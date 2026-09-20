from conftest import register


def test_recommendations_have_why_explanation(env):
    """Activities returned by rank_activities include a 'why' explanation."""
    c, factory = env
    h = register(c)

    # Trigger a wellness plan via chat (which calls coordinate → rank_activities)
    r = c.post("/chat", json={"text": "I had a stressful day at work"}, headers=h)
    assert r.status_code == 200
    plan = r.json().get("wellness_plan", {})
    activities = plan.get("recommended_activities", [])
    # If activities are available, each should have a 'why' key
    for a in activities:
        assert "why" in a, f"Activity {a.get('id')} missing 'why' explanation"


def test_dismiss_endpoint(env):
    """POST /wellness/dismiss stores a dismissal and returns 204."""
    c, _ = env
    h = register(c)
    r = c.post(
        "/wellness/dismiss",
        json={"recommendation_id": "breathing-3"},
        headers=h,
    )
    assert r.status_code == 204


def test_photos_recommendation_for_family_context():
    """When user mentions family or memories, Google Photos recommendation is included."""
    from app.services.external_recommendations import get_external_recommendations

    # Test with English keywords
    recs = get_external_recommendations("sadness", "bollywood", user_text="I miss my mom and family")
    photo_recs = [r for r in recs if r["type"] == "photos"]
    assert len(photo_recs) == 1
    assert "photos.google.com/search/family" in photo_recs[0]["url"]
    assert "Family & Cherished Memories" in photo_recs[0]["title"]

    # Test with Indic language keywords (Marathi / Hindi)
    recs_indic = get_external_recommendations("sadness", "marathi", user_text="मला घरची आणि आईची खूप आठवण येत आहे")
    photo_recs_indic = [r for r in recs_indic if r["type"] == "photos"]
    assert len(photo_recs_indic) == 1
    assert "photos.google.com/search/family" in photo_recs_indic[0]["url"]

