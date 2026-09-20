import { lazy, Suspense, useState } from 'react'
import { useResource, navigate } from '../lib/hooks'
import { Button, Dialog, Empty, ErrorState, Icon, Loading } from './ui'
import { WellnessPhoto } from './WellnessVisual'
const Library = lazy(() => import('../pages/Library'))
const Studio = lazy(() => import('../pages/Studio'))
const CommandCenter = lazy(() =>
  import('../pages/Dashboard').then((m) => ({ default: m.CommandCenter })),
)
const MoodGames = lazy(() => import('./MoodGames'))


export const TOOLS = [
  {
    id: 'meditation',
    icon: 'meditation',
    label: 'Meditation',
    description: 'A guided moment of quiet',
    tone: 'lilac',
  },
  {
    id: 'reflection',
    icon: 'journal',
    label: 'Private reflection',
    description: 'Save what’s on your mind',
    tone: 'peach',
  },
  {
    id: 'checkin',
    icon: 'sun',
    label: 'Quick check-in',
    description: 'Mood, energy, and a next step',
    tone: 'yellow',
  },
  {
    id: 'music',
    icon: 'music',
    label: 'Music reset',
    description: 'Find a sound for this moment',
    tone: 'pink',
  },
  {
    id: 'places',
    icon: 'pin',
    label: 'A change of scenery',
    description: 'Search parks, cafés, and more',
    tone: 'lime',
  },
  {
    id: 'people',
    icon: 'phone',
    label: 'Someone you trust',
    description: 'Choose to call your saved contact',
    tone: 'peach',
  },
  {
    id: 'studio',
    icon: 'camera',
    label: 'Mood Lens',
    description: 'Your creative camera break',
    tone: 'yellow',
  },
  {
    id: 'wellness',
    icon: 'wellness',
    label: 'All reset moments',
    description: 'Movement, grounding, focus & play',
    tone: 'lilac',
  },
  {
    id: 'games',
    icon: 'spark',
    label: 'Mindful Games',
    description: '4 accessible, stress-free mini resets',
    tone: 'peach',
  },
  {
    id: 'photos',
    icon: 'photo',
    label: 'Family & Memories',
    description: 'Relive happy moments on Google Photos',
    tone: 'peach',
  },
]


function TrustedPerson({ onClose }) {
  const contact = useResource('/safety/contact')
  if (contact.loading) return <Loading />
  if (contact.error)
    return <ErrorState error={contact.error} retry={contact.reload} />
  return (
    <div className="people-tool">
      <WellnessPhoto scene="connect" />
      <h3>A little connection can be a good next step.</h3>
      {contact.data ? (
        <>
          <p>
            You chose {contact.data.name} as a trusted{' '}
            {contact.data.relationship_type.toLowerCase()}.
          </p>
          <a className="btn btn-primary" href={`tel:${contact.data.phone}`}>
            <Icon name="phone" />
            Call {contact.data.name}
          </a>
          <p className="quiet-note">
            Opens your calling app. No one has been contacted.
          </p>
        </>
      ) : (
        <Empty title="Choose someone you feel comfortable reaching out to">
          You can save a trusted contact in Settings. This is optional.
        </Empty>
      )}
      <Button
        variant="secondary"
        onClick={() => {
          onClose()
          navigate('settings')
        }}
      >
        {contact.data ? 'Manage trusted contact' : 'Add a trusted contact'}
      </Button>
    </div>
  )
}

function PlacesTool() {
  const [area, setArea] = useState(''),
    [place, setPlace] = useState('parks')
  const query = `${place} ${area.trim() || 'near me'}`
  return (
    <div className="places-tool">
      <WellnessPhoto
        scene={
          place === 'cafés'
            ? 'cafe'
            : place === 'badminton courts' || place === 'gyms'
              ? 'play'
              : 'connect'
        }
      />
      <h3>Somewhere to take a fresh breath.</h3>
      <p>
        Choose what you’d like to find. Google Maps opens with your search;
        Emotion Care does not receive your location.
      </p>
      <label>
        What are you looking for?
        <select value={place} onChange={(e) => setPlace(e.target.value)}>
          {[
            'parks',
            'cafés',
            'gardens',
            'gyms',
            'badminton courts',
            'walking trails',
          ].map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      <label>
        City or area (optional)
        <input
          value={area}
          onChange={(e) => setArea(e.target.value)}
          maxLength={100}
          placeholder="For example, Pune"
        />
      </label>
      <a
        className="btn btn-primary"
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
        target="_blank"
        rel="noreferrer"
      >
        Search in Google Maps <Icon name="arrow" />
      </a>
      <p className="quiet-note">
        This opens an external search. Live place listings inside Emotion Care are
        not connected yet.
      </p>
    </div>
  )
}

const MUSIC_GENRES = [
  { id: 'bollywood', label: 'Bollywood 🎬', spotify: 'bollywood top hits songs', youtube: 'latest bollywood songs' },
  { id: 'hollywood', label: 'Hollywood 🎧', spotify: 'top hollywood english pop hits', youtube: 'top hollywood songs hits' },
  { id: 'hindi', label: 'Hindi Songs 🎶', spotify: 'hindi top hits songs', youtube: 'hindi top songs trending' },
  { id: 'marathi', label: 'Marathi (मराठी) 🪕', spotify: 'marathi top hits gaani songs', youtube: 'marathi songs trending' },
  { id: 'southindian', label: 'South Indian 🌴', spotify: 'south indian top hits songs', youtube: 'south indian top hit songs' },
  { id: 'panjabi', label: 'Punjabi ✨', spotify: 'punjabi top hits songs', youtube: 'punjabi top songs hits' },
  { id: 'malyali', label: 'Malayali Songs (മലയാളം) 🌿', spotify: 'malayalam top hits songs', youtube: 'malayalam top songs hits' },
  { id: 'rap', label: 'Rap 🎤', spotify: 'top rap hits songs', youtube: 'best rap songs' },
  { id: 'hippop', label: 'Hip-Hop 📻', spotify: 'top hip hop hits', youtube: 'best hip hop songs' },
  { id: 'latest2026', label: 'Latest 2026 Songs 🔥', spotify: 'latest 2026 trending songs hits', youtube: 'latest 2026 songs trending' },
  { id: 'famous', label: 'All-Time Famous Songs ⭐', spotify: 'all time famous greatest hit songs', youtube: 'famous hit songs of all time' },
]

const MUSIC_VIBES = [
  { id: 'all', label: '🔥 All Hits / Trending', suffix: '' },
  { id: 'chill', label: '☕ Chill & Relax', suffix: 'chill lofi acoustic' },
  { id: 'dance', label: '💃 Party & Dance', suffix: 'energetic dance party' },
  { id: 'romantic', label: '💖 Romantic', suffix: 'romantic love songs' },
  { id: 'emotional', label: '🌧️ Slow & Emotional', suffix: 'emotional slow sad songs' },
]

function MusicTool() {
  const [selectedGenre, setSelectedGenre] = useState('bollywood')
  const [selectedVibe, setSelectedVibe] = useState('all')
  const [customSearch, setCustomSearch] = useState('')

  const activeGenre = MUSIC_GENRES.find((g) => g.id === selectedGenre) || MUSIC_GENRES[0]
  const activeVibe = MUSIC_VIBES.find((v) => v.id === selectedVibe) || MUSIC_VIBES[0]

  const calculatedQuery = customSearch.trim()
    ? customSearch.trim()
    : activeVibe.suffix
      ? `${activeGenre.label.split(' ')[0]} ${activeVibe.suffix}`
      : activeGenre.spotify

  const spotifyUrl = `https://open.spotify.com/search/${encodeURIComponent(calculatedQuery)}`
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(calculatedQuery)}`

  return (
    <div className="music-tool">
      <WellnessPhoto scene="music" className="music-tool-photo" />
      <h3>A soundtrack made for you.</h3>
      <p>Choose your favorite genre, language, or vibe, then tune in on Spotify or YouTube.</p>

      <div className="music-section-label">
        <small>SELECT GENRE / LANGUAGE</small>
      </div>
      <div className="filter-chips music-genre-chips">
        {MUSIC_GENRES.map((g) => (
          <button
            key={g.id}
            type="button"
            aria-pressed={selectedGenre === g.id}
            className={selectedGenre === g.id ? 'selected' : ''}
            onClick={() => setSelectedGenre(g.id)}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="music-section-label" style={{ marginTop: '12px' }}>
        <small>OPTIONAL VIBE / MOOD</small>
      </div>
      <div className="filter-chips music-vibe-chips">
        {MUSIC_VIBES.map((v) => (
          <button
            key={v.id}
            type="button"
            aria-pressed={selectedVibe === v.id}
            className={selectedVibe === v.id ? 'selected' : ''}
            onClick={() => setSelectedVibe(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="music-custom-search" style={{ marginTop: '14px' }}>
        <input
          type="text"
          placeholder="Or search any specific artist / song (e.g. Arijit Singh, Karan Aujla, Eminem...)"
          value={customSearch}
          onChange={(e) => setCustomSearch(e.target.value)}
          className="music-search-input"
        />
      </div>

      <div className="music-now-playing-preview">
        <small>READY TO PLAY:</small>{' '}
        <b>
          {customSearch.trim()
            ? `"${customSearch.trim()}"`
            : `${activeGenre.label} ${activeVibe.id !== 'all' ? `· ${activeVibe.label}` : ''}`}
        </b>
      </div>

      <div className="button-row">
        <a
          className="btn btn-primary music-btn-spotify"
          href={spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span style={{ marginRight: '6px' }}>▶</span> Open Spotify <Icon name="arrow" />
        </a>
        <a
          className="btn btn-secondary music-btn-youtube"
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span style={{ marginRight: '6px' }}>▶</span> Open YouTube
        </a>
      </div>
      <p className="quiet-note">
        Opens an external search directly on Spotify or YouTube in a new tab. No account login is required by Emotion Care.
      </p>
    </div>
  )
}

function MemoriesTool() {
  const [albumType, setAlbumType] = useState('family')
  const categories = [
    { id: 'family', label: 'Family & Loved Ones', url: 'https://photos.google.com/search/family' },
    { id: 'highlights', label: 'Highlights & Memories', url: 'https://photos.google.com/foryou' },
    { id: 'travel', label: 'Trips & Vacations', url: 'https://photos.google.com/search/travel' },
    { id: 'all', label: 'All Photos', url: 'https://photos.google.com/' },
  ]
  const currentCategory = categories.find((c) => c.id === albumType) || categories[0]

  return (
    <div className="places-tool memories-tool">
      <WellnessPhoto scene="connect" />
      <h3>Revisit your family & cherished memories.</h3>
      <p>
        Looking at old photos of loved ones, warm celebrations, and comforting moments can bring instant solace and remind you of the love around you.
      </p>
      <div className="filter-chips">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={albumType === c.id}
            className={albumType === c.id ? 'selected' : ''}
            onClick={() => setAlbumType(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="button-row" style={{ marginTop: '1rem' }}>
        <a
          className="btn btn-primary"
          href={currentCategory.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          📸 Open {currentCategory.label} in Google Photos <Icon name="arrow" />
        </a>
      </div>
      <p className="quiet-note">
        Opens your personal Google Photos library directly in a new private tab. Emotion Care does not access, store, or view any of your personal photos.
      </p>
    </div>
  )
}

export default function CompanionTools({
  selected = 'all',
  onSelect,
  onClose,
  onStart,
  onSafety,
  onUpdate,
}) {
  const title =
    selected === 'all'
      ? 'What would feel good right now?'
      : TOOLS.find((t) => t.id === selected)?.label || 'Reset moments'
  const start = (...args) => {
    onClose()
    onStart(...args)
  }
  return (
    <Dialog title={title} wide onClose={onClose}>
      <div className={`companion-tool-content tool-${selected}`}>
        <Suspense fallback={<Loading />}>
          {selected === 'all' ? (
            <>
              <p>
                Make a little space for yourself. Pick a tool, or keep talking.
              </p>
              <div className="tool-picker">
                {TOOLS.map((t) => (
                  <button key={t.id} onClick={() => onSelect(t.id)}>
                    <span className={`tool-icon tone-${t.tone}`}>
                      <Icon name={t.icon} />
                    </span>
                    <span>
                      <b>{t.label}</b>
                      <small>{t.description}</small>
                    </span>
                    <Icon name="arrow" size={16} />
                  </button>
                ))}
              </div>
              <div className="tool-editorial">
                <WellnessPhoto scene="cafe" />
                <div>
                  <p className="eyebrow">MAKE A LITTLE SPACE</p>
                  <h3>
                    A fresh place.
                    <br />
                    <em>A fresh perspective.</em>
                  </h3>
                  <button
                    className="editorial-text-link"
                    onClick={() => onSelect('places')}
                  >
                    Find a change of scenery <Icon name="arrow" size={15} />
                  </button>
                </div>
              </div>
              <div className="tool-editorial" style={{ marginTop: '1rem' }}>
                <WellnessPhoto scene="connect" />
                <div>
                  <p className="eyebrow">CHERISHED MOMENTS</p>
                  <h3>
                    Warm memories.
                    <br />
                    <em>People who care.</em>
                  </h3>
                  <button
                    className="editorial-text-link"
                    onClick={() => onSelect('photos')}
                  >
                    View family & memory photos <Icon name="arrow" size={15} />
                  </button>
                </div>
              </div>
            </>
          ) : selected === 'meditation' || selected === 'wellness' ? (
            <Library
              key={selected}
              meditation={selected === 'meditation'}
              embedded
              onStart={start}
              onSafety={onSafety}
            />
          ) : selected === 'studio' ? (
            <Studio />
          ) : selected === 'checkin' ? (
            <CommandCenter
              onStart={start}
              onSafety={onSafety}
              onUpdate={onUpdate}
            />
          ) : selected === 'music' ? (
            <MusicTool />
          ) : selected === 'places' ? (
            <PlacesTool />
          ) : selected === 'people' ? (
            <TrustedPerson onClose={onClose} />
          ) : selected === 'games' ? (
            <MoodGames onComplete={onClose} />
          ) : selected === 'photos' ? (
            <MemoriesTool />
          ) : null}

        </Suspense>
      </div>
    </Dialog>
  )
}
