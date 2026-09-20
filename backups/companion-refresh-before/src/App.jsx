import { lazy, Suspense, useEffect, useState } from 'react'
import { api, readSession, SESSION_KEY } from './lib/api'
import { useResource, useRoute, navigate } from './lib/hooks'
import {
  Brand,
  Button,
  Dialog,
  ErrorBoundary,
  ErrorState,
  Icon,
  Loading,
} from './components/ui'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Journal = lazy(() => import('./pages/Journal'))
const Companion = lazy(() => import('./pages/Companion'))
const Library = lazy(() => import('./pages/Library'))
const Insights = lazy(() => import('./pages/Insights'))
const History = lazy(() => import('./pages/History'))
const Team = lazy(() => import('./pages/Team'))
const Profile = lazy(() => import('./pages/Profile'))
const PreferencesForm = lazy(() =>
  import('./pages/Profile').then((m) => ({ default: m.PreferencesForm })),
)
const SessionPlayer = lazy(() => import('./components/SessionPlayer'))
const SafetyDialog = lazy(() => import('./components/SafetyDialog'))
const Studio = lazy(() => import('./pages/Studio'))
const NAV = [
  ['dashboard', 'home', 'Dashboard'],
  ['journal', 'journal', 'Journal'],
  ['companion', 'chat', 'AI Companion'],
  ['meditation', 'meditation', 'Meditation'],
  ['wellness', 'wellness', 'Wellness'],
  ['insights', 'insights', 'Insights'],
  ['history', 'history', 'History'],
  ['team', 'team', 'Team'],
  ['profile', 'profile', 'Profile'],
  ['settings', 'settings', 'Settings'],
]

function Workspace({ session, onLogout, theme, toggleTheme }) {
  const route = useRoute(),
    profile = useResource('/wellness/profile'),
    summary = useResource('/wellness/summary')
  const [menu, setMenu] = useState(false),
    [player, setPlayer] = useState(null),
    [safety, setSafety] = useState(null),
    [notifications, setNotifications] = useState(false),
    [revision, setRevision] = useState(0)
  useEffect(() => {
    setMenu(false)
    window.scrollTo(0, 0)
  }, [route])
  const onStart = (activity, planId, existing) =>
    setPlayer({ activity, planId, existing })
  const refresh = () => {
    setRevision((v) => v + 1)
    summary.reload()
  }
  const props = {
    user: session.user,
    onStart,
    onSafety: setSafety,
    theme,
    toggleTheme,
  }
  const view =
    route === 'dashboard' ? (
      <Dashboard {...props} />
    ) : route === 'journal' ? (
      <Journal {...props} />
    ) : route === 'companion' ? (
      <Companion {...props} />
    ) : route === 'meditation' ? (
      <Library key="meditation" meditation {...props} />
    ) : route === 'wellness' ? (
      <Library key="wellness" {...props} />
    ) : route === 'insights' ? (
      <Insights />
    ) : route === 'history' ? (
      <History />
    ) : route === 'team' ? (
      <Team />
    ) : route === 'profile' ? (
      <Profile {...props} />
    ) : route === 'settings' ? (
      <Profile settings {...props} />
    ) : route === 'studio' ? (
      <Studio />
    ) : (
      <ErrorState
        error="This page does not exist."
        retry={() => navigate('dashboard')}
      />
    )
  if (profile.loading && !profile.data) return <Loading />
  if (profile.error)
    return <ErrorState error={profile.error} retry={profile.reload} />
  return (
    <div className="workspace">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
      >
        Skip to content
      </a>
      {menu && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={`mm-sidebar ${menu ? 'is-open' : ''}`}>
        <a href="#dashboard" className="sidebar-brand">
          <Brand />
        </a>
        <div className="workspace-label">
          <span className="workspace-initial">W</span>
          <div>
            <b>My wellness space</b>
            <small>Personal workspace</small>
          </div>
          <Icon name="shield" size={15} />
        </div>
        <p className="nav-section-label">YOUR WORKDAY</p>
        <nav aria-label="Main navigation">
          {NAV.slice(0, 8).map(([key, icon, label]) => (
            <a
              key={key}
              href={'#' + key}
              className={route === key ? 'active' : ''}
              aria-current={route === key ? 'page' : undefined}
            >
              <Icon name={icon} />
              {label}
              {key === 'companion' && <span className="nav-ai">AI</span>}
            </a>
          ))}
        </nav>
        <div className="sidebar-reset">
          <span className="small-icon">
            <Icon name="leaf" />
          </span>
          <h3>A moment for you</h3>
          <p>A small pause can change the pace of your day.</p>
          <button onClick={() => navigate('wellness')}>
            Take a quick reset
            <Icon name="arrow" size={15} />
          </button>
        </div>
        <nav className="secondary-nav" aria-label="Account navigation">
          {NAV.slice(8).map(([key, icon, label]) => (
            <a
              key={key}
              href={'#' + key}
              className={route === key ? 'active' : ''}
              aria-current={route === key ? 'page' : undefined}
            >
              <Icon name={icon} />
              {label}
            </a>
          ))}
        </nav>
        <div className="sidebar-user">
          <span className="user-avatar">{session.user.name[0]}</span>
          <div>
            <b>{session.user.name}</b>
            <small>Your private space</small>
          </div>
          <button
            className="icon-button"
            onClick={onLogout}
            aria-label="Sign out"
          >
            <Icon name="logout" size={17} />
          </button>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              <Icon name="menu" />
            </button>
            <span>My workspace</span>
            <span className="breadcrumb-slash">/</span>
            <b>{NAV.find((n) => n[0] === route)?.[2] || 'Mood Studio'}</b>
          </div>
          <div className="topbar-actions">
            <span className="private-indicator">
              <Icon name="shield" size={14} />
              Private & personal
            </span>
            <button
              className="icon-button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19} />
            </button>
            <button
              className="icon-button notification-button"
              aria-label="Open reminders"
              onClick={() => setNotifications(true)}
            >
              <Icon name="bell" size={19} />
              {summary.data?.notifications.length > 0 && <i />}
            </button>
            <button
              className="user-avatar"
              aria-label="Open profile"
              onClick={() => navigate('profile')}
            >
              {session.user.name[0]}
            </button>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="page-content">
          <ErrorBoundary key={route}>
            <Suspense fallback={<Loading />}>
              <div key={revision}>{view}</div>
            </Suspense>
          </ErrorBoundary>
          <footer className="app-footer">
            <span>MoodMentor · A healthier rhythm for your workday</span>
            <button className="text-button" onClick={() => setSafety({})}>
              Support resources
            </button>
          </footer>
        </main>
      </div>
      {!profile.data.onboarded && (
        <Dialog title="Let’s make this space yours." wide>
          <p>
            A few optional preferences help us choose useful next steps. Your
            private data is not shared with your team.
          </p>
          <Suspense fallback={<Loading />}>
            <PreferencesForm
              initial={profile.data}
              onboarding
              onSaved={(data) => {
                profile.setData(data)
                summary.reload()
              }}
            />
          </Suspense>
        </Dialog>
      )}
      {player && (
        <Suspense fallback={<Loading />}>
          <SessionPlayer
            {...player}
            onClose={() => {
              setPlayer(null)
              refresh()
            }}
            onComplete={refresh}
          />
        </Suspense>
      )}
      {safety && (
        <Suspense fallback={<Loading />}>
          <SafetyDialog safety={safety} onClose={() => setSafety(null)} />
        </Suspense>
      )}
      {notifications && (
        <Dialog title="A gentle nudge" onClose={() => setNotifications(false)}>
          {summary.error ? (
            <ErrorState error={summary.error} retry={summary.reload} />
          ) : summary.data?.notifications.length ? (
            summary.data.notifications.map((n) => (
              <article className="notification-item" key={n.id}>
                <h3>{n.title}</h3>
                <p>{n.body}</p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    navigate(n.action)
                    setNotifications(false)
                  }}
                >
                  Take a moment
                </Button>
              </article>
            ))
          ) : (
            <p>
              No reminders right now. You can enable optional in-app reminders
              on your Profile.
            </p>
          )}
        </Dialog>
      )}
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(readSession),
    [authMode, setAuthMode] = useState('login'),
    [showAuth, setShowAuth] = useState(
      window.location.pathname === '/auth/google/callback',
    ),
    [callback, setCallback] = useState(
      window.location.pathname === '/auth/google/callback',
    )
  const [theme, setTheme] = useState(
      () => localStorage.getItem('moodmentor-theme') || 'light',
    ),
    [expired, setExpired] = useState(false)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('moodmentor-theme', theme)
  }, [theme])
  useEffect(() => {
    localStorage.removeItem('moodmentor-session')
    const logout = () => {
      sessionStorage.removeItem(SESSION_KEY)
      setSession(null)
      setShowAuth(true)
      setExpired(true)
    }
    window.addEventListener('session-expired', logout)
    return () => window.removeEventListener('session-expired', logout)
  }, [])
  function accept(next) {
    setSession(next)
    setCallback(false)
    setExpired(false)
    window.history.replaceState({}, '', '/#dashboard')
  }
  function logout() {
    sessionStorage.removeItem(SESSION_KEY)
    setSession(null)
    setShowAuth(false)
    setCallback(false)
    window.history.replaceState({}, '', '/')
  }
  const toggleTheme = () => setTheme((v) => (v === 'dark' ? 'light' : 'dark'))
  if (callback || !session)
    return (
      <>
        {expired && (
          <div className="session-notice" role="status">
            Your session expired. Please sign in again.
          </div>
        )}
        {showAuth ? (
          <Auth
            mode={authMode}
            setMode={setAuthMode}
            onSession={accept}
            callback={callback}
            onBack={() => {
              setShowAuth(false)
              setCallback(false)
              window.history.replaceState({}, '', '/')
            }}
          />
        ) : (
          <Landing
            onAuth={(mode) => {
              setAuthMode(mode)
              setShowAuth(true)
            }}
          />
        )}
      </>
    )
  return (
    <Workspace
      key={session.user.id}
      session={session}
      onLogout={logout}
      theme={theme}
      toggleTheme={toggleTheme}
    />
  )
}
