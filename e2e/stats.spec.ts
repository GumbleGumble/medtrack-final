import { test, expect } from '@playwright/test'

test.describe('Statistics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication state
    await page.goto('/auth/signin')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByRole('button', { name: 'Sign in with Email' }).click()
  })

  test('should display adherence statistics', async ({ page }) => {
    await page.goto('/stats')
    await expect(page.getByRole('heading', { name: 'Statistics' })).toBeVisible()
    await expect(page.getByText('Adherence Rate')).toBeVisible()
    await expect(page.getByText('Doses Taken')).toBeVisible()
    await expect(page.getByText('Missed Doses')).toBeVisible()
  })

  test('should allow date range filtering', async ({ page }) => {
    await page.goto('/stats')
    await page.getByRole('button', { name: 'Date Range' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: 'Last 7 days' }).click()
    await expect(page.getByText('Last 7 days')).toBeVisible()
  })

  test('should display medication-specific statistics', async ({ page }) => {
    await page.goto('/stats')
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.getByText('Medication Name')).toBeVisible()
    await expect(page.getByText('Adherence')).toBeVisible()
  })

  test('should handle empty statistics state', async ({ page }) => {
    await page.goto('/stats')
    // Assuming no medications/doses recorded
    await expect(page.getByText('No statistics available')).toBeVisible()
  })
}) 