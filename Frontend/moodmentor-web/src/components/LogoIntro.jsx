import { useCallback, useEffect, useId, useRef, useState } from 'react'
import './LogoIntro.css'

export const INTRO_KEYS = {
  session: 'emotion-care:intro:session:v1',
  visited: 'emotion-care:intro:visited:v1',
}
export const INTRO_TIMING = {
  first: 6000,
  returning: 6000,
  exit: 300,
  deadline: 2400,
}
export const EMOTION_CARE_LOGO = `${import.meta.env.BASE_URL}brand/emotion-care-logo.png`
export const EMOTION_CARE_VOICE = `${import.meta.env.BASE_URL}audio/emotion-care-welcome.mp3`

let seenInThisDocument = false
function readStorage(kind, key) {
  try {
    return window[kind].getItem(key) === '1'
  } catch {
    return false
  }
}
function remember() {
  seenInThisDocument = true
  for (const [kind, key] of [
    ['sessionStorage', INTRO_KEYS.session],
    ['localStorage', INTRO_KEYS.visited],
  ]) {
    try {
      window[kind].setItem(key, '1')
    } catch {
      /* Storage can be disabled; navigation still works. */
    }
  }
}
function initialMode(enabled) {
  if (
    !enabled ||
    typeof window === 'undefined' ||
    seenInThisDocument ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    window.location.pathname === '/auth/google/callback' ||
    readStorage('sessionStorage', INTRO_KEYS.session)
  )
    return null
  return readStorage('localStorage', INTRO_KEYS.visited) ? 'returning' : 'first'
}

// These regions only clip the supplied raster. They do not redraw the logo.
// Coordinates belong to the original 1254 × 1254 artwork, including its wordmark.
const REGIONS = {
  embrace:
    'M548 138H730V312H548Z M335 245H555C594 253 599 323 700 331L709 351L682 377L650 394H570C498 376 464 423 475 505C487 570 564 625 628 681C663 713 675 752 675 796H640C620 754 530 737 440 692C338 630 325 539 335 420Z',
  heart:
    'M516 390L598 394L646 425L674 376L725 342L794 337L852 368L871 427L861 481L794 530L737 568L691 616L660 662L615 604L552 558L513 502Z',
  leaves:
    'M658 690L664 650L683 610L713 573L768 537L826 505L872 461L897 420L920 401L948 410L948 530L920 643L864 710L733 770L669 796Z M586 1024H667V1100H586Z',
  wordmark: 'M135 797H1128V944H135Z',
  signature:
    'M205 963H1052V1013H205Z M407 1054H578V1075H407Z M675 1054H850V1075H675Z',
}

/** Standalone startup boundary. Children mount immediately and keep their identity. */
export default function LogoIntro({
  children,
  enabled = true,
  src = EMOTION_CARE_LOGO,
  sound = EMOTION_CARE_VOICE,
  firstDuration = INTRO_TIMING.first,
  returningDuration = INTRO_TIMING.returning,
  onComplete,
}) {
  const [mode] = useState(() => initialMode(enabled))
  const [visible, setVisible] = useState(Boolean(mode)),
    [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [leaving, setLeaving] = useState(false)
  const completed = useRef(false),
    callback = useRef(onComplete),
    skipButton = useRef(null),
    audioRef = useRef(null)
  const id = `ec-${useId().replaceAll(':', '')}`
  callback.current = onComplete
  const duration = Math.min(
    15000,
    Math.max(300, mode === 'returning' ? returningDuration : firstDuration),
  )
  const complete = useCallback(() => {
    if (completed.current) return
    completed.current = true
    const restoreFocus = document.activeElement === skipButton.current
    remember()
    setVisible(false)
    if (audioRef.current) {
      try {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      } catch {}
    }
    if (restoreFocus)
      requestAnimationFrame(() => {
        const target =
          document.getElementById('main-content') ||
          document.querySelector('main')
        if (!target) return
        const temporary = !target.hasAttribute('tabindex')
        if (temporary) target.setAttribute('tabindex', '-1')
        target.focus({ preventScroll: true })
        if (temporary)
          target.addEventListener(
            'blur',
            () => target.removeAttribute('tabindex'),
            { once: true },
          )
      })
    callback.current?.()
  }, [])

  useEffect(() => {
    if (!visible) return
    let alive = true
    let watchdog = null
    const image = new Image()
    image.onload = () => {
      if (alive) {
        if (watchdog) clearTimeout(watchdog)
        setReady(true)
      }
    }
    image.onerror = () => {
      if (alive) {
        if (watchdog) clearTimeout(watchdog)
        setFailed(true)
        setReady(true)
      }
    }
    image.src = src
    // Watchdog ONLY fires if image loading is completely stalled/blocked
    watchdog = setTimeout(() => {
      if (alive) complete()
    }, INTRO_TIMING.deadline)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onPreference = () => {
      if (reduced.matches) complete()
    }
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        complete()
      }
    }
    const onVisibility = () => {
      if (document.hidden) complete()
    }
    // Authentication/onboarding dialogs take precedence over the decorative intro.
    const onDialog = () => {
      if (document.querySelector('dialog[open]')) complete()
    }
    const observer = new MutationObserver(onDialog)
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['open'],
      childList: true,
    })
    onDialog()
    reduced.addEventListener('change', onPreference)
    window.addEventListener('keydown', onKey)
    window.addEventListener('hashchange', complete)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      alive = false
      image.onload = null
      image.onerror = null
      clearTimeout(watchdog)
      observer.disconnect()
      reduced.removeEventListener('change', onPreference)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('hashchange', complete)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [visible, src, complete])

  useEffect(() => {
    if (!visible || !ready) return
    const hold = failed ? Math.min(duration, 520) : duration
    const fade = setTimeout(
      () => setLeaving(true),
      Math.max(0, hold - INTRO_TIMING.exit),
    )
    const end = setTimeout(complete, hold)
    return () => {
      clearTimeout(fade)
      clearTimeout(end)
    }
  }, [visible, ready, failed, duration, complete])

  useEffect(() => {
    if (!visible || !ready || failed) return
    let audio = null
    try {
      audio = new Audio(sound)
      audio.volume = 0.9
      audioRef.current = audio

      // Ethereal harmonious chime (528Hz healing tone + 660Hz E5)
      if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext
          const ctx = new AudioCtx()
          const now = ctx.currentTime
          const osc1 = ctx.createOscillator()
          const osc2 = ctx.createOscillator()
          const gainNode = ctx.createGain()

          osc1.type = 'sine'
          osc1.frequency.setValueAtTime(528, now)
          osc2.type = 'sine'
          osc2.frequency.setValueAtTime(660, now)

          gainNode.gain.setValueAtTime(0.0001, now)
          gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.08)
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.8)

          osc1.connect(gainNode)
          osc2.connect(gainNode)
          gainNode.connect(ctx.destination)

          osc1.start(now)
          osc2.start(now)
          osc1.stop(now + 2.0)
          osc2.stop(now + 2.0)
        } catch {}
      }

      // Play the beautiful voice: "Emotion Care"
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser restricts unmuted autoplay until user gesture,
          // play on first interaction on splash
          const playOnGesture = () => {
            audio?.play().catch(() => {})
            window.removeEventListener('pointerdown', playOnGesture)
            window.removeEventListener('keydown', playOnGesture)
          }
          window.addEventListener('pointerdown', playOnGesture, { once: true })
          window.addEventListener('keydown', playOnGesture, { once: true })
        })
      }
    } catch (e) {
      /* Audio is a delightful enhancement and non-blocking */
    }

    return () => {
      if (audio) {
        try {
          audio.pause()
          audio.currentTime = 0
        } catch {}
      }
    }
  }, [visible, ready, failed, sound])

  return (
    <>
      <div
        className="ec-application"
        inert={visible ? true : undefined}
        aria-hidden={visible ? true : undefined}
      >
        {children}
      </div>
      {visible && (
        <section
          className={`ec-logo-intro ec-logo-intro--${mode} ${ready ? 'is-ready' : ''} ${leaving ? 'is-leaving' : ''}`}
          aria-label="Emotion Care welcome"
          onClick={() => {
            if (audioRef.current && audioRef.current.paused) {
              audioRef.current.play().catch(() => {})
            }
          }}
          style={{
            '--ec-intro-duration': `${duration}ms`,
            '--ec-intro-exit': `${INTRO_TIMING.exit}ms`,
          }}
        >
          <div
            className="ec-intro-announcement"
            role="status"
            aria-live="polite"
          >
            <span className="ec-visually-hidden">
              Emotion Care. A healthier you, every day.
            </span>
          </div>
          <div className="ec-intro-art" aria-hidden="true">
            {failed ? (
              <div className="ec-intro-fallback">
                <span>
                  Emotion <em>Care</em>
                </span>
                <p>A healthier you, every day.</p>
              </div>
            ) : (
              <svg
                className="ec-intro-logo"
                viewBox="0 0 1254 1254"
                width="1254"
                height="1254"
                focusable="false"
              >
                <defs>
                  <image
                    id={`${id}-original`}
                    href={src}
                    width="1254"
                    height="1254"
                  />
                  {Object.entries(REGIONS).map(([name, d]) => (
                    <clipPath id={`${id}-${name}`} key={name}>
                      <path d={d} />
                    </clipPath>
                  ))}
                  <mask
                    id={`${id}-paper`}
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="1254"
                    height="1254"
                  >
                    <rect width="1254" height="1254" fill="white" />
                    {Object.values(REGIONS).map((d, i) => (
                      <path key={i} d={d} fill="black" />
                    ))}
                  </mask>
                </defs>
                <use
                  className="ec-logo-paper"
                  href={`#${id}-original`}
                  mask={`url(#${id}-paper)`}
                />
                {Object.keys(REGIONS).map((name) => (
                  <g
                    className={`ec-logo-piece ec-logo-piece--${name}`}
                    key={name}
                  >
                    <use
                      href={`#${id}-original`}
                      clipPath={`url(#${id}-${name})`}
                    />
                  </g>
                ))}
                <ellipse
                  className="ec-heart-breath"
                  cx="686"
                  cy="510"
                  rx="165"
                  ry="135"
                  fill="#ffd5b5"
                  clipPath={`url(#${id}-heart)`}
                />
              </svg>
            )}
          </div>
          <button
            ref={skipButton}
            type="button"
            className="ec-intro-skip"
            onClick={complete}
          >
            Skip intro <span aria-hidden="true">↗</span>
          </button>
        </section>
      )}
    </>
  )
}
