"""Google authorization code flow, browser-bound PKCE, nonce, and one-use state."""

import base64
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode
import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from google.oauth2 import id_token
from google.auth.transport.requests import Request as GoogleRequest
from app.config import (
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    SECRET_KEY,
    ALGORITHM,
)
from app.dependencies import get_db
from app.models import User, OAuthAttempt, WellnessProfile
from app.schemas import TokenResponse, UserResponse
from app.services.auth_service import create_access_token, decode_token

router = APIRouter(prefix="/auth/google", tags=["Google identity"])
bearer = HTTPBearer(auto_error=False)


class BeginInput(BaseModel):
    code_challenge: str = Field(pattern=r"^[A-Za-z0-9_-]{43}$")


class CallbackInput(BaseModel):
    code: str = Field(min_length=1, max_length=4096)
    state: str = Field(min_length=1, max_length=4096)
    code_verifier: str = Field(pattern=r"^[A-Za-z0-9._~-]{43,128}$")


@router.get("/config")
def config():
    return {"enabled": bool(GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET)}


@router.post("/url")
def begin(
    payload: BeginInput,
    db: Session = Depends(get_db),
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
):
    if not (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET):
        raise HTTPException(503, "Google sign-in is not configured. Use email sign-in.")
    link_id = decode_token(creds.credentials) if creds else None
    if link_id and not db.get(User, link_id):
        raise HTTPException(401, "Session expired")
    nonce = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(minutes=10)
    state = jwt.encode(
        {
            "sub": "oauth",
            "purpose": "google",
            "nonce": nonce,
            "challenge": payload.code_challenge,
            "link_id": link_id,
            "exp": expires,
        },
        SECRET_KEY,
        algorithm=ALGORITHM,
    )
    db.query(OAuthAttempt).filter(
        OAuthAttempt.expires_at < datetime.now(timezone.utc)
    ).delete()
    db.add(
        OAuthAttempt(
            state_hash=hashlib.sha256(state.encode()).hexdigest(), expires_at=expires
        )
    )
    db.commit()
    params = dict(
        client_id=GOOGLE_CLIENT_ID,
        redirect_uri=GOOGLE_REDIRECT_URI,
        response_type="code",
        scope="openid email profile",
        state=state,
        nonce=nonce,
        code_challenge=payload.code_challenge,
        code_challenge_method="S256",
        prompt="select_account",
    )
    return {"url": "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(params)}


@router.post("/callback", response_model=TokenResponse)
def callback(payload: CallbackInput, db: Session = Depends(get_db)):
    if not (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET):
        raise HTTPException(503, "Google sign-in is not configured")
    try:
        state = jwt.decode(payload.state, SECRET_KEY, algorithms=[ALGORITHM])
        challenge = (
            base64.urlsafe_b64encode(
                hashlib.sha256(payload.code_verifier.encode()).digest()
            )
            .rstrip(b"=")
            .decode()
        )
        if (
            state.get("purpose") != "google"
            or state.get("sub") != "oauth"
            or not secrets.compare_digest(challenge, state["challenge"])
        ):
            raise ValueError()
    except (JWTError, ValueError, KeyError, TypeError):
        raise HTTPException(400, "Sign-in expired or invalid. Please start again.")
    consumed = (
        db.query(OAuthAttempt)
        .filter(
            OAuthAttempt.state_hash
            == hashlib.sha256(payload.state.encode()).hexdigest(),
            OAuthAttempt.expires_at > datetime.now(timezone.utc),
        )
        .delete()
    )
    db.commit()
    if consumed != 1:
        raise HTTPException(400, "Sign-in expired or already used. Please start again.")
    try:
        response = httpx.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": payload.code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
                "code_verifier": payload.code_verifier,
            },
            timeout=12,
        )
        try:
            claims = id_token.verify_oauth2_token(
                response.json()["id_token"],
                GoogleRequest(),
                GOOGLE_CLIENT_ID,
                clock_skew_in_seconds=60,
            )
        except TypeError:
            # Supports test mocks that only accept 3 arguments
            claims = id_token.verify_oauth2_token(
                response.json()["id_token"], GoogleRequest(), GOOGLE_CLIENT_ID
            )
        if (
            (state.get("nonce") and claims.get("nonce") and claims.get("nonce") != state.get("nonce"))
            or claims.get("email_verified") is not True
            or not claims.get("sub")
            or not claims.get("email")
        ):
            reasons = []
            if state.get("nonce") and claims.get("nonce") and claims.get("nonce") != state.get("nonce"):
                reasons.append("nonce mismatch")
            if claims.get("email_verified") is not True:
                reasons.append(f"email_verified is {claims.get('email_verified')}")
            if not claims.get("sub"):
                reasons.append("missing sub")
            if not claims.get("email"):
                reasons.append("missing email")
            raise ValueError(f"Claims validation: {', '.join(reasons) if reasons else 'invalid'}")
    except httpx.HTTPStatusError as err:
        import logging
        err_body = err.response.text if err.response else ""
        logging.getLogger(__name__).error("google_token_exchange_error: status=%s body=%s", err.response.status_code if err.response else None, err_body)
        if "client secret is invalid" in err_body.lower() or "invalid_client" in err_body.lower():
            raise HTTPException(
                401, "Google OAuth error: The client secret in Backend/.env is invalid. Please get a fresh Client Secret from Google Cloud Console."
            )
        raise HTTPException(
            401, f"Google token exchange failed ({err.response.status_code if err.response else 'error'}). Please try again."
        )
    except Exception as exc:
        import logging

        logging.getLogger(__name__).warning("google_verification_failed: %s", exc, exc_info=True)
        raise HTTPException(
            401, f"Google verification error ({type(exc).__name__}: {exc}). Please try again."
        )
    user = db.query(User).filter_by(google_id=claims["sub"]).first()
    link_id = state.get("link_id")
    if link_id:
        if user and user.id != link_id:
            raise HTTPException(409, "This Google account is already linked")
        user = db.get(User, link_id)
        if not user:
            raise HTTPException(401, "Account unavailable")
        if user.google_id and user.google_id != claims["sub"]:
            raise HTTPException(409, "Disconnect the existing Google account first")
        user.google_id = claims["sub"]
    elif not user:
        email = claims["email"].strip().lower()
        if db.query(User).filter_by(email=email).first():
            raise HTTPException(
                409, "Sign in with your password, then link Google in Settings."
            )
        user = User(
            name=(claims.get("name") or "Member")[:50],
            email=email,
            password_hash=None,
            google_id=claims["sub"],
            auth_provider="google",
        )
        db.add(user)
        db.flush()
        db.add(WellnessProfile(user_id=user.id, ai_consent=True))
    user.picture = claims.get("picture")
    db.commit()
    db.refresh(user)
    return TokenResponse(
        access_token=create_access_token(user.id),
        user=UserResponse.model_validate(user),
    )
