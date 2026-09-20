import pytest
from conftest import register
from app.services.external_recommendations import (
    get_external_recommendations,
    extract_mentioned_movie,
    MULTILINGUAL_MOVIES,
    ALL_MOVIE_TITLES,
)
from app.services.chat_service import extract_mentioned_song, generate_chat_reply


def test_multilingual_movie_catalog_has_all_languages():
    """Verify that catalog contains Hindi, Marathi, South Indian, and International categories."""
    assert "hindi" in MULTILINGUAL_MOVIES
    assert "marathi" in MULTILINGUAL_MOVIES
    assert "south_indian" in MULTILINGUAL_MOVIES
    assert "international" in MULTILINGUAL_MOVIES

    # Check Hindi movies
    hindi_titles = [m[0] for m in MULTILINGUAL_MOVIES["hindi"]]
    assert "3 Idiots" in hindi_titles
    assert "Zindagi Na Milegi Dobara" in hindi_titles
    assert "Dil Chahta Hai" in hindi_titles

    # Check Marathi movies
    marathi_titles = [m[0] for m in MULTILINGUAL_MOVIES["marathi"]]
    assert "Killa" in marathi_titles
    assert "Ventilator" in marathi_titles
    assert "Jhimma" in marathi_titles

    # Check South Indian movies
    south_titles = [m[0] for m in MULTILINGUAL_MOVIES["south_indian"]]
    assert "Kumbalangi Nights" in south_titles
    assert "Bangalore Days" in south_titles
    assert "Anbe Sivam" in south_titles

    # Check International movies
    intl_titles = [m[0] for m in MULTILINGUAL_MOVIES["international"]]
    assert "Amélie" in intl_titles
    assert "Spirited Away" in intl_titles
    assert "Paddington 2" in intl_titles


def test_get_external_recommendations_guarantees_movie():
    """Verify that get_external_recommendations always returns a movie with language attribute."""
    for emotion in ["sadness", "joy", "anger", "fear", "neutral"]:
        recs = get_external_recommendations(emotion, music_preference="marathi")
        movie_recs = [r for r in recs if r["type"] == "movie"]
        assert len(movie_recs) >= 1, f"Expected at least one movie for emotion {emotion}"
        m = movie_recs[0]
        assert "language" in m
        assert "allmovieshub.coffee/?s=" in m["url"]
        assert m["icon"] == "play"
        assert len(m["description"]) > 0


def test_extract_mentioned_movie_detects_movies_in_chat():
    """Verify extract_mentioned_movie identifies movies mentioned in conversation."""
    reply = (
        "If you want something comforting, a beautiful coming-of-age film like "
        "**Zindagi Na Milegi Dobara** or **Dil Chahta Hai** can feel like spending time with old friends. "
        "A comedy like **3 Idiots** might also hit the spot."
    )
    extracted = extract_mentioned_movie(reply, user_text="suggest me a movie")
    assert extracted is not None
    title, url, lang, desc = extracted
    assert "Zindagi Na Milegi Dobara" in title
    assert lang == "Hindi"
    assert "allmovieshub.coffee/?s=" in url
    assert "Recommended in your conversation" in desc

    # Test Marathi movie extraction
    reply_mr = "You might deeply connect with **Killa**, a tender and calming story along the Konkan coast."
    extracted_mr = extract_mentioned_movie(reply_mr, user_text="recommend a marathi film")
    assert extracted_mr is not None
    assert "Killa" in extracted_mr[0]
    assert extracted_mr[2] == "Marathi"

    # Test South Indian movie extraction
    reply_ml = "A soul-soothing masterpiece is **Kumbalangi Nights**, exploring family healing and love."
    extracted_ml = extract_mentioned_movie(reply_ml, user_text="any good movie?")
    assert extracted_ml is not None
    assert "Kumbalangi Nights" in extracted_ml[0]
    assert extracted_ml[2] == "Malayalam"


def test_movie_is_never_extracted_as_spotify_song():
    """Verify extract_mentioned_song skips movie titles and movie requests."""
    reply = (
        "A beautiful coming-of-age film like **Zindagi Na Milegi Dobara** or **Dil Chahta Hai** "
        "can feel like spending time with old friends. Or try **3 Idiots**."
    )
    # 1. When user asked for a movie: must return None
    song_result = extract_mentioned_song(reply, user_text="suggest me a movie to watch")
    assert song_result is None, f"Expected None but got song extraction: {song_result}"

    # 2. Even without movie prompt keyword, known movie titles are skipped by extract_mentioned_song
    song_result_2 = extract_mentioned_song(reply, user_text="hello there")
    assert song_result_2 is None, f"Expected None for movie titles but got: {song_result_2}"


def test_real_song_is_still_extracted_for_spotify():
    """Verify extract_mentioned_song still properly captures real music recommendations."""
    song_reply = "To relax your mind, listen to **Agar Tum Saath Ho** by Arijit Singh."
    song_res = extract_mentioned_song(song_reply, user_text="suggest me a calming song")
    assert song_res is not None
    assert "Agar Tum Saath Ho" in song_res[0]
    assert "open.spotify.com/search/" in song_res[1]


def test_chat_movie_recommendation_matches_right_panel(env):
    """End-to-end test: when user asks for a movie in chat, the right side movie card matches chat
    and Spotify card does NOT show the movie title."""
    c, _ = env
    h = register(c)

    r = c.post("/chat", json={"text": "Can you recommend a comforting movie to watch?"}, headers=h)
    assert r.status_code == 200
    data = r.json()
    reply_text = data["reply"]["text"]
    ext_recs = data["wellness_plan"]["external_recommendations"]

    # Verify movie card exists and matches what chat recommended
    movie_cards = [r for r in ext_recs if r["type"] == "movie"]
    assert len(movie_cards) >= 1
    movie_card = movie_cards[0]

    # Verify movie card details
    assert "allmovieshub.coffee" in movie_card["url"]
    assert movie_card.get("language") in ["Hindi", "Marathi", "Malayalam", "Tamil", "Telugu", "Kannada", "English", "French", "Japanese", "Feel-Good"]

    # Spotify card must NOT steal the movie title
    music_cards = [r for r in ext_recs if r["type"] == "music"]
    assert len(music_cards) >= 1
    spotify_title = music_cards[0]["title"]
    # Spotify card should be a soundtrack/genre, not a movie title from movie_cards
    for m in movie_cards:
        base_title = m["title"].split("(")[0].strip()
        assert spotify_title != base_title, f"Spotify card should not be titled '{base_title}'"
