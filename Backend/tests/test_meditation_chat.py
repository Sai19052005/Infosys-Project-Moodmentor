import pytest
from conftest import register
from app.services.chat_service import generate_chat_reply, _is_meditation_request


def test_is_meditation_request_detection():
    """Verify meditation keywords are accurately recognized."""
    assert _is_meditation_request("i want to do some meditation")
    assert _is_meditation_request("Can we meditate together?")
    assert _is_meditation_request("guided breathing exercise")
    assert _is_meditation_request("help me calm down and relax my mind")
    assert not _is_meditation_request("what movie should i watch?")
    assert not _is_meditation_request("recommend me a song")


def test_meditation_reply_recommends_practice_section_not_chat_steps():
    """Verify offline / fallback chat directs to the Recommended Practices section instead of step-by-step text."""
    reply = generate_chat_reply(
        text="i want to do some meditation",
        emotion="neutral",
        history=[],
        ai_allowed=False,
    )
    # Must refer to Recommended Practices / Start reset
    assert "Recommended Practices" in reply or "Start reset" in reply
    # Must NOT attempt step-by-step counting instructions like "inhale for 4 seconds, hold for 4"
    assert "inhale for" not in reply.lower()
    assert "hold for" not in reply.lower()


def test_chat_endpoint_with_meditation_prioritizes_meditation_plan(env):
    """When user asks for meditation in chat, the wellness plan prioritizes meditation activity."""
    c, _ = env
    h = register(c)

    r = c.post("/chat", json={"text": "i want to do some meditation"}, headers=h)
    assert r.status_code == 200
    data = r.json()
    reply = data["reply"]["text"]
    plan = data["wellness_plan"]

    # In chat: points to guided reset / practices
    assert "Recommended Practices" in reply or "Start reset" in reply or "guided practice" in reply.lower()

    # In wellness_plan: top activity is meditation or breathing
    activities = plan.get("activities", [])
    assert len(activities) > 0
    top_act = activities[0]
    assert top_act["type"] in ["meditation", "breathing", "grounding"]
