import { useState } from 'react'
import { api } from '../lib/api'
import { Button, Icon, Badge } from './ui'

export default function PlanCard({ plan, onPlan, onStart, onSafety, onDismiss, index = 0, eyebrowText, badgeText }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  async function change(action) {
    setBusy(true)
    setError('')
    try {
      const result = await api(`/wellness/plans/${plan.id}/${action}`, {
        method: 'POST',
      })
      onPlan?.(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  if (!plan) return null
  const activity = plan.activity
  const isPrimary = index === 0

  return (
    <article className={`plan-card ${activity ? '' : 'support-card'} ${isPrimary ? 'plan-card-primary' : 'plan-card-secondary'}`}>
      <div className="plan-eyebrow">
        <Icon name={activity ? (isPrimary ? 'spark' : 'spark') : 'shield'} size={14} />
        <span>
          {eyebrowText || (activity ? (isPrimary ? 'YOUR BEST NEXT STEP' : 'RECOMMENDED ALTERNATIVE') : 'MAKE ROOM FOR HUMAN SUPPORT')}
        </span>
        <Badge>{badgeText || (activity ? (isPrimary ? 'Personalized plan' : 'Alternative option') : 'Support available')}</Badge>
      </div>
      <h2>{activity?.title || 'You don’t have to carry this alone.'}</h2>
      <p>{plan.rationale}</p>
      {activity && (
        <div className="inline-meta">
          <span className="meta-pill">
            <Icon name="clock" size={14} />
            {activity.minutes} min
          </span>
          <span className="meta-pill">
            <Icon name="spark" size={13} />
            {activity.category}
          </span>
          <span className="meta-pill">
            {activity.level}
          </span>
        </div>
      )}
      <div className="button-row">
        {activity ? (
          <>
            <Button
              disabled={busy || plan.status !== 'suggested'}
              onClick={() => onStart(activity, plan.id)}
              className="btn-start-reset"
            >
              <Icon name="play" size={16} />
              Start reset
            </Button>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => change('change')}
              className="btn-change-reset"
            >
              Change
            </Button>
            <button
              className="text-button btn-dismiss-reset"
              disabled={busy}
              onClick={() => {
                if (onDismiss) onDismiss();
                else change('dismiss');
              }}
            >
              Not now
            </button>
          </>
        ) : (
          <Button onClick={() => onSafety(plan.safety)}>
            View support options
          </Button>
        )}
      </div>
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
      {plan.trace && plan.trace.length > 0 && (
        <details className="agent-trace">
          <summary>How this recommendation was made</summary>
          <ol>
            {plan.trace.map((step, i) => (
              <li key={i}>
                <b>{step.stage}</b>
                <span>{step.detail}</span>
              </li>
            ))}
          </ol>
        </details>
      )}
    </article>
  )
}
