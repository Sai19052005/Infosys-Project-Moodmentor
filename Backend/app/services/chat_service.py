# ══════════════════════════════════════════════════════════════
# FILE: backend/app/services/chat_service.py
# 🆕 NEW FILE — mood-aware chat companion with crisis safety
# KEY DESIGN: reuses the Gemini singleton from gemini_service,
# reads the user's journal moods as context, never crashes.
# ══════════════════════════════════════════════════════════════

import random

from app.config import GEMINI_MODEL
from app.models import ChatMessage
from app.services.gemini_service import get_gemini_service

# ── 🚨 Crisis safety net — deterministic code, NEVER the LLM's job ──
CRISIS_KEYWORDS = [
    "suicide",
    "suicidal",
    "kill myself",
    "end my life",
    "end it all",
    "want to die",
    "wanna die",
    "self harm",
    "self-harm",
    "selfharm",
    "hurt myself",
    "hurting myself",
    "cut myself",
    "cutting myself",
    "no reason to live",
    "don't want to live",
    "dont want to live",
    "better off dead",
    "better off without me",
    "can't go on",
    "cant go on",
]

CRISIS_REPLY = (
    "Thank you for telling me. You deserve support from someone who can be with you. "
    "If you may be in immediate danger, call local emergency services (112 in India). "
    "In India, you can also call Tele-MANAS at 14416. If possible, reach out to someone you trust now. "
    "I am an automated wellness companion and cannot provide emergency care."
)


def detect_crisis(text: str) -> bool:
    """Keyword safety net. Deliberately errs on the side of caution:
    a false alarm costs one caring message; a miss costs everything."""
    t = text.lower()
    return any(keyword in t for keyword in CRISIS_KEYWORDS)


import urllib.parse
import re

# ── 💬 Gemini reply with conversation memory ──
CHAT_PROMPT = """You are Emotion Care, an extraordinarily warm, compassionate, empathetic, and uplifting emotional wellness companion.

Your objective:
Provide a deep, thoughtful, heartwarming, and truly comforting response that makes the user feel deeply heard, understood, cared for, and revitalized after reading it. Never give curt, superficial, or overly brief 1-2 sentence replies.

Guidelines for your response:
- MOST IMPORTANT — Answer the Actual Question: Read the user's message carefully and respond DIRECTLY to what they are asking or sharing. If they ask about studies, talk about studies. If they share a work problem, discuss that work problem. If they talk about cooking, engage with cooking. Do NOT steer every conversation toward music or songs.
- Structure & Depth: Write 2 to 3 rich, beautifully written paragraphs (around 120-220 words) that feel like talking to a wise, caring, and unconditionally supportive friend.
- Empathy & Validation: Deeply validate what the person is feeling. Mirror their emotional state with profound empathy and reassurance so they know their feelings make complete sense and they aren't alone.
- Comforting Wisdom & Perspective: Offer uplifting, calming, or reassuring perspective. Help them find a moment of peace, grounding, or self-compassion amidst whatever they are going through.
- Music — ONLY When Relevant: Recommend songs ONLY when the user explicitly asks for music, songs, playlists, or something to listen to.
  * When recommending a song, DO NOT include clickable URLs or markdown links.
  * Simply mention the song title and artist naturally in bold (for example: **Song Title** by **Artist**).
  * The companion app will automatically detect your mentioned song and feature its direct Spotify player on the right-side recommendation panel.
  * The user prefers {music_preference} music. Tailor any song you mention to their {music_preference} preference and current mood.
  * If the user did NOT ask for music, do NOT recommend songs.
- Movies and Cinema: When the user asks for a movie recommendation, film, or something to watch:
  * Recommend comforting, uplifting, heartwarming, or mood-lifting movies across all cinema traditions (including Hindi/Bollywood, Marathi, South Indian [Malayalam, Tamil, Telugu, Kannada], and Hollywood/World cinema).
  * Mention movie titles clearly in bold (for example: **Zindagi Na Milegi Dobara**, **Killa**, **Kumbalangi Nights**, **3 Idiots**, **Amélie**).
  * The companion app will automatically detect your recommended movie and feature its streaming card on the right-side recommendation panel.
- Meditation, Mindfulness & Breathing: When the user asks for meditation, breathing exercises, or mindfulness (for example: "I want to do some meditation", "help me meditate", "breathing exercise"):
  * DO NOT write out a step-by-step physical meditation exercise, counting routine, or breathing script in your chat response. Reading long text on a screen prevents the user from actually relaxing.
  * Instead, provide a thoughtful, heartwarming, and deeply comforting message (around 1-2 soothing paragraphs) validating their choice to pause and take care of themselves.
  * Explicitly point them to Emotion Care's built-in interactive audio session player in the **Recommended Practices** section on the right side of the screen (or the "Start reset" button).
  * Explain that our guided audio player will gently guide their breath with voice narration and soothing soundscapes, so they can close their eyes, relax their shoulders, and step away from the screen completely.
- Emotion Care Feature Awareness: You know about these built-in features in the Emotion Care app. When the conversation naturally relates to one, you may gently invite the user to try it — but ONLY if it genuinely fits the discussion. Never force or list multiple features at once.
  * **Mindful Games** — fun, calming mini-games (bubble pop, pattern matching, breathing games) for stress relief or boredom.
  * **Step Outside** — discover nearby parks, cafes, gardens, and trails via Google Maps. Great when the user feels stuck indoors or needs a change of scenery.
  * **Family Memories** — browse cherished photos from Google Photos. Lovely when they miss loved ones, feel nostalgic, or want comfort from happy memories.
  * **Mood Lens** — real-time facial emotion detection via camera. Fun and insightful for self-awareness.
  * **Mood Studio** — creative photo booth with artistic effects and mood-themed overlays for self-expression.
  * **Guided Meditation** — interactive audio sessions with voice narration and soothing soundscapes in multiple languages.
- Gentle Closing: Conclude with a warm, comforting invitation or open question that lets them know you are here to listen at their own pace without pressure.
- Boundaries: Never diagnose, never give medical advice, and never claim to be a licensed therapist.
- Crisis & Helpline Boundary:
  * CRITICAL: Emergency helpline numbers (e.g. 112, 14416, Tele-MANAS) and crisis disclaimers MUST ONLY be mentioned if the user's CURRENT latest message is directly expressing immediate self-harm, suicidal thoughts, or acute danger.
  * If the user's current message is a normal inquiry (asking for songs, movies, meditation, daily life reflections, or casual chat), NEVER bring up past frightening thoughts, suicide, or emergency hotlines unprompted. Treat their current inquiry warmly, pleasantly, and naturally without dwelling on past distress.

{history}The user's latest message (detected emotion: {emotion}):
\"\"\"{text}\"\"\"

Your response:"""


def _format_history(messages: list[ChatMessage]) -> str:
    """Render recent messages as a transcript for the prompt.
    Crucially excludes prior crisis triggers or crisis replies so the LLM
    never gets trapped into an endless crisis-warning loop on non-crisis turns."""
    if not messages:
        return ""
    lines = ["Recent conversation:"]
    for m in messages:
        text = m.text or ""
        # If the message contained extreme crisis text or was the crisis disclaimer, omit it from prompt history
        if detect_crisis(text) or "14416" in text or "tele-manas" in text.lower() or text.strip() == CRISIS_REPLY.strip():
            continue
        speaker = "User" if m.role == "user" else "Emotion Care"
        lines.append(f"{speaker}: {text}")
    if len(lines) == 1:
        return ""
    return "\n".join(lines) + "\n\n"



# ── 🎵 Curated Song Catalog for Spotify Recommendations ──
FALLBACK_SONGS = {
    "marathi": [
        ("Man Udhan Varyache", "Shankar Mahadevan"),
        ("Gharat Hasre Tare", "Shreya Ghoshal"),
        ("Radha Hi Bawari", "Swapnil Bandodkar"),
        ("Mitwaa", "Shankar Mahadevan, Janhavi Prabhu"),
        ("Jiv Rangla", "Hariharan, Shreya Ghoshal"),
        ("Saavar Re Mana", "Swapnil Bandodkar, Janhavi Prabhu"),
        ("Tik Tik Vajate Dokyat", "Sonu Nigam, Sayalie Pankaj"),
        ("Mala Ved Laagale", "Swapnil Bandodkar, Ketaki Mategaonkar"),
        ("Sairat Zaala Ji", "Ajay-Atul"),
        ("Aatach Baya Ka Baavarla", "Shreya Ghoshal, Ajay-Atul"),
        ("Yad Lagla", "Ajay Gogavale"),
        ("Zingaat", "Ajay-Atul"),
        ("Apsara Aali", "Bela Shende, Ajay-Atul"),
        ("Shukratara Mand Wara", "Arun Date, Sudha Malhotra"),
        ("Bhatukalichya Khelamadhali", "Arun Date"),
        ("Deva Tujhya Gabharyala", "Adarsh Shinde"),
        ("Mauli Mauli", "Ajay Gogavale"),
        ("Hi Chaal Turu Turu", "Jaywant Kulkarni"),
        ("Dolby Walya", "Nagesh Morwekar"),
        ("Kombdi Palali", "Anand Shinde"),
    ],
    "bollywood": [
        ("Tum Hi Ho", "Arijit Singh"),
        ("Kabira", "Tochi Raina, Rekha Bhardwaj"),
        ("Ilahi", "Arijit Singh"),
        ("Kun Faya Kun", "A.R. Rahman"),
        ("Love You Zindagi", "Amit Trivedi, Jasleen Royal"),
        ("Kesariya", "Arijit Singh"),
        ("Channa Mereya", "Arijit Singh"),
        ("Phir Le Aya Dil", "Arijit Singh"),
        ("Agar Tum Saath Ho", "Alka Yagnik, Arijit Singh"),
        ("Kal Ho Naa Ho", "Sonu Nigam"),
        ("Tera Yaar Hoon Main", "Arijit Singh"),
        ("Sooraj Dooba Hain", "Arijit Singh, Aditi Singh Sharma"),
        ("Badtameez Dil", "Benny Dayal"),
        ("Matargashti", "Mohit Chauhan"),
        ("Ghungroo", "Arijit Singh, Shilpa Rao"),
        ("Apna Bana Le", "Arijit Singh"),
        ("Tere Hawaale", "Arijit Singh, Shilpa Rao"),
        ("Raataan Lambiyan", "Jubin Nautiyal, Asees Kaur"),
        ("Shayad", "Arijit Singh"),
        ("Dil Diyan Gallan", "Atif Aslam"),
    ],
    "hindi": [
        ("Baarishein", "Anuv Jain"),
        ("Kasoor", "Prateek Kuhad"),
        ("Kho Gaye Hum Kahan", "Jasleen Royal, Prateek Kuhad"),
        ("Waqt Ki Baatein", "Dream Note"),
        ("Alag Aasmaan", "Anuv Jain"),
        ("cold/mess", "Prateek Kuhad"),
        ("Mishri", "Anuv Jain"),
        ("Gul", "Anuv Jain"),
        ("Faasle", "Aditya Rikhari"),
        ("Tu Jane Na", "Atif Aslam"),
        ("O Sanam", "Lucky Ali"),
        ("Safarnama", "Lucky Ali"),
        ("Choo Lo", "The Local Train"),
        ("Aaftaab", "The Local Train"),
        ("Dil Mere", "The Local Train"),
        ("Riha", "Anuv Jain"),
        ("Kyun Dhunde", "Vilen"),
        ("Samjho Na", "Aditya Rikhari"),
    ],
    "hollywood": [
        ("Fix You", "Coldplay"),
        ("Here Comes the Sun", "The Beatles"),
        ("Golden Hour", "JVKE"),
        ("Count on Me", "Bruno Mars"),
        ("Sunflower", "Post Malone, Swae Lee"),
        ("Viva La Vida", "Coldplay"),
        ("Yellow", "Coldplay"),
        ("Someone Like You", "Adele"),
        ("Shallow", "Lady Gaga, Bradley Cooper"),
        ("Perfect", "Ed Sheeran"),
        ("Photograph", "Ed Sheeran"),
        ("Put Your Records On", "Corinne Bailey Rae"),
        ("Sunday Morning", "Maroon 5"),
        ("Budapest", "George Ezra"),
        ("Riptide", "Vance Joy"),
        ("Better Together", "Jack Johnson"),
        ("Upside Down", "Jack Johnson"),
        ("Let It Be", "The Beatles"),
    ],
    "lo-fi": [
        ("Eternal Youth", "RUDE"),
        ("Affection", "Jinsang"),
        ("Snowman", "WYS"),
        ("Controlla", "Idealism"),
        ("Can We Kiss Forever?", "Kina"),
        ("5:32 PM", "The Deli"),
        ("Again", "Wun Two"),
        ("I'm in Love", "Kupla"),
        ("Warm Breeze", "Aso"),
        ("Drifting", "Purrple Cat"),
        ("Lullaby", "Sleepy Fish"),
        ("Lost in Thoughts", "Sarcastic Sounds"),
        ("Morning Coffee", "Sora"),
        ("Rainy Afternoon", "Saib"),
    ],
    "punjabi": [
        ("Kinna Chir", "PropheC"),
        ("Waalian", "Harnoor"),
        ("Pasoori", "Ali Sethi, Shae Gill"),
        ("Brown Munde", "AP Dhillon"),
        ("Tu Aake Dekhle", "King"),
        ("Excuses", "AP Dhillon, Gurinder Gill"),
        ("Insane", "AP Dhillon"),
        ("Lover", "Diljit Dosanjh"),
        ("Born to Shine", "Diljit Dosanjh"),
        ("Do You Know", "Diljit Dosanjh"),
        ("Filhall", "B Praak"),
        ("Mann Bharrya", "B Praak"),
        ("Qismat", "Ammy Virk"),
        ("Guitar Sikhda", "Jassi Gill"),
    ],
    "classical": [
        ("Raag Bhairavi", "Hariprasad Chaurasia"),
        ("Morning Raga - Sitar", "Ravi Shankar"),
        ("Bho Shambho", "Sudha Ragunathan"),
        ("Santoor Serenade", "Shivkumar Sharma"),
        ("Krishna Nee Begane", "Colonial Cousins"),
        ("Raag Yaman", "Bismillah Khan"),
        ("Call of the Valley", "Shivkumar Sharma, Hariprasad Chaurasia"),
        ("Raga Megh", "Zakir Hussain"),
        ("Vatapi Ganapatim", "M.S. Subbulakshmi"),
        ("Bhairav Raga Morning Flute", "Ronu Majumdar"),
    ],
    "south_indian": [
        ("Enjoy Enjaami", "Dhee, Arivu"),
        ("Arabic Kuthu", "Anirudh Ravichander"),
        ("Rowdy Baby", "Dhanush, Dhee"),
        ("Samajavaragamana", "Sid Sriram"),
        ("Butta Bomma", "Armaan Malik"),
        ("Inkem Inkem", "Sid Sriram"),
        ("Naatu Naatu", "Rahul Sipligunj, Kaala Bhairava"),
        ("Kadavule Pole", "Sean Roldan"),
    ],
    "malayalam": [
        ("Malare", "Vijay Yesudas"),
        ("Darshana", "Hesham Abdul Wahab"),
        ("Aaloshilam", "Job Kurian"),
        ("Uyiril Thodum", "Sooraj Santhosh"),
        ("Kudukku", "Vineeth Sreenivasan"),
        ("Aaraadhike", "Sooraj Santhosh"),
        ("Manavalan Thug", "Dabzee"),
    ],
    "rap": [
        ("Machayenge", "EMIWAY BANTAI"),
        ("Aafat Waapas", "Naezy"),
        ("Kohinoor", "DIVINE"),
        ("Lose Yourself", "Eminem"),
        ("G.O.A.T.", "Diljit Dosanjh"),
        ("Humble", "Kendrick Lamar"),
        ("Winning Speech", "Karan Aujla"),
        ("Mirchi", "DIVINE"),
    ],
    "latest_2026": [
        ("Tauba Tauba", "Karan Aujla"),
        ("Illuminati", "Sushin Shyam, Dabzee"),
        ("Hass Hass", "Diljit Dosanjh, Sia"),
        ("Espresso", "Sabrina Carpenter"),
        ("Birds of a Feather", "Billie Eilish"),
        ("Aaj Ki Raat", "Sachin-Jigar, Madhubanti"),
    ],
    "famous": [
        ("Chaiyya Chaiyya", "A.R. Rahman, Sukhwinder Singh"),
        ("Tum Hi Ho", "Arijit Singh"),
        ("Shape of You", "Ed Sheeran"),
        ("Kun Faya Kun", "A.R. Rahman"),
        ("Zingaat", "Ajay-Atul"),
        ("Believer", "Imagine Dragons"),
        ("Kal Ho Naa Ho", "Sonu Nigam"),
    ],
}

GENRE_DISPLAY_NAMES = {
    "marathi": "Marathi (मराठी)",
    "bollywood": "Bollywood",
    "hindi": "Hindi Indie",
    "hollywood": "Hollywood / English Pop",
    "lo-fi": "Lo-Fi & Chill",
    "punjabi": "Punjabi",
    "classical": "Classical & Meditative",
    "south_indian": "South Indian",
    "malayalam": "Malayalam (മലയാളം)",
    "rap": "Rap & Hip-Hop",
    "latest_2026": "Latest 2026 Songs",
    "famous": "All-Time Famous Songs",
}


def _detect_music_genre_from_text(text: str, default_pref: str = "bollywood") -> str:
    """Detect if the user explicitly asked for a specific language/genre in their message."""
    t = text.lower()
    if any(w in t for w in ["marathi", "मराठी"]):
        return "marathi"
    if any(w in t for w in ["malayalam", "malyali", "mallu"]):
        return "malayalam"
    if any(w in t for w in ["south indian", "south", "tamil", "telugu", "kannada"]):
        return "south_indian"
    if any(w in t for w in ["rap", "hip hop", "hiphop", "hippop"]):
        return "rap"
    if any(w in t for w in ["latest", "2026", "new song", "recent"]):
        return "latest_2026"
    if any(w in t for w in ["famous", "hit song", "popular", "evergreen", "all time"]):
        return "famous"
    if any(w in t for w in ["hindi", "हिंदी"]):
        return "hindi"
    if any(w in t for w in ["bollywood", "bolly"]):
        return "bollywood"
    if any(w in t for w in ["hollywood", "english", "western", "pop"]):
        return "hollywood"
    if any(w in t for w in ["punjabi", "पंजाबी", "bhangra"]):
        return "punjabi"
    if any(w in t for w in ["classical", "shastriya", "raga", "sitar", "flute"]):
        return "classical"
    if any(w in t for w in ["lofi", "lo-fi", "chill", "ambient"]):
        return "lo-fi"
    return (default_pref or "bollywood").lower().strip()


def _match_intent_keywords(text: str, kw_list: list[str]) -> bool:
    if not text:
        return False
    t = text.lower()
    for kw in kw_list:
        if " " in kw or any(ord(c) > 127 for c in kw):
            if kw in t:
                return True
        elif kw in ("meditat", "breathe"):
            if kw in t:
                return True
        else:
            if re.search(r'\b' + re.escape(kw) + r'\b', t):
                return True
    return False


def detect_chat_intent(user_text: str = "", reply_text: str = "") -> str:
    """Detect which Emotion Care wellness pillar the conversation relates to.
    Returns one of: 'games', 'places', 'photos', 'studio', 'meditation', 'movie', 'music', 'general'.
    The result drives which recommendation card is promoted to position #1."""
    categories = [
        ("music", ["song", "songs", "music", "gaana", "geet", "track", "tracks", "playlist", "spotify", "listen to", "गाणे", "गाना", "melody", "tune", "tunes"]),
        ("movie", ["movie", "movies", "film", "films", "cinema", "flick", "flicks", "watch", "चित्रपट", "सिनेमा", "web series", "documentary"]),
        ("meditation", ["meditat", "breathe", "breathing", "mindful", "guided session", "guided meditation", "calm down", "zen", "relax my mind", "ध्यान", "pranayam", "deep breath"]),
        ("games", ["game", "games", "play a game", "play games", "playing games", "bored", "boring", "boredom", "mindful games", "mini-game", "mini games", "puzzle", "bubble pop", "खेळ", "खेल", "गेम"]),
        ("places", ["step outside", "outside", "walk", "park", "cafes", "cafe", "garden", "gardens", "trail", "nature", "fresh air", "go out", "outing", "stuck indoors", "stroll", "change of scenery", "बाहेर", "बाहर", "चलना"]),
        ("photos", ["family", "mom", "dad", "mother", "father", "parents", "sister", "brother", "miss my", "missing", "childhood", "memories", "photo", "photos", "nostalgic", "picture", "pictures", "घर", "आई", "बाबा", "परिवार", "आठवण", "याद"]),
        ("studio", ["studio", "mood studio", "photo booth", "creative selfie", "artistic selfie", "self-expression"]),
    ]

    # Prioritize what the user explicitly said or asked for
    for intent, kws in categories:
        if _match_intent_keywords(user_text, kws):
            return intent

    # Next check if the reply context naturally focuses on a specific pillar
    for intent, kws in categories:
        if _match_intent_keywords(reply_text, kws):
            return intent

    return "general"



def _is_song_request(text: str) -> bool:
    t = text.lower()
    song_keywords = ["song", "music", "gaana", "geet", "track", "playlist", "spotify", "listen to", "गाणे", "गाना"]
    return any(w in t for w in song_keywords)


def _is_movie_request(text: str) -> bool:
    t = text.lower()
    movie_keywords = [
        "movie", "movies", "film", "films", "cinema", "flick", "watch",
        "picture", "चित्रपट", "सिनेमा", "web series", "documentary"
    ]
    return any(w in t for w in movie_keywords)


def _is_meditation_request(text: str) -> bool:
    t = text.lower()
    meditation_keywords = [
        "meditat", "breathe", "breathing", "mindful", "guided session",
        "guided meditation", "calm down", "zen", "peace", "relax my mind", "ध्यान"
    ]
    return any(w in t for w in meditation_keywords)


def _get_meditation_recommendation_reply(
    text: str = "",
    history: list[ChatMessage] = None,
) -> str:
    return (
        "Taking a pause to meditate is such a gentle, compassionate gift to give yourself right now. "
        "When your thoughts have felt heavy or your day has been busy, you don't need to force anything or try to 'empty' your mind—simply "
        "giving yourself permission to step away from the noise and just breathe is more than enough.\n\n"
        "I have prepared our guided practice for you in our **Recommended Practices** section on the right side of your screen. "
        "You can tap the **'Start reset'** button on **The quiet between tasks** (or **A little room to breathe**) to begin right away. "
        "Our calming voice guide and soothing soundscape will gently guide every inhale and exhale for you, so you can close your eyes, "
        "relax your shoulders, and step away from the screen completely.\n\n"
        "Take a slow, natural breath, find a comfortable position, and tap **Start reset** whenever you feel ready. I'm right here with you."
    )


def _detect_movie_category_from_text(text: str, default_pref: str = "bollywood") -> str:
    t = text.lower()
    if any(w in t for w in ["marathi", "मराठी"]):
        return "marathi"
    if any(w in t for w in ["south", "malayalam", "tamil", "telugu", "kannada"]):
        return "south_indian"
    if any(w in t for w in ["hollywood", "english", "world", "foreign", "french", "anime", "japanese"]):
        return "international"
    if any(w in t for w in ["hindi", "bollywood", "हिंदी"]):
        return "hindi"
    if (default_pref or "").lower() == "marathi":
        return "marathi"
    if (default_pref or "").lower() == "hollywood":
        return "international"
    return "hindi"


def _get_movie_recommendation_reply(
    text: str = "",
    history: list[ChatMessage] = None,
    music_preference: str = "bollywood",
) -> str:
    from app.services.external_recommendations import MULTILINGUAL_MOVIES
    cat = _detect_movie_category_from_text(text, default_pref=music_preference)
    movies = MULTILINGUAL_MOVIES.get(cat, MULTILINGUAL_MOVIES["hindi"])

    recent_titles = set()
    if history:
        for m in history:
            msg_text = getattr(m, "text", "") or ""
            for m_title, m_year, m_lang, m_genre, m_desc in movies:
                if m_title.lower() in msg_text.lower():
                    recent_titles.add(m_title)

    candidate_movies = [m for m in movies if m[0] not in recent_titles]
    if len(candidate_movies) < 2:
        candidate_movies = movies

    chosen = random.sample(candidate_movies, min(2, len(candidate_movies)))
    m1, m2 = chosen[0], chosen[1]

    cat_labels = {
        "hindi": "Hindi & Bollywood",
        "marathi": "Marathi (मराठी)",
        "south_indian": "South Indian cinema",
        "international": "Hollywood & World cinema",
    }
    label = cat_labels.get(cat, "comforting feel-good")

    return (
        f"Here are two wonderful, heartwarming {label} movies to help you relax and lift your spirits: "
        f"**{m1[0]}** ({m1[1]}, {m1[2]}) and **{m2[0]}** ({m2[1]}, {m2[2]}) 🍿.\n\n"
        f"*{m1[0]}* is a {m1[4].lower()} Meanwhile, *{m2[0]}* brings {m2[4].lower()}\n\n"
        f"I have also featured the movie on the right side under More For Your Mood so you can explore it right away. "
        f"Grab a warm cup of tea or a comfortable blanket, and let yourself get lost in a gentle story. How does that sound?"
    )


def _get_song_recommendation_reply(
    text: str = "",
    history: list[ChatMessage] = None,
    music_preference: str = "bollywood",
) -> str:
    # 1. Determine genre: message explicit request takes priority over profile default
    pref_key = _detect_music_genre_from_text(text, default_pref=music_preference)
    songs = FALLBACK_SONGS.get(pref_key, FALLBACK_SONGS["bollywood"])
    
    # 2. Extract songs already mentioned recently in conversation to prevent repetition
    recent_titles = set()
    if history:
        for m in history:
            msg_text = getattr(m, "text", "") or ""
            for title, _ in songs:
                if title.lower() in msg_text.lower():
                    recent_titles.add(title)
                    
    # 3. Filter out recently recommended songs
    candidate_songs = [s for s in songs if s[0] not in recent_titles]
    if len(candidate_songs) < 2:
        candidate_songs = songs  # Reset pool if all were used
        
    chosen = random.sample(candidate_songs, min(2, len(candidate_songs)))
    
    links = []
    for title, artist in chosen:
        q = urllib.parse.quote(f"{title} {artist}")
        links.append(f"[{title} - {artist}](https://open.spotify.com/search/{q})")
        
    pref_display = GENRE_DISPLAY_NAMES.get(pref_key, pref_key.capitalize())
    return (
        f"Here are two {pref_display} tracks to bring some good energy and comfort to your space: "
        f"**{chosen[0][0]}** by {chosen[0][1]} and **{chosen[1][0]}** by {chosen[1][1]} 🎵. "
        "I have featured the direct Spotify player in your recommendations on the right side! "
        "Take a slow breath while you listen. How does that feel?"
    )


def extract_mentioned_song(reply_text: str = "", user_text: str = "", active_intent: str = "") -> tuple[str, str] | None:
    """Extract (song_title, spotify_url) from a chat reply or user prompt so it can be featured on the right-side card.
    Carefully avoids extracting movie titles or movie recommendations as songs.
    Gated by intent detection — only extracts if the conversation is about music."""
    # When intent system is active, only extract songs for music intent
    if active_intent and active_intent != "music":
        return None
    # When called without intent (legacy/direct calls), check if user or reply text mentions music
    if not active_intent and not _is_song_request(user_text) and not _is_song_request(reply_text):
        return None

    from app.services.external_recommendations import ALL_MOVIE_TITLES

    combined = f"{user_text} {reply_text}"
    if not combined.strip():
        return None

    # If the user specifically asked for a movie and NOT a song, do not treat reply entities as songs
    if _is_movie_request(user_text) and not _is_song_request(user_text):
        return None

    # 1. Check if markdown Spotify link exists in reply: [Title](https://open.spotify.com/search/...)
    m = re.search(r'\[([^\]]+)\]\((https?://open\.spotify\.com/search/[^\)]+)\)', reply_text)
    if m:
        return (m.group(1).strip(), m.group(2).strip())

    # 2. Check for bold title in reply: **Title**
    for m in re.finditer(r'\*\*([^*]{2,50})\*\*', reply_text):
        cand = m.group(1).strip()
        # Skip if candidate is a known movie title
        if cand.lower() in ALL_MOVIE_TITLES:
            continue
        # Skip if window surrounding the entity refers to films or watching
        window = reply_text[max(0, m.start()-40):min(len(reply_text), m.end()+40)].lower()
        if any(w in window for w in ["film", "movie", "watch", "cinema", "directed by", "flick", "coming-of-age film"]):
            continue

        if len(cand.split()) <= 7 and not cand.lower().startswith("rule") and not cand.lower().startswith("note"):
            after = reply_text[m.end():m.end()+45]
            by_m = re.search(r'^\s*(?:by|-)\s*([A-Za-z\s\.\&]+)', after)
            if by_m:
                artist = by_m.group(1).strip().rstrip(",.!?")
                title = f"{cand} - {artist}"
            else:
                title = cand
            q = urllib.parse.quote(title)
            return (title, f"https://open.spotify.com/search/{q}")

    # 3. Check for quoted title: "Title" or 'Title'
    for m in re.finditer(r'["“\']([^"”\']{2,40})["”\']', reply_text):
        cand = m.group(1).strip()
        if cand.lower() in ALL_MOVIE_TITLES:
            continue
        window = reply_text[max(0, m.start()-40):min(len(reply_text), m.end()+40)].lower()
        if any(w in window for w in ["film", "movie", "watch", "cinema", "directed by", "flick", "coming-of-age film"]):
            continue

        if len(cand.split()) <= 6:
            after = reply_text[m.end():m.end()+45]
            by_m = re.search(r'^\s*(?:by|-)\s*([A-Za-z\s\.\&]+)', after)
            if by_m:
                artist = by_m.group(1).strip().rstrip(",.!?")
                title = f"{cand} - {artist}"
            else:
                title = cand
            q = urllib.parse.quote(title)
            return (title, f"https://open.spotify.com/search/{q}")

    # 4. Check against catalog songs
    lowered = combined.lower()
    for genre, song_list in FALLBACK_SONGS.items():
        for s_title, s_artist in song_list:
            if s_title.lower() in lowered:
                full = f"{s_title} - {s_artist}"
                q = urllib.parse.quote(full)
                return (full, f"https://open.spotify.com/search/{q}")

    return None


def clean_chat_reply_text(reply_text: str, is_crisis: bool = False) -> str:
    """Ensure no raw Spotify URLs or links clutter the chat bubble text.
    Replaces markdown Spotify links with clean bold song titles.
    When is_crisis is False, also strips any hallucinated crisis/helpline
    boilerplate paragraphs so normal questions (songs, movies, etc.) remain clean."""
    if not reply_text:
        return ""
    # Remove any trailing "🎧 Listen here: ..."
    cleaned = re.sub(r'\n*🎧\s*Listen here:.*$', '', reply_text, flags=re.IGNORECASE)
    # Replace [Title](https://open.spotify...) with **Title**
    cleaned = re.sub(r'\[([^\]]+)\]\(https?://open\.spotify\.com/[^\)]+\)', r'**\1**', cleaned)
    # Also clean raw open.spotify.com URLs if any slipped through
    cleaned = re.sub(r'https?://open\.spotify\.com/search/[^\s\)\"\']+', '', cleaned)

    if not is_crisis:
        # If this is not an active crisis turn, strip any crisis disclaimer paragraphs
        crisis_markers = [
            r"frightening thoughts",
            r"tele-manas",
            r"\b14416\b",
            r"emergency services.*112",
            r"call(ing)? local emergency",
            r"well-being matter infinitely",
            r"suicide prevention",
            r"safe space for you at your own gentle pace",
        ]
        pattern = re.compile("|".join(crisis_markers), re.IGNORECASE)

        # Split into paragraphs
        paragraphs = re.split(r'\n\s*\n', cleaned)
        retained_paragraphs = []
        for p in paragraphs:
            if not pattern.search(p):
                retained_paragraphs.append(p)

        if retained_paragraphs:
            cleaned = "\n\n".join(retained_paragraphs)
        else:
            cleaned = "I'm right here with you, listening closely and supporting you every step of the way."

    return cleaned.strip()



# ── 🛡️ Curated fallbacks — demo-proofing, same philosophy as Week 3 ──
FALLBACK_CHAT = {
    "joy": [
        "This brings such a genuine smile to my face! 😊 Your happiness and positive energy radiate through your words, and moments like this deserve to be fully celebrated and savored.\n\n"
        "Life moves so quickly, so when something good happens, taking a moment to breathe it in and feel the warmth in your chest can carry you forward for days. What's been the very best part of what happened today?",
        "I can feel the joy and lightness in what you're sharing! 💛 It is truly wonderful when things fall into place or bring that spark of delight to your day.\n\n"
        "Take a slow breath and let that happiness settle into you. I'd love to hear more if you want to share—what made today feel so special?",
    ],
    "sadness": [
        "I am so glad you felt safe enough to share this with me. 💙 Sadness can feel so quiet, heavy, and exhausting to carry all on your own, and I want you to know you don't have to face it alone right now.\n\n"
        "Your feelings are completely valid. Please give yourself permission to feel whatever you are feeling without judging yourself. Healing and lightness take time, and being patient with yourself is the greatest kindness you can offer your heart today.\n\n"
        "I am right here with you, listening closely. What is weighing on you the most in this moment?",
        "Thank you for trusting me with what's on your heart. 💙 It takes courage to acknowledge when you're hurting, and I want you to know that your pain is heard and deeply respected here.\n\n"
        "Whatever is causing this ache, remember that you are stronger than this heavy moment, even when it doesn't feel like it. Take a soft, slow breath and let your shoulders drop.\n\n"
        "I'm listening whenever you're ready. What part of this has been the hardest to sit with?",
    ],
    "anger": [
        "I hear how intense and frustrating this is, and your feelings make complete sense. 🧡 When something feels unfair, disrespectful, or completely out of your control, anger is our natural way of protecting what matters to us.\n\n"
        "Before reacting or trying to fix it all at once, give yourself a moment to just pause and breathe. You don't have to carry that burning heat by yourself. Letting it out here safely is a healthy way to clear the air in your mind.\n\n"
        "I'm in your corner. What was the moment that triggered this, and what do you wish had happened differently?",
        "It takes real self-awareness to step back and talk about anger instead of letting it consume you. 🧡 That frustration is telling you something important about your boundaries or your values.\n\n"
        "Take a deep breath and let the tension in your jaw and hands relax. You have the right to feel upset, and you also deserve peace of mind.\n\n"
        "Tell me more about what happened—I'm here to listen to every bit of it.",
    ],
    "fear": [
        "That sounds genuinely overwhelming, and I want you to know that it is completely okay to feel anxious or afraid. 💚 Fear has a way of painting catastrophic pictures in our minds, making the unknown feel terrifying.\n\n"
        "Let's gently anchor ourselves right now. Feel your feet resting firmly on the ground, notice the air around you, and take one long, slow exhale. You only have to handle right now, not everything that might happen tomorrow.\n\n"
        "I'm right beside you. What's the main worry looping through your mind? Saying it out loud often helps take away some of its power.",
        "I'm right here with you. 💚 Anxiety and fear can make our heart race and our thoughts spiral, but you are safe in this present moment.\n\n"
        "You've navigated difficult, uncertain moments before, even when you weren't sure how you would. Trust that your inner strength is still there, even when fear is loud.\n\n"
        "What is the biggest thing on your mind right now? We can take it one small thought at a time.",
    ],
    "surprise": [
        "Life really just threw an unexpected curveball your way! 💜 When something catches you completely off-guard, it takes a little time for your mind and nervous system to catch up and process it all.\n\n"
        "Whether it feels exciting, confusing, or a bit disorienting, give yourself the space to absorb what happened without rushing to make sense of everything immediately.\n\n"
        "How are you feeling now that the initial shock is settling? Was it a welcome surprise or something tricky to navigate?",
    ],
    "disgust": [
        "Something about that clearly crossed a line or didn't sit right with you at all—and that gut reaction is worth paying attention to. 💜 Disgust often shows up when our fundamental values or personal boundaries feel violated.\n\n"
        "It's completely normal to feel an urge to pull away or feel unsettled after experiencing something like that. Honoring your boundaries is an essential part of self-care.\n\n"
        "What felt most off-putting or wrong about it? I'm here to help you unpack it.",
    ],
    "neutral": [
        "Thank you for checking in with me today. ✨ Sometimes our days aren't filled with big emotional peaks or valleys—they're just quiet, steady, and unfolding one moment at a time.\n\n"
        "These calm, neutral moments can actually be wonderful opportunities to pause, check in with how your body is feeling, and give yourself a little breathing room.\n\n"
        "How has your day been treating you so far, and is there anything on your mind you'd like to reflect on together?",
        "I'm so glad you're here. 💚 Whether you have a lot on your mind or are just looking for a peaceful moment of connection, this space is yours.\n\n"
        "Take a slow breath, relax your shoulders, and let me know how you're doing today. What's been occupying your thoughts lately?",
    ],
}


def _fallback_reply(
    emotion: str,
    text: str = "",
    history: list[ChatMessage] = None,
    music_preference: str = "bollywood",
) -> str:
    if _is_song_request(text):
        return _get_song_recommendation_reply(text, history, music_preference)
    if _is_movie_request(text):
        return _get_movie_recommendation_reply(text, history, music_preference)
    if _is_meditation_request(text):
        return _get_meditation_recommendation_reply(text, history)
    
    # Contextual check: friend / relationship argument
    t = text.lower() if text else ""
    if any(w in t for w in ["fight", "argued", "argument", "best friend", "friend"]) and emotion in {"sadness", "anger"}:
        return (
            "I hear the ache in your heart, and it sounds so heavy. Having a disagreement or fight with your best friend is one of the most painful and disorienting feelings, because that person holds such a special space in your everyday world.\n\n"
            "Please take a slow, gentle breath and be kind to yourself right now. Disagreements hurt this deeply precisely because you care so much about each other. It doesn't mean your friendship is broken or that your bond has vanished—most deep friendships find a way back once emotions cool down and there is room for gentle understanding.\n\n"
            "I'm right here with you, listening without any judgment. Do you want to tell me what happened, or what hurts the most about it right now?"
        )
    
    return random.choice(FALLBACK_CHAT.get(emotion, FALLBACK_CHAT["neutral"]))


def generate_chat_reply(
    text: str,
    emotion: str,
    history: list[ChatMessage],
    ai_allowed: bool = False,
    music_preference: str = "bollywood",
) -> str:
    """Gemini reply with trimmed conversation context.
    Reuses the Week 3 singleton client — auto-fallback if unavailable."""
    # Detect if user specifically asked for a genre in this message
    active_genre = _detect_music_genre_from_text(text, default_pref=music_preference)
    
    service = get_gemini_service()
    if service.client is None or not ai_allowed:
        return _fallback_reply(emotion, text, history, active_genre)
    try:
        prompt = CHAT_PROMPT.format(
            history=_format_history(history),
            emotion=emotion,
            text=text,
            music_preference=active_genre,
        )
        response = service.client.models.generate_content(
            model=GEMINI_MODEL, contents=prompt
        )
        reply = response.text.strip()
        return clean_chat_reply_text(reply)
    except Exception as e:
        import logging

        logging.getLogger(__name__).warning("gemini_chat_fallback: %s", e)
        return _fallback_reply(emotion, text, history, active_genre)
