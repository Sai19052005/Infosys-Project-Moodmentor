import { useMemo } from 'react'

const EMOTION_CONFIG = {
  sadness: {
    emoji: '🥺',
    title: 'Feeling Sad or Tender',
    subtitle: 'Sending you a gentle hug. It is completely okay to feel this way.',
    theme: {
      bg: 'linear-gradient(135deg, #e0f2fe 0%, #ede9fe 100%)',
      glow: '#93c5fd',
      face: '#ffedd5',
      blush: '#fda4af',
      accent: '#60a5fa',
    },
    moodClass: 'mood-sadness',
  },
  grief: {
    emoji: '🥺',
    title: 'Grief & Heavy Heart',
    subtitle: 'Take all the time you need. You don’t have to carry this alone.',
    theme: {
      bg: 'linear-gradient(135deg, #e2e8f0 0%, #e0e7ff 100%)',
      glow: '#cbd5e1',
      face: '#fef3c7',
      blush: '#fca5a5',
      accent: '#818cf8',
    },
    moodClass: 'mood-sadness',
  },
  joy: {
    emoji: '🥰',
    title: 'Joy & Bright Energy',
    subtitle: 'Your smile lights up the room! Savor this sweet feeling.',
    theme: {
      bg: 'linear-gradient(135deg, #fef08a 0%, #fed7aa 100%)',
      glow: '#fde047',
      face: '#fffbeb',
      blush: '#fb7185',
      accent: '#f59e0b',
    },
    moodClass: 'mood-joy',
  },
  amusement: {
    emoji: '😄',
    title: 'Cheerful & Playful',
    subtitle: 'A wonderful moment of lightness and fun.',
    theme: {
      bg: 'linear-gradient(135deg, #fef9c3 0%, #fed7aa 100%)',
      glow: '#fde047',
      face: '#fffbeb',
      blush: '#f43f5e',
      accent: '#ea580c',
    },
    moodClass: 'mood-joy',
  },
  anger: {
    emoji: '😤',
    title: 'Feeling Frustrated',
    subtitle: 'Your frustration is valid. Let’s take a slow breath together.',
    theme: {
      bg: 'linear-gradient(135deg, #fee2e2 0%, #ffedd5 100%)',
      glow: '#fca5a5',
      face: '#fff1f2',
      blush: '#fb7185',
      accent: '#f87171',
    },
    moodClass: 'mood-anger',
  },
  annoyance: {
    emoji: '😮‍💨',
    title: 'A Little Annoyed',
    subtitle: 'Giving you room to shake off the friction and reset.',
    theme: {
      bg: 'linear-gradient(135deg, #fee2e2 0%, #fed7aa 100%)',
      glow: '#fed7aa',
      face: '#fff1f2',
      blush: '#fb7185',
      accent: '#fb923c',
    },
    moodClass: 'mood-anger',
  },
  fear: {
    emoji: '🫣',
    title: 'Anxious or Overwhelmed',
    subtitle: 'You are safe in this quiet space. One breath at a time.',
    theme: {
      bg: 'linear-gradient(135deg, #dbeafe 0%, #ccfbf1 100%)',
      glow: '#99f6e4',
      face: '#f0fdfa',
      blush: '#fbcfe8',
      accent: '#2dd4bf',
    },
    moodClass: 'mood-fear',
  },
  nervousness: {
    emoji: '🥺',
    title: 'Jittery or Nervous',
    subtitle: 'Breathe out slowly. You have what it takes to navigate this.',
    theme: {
      bg: 'linear-gradient(135deg, #e0e7ff 0%, #cffafe 100%)',
      glow: '#a5b4fc',
      face: '#f5f3ff',
      blush: '#f472b6',
      accent: '#6366f1',
    },
    moodClass: 'mood-fear',
  },
  surprise: {
    emoji: '😯',
    title: 'Curious & Surprised',
    subtitle: 'Taking in the unexpected with an open heart.',
    theme: {
      bg: 'linear-gradient(135deg, #f3e8ff 0%, #fae8ff 100%)',
      glow: '#d8b4fe',
      face: '#faf5ff',
      blush: '#f472b6',
      accent: '#c084fc',
    },
    moodClass: 'mood-surprise',
  },
  love: {
    emoji: '💖',
    title: 'Warmth & Connection',
    subtitle: 'Surrounded by genuine kindness and caring thoughts.',
    theme: {
      bg: 'linear-gradient(135deg, #ffe4e6 0%, #fce7f3 100%)',
      glow: '#f472b6',
      face: '#fff1f2',
      blush: '#fb7185',
      accent: '#ec4899',
    },
    moodClass: 'mood-love',
  },
  neutral: {
    emoji: '😌',
    title: 'Calm & Present',
    subtitle: 'A steady, quiet pause to reset your mind whenever you are ready.',
    theme: {
      bg: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
      glow: '#cbd5e1',
      face: '#f8fafc',
      blush: '#fbcfe8',
      accent: '#94a3b8',
    },
    moodClass: 'mood-neutral',
  },
}

export default function CuteEmotionVisual({ emotion = 'neutral' }) {
  const normKey = (emotion || 'neutral').toLowerCase().replace(/\s+/g, '_')
  const config = useMemo(() => {
    return (
      EMOTION_CONFIG[normKey] ||
      (normKey.includes('sad') || normKey.includes('grief') || normKey.includes('disappoint')
        ? EMOTION_CONFIG.sadness
        : normKey.includes('joy') || normKey.includes('happy') || normKey.includes('excit')
          ? EMOTION_CONFIG.joy
          : normKey.includes('ang') || normKey.includes('annoy') || normKey.includes('frustrat')
            ? EMOTION_CONFIG.anger
            : normKey.includes('fear') || normKey.includes('anx') || normKey.includes('nerv')
              ? EMOTION_CONFIG.fear
              : normKey.includes('lov') || normKey.includes('grat') || normKey.includes('car')
                ? EMOTION_CONFIG.love
                : EMOTION_CONFIG.neutral)
    )
  }, [normKey])

  const { emoji, title, subtitle, theme } = config

  return (
    <div
      className="cute-emotion-card"
      style={{
        background: theme.bg,
        boxShadow: `0 8px 24px -4px ${theme.glow}44`,
      }}
      role="img"
      aria-label={`Detected emotion: ${title}`}
    >
      <div className="cute-face-container">
        {/* Animated cute face SVG */}
        <svg
          viewBox="0 0 120 120"
          className="cute-face-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="faceGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="100%" stopColor={theme.face} stopOpacity="1" />
            </radialGradient>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Head */}
          <circle
            cx="60"
            cy="60"
            r="48"
            fill="url(#faceGlow)"
            stroke="#ffffff"
            strokeWidth="3.5"
            filter="url(#softShadow)"
          />

          {/* Blushing Cheeks */}
          <ellipse
            cx="32"
            cy="67"
            rx="8"
            ry="4.5"
            fill={theme.blush}
            opacity="0.65"
            className="cute-cheek"
          />
          <ellipse
            cx="88"
            cy="67"
            rx="8"
            ry="4.5"
            fill={theme.blush}
            opacity="0.65"
            className="cute-cheek"
          />

          {/* Eyes & Eyebrows depending on mood */}
          {normKey.includes('sad') || normKey.includes('grief') ? (
            <>
              {/* Sad soft drooped brows */}
              <path
                d="M 35 44 Q 43 47 49 43"
                stroke="#64748b"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 71 43 Q 77 47 85 44"
                stroke="#64748b"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Shiny puppy dog eyes */}
              <circle cx="43" cy="54" r="8" fill="#1e293b" />
              <circle cx="41" cy="51" r="3.2" fill="#ffffff" />
              <circle cx="45" cy="56" r="1.6" fill="#ffffff" />

              <circle cx="77" cy="54" r="8" fill="#1e293b" />
              <circle cx="75" cy="51" r="3.2" fill="#ffffff" />
              <circle cx="79" cy="56" r="1.6" fill="#ffffff" />

              {/* Gentle cute teardrop gleam */}
              <path
                d="M 87 63 C 87 60 89 57 89 57 C 89 57 91 60 91 63 C 91 65 89 66 88 66 C 87 66 87 65 87 63 Z"
                fill="#60a5fa"
                opacity="0.85"
                className="cute-tear"
              />

              {/* Gentle downturned pouty mouth */}
              <path
                d="M 52 75 Q 60 70 68 75"
                stroke="#334155"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
            </>
          ) : normKey.includes('joy') || normKey.includes('happy') ? (
            <>
              {/* Happy curved eyes (^_^) */}
              <path
                d="M 35 55 Q 43 45 51 55"
                stroke="#1e293b"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
                className="happy-eye"
              />
              <path
                d="M 69 55 Q 77 45 85 55"
                stroke="#1e293b"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
                className="happy-eye"
              />
              {/* Sweet open smiling mouth with tongue */}
              <path
                d="M 50 68 Q 60 84 70 68 Z"
                fill="#e11d48"
                stroke="#1e293b"
                strokeWidth="2"
              />
              <path
                d="M 55 75 Q 60 83 65 75"
                fill="#fda4af"
              />
              {/* Little sparkles */}
              <text x="18" y="40" fontSize="14" className="sparkle-float">✨</text>
              <text x="90" y="38" fontSize="14" className="sparkle-float">✨</text>
            </>
          ) : normKey.includes('ang') ? (
            <>
              {/* Determined / pouty brows */}
              <path
                d="M 34 45 L 48 50"
                stroke="#b91c1c"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 86 45 L 72 50"
                stroke="#b91c1c"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Cute round pouty eyes */}
              <circle cx="43" cy="56" r="6" fill="#1e293b" />
              <circle cx="42" cy="54" r="2" fill="#ffffff" />
              <circle cx="77" cy="56" r="6" fill="#1e293b" />
              <circle cx="76" cy="54" r="2" fill="#ffffff" />
              {/* Cute wavy pout line */}
              <path
                d="M 53 74 Q 60 70 67 74"
                stroke="#1e293b"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
              {/* Little steam puff */}
              <text x="86" y="38" fontSize="14">💨</text>
            </>
          ) : normKey.includes('fear') || normKey.includes('anx') ? (
            <>
              {/* Anxious cute eyes */}
              <circle cx="43" cy="55" r="7.5" fill="#1e293b" />
              <circle cx="41" cy="52" r="3" fill="#ffffff" />
              <circle cx="77" cy="55" r="7.5" fill="#1e293b" />
              <circle cx="75" cy="52" r="3" fill="#ffffff" />
              {/* Soft wavy mouth */}
              <path
                d="M 52 73 Q 56 71 60 73 Q 64 75 68 73"
                stroke="#1e293b"
                strokeWidth="2.6"
                strokeLinecap="round"
                fill="none"
              />
            </>
          ) : (
            <>
              {/* Calm serene smiling eyes */}
              <path
                d="M 36 54 Q 44 48 52 54"
                stroke="#334155"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 68 54 Q 76 48 84 54"
                stroke="#334155"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              {/* Gentle sweet smile */}
              <path
                d="M 52 70 Q 60 77 68 70"
                stroke="#334155"
                strokeWidth="2.6"
                strokeLinecap="round"
                fill="none"
              />
            </>
          )}
        </svg>

        {/* Emotion Badge Pill */}
        <div className="cute-emotion-badge">
          <span className="cute-emoji-icon">{emoji}</span>
          <span className="cute-emotion-name">{title}</span>
        </div>
      </div>

      <p className="cute-emotion-subtitle">{subtitle}</p>
    </div>
  )
}
