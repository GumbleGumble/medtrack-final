import { test, expect } from '@playwright/test'

test.describe('Data Display Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication state
    await page.goto('/auth/signin')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByRole('button', { name: 'Sign in with Email' }).click()
  })

  test('should handle empty medication list', async ({ page }) => {
    await page.goto('/')
    await page.route('**/api/medications', route => 
      route.fulfill({ status: 200, body: JSON.stringify([]) })
    )
    await expect(page.getByText('No medications added yet')).toBeVisible()
  })

  test('should handle empty history list', async ({ page }) => {
    await page.goto('/history')
    await page.route('**/api/history', route => 
      route.fulfill({ 
        status: 200, 
        body: JSON.stringify({ doses: [], total: 0, page: 1, totalPages: 1 }) 
      })
    )
    await expect(page.getByText('No medication history found')).toBeVisible()
  })

  test('should handle empty statistics', async ({ page }) => {
    await page.goto('/stats')
    await page.route('**/api/medications', route => 
      route.fulfill({ status: 200, body: JSON.stringify([]) })
    )
    await expect(page.getByText('No statistics available')).toBeVisible()
  })

  test('should handle data loading states', async ({ page }) => {
    await page.goto('/')
    // Add delay to see loading state
    await page.route('**/api/medications', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.fulfill({ status: 200, body: JSON.stringify([]) })
    })
    await expect(page.getByRole('progressbar')).toBeVisible()
  })

  test('should handle data refresh', async ({ page }) => {
    await page.goto('/stats')
    await page.route('**/api/medications', route => 
      route.fulfill({ status: 500 })
    )
    await expect(page.getByText('Failed to load medications')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
    
    // Setup success response for retry
    await page.unroute('**/api/medications')
    await page.route('**/api/medications', route => 
      route.fulfill({ status: 200, body: JSON.stringify([]) })
    )
    await page.getByRole('button', { name: 'Retry' }).click()
    await expect(page.getByText('No statistics available')).toBeVisible()
  })

  test('should handle partial data errors', async ({ page }) => {
    await page.goto('/history')
    // Medications load successfully but history fails
    await page.route('**/api/medications', route => 
      route.fulfill({ status: 200, body: JSON.stringify([]) })
    )
    await page.route('**/api/history', route => 
      route.fulfill({ status: 500 })
    )
    await expect(page.getByText('Failed to load medication history')).toBeVisible()
    await expect(page.getByRole('combobox', { name: 'Medications' })).toBeVisible()
  })

  test('should handle data pagination errors', async ({ page }) => {
    await page.goto('/history')
    // First page loads successfully
    await page.route('**/api/history?page=1', route => 
      route.fulfill({ 
        status: 200, 
        body: JSON.stringify({
          doses: [{ id: '1', timestamp: new Date().toISOString() }],
          total: 20,
          page: 1,
          totalPages: 2
        })
      })
    )
    // Second page fails
    await page.route('**/api/history?page=2', route => 
      route.fulfill({ status: 500 })
    )
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.getByText('Failed to load page')).toBeVisible()
  })

  test('should handle data filtering errors', async ({ page }) => {
    await page.goto('/history')
    // Initial load succeeds
    await page.route('**/api/history', route => 
      route.fulfill({ 
        status: 200, 
        body: JSON.stringify({
          doses: [],
          total: 0,
          page: 1,
          totalPages: 1
        })
      })
    )
    // Filter request fails
    await page.route('**/api/history?status=taken', route => 
      route.fulfill({ status: 500 })
    )
    await page.getByRole('combobox', { name: 'Status' }).click()
    await page.getByRole('option', { name: 'Taken' }).click()
    await expect(page.getByText('Failed to apply filters')).toBeVisible()
  })
}) 