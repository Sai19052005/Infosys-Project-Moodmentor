from conftest import register
from app.models import ChatMessage
from app.services.chat_service import (
    clean_chat_reply_text,
    _format_history,
    detect_crisis,
    CRISIS_REPLY,
)


def test_clean_chat_reply_strips_hallucinated_crisis_boilerplate():
    """Verify that when is_crisis=False, any hallucinated crisis warning paragraphs are stripped."""
    hallucinated_reply = (
        "Here are some lovely, soothing songs for you: **Kun Faya Kun** by **A.R. Rahman** and **Ilahi** by **Arijit Singh**.\n\n"
        "Please remember that your life and your well-being matter infinitely, and you are never alone in what you are carrying. "
        "Because of the frightening thoughts you shared earlier, I always want to make sure you are safe and supported. "
        "If the heavy feelings ever feel too much to bear, please reach out to someone who can help, such as calling local emergency services at 112 "
        "or connecting with Tele-MANAS at 14416 in India. I am right here with you, cheering for you, and holding a safe space for you at your own gentle pace."
    )

    cleaned = clean_chat_reply_text(hallucinated_reply, is_crisis=False)

    # Crisis disclaimer paragraph must be completely gone
    assert "frightening thoughts" not in cleaned
    assert "Tele-MANAS" not in cleaned
    assert "14416" not in cleaned
    assert "112" not in cleaned
    assert "well-being matter infinitely" not in cleaned

    # The actual song recommendation must remain intact
    assert "**Kun Faya Kun**" in cleaned
    assert "**A.R. Rahman**" in cleaned


def test_clean_chat_reply_preserves_legitimate_crisis():
    """Verify that when is_crisis=True, crisis information is preserved."""
    legitimate_crisis = (
        "Please remember that your life and your well-being matter infinitely. "
        "If you are in immediate danger, call local emergency services at 112 or Tele-MANAS at 14416."
    )
    cleaned = clean_chat_reply_text(legitimate_crisis, is_crisis=True)
    assert "14416" in cleaned
    assert "112" in cleaned


def test_format_history_excludes_crisis_turns():
    """Verify that prior crisis messages are filtered out of the prompt history."""
    messages = [
        ChatMessage(id=1, user_id=1, role="user", text="Hello MoodMentor!"),
        ChatMessage(id=2, user_id=1, role="assistant", text="Hello! How are you feeling?"),
        ChatMessage(id=3, user_id=1, role="user", text="I want to kill myself"),
        ChatMessage(id=4, user_id=1, role="assistant", text=CRISIS_REPLY),
    ]

    history_str = _format_history(messages)

    # Normal turns should be present
    assert "Hello MoodMentor!" in history_str
    assert "Hello! How are you feeling?" in history_str

    # Crisis turns must be excluded
    assert "kill myself" not in history_str
    assert "Tele-MANAS" not in history_str
    assert "14416" not in history_str


def test_song_request_after_crisis_does_not_repeat_crisis_warning(env):
    """Verify that in the chat endpoint, asking for a song after an earlier crisis turn produces a clean reply."""
    c, _ = env
    h = register(c)

    # Turn 1: Extreme crisis message
    r1 = c.post("/chat", json={"text": "I want to commit suicide"}, headers=h)
    assert r1.status_code == 200
    data1 = r1.json()
    assert data1["crisis"] is True
    assert "14416" in data1["reply"]["text"] or "112" in data1["reply"]["text"]

    # Turn 2: Normal song request
    r2 = c.post("/chat", json={"text": "suggest me song"}, headers=h)
    assert r2.status_code == 200
    data2 = r2.json()
    assert data2["crisis"] is False
    reply2 = data2["reply"]["text"]

    # Must NOT have crisis warnings in response to a song request
    assert "frightening thoughts" not in reply2
    assert "14416" not in reply2
    assert "Tele-MANAS" not in reply2
    assert "emergency services at 112" not in reply2
    assert "well-being matter infinitely" not in reply2
