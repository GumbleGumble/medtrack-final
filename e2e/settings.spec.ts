import { test, expect } from '@playwright/test'

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    // Set up email-based authentication
    await page.goto('/auth/signin')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByRole('button', { name: 'Sign in with Email' }).click()
    // Note: In a real test environment, we'd need to handle email verification
    // For now, we can mock the auth state or use a test token
  })

  test('theme selector works correctly', async ({ page }) => {
    await page.goto('/settings')
    await page.click('button#theme')
    await page.click('text=Dark')
    
    // Verify theme change is reflected in data-theme attribute
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    
    // Test custom theme
    await page.click('button#theme')
    await page.click('text=Blue Dawn')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'blue-dawn')
  })

  test('theme selector persists selection', async ({ page }) => {
    await page.goto('/settings')
    await page.click('button#theme')
    await page.click('text=Dark')
    
    // Reload page and verify theme persists
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })

  test('timezone selector shows error state', async ({ page }) => {
    // Mock API failure
    await page.route('/api/user/preferences', async (route) => {
      await route.fulfill({ status: 500 })
    })
    
    await page.goto('/settings')
    await expect(page.getByText('Failed to load timezone settings')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
    
    // Test retry functionality
    await page.unroute('/api/user/preferences')
    await page.route('/api/user/preferences', async (route) => {
      await route.fulfill({ 
        status: 200, 
        body: JSON.stringify({ timezone: 'UTC' }) 
      })
    })
    await page.click('button:has-text("Retry")')
    await expect(page.getByText('Failed to load timezone settings')).not.toBeVisible()
  })

  test('notification settings update successfully', async ({ page }) => {
    await page.goto('/settings')
    
    // Toggle email notifications
    await page.getByLabel('Email Notifications').click()
    await expect(page.getByText('Notification settings updated successfully')).toBeVisible()
    
    // Verify the switch state
    await expect(page.getByLabel('Email Notifications')).not.toBeChecked()
    
    // Test reminder time slider
    await page.getByLabel('Default Reminder Time').click({ position: { x: 100, y: 0 } })
    await expect(page.getByText('Notification settings updated successfully')).toBeVisible()
  })

  test('handles API errors gracefully', async ({ page }) => {
    // Mock API failure for preferences update
    await page.route('/api/user/preferences', async (route) => {
      const method = route.request().method()
      if (method === 'PATCH') {
        await route.fulfill({ status: 500 })
      } else {
        await route.fulfill({ 
          status: 200, 
          body: JSON.stringify({
            emailNotifications: true,
            pushNotifications: false,
            reminderTime: 9,
            reminderBuffer: 30,
            soundEnabled: true,
            vibrationEnabled: true
          })
        })
      }
    })
    
    await page.goto('/settings')
    await page.getByLabel('Sound Effects').click()
    await expect(page.getByText('Failed to update notification settings')).toBeVisible()
  })
}) 