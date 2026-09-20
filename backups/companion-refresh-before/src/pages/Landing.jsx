import { Brand, Button, Icon, Landscape } from '../components/ui'
export default function Landing({ onAuth }) {
  return (
    <div className="landing-v2">
      <nav className="landing-nav">
        <a href="#" aria-label="MoodMentor home">
          <Brand />
        </a>
        <div className="landing-links">
          <a href="#how-it-works">How it works</a>
          <a href="#experience">The experience</a>
          <a href="#privacy">Privacy first</a>
        </div>
        <div className="button-row">
          <button className="text-button" onClick={() => onAuth('login')}>
            Sign in
          </button>
          <Button onClick={() => onAuth('signup')}>
            Find your balance <Icon name="arrow" size={16} />
          </Button>
        </div>
      </nav>
      <main>
        <section className="landing-hero">
          <div>
            <span className="hero-label">
              <span className="status-dot" />
              AGENTIC AI · EMPLOYEE WELLNESS
            </span>
            <h1>
              A healthier workday.
              <br />A little more <em>you.</em>
            </h1>
            <p className="hero-description">
              Your AI-powered wellness companion for a healthier workday. Turn
              how you feel into a small, meaningful next step—and discover what
              works for you.
            </p>
            <div className="button-row">
              <Button onClick={() => onAuth('signup')}>
                Make room for yourself <Icon name="arrow" size={18} />
              </Button>
              <a className="btn btn-secondary" href="#how-it-works">
                See how it works
              </a>
            </div>
            <p className="privacy-inline">
              <Icon name="shield" size={16} />
              Your pace. Your choices. Your private space.
            </p>
          </div>
          <div className="hero-art">
            <Landscape />
            <div className="floating-note">
              <span className="small-icon">
                <Icon name="leaf" />
              </span>
              <div>
                <b>A little room to breathe</b>
                <p>A 3-minute pause between meetings</p>
              </div>
              <Icon name="play" />
            </div>
            <div className="art-caption">SMALL MOMENTS. MEANINGFUL CHANGE.</div>
          </div>
        </section>
        <div className="brand-promise">
          <span>Designed for the human side of work</span>
          <span>
            <Icon name="shield" />
            Private by default
          </span>
          <span>
            <Icon name="spark" />
            Personalized with purpose
          </span>
          <span>
            <Icon name="wellness" />
            Always in your control
          </span>
        </div>
        <section id="how-it-works" className="landing-section">
          <p className="eyebrow">MORE THAN A CHECK-IN</p>
          <h2>
            From “how are you?”
            <br />
            to “here’s what might help.”
          </h2>
          <p className="section-description">
            A thoughtful loop that understands the moment, helps you act, and
            learns from your feedback.
          </p>
          <div className="how-grid">
            {[
              [
                '01',
                'Understand your moment',
                'Share a feeling, journal a thought, or talk through your day.',
              ],
              [
                '02',
                'Take one small step',
                'Get a practical activity matched to your energy, time, and preferences.',
              ],
              [
                '03',
                'Find what works for you',
                'Check in afterwards. Your own outcomes shape future suggestions.',
              ],
            ].map(([n, title, text]) => (
              <article key={n}>
                <span className="step-number">{n}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="experience" className="landing-section experience-section">
          <div>
            <p className="eyebrow">A CALMER CORNER OF YOUR DAY</p>
            <h2>
              Less overwhelm.
              <br />
              More room to reset.
            </h2>
            <p className="section-description">
              Mindful pauses, an attentive companion, and useful personal
              insights—all connected in one space.
            </p>
            <Button variant="secondary" onClick={() => onAuth('signup')}>
              Explore your space <Icon name="arrow" size={16} />
            </Button>
          </div>
          <div className="feature-grid">
            {[
              [
                'meditation',
                'Meditation that fits',
                'Two minutes or twenty. Guided pauses with before-and-after reflection.',
              ],
              [
                'spark',
                'An adaptive wellness engine',
                'Transparent decisions informed by your context and recorded outcomes.',
              ],
              [
                'chat',
                'A space to talk',
                'A supportive companion with clear limits and optional AI assistance.',
              ],
              [
                'team',
                'Wellbeing at work',
                'Opt-in team check-ins and appreciation, with privacy-aware aggregates.',
              ],
            ].map(([icon, title, text]) => (
              <article className="feature-tile" key={title}>
                <Icon name={icon} size={26} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="privacy" className="privacy-section">
          <Icon name="shield" size={38} />
          <div>
            <p className="eyebrow">TRUST IS PART OF WELLBEING</p>
            <h2>Your story belongs to you.</h2>
            <p>
              Your journals and activity history stay private to your account.
              Sending text to Gemini is optional. Team insights need enough
              participants to appear. MoodMentor supports wellbeing; it does not
              diagnose or replace professional or emergency care.
            </p>
          </div>
        </section>
        <section className="landing-cta">
          <p className="eyebrow">A SMALL STEP IS STILL A STEP</p>
          <h2>Make today a little lighter.</h2>
          <Button onClick={() => onAuth('signup')}>
            Create your private space <Icon name="arrow" size={17} />
          </Button>
        </section>
      </main>
      <footer className="landing-footer">
        <Brand />
        <p>Employee wellness, thoughtfully connected.</p>
        <a href="#privacy">Privacy & safety</a>
      </footer>
    </div>
  )
}
