# Emotion Care startup animation

## Design

A warm ivory screen presents the supplied teal/green embrace, followed by the coral heart and green leaves. The composition gently grows from 94% to its final size. A single low-opacity highlight breathes over the heart; the original wordmark lifts into view, followed by the tagline. After a short hold, the screen fades into the already-mounted application. A quiet **Skip intro** control is always available.

The source artwork is a flattened 1254 × 1254 PNG. SVG clipping regions reveal its existing pixels; the symbol and typography have not been redrawn or substituted. The raster's paper background fades in with the wordmark and blends at its outer edges into the screen. The final composition retains the supplied proportions, colors, tagline, and decorative leaves. This is a responsive web implementation, usable in the existing web app or a webview; it does not implement an operating system's native launch screen.

## Files

Paths below are relative to the repository containing `Backend` and `Frontend` (the inner `Infosys-Project-Moodmentor-main` folder).

| File                                                         | Purpose                                                                     |
| ------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `Frontend/moodmentor-web/src/components/LogoIntro.jsx`       | Complete reusable component, image fallback, lifecycle and storage handling |
| `Frontend/moodmentor-web/src/components/LogoIntro.css`       | Scoped animation, responsive layout and reduced-motion styles               |
| `Frontend/moodmentor-web/src/main.jsx`                       | Existing root now wraps `App` in `LogoIntro`                                |
| `Frontend/moodmentor-web/public/brand/emotion-care-logo.png` | Unmodified supplied logo, already connected                                 |
| `Frontend/moodmentor-web/tests/logo-intro.spec.js`           | Focused browser tests and visual-stage screenshots                          |

No animation dependency was added. Existing application routes, authentication code, API clients, dashboard components, and other brand placements were not changed for this feature.

## Integration, already applied

Keep the component outside the route tree, at the stable root in `src/main.jsx`:

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import LogoIntro from "./components/LogoIntro";
// Keep the existing app stylesheet imports.

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LogoIntro>
      <App />
    </LogoIntro>
  </StrictMode>,
);
```

`App` mounts immediately and retains its identity when the overlay disappears. Its authentication, API requests and lazy loading continue underneath. The intro never waits for an API response and never changes the route. Native application dialogs, hash navigation, tab hiding and the Google authentication callback take precedence over the intro.

The overlay temporarily makes the mounted app inert and hides it from assistive technology, preventing interaction with obscured controls. A keyboard user who selects Skip intro is moved to the app's main landmark afterward.

## Asset connection

The image was copied unchanged from:

```text
C:\Users\Rushikesh Tonpe\Dropbox\PC\Downloads\ChatGPT Image Sep 20, 2026, 01_38_26 AM.png
```

The component resolves the public asset using Vite's configured base URL:

```js
`${import.meta.env.BASE_URL}brand/emotion-care-logo.png`;
```

Source and copied asset SHA-256:

```text
1DAB3486D03A15891C40F3F8FEF51EF41784EA58557E88E38393E40F7A4FFC36
```

The clip coordinates belong to this exact artwork. An alternate `src` must use the same layout and proportions; a differently arranged logo requires updating `REGIONS`. An official layered/vector logo could replace the raster later while preserving these motion timings.

## Recommended timing

Times below begin when the logo loads. Reveals overlap gently.

| Stage                             | First visit    |
| --------------------------------- | -------------- |
| Overall fade and 94% → 100% scale | 0–1,144 ms     |
| Embrace reveal                    | 0–475 ms       |
| Heart reveal                      | 229–704 ms     |
| Leaf reveal                       | 475–933 ms     |
| Wordmark reveal                   | 757–1,144 ms   |
| Tagline/background completion     | 933–1,267 ms   |
| Hold complete composition         | 1,267–1,580 ms |
| Fade into mounted app             | 1,580–1,760 ms |

- **First visit:** 1,760 ms after image readiness.
- **Returning session:** 520 ms with the complete logo and a short fade, without individual formation.
- **Same tab/session reload or navigation:** no additional intro after completion or skipping.
- **Reduced motion:** immediate entry; no logo image request from this component.
- **Failed image:** accessible text wordmark fallback, dismissed within 520 ms of failure.
- **Slow/stalled image:** hard stop 2,400 ms after the intro mounts, independent of asset loading or animation events. The app is available even if the image never resolves.

The first-visit flag lives in local storage; the current-session flag lives in session storage. Both use versioned `emotion-care:intro:*` keys. Storage failures are caught, and an in-memory guard still prevents replay within the same loaded document. If storage is unavailable, a new document load can show the full intro again. Duplicated tabs can inherit session storage according to browser behavior.

## Customization

```jsx
<LogoIntro
  enabled={true}
  firstDuration={1760}
  returningDuration={520}
  onComplete={() => {
    /* Optional analytics; do not start app loading here. */
  }}
>
  <App />
</LogoIntro>
```

`enabled` is a startup setting, evaluated when the component mounts. Durations are clamped to 300–2,000 ms. The independent 2,400 ms deadline remains active. `onComplete` runs once when a displayed intro finishes or is dismissed; it does not run when startup rules bypass the intro. Adjust the scoped `.ec-*` rules to tune size, easing, background or motion. Avoid mounting the component inside individual pages or giving it a route-dependent React key.

## Preview and tests

In PowerShell, from the frontend folder:

```powershell
npm.cmd run dev -- --host 127.0.0.1 --port 5175 --strictPort
```

Open `http://127.0.0.1:5175/`. To replay the full intro on that origin, execute this in the browser developer console, then reload:

```js
sessionStorage.removeItem("emotion-care:intro:session:v1");
localStorage.removeItem("emotion-care:intro:visited:v1");
location.reload();
```

To test only the shorter returning version, remove the session key while retaining the local key, then reload.

Run focused checks in another terminal:

```powershell
$env:TEST_BASE_URL = 'http://127.0.0.1:5175'
npm.cmd run test:e2e -- tests/logo-intro.spec.js
npm.cmd run build
```

The suite uses the project's installed Playwright and Microsoft Edge. It verifies immediate app mounting without remounting, first/returning/session behavior, initial and dynamically changed reduced motion, keyboard focus, Escape, navigation, failed/stalled images, denied intro storage, native dialog precedence, Google callback bypass, centered responsive layouts and an axe scan of the intro. Deterministic stage screenshots are saved under `test-results/logo-intro-*-layout-and-artwork/`.

Manual checks:

1. Inspect the staged reveal and final hold at 1440 × 900, 768 × 1024 and 375 × 812. Also rotate a phone to landscape and check that the logo and Skip control fit.
2. Reload the same tab, navigate between pages, and confirm the intro does not replay. Try a fresh private window for a first visit.
3. Use Tab/Enter and Escape. Confirm the Skip control is visible and focus moves into the page after keyboard dismissal.
4. Enable the operating system's reduced-motion setting or browser emulation before loading. Entry should be immediate. Enabling it during the intro should also dismiss it.
5. Block the logo URL or throttle the network. The fallback/deadline must release the application. Confirm normal login and your existing authenticated dashboard flow on the configured backend.
6. Check on actual iOS Safari and Android Chrome before release. Automated viewport checks run in Edge and do not replace physical-device/browser testing.

## Accessibility and performance

- Screen readers receive one polite brand announcement; decorative SVG artwork is hidden from them.
- Skip has a minimum 44 px touch target, visible keyboard focus, and an Escape shortcut.
- Reduced motion bypasses the intro entirely, with a CSS fallback for a preference change.
- Animation uses opacity and small transforms, with one non-looping heart highlight. No video, particles, animated blur, or new animation library.
- The supplied PNG is 1,217,600 bytes (~1.16 MiB). It is deliberately preserved rather than regenerated. The SVG references one shared image URL. The display is capped at 460 CSS pixels; a true vector source would improve very high-density displays and reduce asset weight.
- The splash is bounded independently from image/network behavior and timers/listeners are cleaned up on dismissal, including React StrictMode's development effect cycle.
- These tests validate the intro integration and unchanged app mounting. They do not constitute a new end-to-end verification of all existing backend/authentication features.
