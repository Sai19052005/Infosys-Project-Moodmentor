from conftest import register


def test_voice_status_endpoint(env):
    c, _ = env
    response = c.get("/voice/status")
    assert response.status_code == 200
    data = response.json()
    assert "available" in data
    assert "provider" in data


def test_tts_requires_auth(env):
    c, _ = env
    response = c.post("/voice/tts", json={"text": "Hello", "language": "en"})
    assert response.status_code in (401, 403)


def test_tts_multilingual_authenticated(env):
    c, _ = env
    headers = register(c, "voice_user")
    
    # Test Marathi
    res_mr = c.post("/voice/tts", json={"text": "श्वास घ्या", "language": "mr"}, headers=headers)
    assert res_mr.status_code == 200
    assert res_mr.headers.get("content-type") == "audio/mpeg"
    assert len(res_mr.content) > 0

    # Test Tamil
    res_ta = c.post("/voice/tts", json={"text": "மூச்சை உள்ளிழுக்கவும்", "language": "ta"}, headers=headers)
    assert res_ta.status_code == 200
    assert res_ta.headers.get("content-type") == "audio/mpeg"
    assert len(res_ta.content) > 0


def test_ravi_shankar_meditation_audio_endpoint(env):
    c, _ = env
    # Test program_id routing
    res = c.get("/voice/meditation/ravi_shankar_10min")
    assert res.status_code == 200
    assert res.headers.get("content-type") == "audio/mpeg"
    assert len(res.content) > 1000

    # Test with catalog activity id
    res_cat = c.get("/voice/meditation/meditation-ravi-shankar-10/hi")
    assert res_cat.status_code == 200
    assert res_cat.headers.get("content-type") == "audio/mpeg"


def test_choa_kok_sui_meditation_audio_endpoint(env):
    c, _ = env
    # Test program_id routing
    res = c.get("/voice/meditation/choa_kok_sui_27min")
    assert res.status_code == 200
    assert res.headers.get("content-type") == "audio/mpeg"
    assert len(res.content) > 1000

    # Test with catalog activity id
    res_cat = c.get("/voice/meditation/meditation-choa-kok-sui-27/mr")
    assert res_cat.status_code == 200
    assert res_cat.headers.get("content-type") == "audio/mpeg"
    assert len(res_cat.content) > 1000

