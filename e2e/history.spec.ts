import { test, expect } from '@playwright/test'

test.describe('History Page', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication state
    await page.goto('/auth/signin')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByRole('button', { name: 'Sign in with Email' }).click()
  })

  test('should display history page with filters', async ({ page }) => {
    await page.goto('/history')
    await expect(page.getByRole('heading', { name: 'Medication History' })).toBeVisible()
    await expect(page.getByText('Date Range')).toBeVisible()
    await expect(page.getByText('Medications')).toBeVisible()
    await expect(page.getByText('Status')).toBeVisible()
  })

  test('should filter history by date range', async ({ page }) => {
    await page.goto('/history')
    await page.getByRole('button', { name: /Date Range/i }).click()
    await page.getByRole('button', { name: /Last 7 days/i }).click()
    await expect(page.getByText(/Showing results for last 7 days/i)).toBeVisible()
  })

  test('should filter history by medication', async ({ page }) => {
    await page.goto('/history')
    await page.getByRole('combobox', { name: /Medications/i }).click()
    await page.getByRole('option', { name: /All Medications/i }).click()
    await expect(page.getByText(/Showing all medications/i)).toBeVisible()
  })

  test('should filter history by status', async ({ page }) => {
    await page.goto('/history')
    await page.getByRole('combobox', { name: /Status/i }).click()
    await page.getByRole('option', { name: /Taken/i }).click()
    await expect(page.getByText(/Showing taken doses/i)).toBeVisible()
  })

  test('should export history data', async ({ page }) => {
    await page.goto('/history')
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: /Export/i }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/medication-history-.*\.csv/)
  })

  test('should handle empty history state', async ({ page }) => {
    await page.goto('/history')
    await expect(page.getByText(/No medication history found/i)).toBeVisible()
  })

  test('should paginate through history', async ({ page }) => {
    await page.goto('/history')
    await expect(page.getByRole('button', { name: /Next/i })).toBeVisible()
    await page.getByRole('button', { name: /Next/i }).click()
    await expect(page.getByText(/Page 2/i)).toBeVisible()
  })
}) 