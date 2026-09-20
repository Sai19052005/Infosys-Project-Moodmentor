import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const email = `qa-${Date.now()}@example.com`
const password = 'Qa-password-123'
let account
test.describe.configure({ mode: 'serial' })

test('landing and sign-up are responsive and keyboard accessible', async ({
  page,
}) => {
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: /A healthier workday/ }),
  ).toBeVisible()
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.screenshot({
    path: 'test-results/landing-desktop.png',
    fullPage: true,
  })
  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.getByRole('button', { name: /Make room for yourself/ }).click()
  await page.getByLabel('Your name').fill('Wellness QA')
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: /Create account/ }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'calm', exact: true }).click()
  await page.getByRole('button', { name: /Enter my wellness space/ }).click()
  await expect(
    page.getByRole('heading', { name: /Good .*Wellness/ }),
  ).toBeVisible()
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.screenshot({
    path: 'test-results/dashboard-mobile.png',
    fullPage: true,
  })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  const a11y = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()
  expect(
    a11y.violations.map((v) => ({
      id: v.id,
      description: v.description,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([])
  account = await page.evaluate(() =>
    JSON.parse(sessionStorage.getItem('moodmentor-session-v2')),
  )
  expect(errors).toEqual([])
})

test('journal, chat, routes, safety, favorites, and dark mode use live API data', async ({
  page,
}) => {
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  await page.evaluate(
    (a) => sessionStorage.setItem('moodmentor-session-v2', JSON.stringify(a)),
    account,
  )
  await page.reload()
  await expect(
    page.getByRole('heading', { name: /Good .*Wellness/ }),
  ).toBeVisible()
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.screenshot({
    path: 'test-results/dashboard-desktop.png',
    fullPage: true,
  })
  await page.getByRole('link', { name: 'Journal', exact: true }).click()
  await page
    .getByLabel('Journal entry')
    .fill('After several meetings, I felt exhausted and wanted a small break.')
  await page.getByRole('button', { name: /Save & reflect/ }).click()
  await expect(
    page.getByText('Reflection saved', { exact: true }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'AI Companion' }).click()
  await page
    .getByLabel('Your message')
    .fill('I would like to focus on one small task.')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.locator('.chat-message.assistant')).toBeVisible()
  await page.getByLabel('Your message').fill('I want to kill myself')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(
    page.getByRole('dialog', { name: 'You deserve support.' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: /Tele-MANAS/ })).toHaveAttribute(
    'href',
    'tel:14416',
  )
  await page.getByRole('button', { name: 'Close support options' }).click()
  await page.getByRole('link', { name: 'Meditation', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'A softer pace starts here.' }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: /Add The quiet between tasks to favorites/ })
    .click()
  await expect(
    page.getByRole('button', {
      name: /Remove The quiet between tasks from favorites/,
    }),
  ).toBeVisible()
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.screenshot({
    path: 'test-results/meditation-desktop.png',
    fullPage: true,
  })
  for (const label of ['Insights', 'History', 'Team', 'Profile', 'Settings']) {
    await page.getByRole('link', { name: label, exact: true }).click()
    await expect(page.locator('.page-intro h1')).toBeVisible()
    expect(
      await page.getByText('We couldn’t load this just yet.').count(),
    ).toBe(0)
  }
  await page.getByRole('button', { name: 'Switch to dark mode' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.screenshot({
    path: 'test-results/settings-dark.png',
    fullPage: true,
  })
  const a11y = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()
  expect(
    a11y.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([])
  expect(errors).toEqual([])
})

test('real two-minute session persists pause/resume and measures its outcome', async ({
  page,
}) => {
  await page.goto('/')
  await page.evaluate(
    (a) => sessionStorage.setItem('moodmentor-session-v2', JSON.stringify(a)),
    account,
  )
  await page.reload()
  await page.getByRole('link', { name: 'Meditation', exact: true }).click()
  const card = page.locator('.library-card').filter({
    has: page.getByRole('heading', { name: 'Come back to this moment' }),
  })
  await card.getByRole('button', { name: 'Start', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: 'Low', exact: true }).click()
  await dialog.getByRole('button', { name: 'Begin this moment' }).click()
  await expect(
    dialog.getByRole('button', { name: 'Pause', exact: true }),
  ).toBeVisible()
  await page.waitForTimeout(3000)
  await dialog.getByRole('button', { name: 'Pause', exact: true }).click()
  await dialog.getByRole('button', { name: 'Save & close' }).click()
  await page.reload()
  await page.getByRole('button', { name: 'Resume', exact: true }).click()
  await dialog.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.screenshot({ path: 'test-results/session-player.png' })
  await expect(
    dialog.getByRole('heading', { name: 'You made a little room.' }),
  ).toBeVisible({ timeout: 135000 })
  await dialog.getByRole('button', { name: 'Good', exact: true }).click()
  await dialog.getByRole('button', { name: 'Yes, it helped' }).click()
  await dialog.getByRole('button', { name: 'Save my check-in' }).click()
  await expect(
    dialog.getByRole('heading', { name: 'One moment, remembered.' }),
  ).toBeVisible()
  await expect(dialog.getByText(/Mood change: \+2/)).toBeVisible()
  await dialog.getByRole('button', { name: /Back to my day/ }).click()
  await page.getByRole('link', { name: 'Insights', exact: true }).click()
  await expect(page.getByText('+2 mood', { exact: true })).toBeVisible()
})

test('failed login stays on form and API failure has retry', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password', { exact: true }).fill('wrong-password')
  await page.getByRole('button', { name: 'Sign in to your space' }).click()
  await expect(page.getByRole('alert')).toContainText(
    'Invalid email or password',
  )
  await expect(page.getByLabel('Email address')).toHaveValue(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign in to your space' }).click()
  await expect(page.locator('.page-intro h1')).toBeVisible()
  await page.route('**/wellness/summary', (route) => route.abort())
  await page.getByRole('link', { name: 'Insights', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()
  await page.unroute('**/wellness/summary')
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(
    page.getByRole('heading', { name: 'Learn what makes a difference.' }),
  ).toBeVisible()
})

test('all workspace pages fit mobile and retained studio styles stay contained', async ({
  page,
}) => {
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  await page.evaluate(
    (a) => sessionStorage.setItem('moodmentor-session-v2', JSON.stringify(a)),
    account,
  )
  await page.reload()
  await page.setViewportSize({ width: 375, height: 812 })
  for (const name of [
    'Journal',
    'AI Companion',
    'Meditation',
    'Wellness',
    'Insights',
    'History',
    'Team',
    'Profile',
    'Settings',
    'Dashboard',
  ]) {
    await page.getByRole('button', { name: 'Open navigation' }).click()
    await page
      .getByRole('link', { name, exact: name !== 'AI Companion' })
      .click()
    await expect(page.locator('.page-intro h1')).toBeVisible()
    await expect(page.locator('.skeleton-grid')).toHaveCount(0)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      name,
    ).toBe(true)
  }
  const before = await page.locator('.mm-sidebar').evaluate((el) => ({
    background: getComputedStyle(el).backgroundColor,
    position: getComputedStyle(el).position,
  }))
  await page.evaluate(() => {
    location.hash = 'studio'
  })
  await expect(
    page.getByRole('heading', { name: 'Mood Studio', exact: true }),
  ).toBeVisible()
  await page.evaluate(() => {
    location.hash = 'dashboard'
  })
  await expect(page.locator('.page-intro h1')).toBeVisible()
  expect(
    await page.locator('.mm-sidebar').evaluate((el) => ({
      background: getComputedStyle(el).backgroundColor,
      position: getComputedStyle(el).position,
    })),
  ).toEqual(before)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  expect(errors).toEqual([])
})
