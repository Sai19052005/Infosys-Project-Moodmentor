import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import { Dialog, Button, Icon, MoodPicker, Badge } from './ui'
import { BREATH_LABELS, LANGUAGES, PROGRAMS } from '../lib/meditationContent'

export default function SessionPlayer({
  activity: initialActivity,
  planId,
  existing,
  onClose,
  onComplete,
}) {
  const [session, setSession] = useState(existing || null),
    [before, setBefore] = useState(existing?.mood_before || 3),
    [after, setAfter] = useState(3)
  const [elapsed, setElapsed] = useState(existing?.elapsed_seconds || 0),
    [playing, setPlaying] = useState(false),
    [phase, setPhase] = useState(existing ? 'session' : 'before')
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [helpful, setHelpful] = useState(null),
    [volume, setVolume] = useState(0.15),
    [sound, setSound] = useState('none')
  const [voice, setVoice] = useState(false),
    [language, setLanguage] = useState('en'),
    [result, setResult] = useState(null)
  const elapsedRef = useRef(elapsed),
    audioRef = useRef(null),
    voiceStep = useRef(-1)
  const activity = session?.activity || initialActivity
  const duration = session?.duration_seconds || activity.minutes * 60
  const breath = activity.type === 'breathing'
  const index = Math.min(
    activity.steps.length - 1,
    Math.floor((elapsed / duration) * activity.steps.length),
  )
  const remaining = Math.max(0, duration - Math.floor(elapsed))
  const labels = BREATH_LABELS[language]
  const script = PROGRAMS.find(
    (p) =>
      p.id ===
      {
        'meditation-5': 'stress_relief',
        'meditation-10': 'morning_focus',
        'meditation-15': 'sleep_winddown',
        'meditation-20': 'body_scan',
        'grounding-2': 'anxiety_reset',
        'breathing-3': 'stress_relief',
      }[activity.id],
  )
  const localizedPhase =
    script?.phases[
      Math.min(
        script.phases.length - 1,
        Math.floor((elapsed / duration) * script.phases.length),
      )
    ]
  const instruction =
    language === 'en'
      ? activity.steps[index]
      : localizedPhase?.instruction[language] || activity.steps[index]
  useEffect(() => {
    elapsedRef.current = elapsed
  }, [elapsed])
  useEffect(() => {
    if (!playing) return
    let previous = performance.now()
    const timer = setInterval(() => {
      const now = performance.now(),
        delta = (now - previous) / 1000
      previous = now
      setElapsed((v) => Math.min(duration, v + delta))
    }, 250)
    return () => clearInterval(timer)
  }, [playing, duration])
  useEffect(() => {
    if (elapsed >= duration && phase === 'session') {
      setPlaying(false)
      setPhase('after')
    }
  }, [elapsed, duration, phase])
  useEffect(() => {
    if (!session || phase === 'done') return
    const timer = setInterval(() => {
      api(`/wellness/sessions/${session.id}`, {
        method: 'PATCH',
        body: { elapsed_seconds: Math.floor(elapsedRef.current) },
      }).catch((e) => setError(`Progress has not synced: ${e.message}`))
    }, 15000)
    return () => clearInterval(timer)
  }, [session, phase])
  useEffect(() => {
    if (!playing || sound === 'none') return
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)(),
        gain = ctx.createGain(),
        noise = ctx.createBufferSource()
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate),
        data = buffer.getChannelData(0)
      let previous = 0
      for (let i = 0; i < data.length; i++) {
        previous = (previous + 0.02 * (Math.random() * 2 - 1)) / 1.02
        data[i] = previous * 3.5
      }
      noise.buffer = buffer
      noise.loop = true
      gain.gain.value = volume
      noise.connect(gain)
      gain.connect(ctx.destination)
      noise.start()
      ctx.resume()
      audioRef.current = { ctx, gain }
      return () => {
        noise.stop()
        ctx.close()
        audioRef.current = null
      }
    } catch {
      setError(
        'Ambient sound is unavailable in this browser. You can continue in silence.',
      )
    }
  }, [playing, sound])
  useEffect(() => {
    if (audioRef.current) audioRef.current.gain.gain.value = volume
  }, [volume])
  useEffect(() => {
    if (!voice || !playing || !('speechSynthesis' in window)) return
    const key = instruction + language
    if (voiceStep.current === key) return
    voiceStep.current = key
    const utterance = new SpeechSynthesisUtterance(instruction)
    utterance.lang = LANGUAGES.find((l) => l.id === language).code
    utterance.rate = 0.8
    utterance.volume = Math.min(1, volume * 3)
    speechSynthesis.cancel()
    speechSynthesis.speak(utterance)
  }, [instruction, voice, playing, language, volume])
  useEffect(() => {
    if (!playing && 'speechSynthesis' in window) speechSynthesis.cancel()
  }, [playing])
  useEffect(
    () => () => {
      if ('speechSynthesis' in window) speechSynthesis.cancel()
    },
    [],
  )
  async function start() {
    setBusy(true)
    setError('')
    try {
      const r = await api('/wellness/sessions', {
        method: 'POST',
        body: {
          activity_key: activity.id,
          plan_id: planId || null,
          mood_before: before,
        },
      })
      setSession(r)
      setPhase('session')
      setPlaying(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  async function close() {
    setPlaying(false)
    if (session && phase !== 'done') {
      setBusy(true)
      try {
        await api(`/wellness/sessions/${session.id}`, {
          method: 'PATCH',
          body: { elapsed_seconds: Math.floor(elapsedRef.current) },
        })
        onClose()
      } catch (e) {
        setError(`Could not save progress. ${e.message}`)
      } finally {
        setBusy(false)
      }
    } else onClose()
  }
  async function abandon() {
    setBusy(true)
    setError('')
    try {
      await api(`/wellness/sessions/${session.id}/abandon`, { method: 'POST' })
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  async function complete() {
    setBusy(true)
    setError('')
    try {
      const r = await api(`/wellness/sessions/${session.id}/complete`, {
        method: 'POST',
        body: {
          elapsed_seconds: Math.floor(elapsed),
          mood_after: after,
          helpful,
        },
      })
      setResult(r)
      setPhase('done')
      onComplete()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Dialog title={activity.title} wide onClose={busy ? () => {} : close}>
      <div className={`session-player stage-${phase}`}>
        <div className="session-meta">
          <Badge>{activity.type}</Badge>
          <span>
            {activity.minutes} minutes · {activity.level}
          </span>
        </div>
        {phase === 'before' ? (
          <>
            <p className="player-lead">{activity.benefit}</p>
            <MoodPicker
              value={before}
              onChange={setBefore}
              label="Before we begin, how do you feel?"
            />
            <p className="quiet-note">
              Your before-and-after check-in helps us understand which
              activities work for you.
            </p>
            <Button disabled={busy} onClick={start}>
              {busy ? 'Starting…' : 'Begin this moment'}
              <Icon name="play" size={18} />
            </Button>
          </>
        ) : phase === 'session' ? (
          <>
            <div
              className={`breathing-orb ${playing && breath ? 'breathing' : ''}`}
              style={{ animationPlayState: playing ? 'running' : 'paused' }}
            >
              <span className="timer">
                {Math.floor(remaining / 60)}:
                {String(remaining % 60).padStart(2, '0')}
              </span>
              <span>
                {breath
                  ? Math.floor(elapsed) % 10 < 4
                    ? labels.inhale
                    : labels.exhale
                  : 'A LITTLE SPACE FOR YOU'}
              </span>
            </div>
            <p className="session-instruction" aria-live="polite">
              {instruction}
            </p>
            <progress max={duration} value={elapsed} />
            <div className="player-controls">
              <Button
                onClick={() => {
                  voiceStep.current = -1
                  setPlaying(!playing)
                }}
              >
                {playing ? 'Pause' : 'Continue'}
                <Icon name={playing ? 'clock' : 'play'} size={18} />
              </Button>
              <Button variant="secondary" disabled={busy} onClick={close}>
                Save & close
              </Button>
            </div>
            <div className="audio-controls">
              <label>
                Background
                <select
                  value={sound}
                  onChange={(e) => setSound(e.target.value)}
                >
                  <option value="none">Silence</option>
                  <option value="brown">Soft brown noise</option>
                </select>
              </label>
              <label>
                Volume
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(+e.target.value)}
                />
              </label>
              {script && (
                <label>
                  Guidance language
                  <select
                    value={language}
                    onChange={(e) => {
                      voiceStep.current = -1
                      setLanguage(e.target.value)
                    }}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={voice}
                onChange={(e) => {
                  setVoice(e.target.checked)
                  voiceStep.current = -1
                  if (!e.target.checked && 'speechSynthesis' in window)
                    speechSynthesis.cancel()
                }}
              />
              Read guidance aloud using browser speech
            </label>
            <p className="quiet-note">
              Voice availability depends on your browser. Audio is optional.
              Pause or stop if anything feels uncomfortable.
            </p>
            <button className="text-button" disabled={busy} onClick={abandon}>
              End without recording completion
            </button>
          </>
        ) : phase === 'after' ? (
          <>
            <span className="completion-icon">
              <Icon name="check" size={36} />
            </span>
            <h2>You made a little room.</h2>
            <p>No need to feel different. An honest check-in is what helps.</p>
            <MoodPicker
              value={after}
              onChange={setAfter}
              label="How do you feel now?"
            />
            <fieldset className="feedback-field">
              <legend>Was this activity useful for you?</legend>
              <div className="button-row">
                <Button
                  variant={helpful === true ? 'primary' : 'secondary'}
                  aria-pressed={helpful === true}
                  onClick={() => setHelpful(true)}
                >
                  Yes, it helped
                </Button>
                <Button
                  variant={helpful === false ? 'primary' : 'secondary'}
                  aria-pressed={helpful === false}
                  onClick={() => setHelpful(false)}
                >
                  Not this time
                </Button>
              </div>
            </fieldset>
            <Button onClick={complete} disabled={busy || helpful === null}>
              {busy ? 'Saving…' : 'Save my check-in'}
            </Button>
          </>
        ) : (
          <>
            <span className="completion-icon">
              <Icon name="check" size={36} />
            </span>
            <h2>One moment, remembered.</h2>
            <p>Your session and feedback are saved.</p>
            <div className="outcome-comparison">
              <div>
                <span>Before</span>
                <b>{result.mood_before}/5</b>
              </div>
              <Icon name="arrow" />
              <div>
                <span>After</span>
                <b>{result.mood_after}/5</b>
              </div>
            </div>
            <p>
              Mood change: {result.mood_change > 0 ? '+' : ''}
              {result.mood_change}. Your future suggestions will take this
              feedback into account.
            </p>
            <Button onClick={onClose}>
              Back to my day
              <Icon name="arrow" size={17} />
            </Button>
          </>
        )}
        {error && (
          <p role="alert" className="inline-error">
            {error}
          </p>
        )}
      </div>
    </Dialog>
  )
}
