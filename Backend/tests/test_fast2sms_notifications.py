from datetime import datetime, timezone, timedelta
from unittest.mock import patch, MagicMock
from conftest import register
from app.services.notification_service import NotificationService
from app.models import TrustedContact, SafetyEvent


def test_clean_indian_phone():
    """Verify robust cleaning of Indian mobile number variations."""
    assert NotificationService.clean_indian_phone("07558714056") == "7558714056"
    assert NotificationService.clean_indian_phone("+91 75587 14056") == "7558714056"
    assert NotificationService.clean_indian_phone("+91-75587-14056") == "7558714056"
    assert NotificationService.clean_indian_phone("917558714056") == "7558714056"
    assert NotificationService.clean_indian_phone("7558714056") == "7558714056"
    assert NotificationService.clean_indian_phone("123") is None
    assert NotificationService.clean_indian_phone("") is None
    assert NotificationService.clean_indian_phone(None) is None


def test_fast2sms_unconfigured_fallback():
    """When FAST2SMS_API_KEY is empty, notification service fails gracefully without crashing."""
    with patch("app.services.notification_service.FAST2SMS_API_KEY", ""):
        res = NotificationService.send_trusted_contact_alert(
            user_name="Rushikesh",
            contact_name="Sai Ganesh",
            contact_phone="07558714056",
        )
        assert res["delivered"] is False
        assert res["provider"] == "unconfigured"
        assert "FAST2SMS_API_KEY" in res["message_summary"]


def test_fast2sms_successful_mock_dispatch():
    """Verify successful dispatch when Fast2SMS API returns positive delivery."""
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "return": True,
        "request_id": "fast2sms_req_12345",
        "message": ["SMS sent successfully."],
    }

    with patch("app.services.notification_service.FAST2SMS_API_KEY", "mock_key_abc"):
        with patch("requests.post", return_value=mock_resp) as mock_post:
            res = NotificationService.send_trusted_contact_alert(
                user_name="Rushikesh",
                contact_name="Sai Ganesh",
                contact_phone="07558714056",
            )
            assert res["delivered"] is True
            assert res["provider"] == "fast2sms"
            assert res["request_id"] == "fast2sms_req_12345"

            # Check Fast2SMS payload structure
            mock_post.assert_called_once()
            _, kwargs = mock_post.call_args
            assert kwargs["headers"]["authorization"] == "mock_key_abc"
            assert kwargs["json"]["numbers"] == "7558714056"
            assert kwargs["json"]["route"] == "q"
            assert "Rushikesh" in kwargs["json"]["message"]


def test_safety_notify_endpoint_with_contact(env):
    """Verify POST /safety/notify endpoint triggers NotificationService and creates SafetyEvent."""
    c, dbs = env
    h = register(c, "fast2sms_user")

    # Save trusted contact
    c.post(
        "/safety/contact",
        json={
            "name": "Sai Ganesh",
            "phone": "07558714056",
            "relationship_type": "Friend",
            "role": "trusted_contact",
            "notification_mode": "automatic",
        },
        headers=h,
    )

    with patch(
        "app.services.notification_service.NotificationService.send_trusted_contact_alert",
        return_value={
            "delivered": True,
            "message_summary": "SMS alert sent via Fast2SMS",
            "provider": "fast2sms",
        },
    ):
        res = c.post("/safety/notify", json={}, headers=h)
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert "Fast2SMS" in data["message"]

        with dbs() as db:
            event = db.query(SafetyEvent).order_by(SafetyEvent.id.desc()).first()
            assert event is not None
            assert event.notified_contact is True


def test_chat_crisis_automatic_sms_and_12h_debounce(env):
    """Verify automatic Fast2SMS alert fires on crisis, and 12h debounce prevents duplicate SMS."""
    c, dbs = env
    h = register(c, "crisis_chat_user")

    # Add contact with automatic notification mode
    c.post(
        "/safety/contact",
        json={
            "name": "Sai Ganesh",
            "phone": "07558714056",
            "relationship_type": "Friend",
            "role": "trusted_contact",
            "notification_mode": "automatic",
        },
        headers=h,
    )

    with patch(
        "app.routers.chat.NotificationService.send_trusted_contact_alert",
        return_value={
            "delivered": True,
            "message_summary": "SMS alert sent via Fast2SMS",
            "provider": "fast2sms",
        },
    ) as mock_alert:
        # First crisis message -> should trigger alert
        res1 = c.post("/chat", json={"text": "I feel hopeless and I want to commit suicide"}, headers=h)
        assert res1.status_code == 200
        assert res1.json()["crisis"] is True
        assert mock_alert.call_count == 1

        with dbs() as db:
            events = db.query(SafetyEvent).all()
            assert len(events) >= 1
            assert any(e.notified_contact for e in events)

        # Second crisis message within minutes -> should be debounced, call_count remains 1
        res2 = c.post("/chat", json={"text": "I really want to end my life"}, headers=h)
        assert res2.status_code == 200
        assert res2.json()["crisis"] is True
        assert mock_alert.call_count == 1  # Not spammed!
