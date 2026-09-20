import urllib.parse
import random

MUSIC_PREFERENCES_DATA = {
    "bollywood": {
        "label": "Bollywood",
        "sadness": ("Bollywood Soulful & Melancholy Melodies", "Bollywood soulful acoustic sad songs"),
        "joy": ("Bollywood Feel-Good & Dance Hits", "Bollywood upbeat feel good energetic hits"),
        "anger": ("Bollywood Soothing Acoustic & Sufi", "calming bollywood unplugged sufi acoustic"),
        "fear": ("Bollywood Peaceful & Calming Melodies", "calming hindi bollywood acoustic melodies"),
        "neutral": ("Bollywood Chill & Coffee Melodies", "bollywood lo-fi chill coffee melodies"),
    },
    "hindi": {
        "label": "Hindi Indie & Melodies",
        "sadness": ("Hindi Indie Calming Melancholy", "hindi acoustic indie sad calm songs"),
        "joy": ("Hindi Indie Feel-Good & Pop", "hindi indie upbeat feel good melodies"),
        "anger": ("Hindi Soothing Sufi & Acoustic", "peaceful hindi sufi acoustic relaxation"),
        "fear": ("Hindi Peaceful & Meditative Songs", "soothing hindi slow acoustic calm"),
        "neutral": ("Hindi Acoustic & Indie Chill", "hindi indie cafe chill acoustic favorites"),
    },
    "marathi": {
        "label": "Marathi (मराठी)",
        "sadness": ("Marathi Peaceful Bhavgeet & Melodies", "marathi bhavgeet peaceful emotional calm songs"),
        "joy": ("Marathi Upbeat & Energetic Hits", "marathi upbeat energetic folk pop songs"),
        "anger": ("Marathi Soothing Instrumental & Abhang", "peaceful marathi instrumental flute abhang"),
        "fear": ("Marathi Calming & Soothing Songs", "soothing marathi calm bhavgeet melodies"),
        "neutral": ("Marathi Contemporary & Classic Melodies", "marathi popular acoustic melodies chill"),
    },
    "hollywood": {
        "label": "Hollywood / English Pop",
        "sadness": ("Calming Acoustic & Warm Indie", "calming acoustic lo-fi ambient indie"),
        "joy": ("Upbeat Pop & Feel-Good Anthems", "upbeat pop feel-good indie happy hits"),
        "anger": ("Deep Ambient & Piano Calm", "peaceful cello and piano ambient calm"),
        "fear": ("Meditation & Ambient Serenity", "meditation music nature sounds anxiety relief"),
        "neutral": ("Chill Pop & Cozy Acoustic", "chill pop acoustic hits lo-fi study"),
    },
    "lo-fi": {
        "label": "Lo-Fi & Instrumental",
        "sadness": ("Rainy Day Lo-Fi & Ambient", "sad lo-fi chill beats rainy day instrumental"),
        "joy": ("Sunny Groovy Lo-Fi Beats", "upbeat groovy lo-fi beats happy chillhop"),
        "anger": ("Deep Calm Instrumental Lo-Fi", "ambient chill instrumental deep focus lo-fi"),
        "fear": ("Healing Lo-Fi & Gentle Calm", "healing lo-fi beats to relax calm breathing"),
        "neutral": ("Cozy Lo-Fi Study & Relax", "lo-fi beats to relax study to chillhop"),
    },
    "punjabi": {
        "label": "Punjabi",
        "sadness": ("Punjabi Soulful & Slow Melodies", "punjabi sad soulful acoustic melodies"),
        "joy": ("Punjabi High Energy & Upbeat Hits", "punjabi high energy bhangra upbeat hits"),
        "anger": ("Punjabi Peaceful Acoustic Melodies", "punjabi peaceful acoustic slow songs"),
        "fear": ("Punjabi Soothing & Relaxing Melodies", "punjabi soothing acoustic relaxation"),
        "neutral": ("Punjabi Chilled Acoustic & Pop", "punjabi chilled vibes acoustic pop"),
    },
    "classical": {
        "label": "Classical & Meditative",
        "sadness": ("Raag Yaman & Flute Melancholy", "raag yaman peaceful sitar flute meditation"),
        "joy": ("Raag Bilawal & Sitar Celebration", "raag bilawal energetic classical sitar celebration"),
        "anger": ("Santoor & Gentle Stream Ragas", "soothing santoor instrumental peaceful raga"),
        "fear": ("Indian Meditation Flute & Om Chant", "indian meditation flute raga calm breath"),
        "neutral": ("Morning Raagas & Sitar Harmony", "peaceful indian classical instrumental sitar"),
    },
    "south_indian": {
        "label": "South Indian",
        "sadness": ("South Indian Soulful Melodies", "south indian soulful sad emotional melodies"),
        "joy": ("South Indian Peppy & Dance Hits", "south indian energetic dance party hits"),
        "anger": ("South Indian Soothing Classical & Flute", "calming south indian instrumental flute carnatic"),
        "fear": ("South Indian Peaceful Melodies", "peaceful south indian acoustic melodies"),
        "neutral": ("South Indian Chill Hits", "south indian chill acoustic cafe melodies"),
    },
    "malayalam": {
        "label": "Malayalam (മലയാളം)",
        "sadness": ("Malayalam Heartfelt & Soulful Melodies", "malayalam soulful sad melodious songs"),
        "joy": ("Malayalam Upbeat & Celebration Hits", "malayalam upbeat energetic celebration songs"),
        "anger": ("Malayalam Soothing Acoustic & Rain Melodies", "peaceful calming malayalam acoustic songs"),
        "fear": ("Malayalam Peaceful & Meditative Songs", "soothing malayalam peaceful slow songs"),
        "neutral": ("Malayalam Evergreen & Contemporary Hits", "malayalam top chill acoustic hits"),
    },
    "rap": {
        "label": "Rap & Hip-Hop",
        "sadness": ("Reflective & Deep Lyricism Rap", "deep emotional thoughtful rap songs"),
        "joy": ("High-Energy Hype & Flow Rap", "energetic hype workout rap hip hop tracks"),
        "anger": ("Cathartic & Heavy Beat Hip-Hop", "powerful hard hitting bass hip hop tracks"),
        "fear": ("Motivating & Resilient Hip-Hop", "inspiring uplifting motivational rap anthems"),
        "neutral": ("Smooth Flow & Lo-Fi Hip-Hop", "smooth flow lo-fi hip hop chill tracks"),
    },
    "latest_2026": {
        "label": "Latest 2026 Songs",
        "sadness": ("2026 Soulful & Acoustic Hits", "2026 trending acoustic soulful emotional hits"),
        "joy": ("2026 Viral & Chart-Topping Hits", "2026 viral chart topping upbeat dance hits"),
        "anger": ("2026 Chill & Stress Buster Hits", "2026 peaceful chill pop songs trending"),
        "fear": ("2026 Uplifting & Reassuring Songs", "2026 uplifting inspiring acoustic songs"),
        "neutral": ("2026 Global & Indian Hot Hits", "2026 trending top songs global indian"),
    },
    "famous": {
        "label": "All-Time Famous Songs",
        "sadness": ("Timeless Soulful & Golden Classics", "all time famous soulful emotional classic hits"),
        "joy": ("Greatest Feel-Good Anthems of All Time", "all time greatest feel good celebration anthems"),
        "anger": ("Evergreen Calming & Mellow Classics", "timeless soothing mellow golden hits"),
        "fear": ("Uplifting Golden Anthems & Comfort", "comforting timeless classic hits of all time"),
        "neutral": ("All-Time Top Billboard & Chart Hits", "greatest all time famous hit songs"),
    },
}


def _get_mood_category(emotion: str) -> str:
    if emotion in ["sadness", "grief", "disappointment", "embarrassment", "remorse"]:
        return "sadness"
    elif emotion in [
        "joy", "amusement", "excitement", "love", "gratitude",
        "optimism", "pride", "relief", "admiration", "approval", "caring"
    ]:
        return "joy"
    elif emotion in ["anger", "annoyance", "disapproval", "disgust"]:
        return "anger"
    elif emotion in ["fear", "nervousness", "surprise", "confusion", "realization"]:
        return "fear"
    return "neutral"



# ── 🎬 Multilingual Feel-Good & Calming Movies Catalog ──
MULTILINGUAL_MOVIES = {
    "hindi": [
        ("3 Idiots", "2009", "Hindi", "comedy, drama", "Uplifting story celebrating curiosity, learning, and true friendship."),
        ("Taare Zameen Par", "2007", "Hindi", "family, drama", "Heartwarming story of empathy, patience, and recognizing inner spark."),
        ("Queen", "2013", "Hindi", "comedy, drama", "Empowering feel-good solo journey of rediscovering joy and independence."),
        ("Dear Zindagi", "2016", "Hindi", "drama, healing", "Therapeutic and comforting exploration of mental peace and self-acceptance."),
        ("Zindagi Na Milegi Dobara", "2011", "Hindi", "adventure, drama", "Soul-stirring journey of friendship, facing fears, and living fully."),
        ("Dil Chahta Hai", "2001", "Hindi", "friendship, drama", "Timeless, comforting story of friendship navigating love, change, and growth."),
        ("Jab We Met", "2007", "Hindi", "comedy, romance", "Vibrant, cheerful romantic comedy that brings an instant smile."),
        ("Munna Bhai M.B.B.S.", "2003", "Hindi", "comedy, feel-good", "Wholesome comedy full of laughter, warmth, and heartfelt connection."),
        ("English Vinglish", "2012", "Hindi", "family, comedy", "Quietly triumphant and sweet story of self-respect and courage."),
        ("Wake Up Sid", "2009", "Hindi", "coming-of-age, drama", "Gentle coming-of-age journey of finding passion, purpose, and calm."),
        ("Barfi!", "2012", "Hindi", "comedy, romance", "Charming, tender celebration of unconditional love and everyday joys."),
        ("Piku", "2015", "Hindi", "comedy, family", "Warm, witty, and deeply relatable exploration of family bonds and care."),
        ("Chhichhore", "2019", "Hindi", "comedy, drama", "Nostalgic college journey with a powerful message on resilience and hope."),
        ("12th Fail", "2023", "Hindi", "drama, inspirational", "Deeply inspiring true story of unwavering perseverance and honest effort."),
        ("Swades", "2004", "Hindi", "drama, inspirational", "Moving and meaningful drama about belonging, purpose, and community."),
    ],
    "marathi": [
        ("Killa", "2014", "Marathi", "coming-of-age, drama", "Poetic, calming coming-of-age story set along the serene Konkan coast."),
        ("Ventilator", "2016", "Marathi", "comedy, family drama", "Hilarious and heartwarming celebration of family bonds and togetherness."),
        ("Jhimma", "2021", "Marathi", "comedy, feel-good", "Delightful feel-good comedy about women discovering freedom and joy."),
        ("Elizabeth Ekadashi", "2014", "Marathi", "adventure, family", "Innocent, sweet adventure of childhood resilience and brotherly love."),
        ("Harishchandrachi Factory", "2009", "Marathi", "comedy, biography", "Whimsical, inspiring tribute to creative passion, humor, and optimism."),
        ("Duniyadari", "2013", "Marathi", "romance, friendship", "Vibrant, nostalgic celebration of college friendships and memories."),
        ("Deool", "2011", "Marathi", "comedy, satire", "Clever, rustic comedy full of charm, laughter, and sharp wit."),
        ("Faster Fene", "2017", "Marathi", "adventure, mystery", "Energetic, engaging mystery adventure that keeps spirits high."),
        ("Katyar Kaljat Ghusali", "2015", "Marathi", "musical, drama", "Mesmerizing classical musical drama of artistry, passion, and soul."),
        ("Muramba", "2017", "Marathi", "romance, comedy", "Sweet, modern relationship comedy with comforting parental warmth."),
        ("Baipan Bhaari Deva", "2023", "Marathi", "comedy, empowerment", "Energetic, emotional celebration of sisterhood and overcoming challenges."),
        ("Shwaas", "2004", "Marathi", "family, drama", "Tender, deeply touching bond between a grandfather and his grandson."),
        ("Sairat", "2016", "Marathi", "romance, drama", "Emotionally intense, landmark romantic drama with legendary music."),
        ("Chi Va Chi Sau Ka", "2017", "Marathi", "romance, comedy", "Lighthearted, refreshing romantic comedy full of cheerful laughter."),
    ],
    "south_indian": [
        ("Kumbalangi Nights", "2019", "Malayalam", "family, drama", "Soul-soothing, beautifully shot tale of brotherly healing and love."),
        ("Bangalore Days", "2014", "Malayalam", "friendship, feel-good", "Joyous, vibrant celebration of cousins navigating life and dreams."),
        ("Charlie", "2015", "Malayalam", "adventure, feel-good", "Whimsical, free-spirited journey full of wonder and everyday kindness."),
        ("Home", "2021", "Malayalam", "family, comedy", "Gentle, heartwarming family comedy bridging generations and affection."),
        ("Premam", "2015", "Malayalam", "romance, comedy", "Warm, colorful coming-of-age chronicle filled with charm and music."),
        ("Manjummel Boys", "2024", "Malayalam", "adventure, drama", "Gripping and deeply emotional ode to true friendship and courage."),
        ("Anbe Sivam", "2003", "Tamil", "comedy, philosophy", "Masterpiece of compassion, humor, and seeing the divine in humanity."),
        ("Sillu Karupatti", "2019", "Tamil", "romance, anthology", "Tender anthology of sweet, unspoken everyday love stories."),
        ("Thiruchitrambalam", "2022", "Tamil", "comedy, drama", "Cozy, comforting tale of best friends, family, and emotional healing."),
        ("96", "2018", "Tamil", "romance, drama", "Poetic, nostalgic school reunion filled with bittersweet beauty."),
        ("Soorarai Pottru", "2020", "Tamil", "inspirational, drama", "High-octane, inspirational true-life journey of dreaming big against odds."),
        ("C/o Kancharapalem", "2018", "Telugu", "romance, drama", "Honest, touching, and grounded collection of four village love stories."),
        ("Pelli Choopulu", "2016", "Telugu", "romance, comedy", "Refreshing, witty modern romance about ambition, food, and companionship."),
        ("Jersey", "2019", "Telugu", "sports, drama", "Emotional and inspiring story of a father's enduring love and dedication."),
        ("777 Charlie", "2022", "Kannada", "adventure, drama", "Deeply emotional, life-changing journey between a lonely man and a dog."),
        ("Kirik Party", "2016", "Kannada", "comedy, campus", "Breezy, nostalgic campus comedy full of laughter and youthfulness."),
    ],
    "international": [
        ("Amélie", "2001", "French", "romance, comedy", "Whimsical Paris fairytale about spreading quiet joy to those around you."),
        ("The Intouchables", "2011", "French", "comedy, drama", "Irreverent, uplifting true-story friendship that defies all boundaries."),
        ("Spirited Away", "2001", "Japanese", "animation, fantasy", "Ghibli masterpiece of resilience, courage, and enchanting wonder."),
        ("My Neighbor Totoro", "1988", "Japanese", "animation, family", "Peaceful, comforting animation of childhood wonder and rural calm."),
        ("Paddington 2", "2017", "English", "comedy, family", "Radiant, wholesome comedy celebrating kindness and community."),
        ("The Secret Life of Walter Mitty", "2013", "English", "adventure, comedy", "Stunning visual journey inspiring you to step into the world and live."),
        ("Dead Poets Society", "1989", "English", "drama, inspirational", "Classic celebration of passion, poetry, and making life extraordinary."),
        ("The Grand Budapest Hotel", "2014", "English", "comedy, adventure", "Meticulously crafted, witty, and charming adventure with delightful color."),
        ("Good Will Hunting", "1997", "English", "drama, healing", "Deeply cathartic drama about vulnerability, mentorship, and healing."),
        ("Ratatouille", "2007", "English", "animation, comedy", "Uplifting animation reminding us that great passion can come from anywhere."),
        ("Coco", "2017", "English", "animation, family", "Vibrant, tearfully beautiful journey through music and family love."),
        ("Chef", "2014", "English", "comedy, drama", "Cozy, delicious feel-good road trip celebrating creativity and family."),
        ("The Pursuit of Happyness", "2006", "English", "drama, inspirational", "Deeply motivating reminder that resilience and hope triumph over hardship."),
        ("Little Miss Sunshine", "2006", "English", "comedy, drama", "Quirky, endearing family comedy that finds triumph in imperfection."),
        ("Clueless", "1995", "English", "comedy, romance", "Breezy and charming comedy of heart, growth, and optimism."),
    ]
}

# Fast lookup for catalog movie titles (lowercased)
ALL_MOVIE_TITLES = {}
for _cat, _m_list in MULTILINGUAL_MOVIES.items():
    for _title, _year, _lang, _genre, _desc in _m_list:
        ALL_MOVIE_TITLES[_title.lower()] = (_title, _year, _lang, _genre, _desc)


def extract_mentioned_movie(reply_text: str = "", user_text: str = "") -> tuple[str, str, str, str] | None:
    """Extract (movie_title, letterboxd_url, language, description) from chat reply or user prompt.
    Returns None if no movie is found. Picks the first-mentioned movie if multiple are found."""
    import re
    combined = f"{user_text} {reply_text}".strip()
    if not combined:
        return None

    reply_lower = reply_text.lower()
    first_match = None
    first_pos = len(reply_lower) + 1

    # 1. Match against known catalog movies inside bold or quotes
    for m_key, (m_title, m_year, m_lang, m_genre, m_desc) in ALL_MOVIE_TITLES.items():
        pattern = rf'(?:\*\*|["“\'])\s*{re.escape(m_key)}\s*(?:\*\*|["”\'])'
        m = re.search(pattern, reply_lower)
        if m and m.start() < first_pos:
            first_pos = m.start()
            q = urllib.parse.quote_plus(m_title)
            url = f"https://allmovieshub.coffee/?s={q}"
            first_match = (f"{m_title} ({m_year})", url, m_lang, f"Recommended in your conversation · {m_desc}")

    if first_match:
        return first_match

    # Fallback catalog search in raw text
    for m_key, (m_title, m_year, m_lang, m_genre, m_desc) in ALL_MOVIE_TITLES.items():
        if len(m_key) > 3:
            idx = reply_lower.find(m_key)
            if idx != -1 and idx < first_pos:
                first_pos = idx
                q = urllib.parse.quote_plus(m_title)
                url = f"https://allmovieshub.coffee/?s={q}"
                first_match = (f"{m_title} ({m_year})", url, m_lang, f"Recommended in your conversation · {m_desc}")

    if first_match:
        return first_match

    # 2. If user or reply has movie context, extract any bold title
    movie_context = any(w in combined.lower() for w in ["movie", "film", "watch", "cinema", "चित्रपट", "सिनेमा"])
    if movie_context:
        for m in re.finditer(r'\*\*([^*]{2,50})\*\*', reply_text):
            cand = m.group(1).strip()
            # Skip common non-movie bold words
            if cand.lower() in ["rule", "note", "spotify", "tip", "listen", "remember"]:
                continue
            q = urllib.parse.quote_plus(cand)
            url = f"https://allmovieshub.coffee/?s={q}"
            return (cand, url, "Feel-Good", f"Recommended in your conversation · Calming feel-good movie.")

    return None


def get_external_recommendations(emotion, music_preference="bollywood", user_text="", active_intent="general"):
    recs = []
    
    # Music (Spotify Personalized)
    pref_key = (music_preference or "bollywood").lower().strip()
    aliases = {
        "southindian": "south_indian",
        "malyali": "malayalam",
        "hiphop": "rap",
        "hippop": "rap",
        "latest2026": "latest_2026",
        "famous_song": "famous",
    }
    pref_key = aliases.get(pref_key, pref_key)
    if pref_key not in MUSIC_PREFERENCES_DATA:
        pref_key = "bollywood"
        
    mood_cat = _get_mood_category(emotion)
    title, search_query = MUSIC_PREFERENCES_DATA[pref_key][mood_cat]
    pref_label = MUSIC_PREFERENCES_DATA[pref_key]["label"]
    
    query = urllib.parse.quote(search_query)
    music_rec = {
        "type": "music",
        "title": f"Spotify: {title}",
        "description": f"Curated for your {pref_label} preference & mood ({mood_cat}).",
        "url": f"https://open.spotify.com/search/{query}",
        "icon": "music"
    }
    recs.append(music_rec)
    
    # Multilingual Movies (Curated across Hindi, Marathi, South Indian, and International cinema)
    # Select from user preference region + cross-cultural variety
    selected_movies = []
    
    if pref_key == "marathi":
        selected_movies.append(random.choice(MULTILINGUAL_MOVIES["marathi"]))
        other_cat = random.choice(["hindi", "south_indian", "international"])
        selected_movies.append(random.choice(MULTILINGUAL_MOVIES[other_cat]))
    elif pref_key in ("bollywood", "hindi", "punjabi"):
        selected_movies.append(random.choice(MULTILINGUAL_MOVIES["hindi"]))
        other_cat = random.choice(["marathi", "south_indian", "international"])
        selected_movies.append(random.choice(MULTILINGUAL_MOVIES[other_cat]))
    elif pref_key == "hollywood":
        selected_movies.append(random.choice(MULTILINGUAL_MOVIES["international"]))
        other_cat = random.choice(["hindi", "marathi", "south_indian"])
        selected_movies.append(random.choice(MULTILINGUAL_MOVIES[other_cat]))
    else:
        # Balanced sampling across diverse cinema traditions
        cat1 = random.choice(["hindi", "marathi"])
        cat2 = random.choice(["south_indian", "international"])
        selected_movies.append(random.choice(MULTILINGUAL_MOVIES[cat1]))
        selected_movies.append(random.choice(MULTILINGUAL_MOVIES[cat2]))

    for m_title, m_year, m_lang, m_tags, m_desc in selected_movies:
        q = urllib.parse.quote_plus(m_title)
        recs.append({
            "type": "movie",
            "title": f"{m_title} ({m_year})",
            "language": m_lang,
            "description": f"{m_lang} · {m_desc}",
            "url": f"https://allmovieshub.coffee/?s={q}",
            "icon": "play"
        })
        
    # Outdoor / Step Outside
    outdoor_query = urllib.parse.quote("parks cafes trails gardens")
    recs.append({
        "type": "outdoor",
        "title": "Nearby Parks & Cafes",
        "description": "Step outside for a change of environment.",
        "url": f"https://www.google.com/maps/search/{outdoor_query}",
        "icon": "pin"
    })
    
    # Social
    recs.append({
        "type": "social",
        "title": "Connect with Someone",
        "description": "A good conversation starter can help shift your perspective.",
        "url": "#",
        "icon": "people"
    })

    # Family & Cherished Memories (Google Photos)
    user_text_lower = (user_text or "").lower()
    family_keywords = [
        "family", "mom", "dad", "mother", "father", "parents", "sister", "brother",
        "miss", "missing", "lonely", "alone", "friend", "friends", "childhood", "memories",
        "photo", "photos", "nostalgic", "picture", "pictures", "घर", "आई", "बाबा", "परिवार", "आठवण", "याद"
    ]
    family_context = any(w in user_text_lower for w in family_keywords)
    photos_url = "https://photos.google.com/search/family" if family_context else "https://photos.google.com/"
    photos_rec = {
        "type": "photos",
        "title": "Family & Cherished Memories",
        "description": "Looking back at photos with loved ones and warm memories releases oxytocin and brings comfort.",
        "url": photos_url,
        "icon": "image"
    }
    recs.append(photos_rec)

    # Mindful Games (in-app)
    games_rec = {
        "type": "games",
        "title": "Mindful Games",
        "description": "Fun mini-games like bubble pop & pattern matching to calm your mind and relieve stress.",
        "url": "#games",
        "icon": "game"
    }
    recs.append(games_rec)

    # Mood Studio (in-app)
    studio_rec = {
        "type": "studio",
        "title": "Mood Studio",
        "description": "Express yourself with creative photo effects, mood overlays, and artistic filters.",
        "url": "#studio",
        "icon": "camera"
    }
    recs.append(studio_rec)

    # Guided Meditation (in-app)
    meditation_rec = {
        "type": "meditation",
        "title": "Guided Meditation",
        "description": "Interactive audio sessions with soothing voice narration to help you breathe and reset.",
        "url": "#meditation",
        "icon": "spa"
    }
    recs.append(meditation_rec)

    # ── Dynamic ordering based on detected intent ──
    # Map intent → rec type that should be promoted to position #1
    intent_to_type = {
        "music": "music",
        "movie": "movie",
        "places": "outdoor",
        "photos": "photos",
        "games": "games",
        "studio": "studio",
        "meditation": "meditation",
    }

    promoted_type = intent_to_type.get(active_intent)

    # Build the final 3-card list:
    # 1. The promoted card (matching intent) goes first
    # 2. Then fill with contextually relevant secondary picks
    if promoted_type:
        promoted = [r for r in recs if r["type"] == promoted_type]
        others = [r for r in recs if r["type"] != promoted_type]
    else:
        # General intent: use legacy behavior (music first)
        promoted = [r for r in recs if r["type"] == "music"]
        others = [r for r in recs if r["type"] != "music"]

    # Pick 1 promoted card
    primary = promoted[0] if promoted else recs[0]

    # Pick 2 secondary cards from the remaining pool
    # Prioritize photos when family context or sadness is present
    movie_recs = [r for r in others if r["type"] == "movie"]
    non_movie_others = [r for r in others if r["type"] != "movie"]

    if family_context or mood_cat == "sadness":
        secondary_1 = next((r for r in others if r["type"] == "photos"), None) or (movie_recs[0] if movie_recs else (non_movie_others[0] if non_movie_others else primary))
        remaining = [r for r in others if r is not secondary_1]
        secondary_2 = remaining[0] if remaining else primary
    else:
        secondary_1 = movie_recs[0] if movie_recs else (non_movie_others[0] if non_movie_others else primary)
        remaining = [r for r in others if r is not secondary_1]
        secondary_2 = random.choice(remaining) if remaining else primary

    final_recs = [primary]
    if secondary_1 is not primary:
        final_recs.append(secondary_1)
    if secondary_2 is not primary and secondary_2 is not secondary_1:
        final_recs.append(secondary_2)

    return final_recs

