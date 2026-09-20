from conftest import register
from app.services.external_recommendations import get_external_recommendations
from app.services.chat_service import generate_chat_reply


def test_profile_music_preference_defaults_and_updates(env):
    """Verify music_preference defaults to 'bollywood' and can be updated to 'marathi' or other genres."""
    c, _ = env
    h = register(c)

    # 1. Default check
    r = c.get("/wellness/profile", headers=h)
    assert r.status_code == 200
    data = r.json()
    assert data.get("music_preference") == "bollywood"

    # 2. Update to Marathi
    data["music_preference"] = "marathi"
    r_put = c.put("/wellness/profile", json=data, headers=h)
    assert r_put.status_code == 200
    assert r_put.json().get("music_preference") == "marathi"

    # 3. Retrieve updated profile
    r_get = c.get("/wellness/profile", headers=h)
    assert r_get.status_code == 200
    assert r_get.json().get("music_preference") == "marathi"

    # 4. Check /auth/export data export includes music_preference
    r_auth = c.get("/auth/export", headers=h)
    assert r_auth.status_code == 200
    assert r_auth.json().get("profile", {}).get("music_preference") == "marathi"


def test_external_recommendations_with_music_preferences():
    """Verify Spotify recommendations match different user genres and emotions."""
    # Marathi preference
    recs_marathi = get_external_recommendations("sadness", music_preference="marathi")
    music_rec = next(r for r in recs_marathi if r["type"] == "music")
    assert "Spotify:" in music_rec["title"]
    assert "open.spotify.com" in music_rec["url"]
    assert "marathi" in music_rec["description"].lower()

    # Hollywood / English preference
    recs_hw = get_external_recommendations("joy", music_preference="hollywood")
    music_hw = next(r for r in recs_hw if r["type"] == "music")
    assert "open.spotify.com" in music_hw["url"]
    assert "hollywood" in music_hw["description"].lower()

    # Classical preference
    recs_classical = get_external_recommendations("anger", music_preference="classical")
    music_classical = next(r for r in recs_classical if r["type"] == "music")
    assert "open.spotify.com" in music_classical["url"]
    assert "classical" in music_classical["description"].lower()

    # South Indian preference
    recs_si = get_external_recommendations("joy", music_preference="southindian")
    music_si = next(r for r in recs_si if r["type"] == "music")
    assert "open.spotify.com" in music_si["url"]
    assert "south indian" in music_si["description"].lower()

    # Malayalam preference
    recs_ml = get_external_recommendations("sadness", music_preference="malyali")
    music_ml = next(r for r in recs_ml if r["type"] == "music")
    assert "open.spotify.com" in music_ml["url"]
    assert "malayalam" in music_ml["description"].lower()

    # Rap & Hip-Hop preference
    recs_rap = get_external_recommendations("joy", music_preference="rap")
    music_rap = next(r for r in recs_rap if r["type"] == "music")
    assert "open.spotify.com" in music_rap["url"]
    assert "rap" in music_rap["description"].lower()

    # Latest 2026 preference
    recs_2026 = get_external_recommendations("joy", music_preference="latest2026")
    music_2026 = next(r for r in recs_2026 if r["type"] == "music")
    assert "open.spotify.com" in music_2026["url"]
    assert "2026" in music_2026["description"].lower()

    # Famous songs preference
    recs_famous = get_external_recommendations("neutral", music_preference="famous")
    music_famous = next(r for r in recs_famous if r["type"] == "music")
    assert "open.spotify.com" in music_famous["url"]
    assert "famous" in music_famous["description"].lower()


def test_chat_music_request_provides_spotify_links(env):
    """When a user asks for song recommendations in chat, Spotify links are provided with user preference."""
    c, _ = env
    h = register(c)

    # Set user preference to Marathi
    prof = c.get("/wellness/profile", headers=h).json()
    prof["music_preference"] = "marathi"
    c.put("/wellness/profile", json=prof, headers=h)

    # User asks for song recommendation
    r = c.post("/chat", json={"text": "Can you suggest a song to relax?"}, headers=h)
    assert r.status_code == 200
    data = r.json()
    reply = data["reply"]["text"]

    # In chat: NO raw links to Spotify; only mention song in bold!
    assert "open.spotify.com" not in reply
    assert "**" in reply  # Song is mentioned in bold

    # In right-side recommendations (wellness_plan): featured Spotify link
    ext_recs = data["wellness_plan"]["external_recommendations"]
    music_recs = [rec for rec in ext_recs if rec["type"] == "music"]
    assert len(music_recs) > 0
    assert "open.spotify.com/search/" in music_recs[0]["url"]


def test_offline_fallback_chat_recommends_spotify_songs():
    """Verify offline / fallback chat mentions songs in bold and extracts Spotify link for recommendations."""
    from app.services.chat_service import extract_mentioned_song
    
    reply_marathi = generate_chat_reply(
        text="Can you suggest me a nice song?",
        emotion="sadness",
        history=[],
        ai_allowed=False,
        music_preference="marathi"
    )
    # Chat message only mentions song
    assert "open.spotify.com" not in reply_marathi
    assert "Marathi" in reply_marathi
    assert "**" in reply_marathi
    
    # Right-side recommendation extractor finds Spotify link
    extracted = extract_mentioned_song(reply_marathi)
    assert extracted is not None
    assert "open.spotify.com/search/" in extracted[1]

    reply_hindi = generate_chat_reply(
        text="What track should I listen to?",
        emotion="joy",
        history=[],
        ai_allowed=False,
        music_preference="hindi"
    )
    assert "open.spotify.com" not in reply_hindi
    assert "Hindi" in reply_hindi
    assert "**" in reply_hindi
    extracted_hindi = extract_mentioned_song(reply_hindi)
    assert extracted_hindi is not None
    assert "open.spotify.com/search/" in extracted_hindi[1]


def test_explicit_marathi_in_chat_overrides_default_bollywood(env):
    """When a user explicitly types 'suggest me marathi song', MoodMentor suggests Marathi songs in chat and on right side."""
    c, _ = env
    h = register(c)

    # Profile remains default bollywood
    prof = c.get("/wellness/profile", headers=h).json()
    assert prof.get("music_preference") == "bollywood"

    # User explicitly asks for marathi song
    r = c.post("/chat", json={"text": "suggest me marathi song"}, headers=h)
    assert r.status_code == 200
    data = r.json()
    reply = data["reply"]["text"]

    # In chat: Must mention Marathi, no raw URL
    assert "Marathi" in reply
    assert "open.spotify.com" not in reply
    assert "**" in reply

    # On right side: Featured Marathi recommendation with Spotify search URL
    music_recs = [rec for rec in data["wellness_plan"]["external_recommendations"] if rec["type"] == "music"]
    assert len(music_recs) > 0
    assert "open.spotify.com/search/" in music_recs[0]["url"]


def test_consecutive_song_requests_do_not_repeat_same_songs():
    """Consecutive song requests rotate and don't suggest the exact same songs."""
    from app.models import ChatMessage

    # First request
    reply1 = generate_chat_reply(
        text="suggest me marathi song",
        emotion="neutral",
        history=[],
        ai_allowed=False,
        music_preference="bollywood"
    )
    assert "Marathi" in reply1

    # Simulate history with reply1
    hist = [
        ChatMessage(role="user", text="suggest me marathi song"),
        ChatMessage(role="assistant", text=reply1)
    ]

    # Second request
    reply2 = generate_chat_reply(
        text="suggest me another marathi song",
        emotion="neutral",
        history=hist,
        ai_allowed=False,
        music_preference="bollywood"
    )
    assert "Marathi" in reply2

    # Extract bold song titles from both replies to ensure variety
    import re
    songs1 = set(re.findall(r'\*\*(.*?)\*\*', reply1))
    songs2 = set(re.findall(r'\*\*(.*?)\*\*', reply2))
    # Should not be identical!
    assert songs1 != songs2, f"Expected different songs but got: {songs1} and {songs2}"
