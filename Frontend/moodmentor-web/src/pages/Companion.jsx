import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../lib/api'
import { useResource, navigate } from '../lib/hooks'
import {
  Badge,
  Button,
  Dialog,
  ErrorState,
  Icon,
  Loading,
} from '../components/ui'
import { ActivityArtwork, WellnessPhoto } from '../components/WellnessVisual'
import CuteEmotionVisual from '../components/CuteEmotionVisual'
import PlanCard from '../components/PlanCard'
import VoiceInput from '../components/VoiceInput'
import { SPEECH_LANGUAGES, textLanguage, useNarrator } from '../lib/speech'
const CompanionTools = lazy(() => import('../components/CompanionTools'))

const PROMPTS = [
  [
    'leaf',
    'A full day?',
    'Meetings all day. I feel drained and need a small break.',
    'lime',
  ],
  [
    'spark',
    'Find my focus',
    'I am finding it hard to focus. Help me take one small step.',
    'lilac',
  ],
  [
    'sun',
    'Something good',
    'Something good happened today and I want to reflect on it.',
    'peach',
  ],
]
function timestamp(value) {
  return Date.parse(/[zZ]|[+-]\d\d:\d\d$/.test(value) ? value : value + 'Z')
}

function renderFormattedText(textChunk, keyPrefix) {
  if (typeof textChunk !== 'string') return textChunk
  const boldRegex = /\*\*([^*]+)\*\*/g
  const subParts = []
  let lastIdx = 0
  let bMatch
  while ((bMatch = boldRegex.exec(textChunk)) !== null) {
    if (bMatch.index > lastIdx) {
      subParts.push(textChunk.slice(lastIdx, bMatch.index))
    }
    subParts.push(
      <strong key={`${keyPrefix}-b-${bMatch.index}`} className="song-mention-highlight">
        {bMatch[1]}
      </strong>
    )
    lastIdx = boldRegex.lastIndex
  }
  if (lastIdx < textChunk.length) {
    subParts.push(textChunk.slice(lastIdx))
  }
  return subParts.length > 0 ? subParts : textChunk
}

export function renderMessageText(text) {
  if (!text) return null
  // In chat: DO NOT render direct links to Spotify. Only mention song names in bold.
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g
  const parts = []
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    const label = match[1]
    const url = match[2]
    const isSpotify = url.includes('spotify.com')

    if (isSpotify) {
      // Mention song name in bold without link in chat
      parts.push(
        <strong key={match.index} className="song-mention-highlight">
          {label}
        </strong>
      )
    } else {
      parts.push(
        <a
          key={match.index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="chat-text-link"
        >
          {label}
        </a>
      )
    }
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return (
    <div className="message-rendered-text">
      {parts.map((part, idx) =>
        typeof part === 'string' ? (
          <span key={idx} style={{ whiteSpace: 'pre-line' }}>{renderFormattedText(part, idx)}</span>
        ) : (
          part
        )
      )}
    </div>
  )
}

export default function Companion({
  user,
  onStart,
  onSafety,
  revision = 0,
  initialReflection = false,
  audioBlocked = false,
}) {
  const chat = useResource('/chat/history?limit=100'),
    reflections = useResource('/journal/history?limit=50'),
    summary = useResource('/wellness/summary')
  const [text, setText] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [plan, setPlan] = useState(null),
    [hasNewPlan, setHasNewPlan] = useState(false)
  const [reflectionMode, setReflectionMode] = useState(initialReflection),
    [clear, setClear] = useState(false),
    [tool, setTool] = useState(null),
    [panelOpen, setPanelOpen] = useState(
      () =>
        window.innerWidth > 900 &&
        localStorage.getItem('moodmentor-recommendations') !== 'hidden',
    )
  const [pendingText, setPendingText] = useState(''),
    [notice, setNotice] = useState('')
  const [recording, setRecording] = useState(false),
    [voiceOptions, setVoiceOptions] = useState(false),
    [readReplies, setReadReplies] = useState(false),
    [readingKey, setReadingKey] = useState(null)
  const [voiceLanguage, setVoiceLanguage] = useState(() => {
    const saved = localStorage.getItem('moodmentor-voice-language')
    return SPEECH_LANGUAGES.some((l) => l.id === saved) ? saved : 'en'
  })
  const narrator = useNarrator()
  useEffect(() => {
    localStorage.setItem('moodmentor-voice-language', voiceLanguage)
  }, [voiceLanguage])
  useEffect(() => {
    if (tool || clear || recording || audioBlocked) narrator.stop()
  }, [tool, clear, recording, audioBlocked, narrator.stop])
  function readMessage(message, key) {
    if (narrator.speaking && readingKey === key) {
      narrator.stop()
      return
    }
    setReadingKey(key)
    const cleanText = (message || '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    narrator.speak(cleanText, textLanguage(cleanText, voiceLanguage))
  }
  function startActivity(...args) {
    narrator.stop()
    onStart(...args)
  }
  const bottom = useRef(null),
    input = useRef(null),
    previousRevision = useRef(revision)
  const messages = useMemo(
    () =>
      [
        ...(chat.data || []).map((m) => ({
          ...m,
          key: `chat-${m.id}`,
          sources: m.sources || [],
        })),
        ...(reflections.data || []).flatMap((r) =>
          [
            {
              id: r.id,
              key: `reflection-${r.id}`,
              role: 'user',
              text: r.text,
              created_at: r.created_at,
              reflection: true,
              emotion: r.dominant_emotion,
            },
            {
              key: `reflection-reply-${r.id}`,
              role: 'assistant',
              text: r.ai_reply,
              created_at: r.created_at,
              reflection: true,
            },
          ].filter((m) => m.text),
        ),
      ].sort((a, b) => timestamp(a.created_at) - timestamp(b.created_at)),
    [chat.data, reflections.data],
  )
  const shownPlan = useMemo(() => {
    const base = hasNewPlan ? plan : summary.data?.latest_plan
    if (!base || !base.external_recommendations) return base

    // Check if the latest assistant message mentioned a song
    const lastBotMsg = [...messages].reverse().find((m) => m.role === 'assistant')?.text || ''
    if (!lastBotMsg) return base

    let songMatch = null
    const linkMatch = /\[([^\]]+)\]\((https?:\/\/open\.spotify\.com\/search\/[^)]+)\)/.exec(lastBotMsg)
    if (linkMatch) {
      songMatch = { title: linkMatch[1], url: linkMatch[2] }
    }

    if (songMatch) {
      const musicCard = {
        type: 'music',
        title: songMatch.title,
        description: 'Mentioned in your conversation · Ready to play on Spotify',
        url: songMatch.url,
        icon: 'music',
      }
      const others = base.external_recommendations.filter((r) => r.type !== 'music')
      return {
        ...base,
        external_recommendations: [musicCard, ...others],
      }
    }

    return base
  }, [hasNewPlan, plan, summary.data?.latest_plan, messages])
  const signal = [...messages]
    .reverse()
    .find((m) => m.role === 'user' && m.emotion)?.emotion
  const active = summary.data?.active_sessions?.[0]
  const firstName = user?.name?.split(' ')[0] || 'there'
  useEffect(() => {
    if (messages.length || busy)
      bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, busy])
  useEffect(() => {
    localStorage.setItem(
      'moodmentor-recommendations',
      panelOpen ? 'visible' : 'hidden',
    )
  }, [panelOpen])
  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px)')
    const closeOnMobile = () => {
      if (media.matches) setPanelOpen(false)
    }
    media.addEventListener('change', closeOnMobile)
    return () => media.removeEventListener('change', closeOnMobile)
  }, [])
  useEffect(() => {
    if (previousRevision.current === revision) return
    previousRevision.current = revision
    setHasNewPlan(false)
    setPlan(null)
    summary.reload()
  }, [revision, summary.reload])
  useEffect(() => {
    setReflectionMode(initialReflection)
  }, [initialReflection])
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(''), 7000)
    return () => clearTimeout(timer)
  }, [notice])
  async function send(e) {
    e.preventDefault()
    const draft = text.trim()
    if (busy || recording || draft.length < (reflectionMode ? 3 : 1)) return
    narrator.stop()
    setBusy(true)
    setError('')
    setPendingText(draft)
    try {
      const r = await api(reflectionMode ? '/journal' : '/chat', {
        method: 'POST',
        body: { text: draft },
      })
      if (reflectionMode) {
        reflections.setData((prev) => [r, ...(prev || [])])
        setNotice('Reflection saved to your private history.')
      } else {
        const reply = { ...r.reply, sources: r.sources || [] }
        chat.setData((prev) => [...(prev || []), r.user_message, reply])
      }
      setText('')
      setPlan(r.wellness_plan)
      setHasNewPlan(true)
      if (window.innerWidth > 900) setPanelOpen(true)
      summary.reload()
      if (
        r.crisis ||
        ['high', 'critical'].includes(r.wellness_plan?.safety?.risk_level)
      ) {
        narrator.stop()
        onSafety(r.wellness_plan?.safety || {})
      } else if (readReplies) {
        const reply = reflectionMode ? r.ai_reply : r.reply.text
        const key = reflectionMode
          ? `reflection-reply-${r.id}`
          : `chat-${r.reply.id}`
        readMessage(reply, key)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
      setPendingText('')
      input.current?.focus()
    }
  }
  async function clearChat() {
    setBusy(true)
    setError('')
    try {
      await api('/chat/history', { method: 'DELETE' })
      chat.setData([])
      setClear(false)
      setPlan(null)
      setHasNewPlan(true)
      setNotice(
        'Conversation deleted. Saved reflections remain in your history.',
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }
  function selectTool(id) {
    if (id === 'reflection') {
      setReflectionMode(true)
      setTool(null)
      input.current?.focus()
    } else setTool(id)
  }
  function updatePlan(next) {
    setPlan(next)
    setHasNewPlan(true)
    summary.reload()
  }
  const loading = chat.loading || reflections.loading
  const failed = chat.error || reflections.error
  const empty = !messages.length && !busy && !loading && !failed
  return (
    <div className={`companion-experience ${panelOpen ? '' : 'canvas-hidden'}`}>
      <section
        className="conversation-column"
        aria-label="Companion conversation"
      >
        <div className="conversation-heading">
          <div className="conversation-brand">
            <span className="companion-sign" aria-hidden="true">
              ✳
            </span>
            <div>
              <b>Your daily companion</b>
              <small>Space to reflect. A small next step.</small>
            </div>
          </div>
          <div className="button-row">
            <button
              className="icon-button"
              aria-label="Clear conversation"
              title="Clear conversation"
              disabled={busy || recording || !chat.data?.length}
              onClick={() => setClear(true)}
            >
              <Icon name="history" size={18} />
            </button>
            <button
              className="icon-button canvas-toggle"
              aria-label={
                panelOpen ? 'Hide recommendations' : 'Show recommendations'
              }
              aria-expanded={panelOpen}
              onClick={() => setPanelOpen((v) => !v)}
            >
              <Icon name="panel" />
            </button>
          </div>
        </div>
        <div
          className={`conversation-stream ${empty ? 'is-empty' : ''}`}
          role="log"
          tabIndex={0}
          aria-label="Conversation"
          aria-live="polite"
          aria-relevant="additions text"
        >
          {loading ? (
            <Loading />
          ) : failed ? (
            <ErrorState
              error={failed}
              retry={() => {
                chat.reload()
                reflections.reload()
              }}
            />
          ) : empty ? (
            <div className="companion-arrival">
              <p className="eyebrow">
                HELLO, {firstName.toUpperCase()}{' '}
                <span aria-hidden="true">✳</span>
              </p>
              <h1>
                How’s your
                <br />
                <em>mind today?</em>
              </h1>
              <p>
                A busy day, a little win, or something on your mind.
                <br className="desktop-break" /> Start wherever you are. We’ll
                find a way forward.
              </p>
              <div className="arrival-prompts">
                {PROMPTS.map(([icon, title, prompt, tone]) => (
                  <button
                    className={`tone-${tone}`}
                    key={title}
                    onClick={() => {
                      setText(prompt)
                      input.current?.focus()
                    }}
                  >
                    <Icon name={icon} />
                    <b>{title}</b>
                    <span>{prompt}</span>
                    <Icon name="arrow" size={15} />
                  </button>
                ))}
              </div>
              <span className="arrival-note">
                <Icon name="shield" size={14} />
                Your words belong to your private space.
              </span>
              <div
                className="arrival-moments"
                aria-label="Explore a fresh moment"
              >
                {[
                  ['music', 'music', 'A new soundtrack'],
                  ['places', 'cafe', 'A change of scene'],
                  ['wellness', 'play', 'A little more play'],
                ].map(([id, scene, label]) => (
                  <button key={id} onClick={() => setTool(id)}>
                    <WellnessPhoto scene={scene} />
                    <span>
                      {label}
                      <Icon name="arrow" size={14} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <article
                className={`conversation-message chat-message ${m.role} ${m.reflection ? 'is-reflection' : ''}`}
                key={m.key}
              >
                <div className="message-author">
                  {m.role === 'assistant' && (
                    <span className="companion-avatar-mark" aria-hidden="true">
                      <img
                        src={`${import.meta.env.BASE_URL}brand/emotion-care-icon.png`}
                        alt=""
                        width="20"
                        height="20"
                        style={{
                          borderRadius: '50%',
                          verticalAlign: 'middle',
                          objectFit: 'contain',
                          background: '#fff',
                          boxShadow: '0 1px 3px rgba(36, 91, 81, 0.15)',
                          marginRight: '4px',
                        }}
                      />
                    </span>
                  )}
                  <b>{m.role === 'user' ? 'You' : 'Emotion Care'}</b>
                  {m.reflection && (
                    <span className="reflection-badge">
                      <Icon name="journal" size={12} />
                      Saved reflection
                    </span>
                  )}
                </div>
                {renderMessageText(m.text)}
                {m.role === 'assistant' &&
                  /start reset|recommended practices|guided practice|quiet between tasks|room to breathe|meditation practice/i.test(m.text) && (
                    <div className="chat-guided-action-banner">
                      <div className="chat-action-left">
                        <span className="chat-action-icon" aria-hidden="true">🧘</span>
                        <div className="chat-action-text">
                          <strong>{(shownPlan?.activities && shownPlan.activities[0]?.title) || shownPlan?.activity?.title || 'The quiet between tasks'}</strong>
                          <span>Interactive audio session with voice narration & breath timer</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="chat-action-start-btn"
                        onClick={() => {
                          const act = (shownPlan?.activities && shownPlan.activities[0]) || shownPlan?.activity
                          if (act) {
                            startActivity(act, shownPlan?.id)
                          } else {
                            setPanelOpen(true)
                            const el = document.querySelector('.mindfulness-practices-section')
                            if (el) el.scrollIntoView({ behavior: 'smooth' })
                          }
                        }}
                      >
                        <Icon name="play" size={13} />
                        <span>Start reset</span>
                      </button>
                    </div>
                  )}
                {m.role === 'assistant' &&
                  m.sources?.length > 0 && (
                    <details className="rag-sources">
                      <summary>
                        <Icon name="spark" size={12} />
                        {m.sources.length}{' '}
                        {m.sources.length === 1 ? 'source' : 'sources'}
                      </summary>
                      <ul>
                        {m.sources.map((s, i) => (
                          <li key={i}>
                            {s.url ? (
                              <a
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {s.title || s.source_name || 'Reference'}
                              </a>
                            ) : (
                              <span>
                                {s.title || s.source_name || 'Reference'}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                {m.role === 'assistant' && (
                  <button
                    className="read-reply"
                    disabled={recording}
                    onClick={() => readMessage(m.text, m.key)}
                    aria-label={
                      narrator.speaking && readingKey === m.key
                        ? 'Stop reading reply'
                        : 'Read reply aloud'
                    }
                  >
                    <Icon
                      name={
                        narrator.speaking && readingKey === m.key
                          ? 'stop'
                          : 'volume'
                      }
                      size={14}
                    />
                    {narrator.speaking && readingKey === m.key
                      ? 'Stop audio'
                      : 'Listen'}
                  </button>
                )}
              </article>
            ))
          )}
          {busy && (
            <>
              <article className="conversation-message user">
                <div className="message-author">
                  <b>You</b>
                </div>
                <p>{pendingText || 'Updating your conversation…'}</p>
              </article>
              <div className="companion-thinking" role="status">
                <span className="companion-sign" aria-hidden="true">
                  ✳
                </span>
                <span>
                  Taking a moment with your words
                  <span className="thinking-dots" aria-hidden="true">
                    ...
                  </span>
                </span>
              </div>
            </>
          )}
          <div ref={bottom} />
        </div>
        <div className="composer-area">
          {reflectionMode && (
            <div className="reflection-mode">
              <span>
                <Icon name="journal" size={15} />
                Private reflection · saves to your journal
              </span>
              <button
                className="text-button"
                onClick={() => setReflectionMode(false)}
              >
                Back to chat
              </button>
            </div>
          )}
          <form
            className={`companion-composer ${reflectionMode ? 'reflecting' : ''}`}
            onSubmit={send}
          >
            <label className="sr-only" htmlFor="companion-message">
              {reflectionMode ? 'Private reflection' : 'Your message'}
            </label>
            <textarea
              ref={input}
              id="companion-message"
              rows={2}
              required
              maxLength={reflectionMode ? 5000 : 2000}
              minLength={reflectionMode ? 3 : 1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                reflectionMode
                  ? 'A thought you’d like to keep…'
                  : 'What’s on your mind?'
              }
              disabled={busy || recording}
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter' &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault()
                  if (!busy && !recording) e.currentTarget.form.requestSubmit()
                }
              }}
            />
            <div className="composer-bottom">
              <button
                type="button"
                className="tools-trigger"
                aria-haspopup="dialog"
                disabled={recording}
                onClick={() => setTool('all')}
              >
                <Icon name="plus" size={18} />
                Tools
              </button>
              <span className="composer-mode">
                {reflectionMode ? 'Reflection' : 'A conversation at your pace'}
              </span>
              <VoiceInput
                value={text}
                onChange={setText}
                disabled={
                  busy || !!tool || voiceOptions || clear || audioBlocked
                }
                limit={reflectionMode ? 5000 : 2000}
                onActiveChange={setRecording}
                onBeforeListen={narrator.stop}
                language={voiceLanguage}
                onLanguageChange={setVoiceLanguage}
              />
              <button
                className="send-button"
                disabled={
                  busy ||
                  recording ||
                  text.trim().length < (reflectionMode ? 3 : 1)
                }
                aria-label={reflectionMode ? 'Save reflection' : 'Send message'}
              >
                <Icon name="arrow" size={21} />
              </button>
            </div>
          </form>
          <div
            className={`quick-tools ${recording ? 'recording-tools' : ''}`}
            inert={recording ? true : undefined}
          >
            <button onClick={() => setTool('meditation')}>
              <Icon name="meditation" size={15} />
              Meditation
            </button>
            <button onClick={() => setTool('music')}>
              <Icon name="music" size={15} />
              Music
            </button>
            <button onClick={() => setTool('places')}>
              <Icon name="pin" size={15} />
              Step outside
            </button>
            <button onClick={() => setTool('studio')}>
              <Icon name="camera" size={15} />
              Mood Lens
            </button>
            <button onClick={() => setTool('photos')}>
              <Icon name="photo" size={15} />
              Family & Photos
            </button>
            <button onClick={() => setVoiceOptions(true)}>
              <Icon name="volume" size={15} />
              Voice options
            </button>
          </div>
          {narrator.error && (
            <p role="status" className="speech-notice">
              {narrator.error}
            </p>
          )}
          {error && (
            <p className="inline-error" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="companion-notice" role="status">
              <Icon name="check" size={14} />
              {notice}
            </p>
          )}
          <p className="companion-footnote">
            Signals can miss context. Your own understanding comes first.{' '}
            <button onClick={() => onSafety({})}>Human support</button>
          </p>
        </div>
      </section>
      {panelOpen && (
        <aside
          className="recommendation-canvas"
          aria-label="Your recommendations"
        >
          <div className="canvas-heading">
            <span>
              <Icon name="spark" size={15} />A MOMENT FOR YOU
            </span>
            <button
              className="icon-button"
              aria-label="Close recommendations"
              onClick={() => setPanelOpen(false)}
            >
              <Icon name="close" size={16} />
            </button>
          </div>
          {signal && (
            <div className="wellness-signal">
              <span className="signal-orb" aria-hidden="true" />
              <div>
                <small>FROM YOUR WORDS</small>
                <b>{signal.replaceAll('_', ' ')}</b>
                <span>Possible signal · you know yourself best</span>
              </div>
            </div>
          )}
          {summary.error && (
            <ErrorState error={summary.error} retry={summary.reload} />
          )}
          {active ? (
            <article className="canvas-resume">
              <ActivityArtwork type={active.activity.type} />
              <Badge>A MOMENT IN PROGRESS</Badge>
              <h2>{active.activity.title}</h2>
              <p>Your progress is saved. Pick it up whenever you’re ready.</p>
              <Button onClick={() => startActivity(null, null, active)}>
                Resume your moment <Icon name="play" size={16} />
              </Button>
            </article>
          ) : shownPlan ? (
            <div className="canvas-plan">
              {/* 1. Detected Emotion Visual */}
              <CuteEmotionVisual
                emotion={
                  signal ||
                  shownPlan?.activity?.emotion ||
                  (shownPlan?.activities && shownPlan.activities[0]?.emotion) ||
                  'calm'
                }
              />

              {/* 2. External Recommendations (Soundtracks & Moments) */}
              {shownPlan.external_recommendations && shownPlan.external_recommendations.length > 0 && (
                <section className="other-recommendations-section" aria-label="Extra recommendations">
                  <div className="canvas-section-header">
                    <div className="canvas-section-title">
                      <Icon name="spark" size={14} className="sparkle-icon" />
                      <span>MORE FOR YOUR MOOD</span>
                    </div>
                    <small className="canvas-section-caption">Curated soundtracks & moments</small>
                  </div>
                  
                  <div className="external-recs-list">
                    {shownPlan.external_recommendations.map((rec, i) => {
                      const isMusic = rec.type === 'music'
                      const isMovie = rec.type === 'movie'
                      const isOutdoor = rec.type === 'outdoor'
                      const isPhotos = rec.type === 'photos'
                      const isGames = rec.type === 'games'
                      const isStudio = rec.type === 'studio'
                      const isMeditation = rec.type === 'meditation'
                      const isInApp = isGames || isStudio || isMeditation
                      
                      return (
                        <article
                          className={`external-rec-card rec-type-${rec.type || 'generic'}`}
                          key={`ext-${i}-${rec.title}`}
                        >
                          <div className="rec-card-top">
                            <div className="rec-badge-group">
                              <span className={`rec-icon-badge badge-${rec.type}`}>
                                <Icon name={rec.icon || (isMusic ? 'music' : isMovie ? 'play' : isOutdoor ? 'pin' : isPhotos ? 'photo' : isGames ? 'game' : isStudio ? 'camera' : isMeditation ? 'spa' : 'spark')} size={15} />
                              </span>
                              <span className="rec-category-tag">
                                {isMusic
                                  ? 'Spotify Soundtrack'
                                  : isMovie
                                  ? (rec.language ? (rec.language === 'English' ? 'Hollywood Movie' : `${rec.language} Movie`) : 'Feel-Good Movie')
                                  : isOutdoor
                                  ? 'Step Outside'
                                  : isPhotos
                                  ? 'Family & Memories'
                                  : isGames
                                  ? 'Mindful Games'
                                  : isStudio
                                  ? 'Creative Studio'
                                  : isMeditation
                                  ? 'Guided Meditation'
                                  : 'Connect'}
                              </span>
                            </div>
                            <button
                              className="rec-dismiss-btn"
                              title="Dismiss recommendation"
                              aria-label={`Dismiss ${rec.title}`}
                              onClick={() => {
                                api('/wellness/dismiss', { method: 'POST', body: { recommendation_id: rec.title } }).catch(console.error);
                                setPlan(prev => prev ? { ...prev, external_recommendations: prev.external_recommendations.filter(r => r.title !== rec.title) } : prev);
                                setHasNewPlan(true);
                              }}
                            >
                              <Icon name="close" size={13} />
                            </button>
                          </div>

                          <div className="rec-card-body">
                            <h4 className="rec-title">{rec.title}</h4>
                            <p className="rec-description">{rec.description}</p>
                          </div>

                          <div className="rec-card-footer">
                            {isInApp ? (
                              <button
                                className={`rec-action-btn action-${rec.type}`}
                                onClick={() => setTool(isGames ? 'games' : isStudio ? 'studio' : 'meditation')}
                              >
                                {isGames ? (
                                  <>
                                    <span className="btn-icon">🎮</span>
                                    <span>Play Now</span>
                                  </>
                                ) : isStudio ? (
                                  <>
                                    <span className="btn-icon">🎨</span>
                                    <span>Open Studio</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="btn-icon">🧘</span>
                                    <span>Start Session</span>
                                  </>
                                )}
                              </button>
                            ) : (
                            <a
                              href={rec.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`rec-action-btn action-${rec.type}`}
                            >
                              {isMusic ? (
                                <>
                                  <span className="btn-icon">▶</span>
                                  <span>Listen on Spotify</span>
                                  <span className="btn-arrow">↗</span>
                                </>
                              ) : isMovie ? (
                                <>
                                  <span className="btn-icon">🍿</span>
                                  <span>Watch / Download Movie</span>
                                  <span className="btn-arrow">↗</span>
                                </>
                              ) : isOutdoor ? (
                                <>
                                  <span className="btn-icon">📍</span>
                                  <span>Explore on Google Maps</span>
                                  <span className="btn-arrow">↗</span>
                                </>
                              ) : isPhotos ? (
                                <>
                                  <span className="btn-icon">📸</span>
                                  <span>Open Google Photos</span>
                                  <span className="btn-arrow">↗</span>
                                </>
                              ) : (
                                <>
                                  <span className="btn-icon">💬</span>
                                  <span>Open Link</span>
                                  <span className="btn-arrow">↗</span>
                                </>
                              )}
                            </a>
                            )}
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* 3. Recommended Mindfulness Practices (Placed AFTER 'MORE FOR YOUR MOOD') */}
              <section className="mindfulness-practices-section" aria-label="Recommended practices">
                <div className="canvas-section-header">
                  <div className="canvas-section-title">
                    <Icon name="spark" size={14} className="sparkle-icon" />
                    <span>RECOMMENDED PRACTICES</span>
                  </div>
                  <small className="canvas-section-caption">Short guided resets to center your day</small>
                </div>
                
                <div className="practices-cards-list">
                  {shownPlan.activities && shownPlan.activities.length > 0 ? (
                    shownPlan.activities.slice(0, 2).map((act, index) => (
                      <PlanCard
                        key={act.id || index}
                        index={index}
                        plan={{...shownPlan, activity: act, rationale: act.why || shownPlan.rationale}}
                        onPlan={updatePlan}
                        onStart={startActivity}
                        onSafety={onSafety}
                        onDismiss={() => {
                          api('/wellness/dismiss', { method: 'POST', body: { recommendation_id: act.id } }).catch(console.error);
                          setPlan(prev => prev ? { ...prev, activities: prev.activities.filter(a => a.id !== act.id) } : prev);
                          setHasNewPlan(true);
                        }}
                      />
                    ))
                  ) : (
                    <PlanCard
                      plan={shownPlan}
                      index={0}
                      onPlan={updatePlan}
                      onStart={startActivity}
                      onSafety={onSafety}
                    />
                  )}
                </div>
              </section>
            </div>
          ) : (
            <article className="canvas-invitation">
              <div className="canvas-photo">
                <WellnessPhoto scene="pause" />
                <span className="canvas-sticker" aria-hidden="true">
                  a little
                  <br />
                  <em>breathing room</em>
                </span>
              </div>
              <div className="canvas-invitation-copy">
                <p className="eyebrow">LESS RUSH. MORE ROOM.</p>
                <h2>
                  Your next step
                  <br />
                  starts with <em>you.</em>
                </h2>
                <p>
                  Talk naturally. When a reset might fit, we’ll bring it here.
                </p>
                <button
                  className="editorial-text-link"
                  onClick={() => setTool('wellness')}
                >
                  Explore a reset <Icon name="arrow" size={16} />
                </button>
              </div>
            </article>
          )}
          <div className="canvas-discover">
            <div className="canvas-subheading">
              <b>Find your kind of pause</b>
              <button className="text-button" onClick={() => setTool('all')}>
                View tools
              </button>
            </div>
            <button onClick={() => setTool('meditation')}>
              <WellnessPhoto scene="meditation" />
              <span>
                <b>A quieter mind</b>
                <small>Meditation & breathing</small>
              </span>
              <Icon name="arrow" size={16} />
            </button>
            <button onClick={() => setTool('people')}>
              <WellnessPhoto scene="connect" />
              <span>
                <b>A little connection</b>
                <small>Someone you trust</small>
              </span>
              <Icon name="arrow" size={16} />
            </button>
          </div>
          {summary.data?.total_sessions > 0 && (
            <div className="canvas-progress">
              <span>YOUR SMALL STEPS ADD UP</span>
              <b>
                {summary.data.total_sessions}{' '}
                {summary.data.total_sessions === 1 ? 'moment' : 'moments'} for
                yourself.
              </b>
              <button
                className="text-button"
                onClick={() => navigate('progress')}
              >
                See what’s helping <Icon name="arrow" size={14} />
              </button>
            </div>
          )}
        </aside>
      )}
      {clear && (
        <Dialog
          title="Clear your conversation?"
          onClose={() => setClear(false)}
        >
          <p>
            This deletes your chat history. Saved journal reflections and
            activity outcomes remain in your account.
          </p>
          <div className="button-row">
            <Button variant="danger" disabled={busy} onClick={clearChat}>
              Delete conversation
            </Button>
            <Button variant="secondary" onClick={() => setClear(false)}>
              Keep it
            </Button>
          </div>
        </Dialog>
      )}
      {tool && (
        <Suspense fallback={<Loading />}>
          <CompanionTools
            selected={tool}
            onSelect={selectTool}
            onClose={() => setTool(null)}
            onStart={startActivity}
            onSafety={onSafety}
            onUpdate={() => {
              summary.reload()
              setHasNewPlan(false)
            }}
          />
        </Suspense>
      )}
      {voiceOptions && (
        <Dialog
          title="A voice that feels comfortable."
          onClose={() => setVoiceOptions(false)}
        >
          <p>
            Speak in your preferred language and listen to replies. Your device
            or browser’s speech service handles audio. Replies are read in their
            written language; voice settings do not translate them.
          </p>
          <label>
            Voice input language
            <select
              value={voiceLanguage}
              onChange={(e) => setVoiceLanguage(e.target.value)}
            >
              {SPEECH_LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.native} · {l.name}
                </option>
              ))}
            </select>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={readReplies}
              onChange={(e) => {
                setReadReplies(e.target.checked)
                if (!e.target.checked) narrator.stop()
              }}
            />
            Read new replies aloud in this session
          </label>
          <p className="quiet-note">
            Available voices depend on your device. You can also press Listen
            below a reply. Audio stops when you leave this page or open an
            activity.
          </p>
          <Button onClick={() => setVoiceOptions(false)}>Done</Button>
        </Dialog>
      )}
    </div>
  )
}
