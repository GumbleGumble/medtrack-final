import { test, expect } from '@playwright/test'

test.describe('Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Set up email-based authentication
    await page.goto('/auth/signin')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByRole('button', { name: 'Sign in with Email' }).click()
  })

  test('displays field-level validation errors', async ({ page }) => {
    await page.goto('/settings')
    await page.getByRole('button', { name: 'Grant Access' }).click()
    
    // Submit empty form
    await page.getByRole('button', { name: 'Grant' }).click()
    
    // Check for field-level errors
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Select at least one medication group')).toBeVisible()
  })

  test('displays error summary for multiple errors', async ({ page }) => {
    await page.goto('/settings')
    await page.getByRole('button', { name: 'Grant Access' }).click()
    
    // Fill invalid data
    await page.getByLabel('Email').fill('invalid-email')
    await page.getByRole('button', { name: 'Grant' }).click()
    
    // Check for error summary
    await expect(page.getByText('There were errors with your submission')).toBeVisible()
    await expect(page.getByText('email: Invalid email address')).toBeVisible()
    await expect(page.getByText('groups: Select at least one medication group')).toBeVisible()
  })

  test('clears errors on valid submission', async ({ page }) => {
    await page.goto('/settings')
    await page.getByRole('button', { name: 'Grant Access' }).click()
    
    // Submit empty form to trigger errors
    await page.getByRole('button', { name: 'Grant' }).click()
    await expect(page.getByText('Email is required')).toBeVisible()
    
    // Fill valid data
    await page.getByLabel('Email').fill('user@example.com')
    await page.getByLabel('Medication Groups').click()
    await page.getByRole('option', { name: 'Daily Medications' }).click()
    await page.getByRole('button', { name: 'Grant' }).click()
    
    // Check that errors are cleared
    await expect(page.getByText('Email is required')).not.toBeVisible()
    await expect(page.getByText('Access granted successfully')).toBeVisible()
  })

  test('handles server-side validation errors', async ({ page }) => {
    // Mock API to return validation error
    await page.route('/api/access', async (route) => {
      const method = route.request().method()
      if (method === 'POST') {
        await route.fulfill({
          status: 422,
          body: JSON.stringify({
            errors: {
              email: ['User already has access to this group']
            }
          })
        })
      }
    })
    
    await page.goto('/settings')
    await page.getByRole('button', { name: 'Grant Access' }).click()
    
    // Fill valid data
    await page.getByLabel('Email').fill('user@example.com')
    await page.getByLabel('Medication Groups').click()
    await page.getByRole('option', { name: 'Daily Medications' }).click()
    await page.getByRole('button', { name: 'Grant' }).click()
    
    // Check for server-side error
    await expect(page.getByText('User already has access to this group')).toBeVisible()
  })

  test('maintains form state during validation', async ({ page }) => {
    await page.goto('/settings')
    await page.getByRole('button', { name: 'Grant Access' }).click()
    
    // Fill partial data
    await page.getByLabel('Email').fill('user@example.com')
    await page.getByRole('button', { name: 'Grant' }).click()
    
    // Check that email field maintains its value after error
    await expect(page.getByLabel('Email')).toHaveValue('user@example.com')
  })
}) 