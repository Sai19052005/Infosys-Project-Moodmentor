import { Icon } from './ui'

export const WELLNESS_IMAGES = {
  pause: '/images/sunlit-pause.png',
  connect: '/images/walk-together.png',
  calm: '/images/quiet-lake.png',
  meditation: '/images/meditation-dock.jpg',
  zen: '/images/meditation-zen.jpg',
  master: '/images/meditation-master.png',
  choa_kok_sui: '/images/meditation-master.png',
  ravi_shankar: '/images/meditation-ravi-shankar.png',
  music: '/images/music-moment.png',
  cafe: '/images/cafe-courtyard.png',
  play: '/images/park-badminton.png',
}

export function WellnessPhoto({
  scene = 'pause',
  src = null,
  alt = '',
  className = '',
  eager = false,
}) {
  return (
    <img
      className={`wellness-photo ${className}`}
      src={src || WELLNESS_IMAGES[scene] || WELLNESS_IMAGES.pause}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      width="1536"
      height="1024"
    />
  )
}

export function ActivityArtwork({ type = 'meditation', artworkUrl = null, className = '' }) {
  if (artworkUrl) {
    return (
      <img
        className={`wellness-photo activity-artwork ${className}`}
        src={artworkUrl}
        alt=""
        loading="lazy"
        decoding="async"
      />
    )
  }

  const scene =
    type === 'master' || type === 'choa_kok_sui'
      ? 'master'
      : type === 'music'
      ? 'music'
      : type === 'movement'
        ? 'play'
        : type === 'break'
          ? 'cafe'
          : ['walk', 'social'].includes(type)
            ? 'connect'
            : type === 'meditation'
              ? 'meditation'
              : type === 'breathing'
                ? 'zen'
                : 'pause'

  if (!['game', 'focus', 'journaling'].includes(type))
    return (
      <WellnessPhoto
        scene={scene}
        className={`activity-artwork ${className}`}
      />
    )
  return (
    <div
      className={`activity-artwork artwork-${type} ${className}`}
      aria-hidden="true"
    >
      <span className="artwork-ring one" />
      <span className="artwork-ring two" />
      <span className="artwork-ring three" />
      <Icon
        name={
          type === 'music'
            ? 'music'
            : type === 'game'
              ? 'game'
              : type === 'focus'
                ? 'spark'
                : 'journal'
        }
        size={52}
      />
    </div>
  )
}
