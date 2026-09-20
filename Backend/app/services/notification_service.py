import re
import logging
import requests
from typing import Optional, Dict, Any

from app.config import FAST2SMS_API_KEY

logger = logging.getLogger("moodmentor.notifications")


class NotificationService:
    @staticmethod
    def clean_indian_phone(phone: str) -> Optional[str]:
        """
        Extracts a clean 10-digit Indian mobile number from various phone formats:
        e.g. "+91 75587 14056", "07558714056", "917558714056", or "7558714056".
        """
        if not phone:
            return None
        digits = re.sub(r"[^\d]", "", phone)
        if digits.startswith("91") and len(digits) == 12:
            digits = digits[2:]
        elif digits.startswith("0") and len(digits) == 11:
            digits = digits[1:]
        
        return digits if len(digits) == 10 else (digits if len(digits) >= 10 else None)

    @staticmethod
    def send_trusted_contact_alert(
        user_name: str,
        contact_name: str,
        contact_phone: str,
        contact_email: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Dispatches a privacy-preserving safety notice to a trusted contact via Fast2SMS.
        IMPORTANT: Never exposes user's journal text, emotion scores, or private chat logs.
        """
        clean_phone = NotificationService.clean_indian_phone(contact_phone)
        display_name = user_name.strip() if user_name else "Your friend"

        message_body = (
            f"MoodMentor Alert: {display_name} is experiencing severe emotional distress right now. "
            f"As their trusted contact, please reach out or call them. - MoodMentor"
        )

        if not clean_phone:
            logger.warning("Fast2SMS aborted: invalid recipient phone number %s", contact_phone)
            return {
                "delivered": False,
                "recipient_name": contact_name,
                "recipient_phone": contact_phone,
                "recipient_email": contact_email,
                "message_summary": f"Invalid phone format: '{contact_phone}'. Please enter a valid 10-digit mobile number.",
                "provider": "fast2sms",
            }

        if not FAST2SMS_API_KEY:
            logger.info("Fast2SMS API key not configured. Mock notification logged for %s (%s)", contact_name, clean_phone)
            return {
                "delivered": False,
                "recipient_name": contact_name,
                "recipient_phone": contact_phone,
                "recipient_email": contact_email,
                "message_summary": "Fast2SMS API key not configured in .env. Add FAST2SMS_API_KEY to enable direct SMS delivery.",
                "provider": "unconfigured",
            }

        url = "https://www.fast2sms.com/dev/bulkV2"
        headers = {
            "authorization": FAST2SMS_API_KEY,
            "Content-Type": "application/json",
        }
        payload = {
            "route": "q",
            "message": message_body,
            "language": "english",
            "flash": 0,
            "numbers": clean_phone,
        }

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=8)
            data = response.json() if response.status_code == 200 or response.text.startswith("{") else {}

            if response.status_code == 200 and data.get("return") is True:
                logger.info("Fast2SMS emergency alert sent to %s (%s)", contact_name, clean_phone)
                return {
                    "delivered": True,
                    "recipient_name": contact_name,
                    "recipient_phone": contact_phone,
                    "recipient_email": contact_email,
                    "message_summary": f"Emergency SMS alert successfully dispatched to {contact_name} ({clean_phone}) via Fast2SMS.",
                    "provider": "fast2sms",
                    "request_id": data.get("request_id"),
                }
            else:
                err_msg = data.get("message") if data else response.text
                if isinstance(err_msg, list):
                    err_msg = ", ".join(err_msg)
                logger.error("Fast2SMS delivery failure: %s (status: %s)", err_msg, response.status_code)
                return {
                    "delivered": False,
                    "recipient_name": contact_name,
                    "recipient_phone": contact_phone,
                    "recipient_email": contact_email,
                    "message_summary": f"Fast2SMS delivery failed: {err_msg}",
                    "provider": "fast2sms",
                }
        except Exception as e:
            logger.exception("Fast2SMS request exception: %s", e)
            return {
                "delivered": False,
                "recipient_name": contact_name,
                "recipient_phone": contact_phone,
                "recipient_email": contact_email,
                "message_summary": f"Fast2SMS connection error: {str(e)}",
                "provider": "fast2sms",
            }

