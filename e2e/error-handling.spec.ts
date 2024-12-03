import { test, expect } from '@playwright/test'

test.describe('Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication state
    await page.goto('/auth/signin')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByRole('button', { name: 'Sign in with Email' }).click()
  })

  test('should handle network errors in medication list', async ({ page }) => {
    await page.goto('/')
    await page.route('**/api/medications', route => route.abort())
    await expect(page.getByText('Failed to load medications')).toBeVisible()
  })

  test('should handle network errors in statistics', async ({ page }) => {
    await page.goto('/stats')
    await page.route('**/api/medications', route => route.abort())
    await expect(page.getByText('Failed to load medications')).toBeVisible()
  })

  test('should handle network errors in history', async ({ page }) => {
    await page.goto('/history')
    await page.route('**/api/history', route => route.abort())
    await expect(page.getByText('Failed to load medication history')).toBeVisible()
  })

  test('should handle network errors in settings', async ({ page }) => {
    await page.goto('/settings')
    await page.route('**/api/user/preferences', route => route.abort())
    await expect(page.getByText('Failed to load preferences')).toBeVisible()
  })

  test('should handle navigation errors gracefully', async ({ page }) => {
    await page.goto('/')
    // Simulate a JavaScript error in navigation
    await page.addScriptTag({
      content: `
        window.addEventListener('load', () => {
          const nav = document.querySelector('nav');
          if (nav) {
            throw new Error('Simulated navigation error');
          }
        });
      `,
    })
    await expect(page.getByText('Navigation error')).toBeVisible()
  })

  test('should handle dialog errors gracefully', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Add Medication' }).click()
    // Simulate a JavaScript error in dialog
    await page.addScriptTag({
      content: `
        window.addEventListener('load', () => {
          const dialog = document.querySelector('[role="dialog"]');
          if (dialog) {
            throw new Error('Simulated dialog error');
          }
        });
      `,
    })
    await expect(page.getByText('An unexpected error occurred')).toBeVisible()
  })

  test('should handle form submission errors', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Add Medication' }).click()
    await page.getByLabel('Name').fill('Test Medication')
    await page.getByLabel('Dosage').fill('10')
    await page.getByLabel('Unit').fill('mg')
    await page.route('**/api/medications', route => route.abort())
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('Failed to add medication')).toBeVisible()
  })

  test('should handle rate limiting gracefully', async ({ page }) => {
    await page.goto('/')
    // Simulate rate limit response
    await page.route('**/api/**', route => 
      route.fulfill({
        status: 429,
        body: 'Too Many Requests',
        headers: {
          'Retry-After': '60',
        },
      })
    )
    await expect(page.getByText('Too many requests')).toBeVisible()
  })
}) 