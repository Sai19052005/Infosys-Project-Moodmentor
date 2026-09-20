import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useResource } from '../lib/hooks'
import { api } from '../lib/api'
import {
  Badge,
  Button,
  Empty,
  ErrorState,
  Icon,
  Loading,
  SectionTitle,
} from '../components/ui'

function MoodChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  const moodScore = payload[0].value
  const moodLabels = {
    1: 'Very Low',
    2: 'Soft / Low',
    3: 'Okay / Steady',
    4: 'Good / Uplifted',
    5: 'Great / Joyful',
  }
  const rounded = Math.round(moodScore)
  const labelText = moodLabels[rounded] || 'Okay'
  return (
    <div className="mood-chart-tooltip">
      <div className="tooltip-date">{label}</div>
      <div className="tooltip-value">
        <span className={`tooltip-orb mood-${rounded}`} />
        <b>{moodScore} / 5</b>
        <small>· {labelText}</small>
      </div>
    </div>
  )
}

export default function Insights() {
  const resource = useResource('/wellness/summary'),
    balance = useResource('/team/work-life-score')
  const [report, setReport] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [timeRange, setTimeRange] = useState('30d')

  const data = resource.data

  const filteredMoodTrend = useMemo(() => {
    const raw = data?.mood_trend || []
    if (timeRange === '7d') {
      return raw.slice(-7)
    }
    return raw
  }, [data?.mood_trend, timeRange])

  if (resource.loading) return <Loading />
  if (resource.error)
    return <ErrorState error={resource.error} retry={resource.reload} />
  if (!data) return <Loading />

  async function weekly() {
    setBusy(true)
    setError('')
    try {
      setReport(await api('/report/weekly'))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const score = data.wellness_score ?? 75
  const circumference = 2 * Math.PI * 46
  const strokeOffset = circumference - (circumference * score) / 100

  return (
    <div className="progress-insights-page">
      <div className="page-intro">
        <div>
          <p className="eyebrow">YOUR WELLNESS TRAJECTORY</p>
          <h1>How you’re doing & what makes a difference.</h1>
          <p>
            Holistic insights into your emotional balance, healthy habits, and gentle growth.
          </p>
        </div>
        <Button variant="secondary" disabled={busy} onClick={weekly}>
          <Icon name="spark" size={16} />
          {busy ? 'Preparing…' : 'Open weekly reflection'}
        </Button>
      </div>

      {/* 1. HERO WELLNESS STATUS & VERDICT ("Are We Doing Right or Wrong?") */}
      <section className={`wellness-hero-card tone-${data.wellness_status_tone || 'positive'}`}>
        <div className="hero-score-column">
          <div className="score-ring-container">
            <svg className="score-ring-svg" viewBox="0 0 110 110">
              <circle
                className="score-ring-bg"
                cx="55"
                cy="55"
                r="46"
                strokeWidth="9"
              />
              <circle
                className="score-ring-bar"
                cx="55"
                cy="55"
                r="46"
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
              />
            </svg>
            <div className="score-ring-center">
              <span className="score-number">{score}</span>
              <span className="score-label">OUT OF 100</span>
            </div>
          </div>
        </div>

        <div className="hero-verdict-column">
          <div className="hero-badge-row">
            <span className={`wellness-status-badge status-${data.wellness_status_tone || 'positive'}`}>
              <i className="status-dot" />
              {data.wellness_status || 'Thriving & On Track'}
            </span>
            <span className={`wellness-trajectory-pill trajectory-${data.wellness_trajectory_tone || 'positive'}`}>
              {data.wellness_trajectory || 'Steady & Grounded'}
            </span>
          </div>
          <h2 className="hero-verdict-heading">
            {data.wellness_status_tone === 'positive'
              ? 'You are on a healthy, uplifting path.'
              : data.wellness_status_tone === 'steady'
                ? 'You are holding steady balance and grounded pace.'
                : 'Your system is asking for extra rest and gentle care.'}
          </h2>
          <p className="hero-verdict-body">
            {data.wellness_verdict ||
              'Your mindfulness moments and check-ins are actively supporting your mental resilience.'}
          </p>
        </div>
      </section>

      {/* 2. WHAT YOU'RE DOING RIGHT VS GENTLE FOCUS AREAS */}
      <div className="feedback-cards-grid">
        <article className="feedback-card card-strengths">
          <div className="feedback-card-header">
            <span className="feedback-icon icon-strengths">
              <Icon name="check" size={16} />
            </span>
            <div>
              <h3>What you’re doing right</h3>
              <small>Healthy habits supporting your peace</small>
            </div>
          </div>
          <ul className="feedback-list">
            {(data.strengths && data.strengths.length > 0
              ? data.strengths
              : [
                  'Consistent mindful reset moments',
                  'Taking time to reflect and pause',
                  'Positive mood rebound after activities',
                ]
            ).map((item, idx) => (
              <li key={idx}>
                <span className="bullet-mark">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="feedback-card card-focus">
          <div className="feedback-card-header">
            <span className="feedback-icon icon-focus">
              <Icon name="spark" size={16} />
            </span>
            <div>
              <h3>Gentle areas to focus on</h3>
              <small>Supportive nudges without pressure</small>
            </div>
          </div>
          <ul className="feedback-list">
            {(data.focus_areas && data.focus_areas.length > 0
              ? data.focus_areas
              : [
                  'Keep your daily micro-pauses consistent',
                  'Notice when evening stress arises and take a breath',
                ]
            ).map((item, idx) => (
              <li key={idx}>
                <span className="bullet-mark">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      {/* 3. 4 CORE VITAL SIGNS (KPI CARDS) */}
      <div className="kpi-vital-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap tone-purple">
            <Icon name="spark" size={18} />
          </div>
          <div className="kpi-info">
            <small>WELLBEING SCORE</small>
            <b>{score} / 100</b>
            <span className="kpi-subtext">{data.wellness_trajectory || 'Baseline steady'}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap tone-green">
            <Icon name="leaf" size={18} />
          </div>
          <div className="kpi-info">
            <small>ACTIVE STREAK</small>
            <b>{data.streak || 0} {data.streak === 1 ? 'Day' : 'Days'}</b>
            <span className="kpi-subtext">
              {data.meditation_streak ? `${data.meditation_streak}d meditation` : 'Daily consistency'}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap tone-peach">
            <Icon name="clock" size={18} />
          </div>
          <div className="kpi-info">
            <small>MINDFUL TIME</small>
            <b>{data.total_minutes || 0} Mins</b>
            <span className="kpi-subtext">{data.total_sessions || 0} sessions completed</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap tone-blue">
            <Icon name="sun" size={18} />
          </div>
          <div className="kpi-info">
            <small>MOOD UPLIFT RATE</small>
            <b>{data.recovery_rate || '+1.0'} Mood</b>
            <span className="kpi-subtext">Average boost per session</span>
          </div>
        </div>
      </div>

      {/* 4. MOOD RHYTHM & EMOTIONAL BALANCE */}
      <div className="insights-grid">
        <article className="mm-card mood-rhythm-card">
          <div className="card-top-controls">
            <SectionTitle eyebrow="EMOTIONAL TRAJECTORY" title="Your check-in rhythm" />
            <div className="time-filter-toggle">
              <button
                type="button"
                className={timeRange === '7d' ? 'active' : ''}
                onClick={() => setTimeRange('7d')}
              >
                7 Days
              </button>
              <button
                type="button"
                className={timeRange === '30d' ? 'active' : ''}
                onClick={() => setTimeRange('30d')}
              >
                30 Days
              </button>
            </div>
          </div>

          {filteredMoodTrend.length ? (
            <>
              <div className="mood-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredMoodTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => (typeof d === 'string' ? d.slice(5) : d || '')}
                      tickLine={false}
                      axisLine={false}
                      stroke="var(--muted)"
                    />
                    <YAxis
                      domain={[1, 5]}
                      ticks={[1, 2, 3, 4, 5]}
                      tickFormatter={(v) => ({ 1: 'Low', 2: 'Soft', 3: 'Okay', 4: 'Good', 5: 'Great' }[v] || v)}
                      width={45}
                      axisLine={false}
                      tickLine={false}
                      stroke="var(--muted)"
                      fontSize={11}
                    />
                    <Tooltip content={<MoodChartTooltip />} />
                    <Area
                      dataKey="mood"
                      type="monotone"
                      stroke="#10b981"
                      fill="url(#moodGradient)"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                      activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#ffffff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mood-chart-legend">
                <span><i className="legend-dot green" /> 4-5: Good / Great</span>
                <span><i className="legend-dot yellow" /> 3: Okay / Balanced</span>
                <span><i className="legend-dot red" /> 1-2: Low / Tender</span>
              </div>
            </>
          ) : (
            <Empty title="A rhythm will emerge">
              Your command-center check-ins build this chart over time.
            </Empty>
          )}
        </article>

        <article className="mm-card emotional-balance-card">
          <SectionTitle eyebrow="OVERALL SPECTRUM" title="Emotional balance" />
          <p className="card-sub-p">
            Distribution of emotions recorded from your check-ins and reflections.
          </p>

          <div className="segmented-balance-bar">
            <div
              className="segment seg-uplifting"
              style={{ width: `${data.emotional_balance?.uplifting_pct || 50}%` }}
              title={`Uplifting: ${data.emotional_balance?.uplifting_pct || 50}%`}
            />
            <div
              className="segment seg-steady"
              style={{ width: `${data.emotional_balance?.steady_pct || 35}%` }}
              title={`Calm / Steady: ${data.emotional_balance?.steady_pct || 35}%`}
            />
            <div
              className="segment seg-heavy"
              style={{ width: `${data.emotional_balance?.heavy_pct || 15}%` }}
              title={`Needs Care: ${data.emotional_balance?.heavy_pct || 15}%`}
            />
          </div>

          <div className="balance-breakdown-legend">
            <div className="legend-item">
              <span className="legend-swatch seg-uplifting" />
              <div>
                <b>{data.emotional_balance?.uplifting_pct || 50}%</b>
                <small>Uplifting & Joy</small>
              </div>
            </div>
            <div className="legend-item">
              <span className="legend-swatch seg-steady" />
              <div>
                <b>{data.emotional_balance?.steady_pct || 35}%</b>
                <small>Calm & Steady</small>
              </div>
            </div>
            <div className="legend-item">
              <span className="legend-swatch seg-heavy" />
              <div>
                <b>{data.emotional_balance?.heavy_pct || 15}%</b>
                <small>Needs Care</small>
              </div>
            </div>
          </div>

          <div className="detailed-emotion-tags">
            {Object.keys(data.emotion_distribution || {}).length > 0 ? (
              Object.entries(data.emotion_distribution).map(([name, count]) => (
                <span className="emotion-pill-tag" key={name}>
                  {name} <small>({count})</small>
                </span>
              ))
            ) : (
              <small style={{ color: 'var(--muted)' }}>Check-in words will categorize emotions here.</small>
            )}
          </div>
        </article>
      </div>

      {/* 5. WHAT SEEMS TO HELP & PERSONAL MILESTONES */}
      <div className="insights-grid">
        <article className="mm-card">
          <SectionTitle
            eyebrow="ACTIVITY OUTCOMES"
            title="What seems to help"
          />
          {data.effectiveness?.length ? (
            <div className="effectiveness-list">
              {data.effectiveness.map((g) => (
                <div key={g.type}>
                  <div className="section-title">
                    <b>{g.type}</b>
                    <Badge tone={g.average_change > 0 ? 'sage' : ''}>
                      {g.average_change > 0 ? '+' : ''}
                      {g.average_change} mood
                    </Badge>
                  </div>
                  <progress value={g.helpful_percent} max={100} />
                  <small>
                    {g.sessions} completed · {g.helpful_percent}% marked helpful
                    {g.sessions < 3 ? ' · Early signal' : ''}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <Empty title="Let experience guide you">
              Complete a session and its before/after check-in to begin.
            </Empty>
          )}
          <p className="quiet-note">
            Mood change is an observation on a 1–5 scale, not a medical claim.
          </p>
        </article>

        <article className="mm-card">
          <SectionTitle title="Your personal milestones" />
          {data.milestones?.map((m) => (
            <div
              className={`milestone ${m.unlocked ? 'unlocked' : ''}`}
              key={m.title}
            >
              <span className="small-icon">
                <Icon name={m.unlocked ? 'check' : 'leaf'} />
              </span>
              <div>
                <b>{m.title}</b>
                <small>
                  {m.unlocked ? 'A moment worth celebrating' : 'At your own pace'}
                </small>
              </div>
            </div>
          ))}
          <p className="quiet-note">
            Streaks encourage consistency, never pressure. Rest days are part of wellbeing.
          </p>
        </article>
      </div>

      {balance.data?.journal_regularity > 0 && (
        <article className="mm-card">
          <SectionTitle title="Your workday reflection pattern" />
          <p>{balance.data.tip}</p>
          <p>
            {balance.data.journal_regularity}% of days included a journal entry
            over the last 30 days.
          </p>
          <p className="quiet-note">
            This describes how often you use the journal. It does not measure
            productivity, mental health, or burnout.
          </p>
        </article>
      )}

      {error && (
        <p role="alert" className="inline-error">
          {error}
        </p>
      )}

      {report && (
        <article className="mm-card weekly-report">
          <Badge>Weekly reflection</Badge>
          <h2>
            {report.week_start} — {report.week_end}
          </h2>
          {report.total_entries === 0 ? (
            <Empty title="Your week is a fresh page">
              Add a journal reflection to begin a weekly summary.
            </Empty>
          ) : (
            <>
              <p>{report.narrative}</p>
              <ul>
                {report.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <p>
                <b>One next step:</b> {report.suggestion}
              </p>
            </>
          )}
        </article>
      )}
    </div>
  )
}
