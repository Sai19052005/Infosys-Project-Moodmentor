import { useState } from 'react'
import { api, beginGoogle } from '../lib/api'
import { useResource } from '../lib/hooks'
import {
  Button,
  Badge,
  Dialog,
  Empty,
  ErrorState,
  Icon,
  Loading,
} from '../components/ui'

export function PreferencesForm({ initial, onSaved, onboarding = false }) {
  const [form, setForm] = useState(initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [saved, setSaved] = useState(false)
  const update = (key, value) => {
    setForm({ ...form, [key]: value })
    setSaved(false)
  }
  const toggle = (key, value) =>
    update(
      key,
      form[key].includes(value)
        ? form[key].filter((v) => v !== value)
        : [...form[key], value],
    )
  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = await api('/wellness/profile', {
        method: 'PUT',
        body: { ...form, onboarded: true },
      })
      setSaved(true)
      onSaved?.(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <form className="preferences-form" onSubmit={submit}>
      <fieldset>
        <legend>What would you like more room for?</legend>
        <div className="preference-options">
          {['calm', 'focus', 'energy', 'sleep', 'boundaries', 'connection'].map(
            (v) => (
              <button
                type="button"
                key={v}
                className={form.goals.includes(v) ? 'selected' : ''}
                aria-pressed={form.goals.includes(v)}
                onClick={() => toggle('goals', v)}
              >
                {v}
              </button>
            ),
          )}
        </div>
      </fieldset>
      <fieldset>
        <legend>Which activities feel like you?</legend>
        <div className="preference-options">
          {[
            'breathing',
            'meditation',
            'movement',
            'music',
            'walk',
            'focus',
            'social',
            'journaling',
          ].map((v) => (
            <button
              type="button"
              key={v}
              className={form.preferred_types.includes(v) ? 'selected' : ''}
              aria-pressed={form.preferred_types.includes(v)}
              onClick={() => toggle('preferred_types', v)}
            >
              {v}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="form-grid">
        <label>
          Usual session length
          <select
            value={form.preferred_minutes}
            onChange={(e) => update('preferred_minutes', +e.target.value)}
          >
            {[2, 3, 5, 10, 15, 20].map((n) => (
              <option key={n} value={n}>
                {n} minutes
              </option>
            ))}
          </select>
        </label>
        <label>
          Weekly intention
          <select
            value={form.weekly_goal}
            onChange={(e) => update('weekly_goal', +e.target.value)}
          >
            {[1, 2, 3, 4, 5, 7, 10, 14].map((n) => (
              <option key={n} value={n}>
                {n} sessions
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="form-grid">
        <label>
          Timezone
          <select
            value={form.timezone}
            onChange={(e) => update('timezone', e.target.value)}
          >
            {[
              'Asia/Kolkata',
              'UTC',
              'America/New_York',
              'America/Los_Angeles',
              'Europe/London',
              'Europe/Berlin',
              'Asia/Singapore',
              'Australia/Sydney',
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <div className="form-grid">
          <label>
            Work starts
            <select
              value={form.work_start}
              onChange={(e) => update('work_start', +e.target.value)}
            >
              {Array.from({ length: 24 }, (_, n) => (
                <option key={n} value={n}>
                  {String(n).padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </label>
          <label>
            Work ends
            <select
              value={form.work_end}
              onChange={(e) => update('work_end', +e.target.value)}
            >
              {Array.from({ length: 24 }, (_, n) => (
                <option key={n} value={n + 1}>
                  {String(n + 1).padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <label className="consent-row">
        <input
          type="checkbox"
          checked={form.reminders_enabled}
          onChange={(e) => update('reminders_enabled', e.target.checked)}
        />
        <span>
          <b>Gentle reminders inside MoodMentor</b>
          <small>
            Optional check-in and unfinished-session reminders. No push
            messages, email, or SMS.
          </small>
        </span>
      </label>
      <label className="consent-row">
        <input
          type="checkbox"
          checked={form.ai_consent}
          onChange={(e) => update('ai_consent', e.target.checked)}
        />
        <span>
          <b>Enable optional Gemini assistance</b>
          <small>
            Allow journal text, recent chat context, and wellness summaries to
            be sent to Google Gemini for contextual responses. Local rules and
            curated guidance work without this. You can turn it off anytime; it
            does not remove data already processed by the provider.
          </small>
        </span>
      </label>
      {error && (
        <p role="alert" className="inline-error">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="success-note">
          Your preferences are saved.
        </p>
      )}
      <Button disabled={busy}>
        {busy
          ? 'Saving…'
          : onboarding
            ? 'Enter my wellness space'
            : 'Save preferences'}
        <Icon name="arrow" size={16} />
      </Button>
    </form>
  )
}

export default function Profile({
  user,
  settings = false,
  theme,
  toggleTheme,
}) {
  const profile = useResource('/wellness/profile'),
    integration = useResource('/integrations/status'),
    contact = useResource('/safety/contact')
  const [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false),
    [confirm, setConfirm] = useState(false)
  async function saveContact(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const values = Object.fromEntries(new FormData(e.currentTarget))
      values.email = values.email || null
      await api('/safety/contact', {
        method: 'POST',
        body: { ...values, notification_mode: 'ask' },
      })
      setNotice(
        'Trusted contact saved. Automatic delivery is unavailable; call your contact directly.',
      )
      contact.reload()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  async function removeContact() {
    setBusy(true)
    try {
      await api('/safety/contact', { method: 'DELETE' })
      contact.reload()
      setConfirm(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  const failed = [profile, integration, contact].find((r) => r.error)
  if (failed)
    return (
      <ErrorState
        error={failed.error}
        retry={() => {
          profile.reload()
          integration.reload()
          contact.reload()
        }}
      />
    )
  if (profile.loading || integration.loading || contact.loading)
    return <Loading />
  return (
    <>
      <div className="page-intro">
        <div>
          <p className="eyebrow">
            {settings ? 'SETTINGS & PRIVACY' : 'YOUR WELLNESS PROFILE'}
          </p>
          <h1>
            {settings
              ? 'Your space. Your choices.'
              : 'A rhythm that feels like you.'}
          </h1>
          <p>
            {settings
              ? 'Manage your account connections, privacy, and support options.'
              : 'Your preferences guide suggestions. Your feedback makes them more personal.'}
          </p>
        </div>
      </div>
      <article className="mm-card profile-identity">
        <span className="profile-avatar">{user.name[0]}</span>
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
        <Badge>
          <Icon name="shield" size={14} />
          Private account
        </Badge>
      </article>
      {!settings ? (
        <article className="mm-card">
          <h2>Make your wellness space your own</h2>
          <p className="muted">
            Choose what feels useful. You can change any of this later.
          </p>
          <PreferencesForm initial={profile.data} onSaved={profile.setData} />
        </article>
      ) : (
        <div className="settings-grid">
          <article className="mm-card">
            <h2>Privacy, in plain language</h2>
            <ul className="privacy-list">
              <li>
                Journals, chat, check-ins, and sessions are scoped to your
                account.
              </li>
              <li>
                Your team sees only opt-in aggregate mood patterns after enough
                members participate. Kudos are named and visible to your team.
              </li>
              <li>
                Google sign-in requests identity only. Photos and Contacts
                access is unavailable.
              </li>
              <li>
                AI sharing is {profile.data.ai_consent ? 'enabled' : 'off'}.
                Change this on your Profile.
              </li>
              <li>
                Private data is stored in the application database. Production
                operators must configure storage encryption, backups, and
                retention.
              </li>
            </ul>
            <Button variant="secondary" onClick={toggleTheme}>
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
              Use {theme === 'dark' ? 'light' : 'dark'} theme
            </Button>
          </article>
          <article className="mm-card">
            <div className="section-title">
              <h2>Google account</h2>
              <Badge>
                {integration.data.google_connected
                  ? 'Connected'
                  : 'Not connected'}
              </Badge>
            </div>
            <p>
              Secure identity sign-in with explicit account linking. No access
              to your Google Photos or Contacts.
            </p>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                setError('')
                try {
                  if (integration.data.google_connected) {
                    await api('/integrations/disconnect', { method: 'DELETE' })
                    integration.reload()
                  } else await beginGoogle()
                } catch (e) {
                  setError(e.message)
                } finally {
                  setBusy(false)
                }
              }}
            >
              {integration.data.google_connected
                ? 'Disconnect Google'
                : 'Link Google account'}
              <Icon name="arrow" size={16} />
            </Button>
            <p className="quiet-note">
              Google must be configured by the application operator. Accounts
              using Google as their only sign-in method must keep it linked.
            </p>
          </article>
          <article className="mm-card">
            <h2>A person you trust</h2>
            <p>
              Save a contact so their details are easy to find when you need
              support. MoodMentor does not currently send messages to this
              person.
            </p>
            <form onSubmit={saveContact} key={contact.data?.id || 'new'}>
              <div className="form-grid">
                <label>
                  Name
                  <input
                    name="name"
                    defaultValue={contact.data?.name}
                    required
                    maxLength={100}
                  />
                </label>
                <label>
                  Relationship
                  <select
                    name="relationship_type"
                    defaultValue={contact.data?.relationship_type || 'Friend'}
                  >
                    {['Friend', 'Family', 'Partner', 'Counselor', 'Other'].map(
                      (v) => (
                        <option key={v}>{v}</option>
                      ),
                    )}
                  </select>
                </label>
              </div>
              <div className="form-grid">
                <label>
                  Phone
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={contact.data?.phone}
                    required
                    maxLength={30}
                    placeholder="Include country code"
                  />
                </label>
                <label>
                  Email (optional)
                  <input
                    type="email"
                    name="email"
                    defaultValue={contact.data?.email || ''}
                  />
                </label>
              </div>
              <p className="quiet-note">
                Saving contact details does not contact anyone. Notifications
                always require an explicit action; a provider is not configured.
              </p>
              <div className="button-row">
                <Button disabled={busy}>Save trusted contact</Button>
                {contact.data && (
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setConfirm(true)}
                  >
                    Remove contact
                  </Button>
                )}
              </div>
            </form>
          </article>
          <article className="mm-card">
            <h2>Notifications</h2>
            <p>
              {profile.data.reminders_enabled
                ? 'In-app reminders are enabled.'
                : 'Reminders are off.'}{' '}
              Change reminder preferences on your Profile.
            </p>
            <Badge>External delivery unavailable</Badge>
            <p className="quiet-note">
              We never show a delivery confirmation for a message that has not
              been delivered.
            </p>
          </article>
        </div>
      )}
      {error && (
        <p role="alert" className="inline-error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="notice-inline">
          {notice}
        </p>
      )}
      {confirm && (
        <Dialog
          title="Remove your trusted contact?"
          onClose={() => setConfirm(false)}
        >
          <p>The saved contact details will be deleted.</p>
          <Button disabled={busy} variant="danger" onClick={removeContact}>
            Remove contact
          </Button>
        </Dialog>
      )}
    </>
  )
}
