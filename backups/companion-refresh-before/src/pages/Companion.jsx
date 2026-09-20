import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import { useResource } from '../lib/hooks'
import {
  Button,
  Icon,
  Badge,
  Loading,
  ErrorState,
  Dialog,
} from '../components/ui'
import PlanCard from '../components/PlanCard'
export default function Companion({ onStart, onSafety }) {
  const resource = useResource('/chat/history?limit=100'),
    [text, setText] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [plan, setPlan] = useState(null),
    [clear, setClear] = useState(false)
  const bottom = useRef(null)
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [resource.data, busy])
  async function send(e) {
    e.preventDefault()
    if (!text.trim() || busy) return
    setBusy(true)
    setError('')
    try {
      const r = await api('/chat', { method: 'POST', body: { text } })
      resource.setData((prev) => [...(prev || []), r.user_message, r.reply])
      setText('')
      setPlan(r.wellness_plan)
      if (r.crisis) onSafety(r.wellness_plan.safety)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  async function clearChat() {
    setBusy(true)
    try {
      await api('/chat/history', { method: 'DELETE' })
      resource.setData([])
      setPlan(null)
      setClear(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <div className="page-intro">
        <div>
          <p className="eyebrow">YOUR AI COMPANION</p>
          <h1>A space to be heard.</h1>
          <p>Talk through the day. Find one manageable next step.</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setClear(true)}
          disabled={busy || !resource.data?.length}
        >
          Clear conversation
        </Button>
      </div>
      <div className="companion-layout">
        <section className="mm-card chat-card">
          <div className="companion-header">
            <span className="companion-avatar">
              <Icon name="spark" />
            </span>
            <div>
              <b>MoodMentor</b>
              <small>Supportive reflection · AI sharing is optional</small>
            </div>
            <Badge>Private</Badge>
          </div>
          <div className="chat-messages" role="log" aria-label="Conversation">
            {resource.loading ? (
              <Loading />
            ) : resource.error ? (
              <ErrorState error={resource.error} retry={resource.reload} />
            ) : !resource.data?.length ? (
              <div className="chat-welcome">
                <Icon name="chat" size={36} />
                <h2>What’s on your mind?</h2>
                <p>
                  You can start anywhere. I’ll help you find a little
                  perspective.
                </p>
                {[
                  'I’ve had meetings all day and feel drained.',
                  'I’m finding it hard to focus.',
                  'Something good happened today.',
                ].map((p) => (
                  <button
                    className="suggested-prompt"
                    key={p}
                    onClick={() => setText(p)}
                  >
                    {p}
                    <Icon name="arrow" size={16} />
                  </button>
                ))}
              </div>
            ) : (
              resource.data.map((m) => (
                <div className={`chat-message ${m.role}`} key={m.id}>
                  <span>{m.role === 'user' ? 'You' : 'MoodMentor'}</span>
                  <p>{m.text}</p>
                  {m.emotion && <small>Possible signal: {m.emotion}</small>}
                </div>
              ))
            )}
            {busy && (
              <p className="thinking" role="status">
                Taking a moment to reflect…
              </p>
            )}
            <div ref={bottom} />
          </div>
          <form className="chat-compose" onSubmit={send}>
            <label className="sr-only" htmlFor="chat-text">
              Your message
            </label>
            <textarea
              id="chat-text"
              required
              maxLength={2000}
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write what’s on your mind…"
            />
            <Button disabled={busy || !text.trim()} aria-label="Send message">
              <Icon name="arrow" />
            </Button>
          </form>
          {error && (
            <p className="inline-error" role="alert">
              {error}
            </p>
          )}
        </section>
        <aside>
          {plan ? (
            <PlanCard
              plan={plan}
              onPlan={setPlan}
              onStart={onStart}
              onSafety={onSafety}
            />
          ) : (
            <article className="mm-card companion-note">
              <Icon name="leaf" size={32} />
              <h3>Understanding, then action.</h3>
              <p>
                When a small activity may help, you’ll find it here. Every
                recommendation is yours to start, change, or skip.
              </p>
              <p className="quiet-note">
                This companion is not a therapist or emergency service. It can
                misunderstand context. Reach out to a trusted person or
                professional when you need more support.
              </p>
              <Button
                variant="secondary"
                onClick={() => onSafety({ risk_level: 'none' })}
              >
                Find human support
              </Button>
            </article>
          )}
        </aside>
      </div>
      {clear && (
        <Dialog
          title="Clear your conversation?"
          onClose={() => setClear(false)}
        >
          <p>
            This permanently removes your chat history from MoodMentor. Activity
            history remains in your private account.
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
    </>
  )
}
