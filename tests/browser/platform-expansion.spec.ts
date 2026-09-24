import { type Page } from '@playwright/test'
import { expect, test } from './security-fixture'

const viewports = [
  { label: 'desktop-1440', width: 1440, height: 1000 },
  { label: 'tablet-768', width: 768, height: 1024 },
  { label: 'mobile-390', width: 390, height: 844 },
] as const

const specialties = [
  { id: 'oncology', name: 'Oncology' },
  { id: 'exercise-recovery', name: 'Exercise & Recovery' },
  { id: 'orthopaedics', name: 'Orthopaedics' },
  { id: 'cardiovascular', name: 'Cardiovascular' },
] as const

async function returnToPageTop(page: Page) {
  const scrollTop = await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto'
    document.body.style.scrollBehavior = 'auto'
    const scrollingElement = document.scrollingElement
    if (scrollingElement) scrollingElement.scrollTop = 0
    window.scrollTo(0, 0)
    return scrollingElement?.scrollTop ?? window.scrollY
  })

  expect(scrollTop).toBe(0)
}

async function waitForHomepageReadiness(page: Page) {
  await page.goto('/')

  await expect(
    page.getByRole('heading', {
      name: 'Turn life between visits into information your care team can act on.',
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', {
      name: 'Two perspectives. One longitudinal clinical picture.',
    }),
  ).toBeVisible()

  // Font completion and a successful real keyboard state transition provide
  // explicit layout and hydration readiness without a sleep or network-idle
  // heuristic. Before hydration, the arrow key cannot select the next tab.
  await page.evaluate(async () => {
    await document.fonts.ready
  })
  await expect
    .poll(() => page.evaluate(() => document.fonts.status))
    .toBe('loaded')

  const oncologyTab = page.getByRole('tab', { name: 'Oncology' })
  const exerciseTab = page.getByRole('tab', { name: 'Exercise & Recovery' })
  await oncologyTab.focus()
  await expect(oncologyTab).toBeFocused()
  await expect
    .poll(
      async () => {
        if ((await exerciseTab.getAttribute('aria-selected')) === 'true') {
          return true
        }
        await oncologyTab.focus()
        await page.keyboard.press('ArrowRight')
        return (await exerciseTab.getAttribute('aria-selected')) === 'true'
      },
      { timeout: 10000 },
    )
    .toBe(true)
  await expect(exerciseTab).toBeFocused()
}

test('homepage early-access CTA preserves comfortable contrast across interaction states', async ({
  page,
}) => {
  await waitForHomepageReadiness(page)
  const cta = page.getByRole('link', { name: 'Request Early Access' })
  await cta.scrollIntoViewIfNeeded()
  const expectedInk = 'rgb(13, 27, 42)'
  const expectedBlue = 'rgb(30, 64, 175)'

  const contrastRatio = async () =>
    cta.evaluate((element) => {
      const parseColor = (value: string) => {
        const match = value.match(/rgba?\(([^)]+)\)/)
        if (!match) throw new Error(`Unsupported color: ${value}`)
        const channels = match[1]
          .split(',')
          .map((channel) => Number(channel.trim()))
        const [red, green, blue] = channels
        return [red, green, blue].map((channel) => {
          const normalized = channel / 255
          return normalized <= 0.03928
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4
        })
      }

      const foreground = parseColor(getComputedStyle(element).color)
      const background = parseColor(getComputedStyle(element).backgroundColor)
      const luminance = ([red, green, blue]: number[]) =>
        0.2126 * red + 0.7152 * green + 0.0722 * blue
      const foregroundLuminance = luminance(foreground)
      const backgroundLuminance = luminance(background)
      return (
        (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
        (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
      )
    })

  const expectStateColors = async ({
    background,
    outline,
  }: {
    background: string
    outline?: string
  }) => {
    await expect(cta).toHaveCSS('background-color', background)
    if (outline !== undefined) {
      await expect(cta).toHaveCSS('outline-color', outline)
    }
  }

  await expectStateColors({ background: expectedInk })
  expect(await contrastRatio()).toBeGreaterThanOrEqual(7)

  await cta.hover()
  await expectStateColors({ background: expectedBlue })
  expect(await contrastRatio()).toBeGreaterThanOrEqual(7)

  await cta.focus()
  await expect(cta).toBeFocused()
  await expectStateColors({
    background: expectedBlue,
    outline: expectedBlue,
  })
  expect(await contrastRatio()).toBeGreaterThanOrEqual(7)
  await expect(cta).toHaveCSS('outline-style', 'solid')

  await cta.hover()
  await page.mouse.down()
  try {
    await expectStateColors({ background: expectedBlue })
    expect(await contrastRatio()).toBeGreaterThanOrEqual(7)
  } finally {
    await page.mouse.up()
  }
})

for (const viewport of viewports) {
  test(`platform specialties remain actionable at ${viewport.label}`, async ({
    page,
  }, testInfo) => {
    await waitForHomepageReadiness(page)
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    })

    for (const specialty of specialties) {
      const tab = page.getByRole('tab', { name: specialty.name })
      await tab.scrollIntoViewIfNeeded()
      await expect(tab).toBeInViewport()
      await expect(tab).toBeEnabled()
      // A trial click waits for Playwright's full pointer actionability checks
      // (stable, visible, enabled, and receiving events); the following click
      // remains a genuine pointer interaction asserted below.
      await tab.click({ trial: true, timeout: 5000 })
      await tab.click({ timeout: 5000 })
      await expect(tab).toHaveAttribute('aria-selected', 'true')
      const panel = page.getByRole('tabpanel')
      await expect(
        panel.getByRole('heading', { name: specialty.name, level: 3 }),
      ).toBeVisible()
      await expect(panel).toContainText(
        'Synthetic example · not a patient record',
      )
      if (specialty.id === 'cardiovascular') {
        await expect(panel).toContainText(
          'Longitudinal symptoms, functional tolerance, medication-related observations, recovery patterns, and meaningful changes between encounters.',
        )
      }

      const cardLayout = await page
        .getByRole('tablist', { name: 'Select a specialty workflow' })
        .getByRole('tab')
        .evaluateAll((tabs) =>
          tabs.map((tab) => {
            const bounds = tab.getBoundingClientRect()
            return {
              x: Math.round(bounds.x),
              y: Math.round(bounds.y),
              width: Math.round(bounds.width),
            }
          }),
        )
      const expectedColumns =
        viewport.width >= 1280 ? 4 : viewport.width >= 640 ? 2 : 1
      const rowTops = cardLayout.map((card) => card.y).sort((a, b) => a - b)
      const rowCount = rowTops.filter(
        (top, index) => index === 0 || top - rowTops[index - 1] > 8,
      ).length
      expect(rowCount).toBe(Math.ceil(specialties.length / expectedColumns))
      for (let row = 0; row < cardLayout.length; row += expectedColumns) {
        const widths = cardLayout
          .slice(row, row + expectedColumns)
          .map((card) => card.width)
        expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1)
      }

      const dimensions = await page.evaluate(() => ({
        viewportWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        sectionHeights: [...document.querySelectorAll('main > section')].map(
          (section) => section.getBoundingClientRect().height,
        ),
        sectionGaps: [...document.querySelectorAll('main > section')].flatMap(
          (section, index, all) =>
            index === 0
              ? []
              : [
                  section.getBoundingClientRect().top -
                    all[index - 1].getBoundingClientRect().bottom,
                ],
        ),
        imageHeights: [...document.querySelectorAll('main img')].map(
          (image) => image.getBoundingClientRect().height,
        ),
      }))
      expect(dimensions.documentWidth).toBeLessThanOrEqual(
        dimensions.viewportWidth,
      )
      expect(Math.max(...dimensions.sectionHeights)).toBeLessThan(2200)
      expect(Math.max(0, ...dimensions.sectionGaps)).toBeLessThanOrEqual(1)
      expect(Math.max(...dimensions.imageHeights)).toBeLessThanOrEqual(560)
      expect(
        await panel.evaluate(
          (element) => element.scrollHeight <= element.clientHeight + 1,
        ),
      ).toBe(true)

      await returnToPageTop(page)
      await page.screenshot({
        path: testInfo.outputPath(`${viewport.label}-${specialty.id}.jpg`),
        type: 'jpeg',
        quality: 75,
        fullPage: true,
        animations: 'disabled',
      })
    }

    await page.emulateMedia({ reducedMotion: 'reduce' })
    const oncologyTab = page.getByRole('tab', { name: 'Oncology' })
    await oncologyTab.focus()
    await expect(oncologyTab).toBeFocused()
    await page.keyboard.press('ArrowRight')
    const exerciseTab = page.getByRole('tab', { name: 'Exercise & Recovery' })
    await expect(exerciseTab).toBeFocused()
    await expect(exerciseTab).toHaveAttribute('aria-selected', 'true')
    expect(
      await page.evaluate(
        () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      ),
    ).toBe(true)
    expect(
      await exerciseTab.evaluate((element) => ({
        outline: getComputedStyle(element).outlineStyle,
        transition: getComputedStyle(element).transitionProperty,
      })),
    ).toEqual({ outline: 'solid', transition: 'none' })
    await returnToPageTop(page)
    await page.screenshot({
      path: testInfo.outputPath(
        `${viewport.label}-reduced-motion-keyboard-focus.jpg`,
      ),
      type: 'jpeg',
      quality: 75,
      fullPage: true,
      animations: 'disabled',
    })
  })
}
