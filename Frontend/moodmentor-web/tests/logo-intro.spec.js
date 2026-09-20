import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const sessionKey = 'emotion-care:intro:session:v1'
const visitedKey = 'emotion-care:intro:visited:v1'
const splash = '.ec-logo-intro'

async function openIntro(page) {
  const start = new Date('2026-09-20T00:00:00Z')
  await page.clock.install({ time: start })
  await page.clock.pauseAt(start)
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator(`${splash}.is-ready`)).toBeAttached()
}

async function setFrame(page, ms) {
  await page.locator('.ec-intro-art').evaluate((el, time) => {
    for (const animation of el.getAnimations({ subtree: true })) {
      animation.pause()
      animation.currentTime = time
    }
  }, ms)
}

test('first visit mounts the app immediately and ends without remounting it', async ({
  page,
}) => {
  await openIntro(page)
  await expect(page.locator('.ec-application')).toHaveAttribute('inert', '')
  await expect(page.locator('.ec-application main')).toBeAttached()
  await page.locator('.ec-application main').evaluate((el) => {
    el.dataset.introMountCheck = 'preserved'
  })
  await page.clock.runFor(6100)
  await expect(page.locator(splash)).toHaveCount(0)
  await expect(page.locator('.ec-application')).not.toHaveAttribute('inert')
  await expect(page.locator('.ec-application main')).toHaveAttribute(
    'data-intro-mount-check',
    'preserved',
  )
  expect(
    await page.evaluate((key) => sessionStorage.getItem(key), sessionKey),
  ).toBe('1')
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.locator('.ec-application main')).toBeAttached()
  await expect(page.locator(splash)).toHaveCount(0)
  await page.evaluate(() => {
    location.hash = 'library'
  })
  await expect(page.locator(splash)).toHaveCount(0)
})

test('returning visit uses the short version', async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, '1'), visitedKey)
  await openIntro(page)
  await expect(page.locator(splash)).toHaveClass(/--returning/)
  await page.clock.runFor(6100)
  await expect(page.locator(splash)).toHaveCount(0)
})

test('reduced motion enters immediately and skips the image request', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const requests = []
  page.on('request', (r) => {
    if (r.url().includes('emotion-care-logo.png')) requests.push(r.url())
  })
  await page.goto('/')
  await expect(page.locator('.ec-application main')).toBeAttached()
  await expect(page.locator(splash)).toHaveCount(0)
  await expect(page.locator('.ec-application')).not.toHaveAttribute('inert')
  expect(requests).toHaveLength(0)
})

test('changing reduced-motion preference dismisses an active intro', async ({
  page,
}) => {
  await openIntro(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator(splash)).toHaveCount(0)
  await expect(page.locator('.ec-application')).not.toHaveAttribute('inert')
})

test('keyboard skip restores focus to the mounted page', async ({ page }) => {
  await openIntro(page)
  await page.getByRole('button', { name: 'Skip intro' }).focus()
  await page.keyboard.press('Enter')
  await page.clock.runFor(32)
  await expect(page.locator(splash)).toHaveCount(0)
  expect(await page.evaluate(() => document.activeElement.tagName)).toBe('MAIN')
})

test('Escape and navigation dismiss the intro', async ({ page }) => {
  await openIntro(page)
  await page.keyboard.press('Escape')
  await expect(page.locator(splash)).toHaveCount(0)
  await page.evaluate((key) => sessionStorage.removeItem(key), sessionKey)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.locator(splash)).toBeAttached()
  await page.evaluate(() => {
    location.hash = 'companion'
  })
  await expect(page.locator(splash)).toHaveCount(0)
})

test('failed logo shows text fallback and releases the app quickly', async ({
  page,
}) => {
  await page.route('**/brand/emotion-care-logo.png', (route) => route.abort())
  await openIntro(page)
  await expect(page.locator('.ec-intro-fallback')).toContainText('Emotion Care')
  await page.clock.runFor(540)
  await expect(page.locator(splash)).toHaveCount(0)
})

test('a stalled image cannot block entry beyond 2.4 seconds', async ({
  page,
}) => {
  await page.route('**/brand/emotion-care-logo.png', () => {})
  await page.clock.install()
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator(splash)).toBeAttached()
  await page.clock.runFor(2450)
  await expect(page.locator(splash)).toHaveCount(0)
  await expect(page.locator('.ec-application')).not.toHaveAttribute('inert')
})

test('intro tolerates denied storage without blocking startup', async ({
  page,
}) => {
  // Deny only the intro keys: unrelated application storage remains functional.
  await page.addInitScript(() => {
    const get = Storage.prototype.getItem,
      set = Storage.prototype.setItem
    Storage.prototype.getItem = function (key) {
      if (key.startsWith('emotion-care:intro:'))
        throw new DOMException('Blocked', 'SecurityError')
      return get.call(this, key)
    }
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith('emotion-care:intro:'))
        throw new DOMException('Blocked', 'SecurityError')
      return set.call(this, key, value)
    }
  })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await openIntro(page)
  await page.clock.runFor(6100)
  await expect(page.locator(splash)).toHaveCount(0)
  expect(errors).toEqual([])
})

test('application dialogs take precedence', async ({ page }) => {
  await openIntro(page)
  await page.evaluate(() => {
    const dialog = document.createElement('dialog')
    dialog.textContent = 'Authentication requires attention'
    document.querySelector('.ec-application').append(dialog)
    dialog.showModal()
  })
  await expect(page.locator(splash)).toHaveCount(0)
  await expect(page.locator('dialog[open]')).toBeVisible()
  await expect(page.locator('.ec-application')).not.toHaveAttribute('inert')
})

test('Google authentication callback bypasses the intro', async ({ page }) => {
  await page.goto('/auth/google/callback', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.ec-application')).toBeAttached()
  await expect(page.locator(splash)).toHaveCount(0)
  await expect(page.locator('.ec-application')).not.toHaveAttribute('inert')
})

for (const [device, viewport] of Object.entries({
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 },
})) {
  test(`${device} layout and artwork`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport)
    await openIntro(page)
    const art = await page.locator('.ec-intro-art').boundingBox()
    expect(art.x).toBeGreaterThanOrEqual(0)
    expect(art.x + art.width).toBeLessThanOrEqual(viewport.width)
    expect(art.y + art.height).toBeLessThanOrEqual(viewport.height)
    expect(Math.abs(art.x + art.width / 2 - viewport.width / 2)).toBeLessThan(1)
    expect(Math.abs(art.y + art.height / 2 - viewport.height / 2)).toBeLessThan(
      1,
    )
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    for (const [frame, time] of [
      ['embrace', 220],
      ['heart', 650],
      ['complete', 1530],
    ]) {
      await setFrame(page, time)
      await page.screenshot({
        path: testInfo.outputPath(`${device}-${frame}.png`),
      })
    }
    if (device === 'desktop') {
      await page.clock.resume()
      const results = await new AxeBuilder({ page }).include(splash).analyze()
      expect(results.violations).toEqual([])
    }
  })
}
