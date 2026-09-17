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

test('platform homepage reflows and shows every specialty with synthetic examples', async ({
  page,
}, testInfo) => {
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

  for (const viewport of viewports) {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    })

    for (const specialty of specialties) {
      const tab = page.getByRole('tab', { name: specialty.name })
      await tab.click()
      await expect(tab).toHaveAttribute('aria-selected', 'true')
      const panel = page.getByRole('tabpanel')
      await expect(
        panel.getByRole('heading', { name: specialty.name, level: 3 }),
      ).toBeVisible()
      await expect(panel).toContainText(
        'Synthetic example · not a patient record',
      )

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
        path: testInfo.outputPath(`${viewport.label}-${specialty.id}.png`),
        fullPage: true,
        animations: 'disabled',
      })
    }
  }

  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const oncologyTab = page.getByRole('tab', { name: 'Oncology' })
  await oncologyTab.focus()
  await expect(oncologyTab).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(
    page.getByRole('tab', { name: 'Exercise & Recovery' }),
  ).toBeFocused()
  await expect(
    page.getByRole('tab', { name: 'Exercise & Recovery' }),
  ).toHaveAttribute('aria-selected', 'true')
  expect(
    await page.evaluate(
      () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    ),
  ).toBe(true)
  expect(
    await page
      .getByRole('tab', { name: 'Exercise & Recovery' })
      .evaluate((element) => ({
        outline: getComputedStyle(element).outlineStyle,
        transition: getComputedStyle(element).transitionProperty,
      })),
  ).toEqual({ outline: 'solid', transition: 'none' })
  await returnToPageTop(page)
  await page.screenshot({
    path: testInfo.outputPath('desktop-reduced-motion-keyboard-focus.png'),
    fullPage: true,
    animations: 'disabled',
  })
})
