import { test, expect } from '@playwright/test'

test.describe('UI Components', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication state
    await page.goto('/auth/signin')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByRole('button', { name: 'Sign in with Email' }).click()
  })

  test.describe('Accordion', () => {
    test('should expand and collapse', async ({ page }) => {
      await page.goto('/settings')
      const trigger = page.getByRole('button', { name: 'Advanced Settings' })
      await trigger.click()
      await expect(page.getByRole('region')).toBeVisible()
      await trigger.click()
      await expect(page.getByRole('region')).not.toBeVisible()
    })

    test('should handle keyboard navigation', async ({ page }) => {
      await page.goto('/settings')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Enter')
      await expect(page.getByRole('region')).toBeVisible()
      await page.keyboard.press('Space')
      await expect(page.getByRole('region')).not.toBeVisible()
    })
  })

  test.describe('Dialog and Sheet', () => {
    test('should open and close with animation', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('button', { name: 'Add Medication' }).click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await expect(page.getByRole('dialog')).toHaveAttribute('data-state', 'open')
      await page.keyboard.press('Escape')
      await expect(page.getByRole('dialog')).toHaveAttribute('data-state', 'closed')
    })

    test('should trap focus within dialog', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('button', { name: 'Add Medication' }).click()
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('role'))
      expect(focusedElement).toBe('button')
    })
  })

  test.describe('Popover and Tooltip', () => {
    test('should show on hover and hide on mouse leave', async ({ page }) => {
      await page.goto('/settings')
      await page.hover('[aria-label="Help"]')
      await expect(page.getByRole('tooltip')).toBeVisible()
      await page.mouse.move(0, 0)
      await expect(page.getByRole('tooltip')).not.toBeVisible()
    })

    test('should show popover on click', async ({ page }) => {
      await page.goto('/settings')
      await page.getByRole('button', { name: 'User settings' }).click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await page.click('body')
      await expect(page.getByRole('dialog')).not.toBeVisible()
    })
  })

  test.describe('Badge and Avatar', () => {
    test('should render with correct variants', async ({ page }) => {
      await page.goto('/settings')
      await expect(page.locator('.badge-default')).toBeVisible()
      await expect(page.locator('.badge-secondary')).toBeVisible()
      await expect(page.locator('.badge-destructive')).toBeVisible()
    })

    test('should render avatar with fallback', async ({ page }) => {
      await page.goto('/settings')
      const avatar = page.locator('[role="img"]').first()
      await expect(avatar).toBeVisible()
      await expect(avatar.locator('.avatar-fallback')).toBeVisible()
    })
  })

  test.describe('Progress and Slider', () => {
    test('should update progress value', async ({ page }) => {
      await page.goto('/stats')
      const progress = page.locator('progress')
      await expect(progress).toHaveAttribute('value', '0')
      // Simulate progress update
      await page.evaluate(() => {
        const progress = document.querySelector('progress')
        if (progress) progress.value = 50
      })
      await expect(progress).toHaveAttribute('value', '50')
    })

    test('should handle slider interaction', async ({ page }) => {
      await page.goto('/settings')
      const slider = page.locator('[role="slider"]')
      await slider.click()
      const value = await slider.getAttribute('aria-valuenow')
      expect(Number(value)).toBeGreaterThan(0)
    })
  })

  test.describe('Calendar', () => {
    test('should allow date selection', async ({ page }) => {
      await page.goto('/history')
      await page.getByRole('button', { name: /Date Range/i }).click()
      await page.getByRole('button', { name: new RegExp(new Date().getDate().toString()) }).click()
      await expect(page.getByRole('button', { name: /Date Range/i })).toContainText(new Date().getDate().toString())
    })

    test('should navigate between months', async ({ page }) => {
      await page.goto('/history')
      await page.getByRole('button', { name: /Date Range/i }).click()
      const currentMonth = new Date().toLocaleString('default', { month: 'long' })
      await page.getByRole('button', { name: 'Next month' }).click()
      await expect(page.getByText(currentMonth)).not.toBeVisible()
    })
  })

  test.describe('Loading States', () => {
    test('should show skeleton loading state', async ({ page }) => {
      await page.goto('/history')
      // Mock slow API response
      await page.route('**/api/history', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        await route.fulfill({ status: 200, body: JSON.stringify({ doses: [], total: 0, page: 1, totalPages: 1 }) })
      })
      await expect(page.locator('.animate-pulse')).toBeVisible()
    })

    test('should show spinner during action', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('button', { name: 'Record Dose' }).click()
      await expect(page.locator('.animate-spin')).toBeVisible()
    })
  })

  test.describe('Theme Compatibility', () => {
    test('should respect system theme', async ({ page }) => {
      await page.goto('/settings')
      await page.evaluate(() => {
        window.matchMedia = (query: string): MediaQueryList => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true
        })
      })
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    })

    test('should switch themes', async ({ page }) => {
      await page.goto('/settings')
      await page.getByLabel('Theme').click()
      await page.getByRole('option', { name: 'Light' }).click()
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
      await page.getByLabel('Theme').click()
      await page.getByRole('option', { name: 'Dark' }).click()
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    })
  })
}) 