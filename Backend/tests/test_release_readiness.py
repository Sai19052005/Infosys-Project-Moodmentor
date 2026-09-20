from conftest import register


def test_export_user_data(env):
    """GET /auth/export returns all personal data for GDPR/privacy compliance."""
    c, _ = env
    h = register(c)

    # Post a journal entry and chat message
    c.post("/journal", json={"text": "Today was a thoughtful day."}, headers=h)
    c.post("/chat", json={"text": "Hello MoodMentor, I need a pause."}, headers=h)

    # Add a trusted contact
    c.post(
        "/safety/contact",
        json={"name": "Helper", "phone": "+1-555-0000", "role": "trusted_contact"},
        headers=h,
    )

    r = c.get("/auth/export", headers=h)
    assert r.status_code == 200
    data = r.json()
    assert "user" in data
    assert "profile" in data
    assert "journal_entries" in data
    assert len(data["journal_entries"]) >= 1
    assert "chat_messages" in data
    assert len(data["chat_messages"]) >= 1
    assert "trusted_contacts" in data
    assert len(data["trusted_contacts"]) >= 1


def test_delete_user_account_cascades(env):
    """DELETE /auth/me deletes the user and prevents subsequent logins."""
    c, _ = env
    h = register(c, index=99)

    # Verify user can access profile
    assert c.get("/auth/me", headers=h).status_code == 200

    # Delete account
    del_res = c.delete("/auth/me", headers=h)
    assert del_res.status_code == 204

    # Now token should no longer work
    assert c.get("/auth/me", headers=h).status_code == 401


def test_security_headers_present(env):
    """Responses include expected security headers."""
    c, _ = env
    r = c.get("/health")
    assert r.status_code == 200
    assert r.headers.get("X-Content-Type-Options") == "nosniff"
    assert r.headers.get("Referrer-Policy") == "no-referrer"
    assert r.headers.get("Cache-Control") == "no-store"


def test_sensitive_fields_stored_encrypted_in_database(env):
    """Verify that raw database columns store encrypted ciphertexts (gAAAAA...) and never plaintext."""
    from sqlalchemy import text
    from app.services.encryption import is_encrypted

    c, factory = env
    h = register(c, index=12)

    secret_journal = "My deep secret thought for today."
    secret_chat = "I am feeling overwhelmed by life events."
    secret_phone = "+91-9876543210"

    # Write through API
    c.post("/journal", json={"text": secret_journal}, headers=h)
    c.post("/chat", json={"text": secret_chat}, headers=h)
    c.post("/safety/contact", json={"name": "Doctor", "phone": secret_phone, "role": "trusted_contact"}, headers=h)

    # Inspect raw database without SQLAlchemy TypeDecorator
    with factory() as db:
        # Check raw journal_entries table
        row = db.execute(text("SELECT text FROM journal_entries WHERE text LIKE 'gAAAAA%'")).fetchone()
        assert row is not None, "Raw journal text must be encrypted"
        assert is_encrypted(row[0]), "Raw text must be a valid Fernet token"
        assert secret_journal not in row[0], "Raw database must NOT contain plaintext"

        # Check raw chat_messages table
        row = db.execute(text("SELECT text FROM chat_messages WHERE text LIKE 'gAAAAA%'")).fetchone()
        assert row is not None, "Raw chat message text must be encrypted"
        assert is_encrypted(row[0])
        assert secret_chat not in row[0]

        # Check raw trusted_contacts table
        row = db.execute(text("SELECT phone FROM trusted_contacts WHERE phone LIKE 'gAAAAA%'")).fetchone()
        assert row is not None, "Raw contact phone must be encrypted"
        assert is_encrypted(row[0])
        assert secret_phone not in row[0]

    # Verify that the API decodes it seamlessly for authorized user
    res = c.get("/journal/history", headers=h)
    assert res.status_code == 200
    entries = res.json()
    assert any(e["text"] == secret_journal for e in entries)


def test_logout_revokes_token(env):
    """POST /auth/logout revokes JWT token; subsequent requests with same token return 401."""
    c, _ = env
    h = register(c, index=13)

    # Works before logout
    assert c.get("/auth/me", headers=h).status_code == 200

    # Logout
    logout_res = c.post("/auth/logout", headers=h)
    assert logout_res.status_code == 200

    # Token is now revoked
    me_res = c.get("/auth/me", headers=h)
    assert me_res.status_code == 401
    assert "revoked" in me_res.json()["detail"].lower()


def test_weak_password_rejected(env):
    """Signing up with trivial or all-digit password is rejected."""
    c, _ = env
    r1 = c.post("/auth/signup", json={"name": "Bad", "email": "bad1@example.com", "password": "password"})
    assert r1.status_code == 422

    r2 = c.post("/auth/signup", json={"name": "Bad", "email": "bad2@example.com", "password": "12345678"})
    assert r2.status_code == 422

