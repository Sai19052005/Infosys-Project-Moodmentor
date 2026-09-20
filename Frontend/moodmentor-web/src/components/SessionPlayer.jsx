import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import { Dialog, Button, Icon, MoodPicker, Badge } from './ui'
import { BREATH_LABELS, LANGUAGES, PROGRAMS } from '../lib/meditationContent'
import { matchVoice, useNarrator, useProviderTTS } from '../lib/speech'
import { ActivityArtwork, WellnessPhoto } from './WellnessVisual'

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
  const [voiceVolume, setVoiceVolume] = useState(0.8),
    [voiceRate, setVoiceRate] = useState(0.8)
  const [useAI, setUseAI] = useState(true)
  const narrator = useNarrator()
  const providerTTS = useProviderTTS()
  const activeVoice = useAI && providerTTS.providerAvailable ? providerTTS : narrator
  const selectedVoice = matchVoice(narrator.voices, language)
  const elapsedRef = useRef(elapsed),
    audioRef = useRef(null),
    voiceStep = useRef(-1)
  const activity = session?.activity || initialActivity
  const script = PROGRAMS.find(
    (p) =>
      p.id ===
      {
        'meditation-ravi-shankar-10': 'ravi_shankar_10min',
        'meditation-choa-kok-sui-27': 'choa_kok_sui_27min',
        'meditation-5': 'stress_relief',
        'meditation-10': 'morning_focus',
        'grounding-2': 'anxiety_reset',
        'breathing-3': 'stress_relief',
      }[activity.id] ||
      p.id === activity.id ||
      (activity.id === 'meditation-ravi-shankar-10' && p.id === 'ravi_shankar_10min') ||
      (activity.id === 'meditation-choa-kok-sui-27' && p.id === 'choa_kok_sui_27min'),
  )
  const isChoaKokSui = script?.id === 'choa_kok_sui_27min' || activity?.id === 'meditation-choa-kok-sui-27'
  const isRaviShankar = script?.id === 'ravi_shankar_10min' || activity?.id === 'meditation-ravi-shankar-10'
  const hasMasterAudio = Boolean(
    script?.hasMasterAudio ||
    script?.audioUrl ||
    activity?.audio_url ||
    isRaviShankar ||
    isChoaKokSui
  )
  const masterAudioUrl =
    script?.audioUrl ||
    activity?.audio_url ||
    (isChoaKokSui
      ? '/audio/meditations/choa_kok_sui_27min.mp3'
      : hasMasterAudio
      ? '/audio/meditations/ravi_shankar_10min.mp3'
      : '')
  const duration = (hasMasterAudio && script?.duration) ? script.duration : (session?.duration_seconds || activity.minutes * 60)
  const [audioMode, setAudioMode] = useState(hasMasterAudio ? 'master' : 'ai')
  const masterAudioRef = useRef(null)

  const masterGuideName = isChoaKokSui
    ? 'Grand Master Choa Kok Sui'
    : isRaviShankar
    ? 'Gurudev Sri Sri Ravi Shankar'
    : (script?.guide || 'Master Meditation')
  const masterLanguageBadge = isChoaKokSui ? 'English + Marathi' : 'Hindi + English'
  const masterDurationBadge = isChoaKokSui ? '27 Minutes' : '10 Minutes'
  const masterSubtitle = isChoaKokSui
    ? 'Extremely powerful Twin Hearts meditation for illumination, blessing the Earth, deep peace, and daily mind rejuvenation.'
    : 'Authentic bilingual audio meditation on breath awareness, body gratitude, and inner stillness with live captions.'
  const masterArtwork = isChoaKokSui
    ? '/images/meditation-master.png'
    : isRaviShankar
    ? '/images/meditation-ravi-shankar.png'
    : script?.artworkUrl || null

  const breath = activity.type === 'breathing'
  const index = Math.min(
    activity.steps.length - 1,
    Math.floor((elapsed / duration) * activity.steps.length),
  )
  const remaining = Math.max(0, duration - Math.floor(elapsed))
  const labels = BREATH_LABELS[language]


  const scriptTime = script ? (hasMasterAudio ? elapsed : (elapsed / duration) * script.duration) : 0
  const localizedPhase =
    script?.phases.find((p) => scriptTime >= p.start && scriptTime < p.end) ||
    script?.phases.at(-1)
  const instruction =
    language === 'en'
      ? (localizedPhase?.instruction?.en || activity.steps[index])
      : (localizedPhase?.instruction?.[language] || activity.steps[index])
  const narration =
    language === 'en'
      ? (localizedPhase?.voice?.en || instruction)
      : (localizedPhase?.voice?.[language] || instruction)

  // Master recorded audio playback (e.g. Sri Sri Ravi Shankar authentic recording)
  useEffect(() => {
    if (!hasMasterAudio || !masterAudioUrl) return
    const a = new Audio(masterAudioUrl)
    a.preload = 'auto'
    a.volume = voiceVolume
    masterAudioRef.current = a

    const onTimeUpdate = () => {
      if (a.duration && !isNaN(a.currentTime)) {
        setElapsed(a.currentTime)
      }
    }
    const onEnded = () => {
      setPlaying(false)
      setPhase('after')
    }
    a.addEventListener('timeupdate', onTimeUpdate)
    a.addEventListener('ended', onEnded)

    return () => {
      a.removeEventListener('timeupdate', onTimeUpdate)
      a.removeEventListener('ended', onEnded)
      a.pause()
      masterAudioRef.current = null
    }
  }, [hasMasterAudio, masterAudioUrl])

  // Sync master audio volume
  useEffect(() => {
    if (masterAudioRef.current) {
      masterAudioRef.current.volume = voiceVolume
    }
  }, [voiceVolume])

  // Play / pause master audio
  useEffect(() => {
    if (!hasMasterAudio || !masterAudioRef.current) return
    if (audioMode === 'master' && playing && phase === 'session') {
      masterAudioRef.current.play().catch((e) => console.warn('Master audio playback notice:', e))
    } else {
      masterAudioRef.current.pause()
    }
  }, [hasMasterAudio, audioMode, playing, phase])

  // Automatically ensure AI voice is enabled when device lacks local voice
  useEffect(() => {
    if (!selectedVoice && providerTTS.providerAvailable) {
      setUseAI(true)
    }
  }, [selectedVoice, providerTTS.providerAvailable])

  useEffect(() => {
    elapsedRef.current = elapsed
  }, [elapsed])
  useEffect(() => {
    if (!playing) return
    if (hasMasterAudio && audioMode === 'master') return // HTML5 timeupdate event handles elapsed
    let previous = performance.now()
    const timer = setInterval(() => {
      const now = performance.now(),
        delta = (now - previous) / 1000
      previous = now
      setElapsed((v) => Math.min(duration, v + delta))
    }, 250)
    return () => clearInterval(timer)
  }, [playing, duration, hasMasterAudio, audioMode])

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
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const gain = ctx.createGain()
      gain.gain.value = volume
      gain.connect(ctx.destination)

      let cleanup = () => {}

      if (sound === 'brown') {
        const noise = ctx.createBufferSource()
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate)
        const data = buffer.getChannelData(0)
        let previous = 0
        for (let i = 0; i < data.length; i++) {
          previous = (previous + 0.02 * (Math.random() * 2 - 1)) / 1.02
          data[i] = previous * 3.5
        }
        noise.buffer = buffer
        noise.loop = true
        noise.connect(gain)
        noise.start()
        cleanup = () => {
          try { noise.stop() } catch {}
        }
      } else if (sound === 'rain') {
        // Gentle Rain & Ocean Waves: pink noise filtered with slow wave swell modulation
        const bufferSize = ctx.sampleRate * 4
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const output = noiseBuffer.getChannelData(0)
        let b0 = 0, b1 = 0, b2 = 0
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1
          b0 = 0.99 * b0 + white * 0.05
          b1 = 0.95 * b1 + white * 0.05
          b2 = 0.90 * b2 + white * 0.05
          output[i] = (b0 + b1 + b2) * 1.8
        }
        const noiseSource = ctx.createBufferSource()
        noiseSource.buffer = noiseBuffer
        noiseSource.loop = true

        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = 900

        const lfo = ctx.createOscillator()
        const lfoGain = ctx.createGain()
        lfo.frequency.value = 0.12 // 8-second wave rhythm
        lfoGain.gain.value = 350
        lfo.connect(filter.frequency)
        lfo.start()

        noiseSource.connect(filter)
        filter.connect(gain)
        noiseSource.start()
        cleanup = () => {
          try { noiseSource.stop(); lfo.stop() } catch {}
        }
      } else if (sound === 'singing_bowl') {
        // Tibetan Singing Bowl: warm 432Hz fundamental with harmonic overtones and gentle shimmer
        const freqs = [108, 216, 432, 864, 1296]
        const weights = [0.35, 0.3, 0.2, 0.08, 0.04]
        const oscs = []
        const lfos = []

        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator()
          osc.type = 'sine'
          osc.frequency.value = f + (idx * 0.25)

          const oscGain = ctx.createGain()
          oscGain.gain.value = weights[idx]

          const mod = ctx.createOscillator()
          const modGain = ctx.createGain()
          mod.frequency.value = 0.18 + idx * 0.04
          modGain.gain.value = weights[idx] * 0.2
          mod.connect(modGain)
          modGain.connect(oscGain.gain)
          mod.start()
          lfos.push(mod)

          osc.connect(oscGain)
          oscGain.connect(gain)
          osc.start()
          oscs.push(osc)
        })
        cleanup = () => {
          oscs.forEach((o) => { try { o.stop() } catch {} })
          lfos.forEach((m) => { try { m.stop() } catch {} })
        }
      } else if (sound === 'stream') {
        // Peaceful Forest Stream: bandpass noise with soothing trickle modulation
        const bufferSize = ctx.sampleRate * 3
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const output = noiseBuffer.getChannelData(0)
        let prev = 0
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1
          prev = 0.92 * prev + 0.08 * white
          output[i] = prev * 3.8
        }
        const noiseSource = ctx.createBufferSource()
        noiseSource.buffer = noiseBuffer
        noiseSource.loop = true

        const bpFilter = ctx.createBiquadFilter()
        bpFilter.type = 'bandpass'
        bpFilter.frequency.value = 850
        bpFilter.Q.value = 1.6

        const trickleLfo = ctx.createOscillator()
        const trickleGain = ctx.createGain()
        trickleLfo.frequency.value = 0.75
        trickleGain.gain.value = 320
        trickleLfo.connect(bpFilter.frequency)
        trickleLfo.start()

        noiseSource.connect(bpFilter)
        bpFilter.connect(gain)
        noiseSource.start()
        cleanup = () => {
          try { noiseSource.stop(); trickleLfo.stop() } catch {}
        }
      } else if (sound === 'cosmic_om') {
        // Deep Theta Om · 432 Hz: 108Hz base + 114Hz theta beat (6Hz meditative delta/theta) + 432Hz harmonic
        const base1 = ctx.createOscillator()
        const base2 = ctx.createOscillator()
        const harmonic = ctx.createOscillator()

        base1.type = 'sine'
        base1.frequency.value = 108

        base2.type = 'sine'
        base2.frequency.value = 114

        harmonic.type = 'sine'
        harmonic.frequency.value = 432

        const harmGain = ctx.createGain()
        harmGain.gain.value = 0.22
        harmonic.connect(harmGain)

        base1.connect(gain)
        base2.connect(gain)
        harmGain.connect(gain)

        base1.start()
        base2.start()
        harmonic.start()
        cleanup = () => {
          try { base1.stop(); base2.stop(); harmonic.stop() } catch {}
        }
      }

      ctx.resume()
      audioRef.current = { ctx, gain }
      return () => {
        cleanup()
        try { ctx.close() } catch {}
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
    if (hasMasterAudio && audioMode === 'master') {
      activeVoice.stop()
      voiceStep.current = ''
      return
    }
    if (!voice || !playing) {
      activeVoice.stop()
      voiceStep.current = ''
      return
    }
    const key = narration + language
    if (voiceStep.current === key) return
    voiceStep.current = key
    
    // activeVoice could be providerTTS or narrator
    activeVoice.speak(narration, language, {
      rate: voiceRate,
      volume: voiceVolume,
    })
  }, [
    narration,
    voice,
    playing,
    language,
    selectedVoice?.voiceURI,
    voiceRate,
    voiceVolume,
    activeVoice,
    hasMasterAudio,
    audioMode,
  ])
  useEffect(() => {
    const hide = () => {
      if (document.hidden) setPlaying(false)
    }
    document.addEventListener('visibilitychange', hide)
    return () => document.removeEventListener('visibilitychange', hide)
  }, [])
  async function start() {
    narrator.stop()
    if (hasMasterAudio && masterAudioRef.current) {
      try { masterAudioRef.current.currentTime = 0 } catch {}
    }
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
    narrator.stop()
    if (masterAudioRef.current) {
      try { masterAudioRef.current.pause() } catch {}
    }
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
    if (masterAudioRef.current) {
      try { masterAudioRef.current.pause() } catch {}
    }
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
    if (masterAudioRef.current) {
      try { masterAudioRef.current.pause() } catch {}
    }
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
        {phase === 'before' && (
          <ActivityArtwork type={activity.type} className="session-cover" />
        )}
        <div className="session-meta">
          <Badge>{activity.type}</Badge>
          <span>
            {activity.minutes} minutes · {activity.level}
          </span>
        </div>
        {['before', 'session'].includes(phase) && (
          <div className="narration-setup">
            <div className="narration-heading">
              <span>
                <Icon name="volume" size={17} />
                <b>Your audio guide</b>
              </span>
              <small>At your own pace</small>
            </div>
            <div className="narration-options">
              <label>
                Guidance language
                <select
                  value={language}
                  onChange={(e) => {
                    activeVoice.stop()
                    voiceStep.current = ''
                    setLanguage(e.target.value)
                  }}
                >
                  {(script
                    ? LANGUAGES
                    : LANGUAGES.filter((l) => l.id === 'en')
                  ).map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.native} · {l.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Background ambience
                <select
                  value={sound}
                  onChange={(e) => setSound(e.target.value)}
                >
                  <option value="none">Silence</option>
                  <option value="brown">Soft brown noise</option>
                  <option value="rain">Gentle Rain & Waves</option>
                  <option value="singing_bowl">Tibetan Singing Bowl (Zen Drone)</option>
                  <option value="stream">Peaceful Forest Stream</option>
                  <option value="cosmic_om">Deep Theta Om · 432 Hz</option>
                </select>
              </label>
              <label>
                Voice pace
                <select
                  value={voiceRate}
                  onChange={(e) => {
                    voiceStep.current = ''
                    setVoiceRate(+e.target.value)
                  }}
                >
                  <option value="0.7">Gentle</option>
                  <option value="0.8">Relaxed</option>
                  <option value="1">Natural</option>
                </select>
              </label>
              <label>
                Voice volume
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={voiceVolume}
                  onChange={(e) => setVoiceVolume(+e.target.value)}
                />
              </label>
            </div>
            <div className="narration-actions">
              {providerTTS.providerAvailable && (
                <label className="checkbox-label" style={{ display: 'block', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    checked={useAI}
                    onChange={(e) => {
                      setUseAI(e.target.checked)
                      activeVoice.stop()
                      voiceStep.current = ''
                    }}
                  />
                  Use AI Voice
                </label>
              )}
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={voice}
                  disabled={useAI && providerTTS.providerAvailable ? false : !selectedVoice}
                  onChange={(e) => {
                    setVoice(e.target.checked)
                    voiceStep.current = ''
                    if (!e.target.checked) activeVoice.stop()
                  }}
                />
                Read guidance aloud
              </label>
              <Button
                variant="secondary"
                disabled={useAI && providerTTS.providerAvailable ? false : !selectedVoice}
                onClick={() =>
                  activeVoice.speaking
                    ? activeVoice.stop()
                    : activeVoice.speak(narration, language, {
                        rate: voiceRate,
                        volume: voiceVolume,
                      })
                }
              >
                <Icon name={activeVoice.speaking ? 'stop' : 'volume'} size={15} />
                {activeVoice.speaking
                  ? 'Stop audio'
                  : phase === 'before'
                    ? 'Preview voice'
                    : 'Replay guidance'}
              </Button>
            </div>
            <p className="voice-availability" role="status">
              {useAI && providerTTS.providerAvailable 
                ? 'AI voice narration ready (supports English, Hindi, Marathi, Tamil, Malayalam)'
                : selectedVoice
                ? `${selectedVoice.name} · ${selectedVoice.localService ? 'Device voice' : 'Online browser voice'}`
                : `No device voice installed for ${LANGUAGES.find((l) => l.id === language)?.name}. Enable "Use AI Voice" above to listen.`}
            </p>
            {activeVoice.error && (
              <p className="inline-error" role="status">
                {activeVoice.error}
              </p>
            )}
            <p className="quiet-note">
              {useAI && providerTTS.providerAvailable ? 'AI speech service reads the guidance.' : 'Your device or browser speech service reads the guidance.'} Preview
              it before closing your eyes. Audio is optional.
            </p>
          </div>
        )}
        {phase === 'before' ? (
          <>
            {hasMasterAudio && (
              <div className="master-track-card">
                <div className="master-track-badge-row">
                  <Badge variant="accent">🎙️ Master Recording</Badge>
                  <Badge>{masterDurationBadge}</Badge>
                  <Badge>{masterLanguageBadge}</Badge>
                </div>
                <h4 style={{ margin: '10px 0 4px', fontSize: '15px', fontWeight: '600' }}>
                  Guided by {masterGuideName}
                </h4>
                <p className="quiet-note" style={{ margin: '0 0 12px' }}>
                  {masterSubtitle}
                </p>
                <div className="audio-mode-pill-row">
                  <button
                    type="button"
                    className={`audio-mode-pill ${audioMode === 'master' ? 'active' : ''}`}
                    onClick={() => {
                      setAudioMode('master')
                      activeVoice.stop()
                    }}
                  >
                    🎙️ {masterGuideName} Audio
                  </button>
                  <button
                    type="button"
                    className={`audio-mode-pill ${audioMode === 'ai' ? 'active' : ''}`}
                    onClick={() => {
                      setAudioMode('ai')
                      if (masterAudioRef.current) masterAudioRef.current.pause()
                    }}
                  >
                    🤖 AI Voice ({LANGUAGES.find((l) => l.id === language)?.name})
                  </button>
                </div>
              </div>
            )}
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
            <div className="session-visual">
              <WellnessPhoto
                scene={masterArtwork ? 'master' : activity.type === 'breathing' ? 'zen' : 'meditation'}
                src={masterArtwork}
              />
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
                    : isChoaKokSui
                    ? 'MASTER CHOA KOK SUI'
                    : isRaviShankar
                    ? 'SRI SRI RAVI SHANKAR'
                    : 'A LITTLE SPACE FOR YOU'}
                </span>
              </div>
            </div>

            {localizedPhase?.caption && (
              <div className="master-caption-bubble" role="region" aria-label="Spoken Captions">
                <div className="caption-header">
                  <span className="caption-tag">🎙️ {masterGuideName}</span>
                  <span className="caption-sub">Live Spoken Words</span>
                </div>
                <p className="caption-quote">"{localizedPhase.caption}"</p>
              </div>
            )}

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
              {hasMasterAudio && (
                <label>
                  Audio Track
                  <select
                    value={audioMode}
                    onChange={(e) => {
                      const m = e.target.value
                      setAudioMode(m)
                      if (m === 'master') {
                        activeVoice.stop()
                      } else if (masterAudioRef.current) {
                        masterAudioRef.current.pause()
                      }
                    }}
                  >
                    <option value="master">🎙️ {masterGuideName} (Original)</option>
                    <option value="ai">🤖 AI Voice ({LANGUAGES.find((l) => l.id === language)?.name || 'Language'})</option>
                  </select>
                </label>
              )}
              <label>
                Background
                <select
                  value={sound}
                  onChange={(e) => setSound(e.target.value)}
                >
                  <option value="none">Silence</option>
                  <option value="brown">Soft brown noise</option>
                  <option value="rain">Gentle Rain & Waves</option>
                  <option value="singing_bowl">Tibetan Singing Bowl (Zen Drone)</option>
                  <option value="stream">Peaceful Forest Stream</option>
                  <option value="cosmic_om">Deep Theta Om · 432 Hz</option>
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
            </div>

            <p className="quiet-note">
              Pause or stop if anything feels uncomfortable. Leaving this tab
              pauses your session and audio.
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
