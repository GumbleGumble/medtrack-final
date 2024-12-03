import { test, expect } from '@playwright/test'

test.describe('Form Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication state
    await page.goto('/auth/signin')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByRole('button', { name: 'Sign in with Email' }).click()
  })

  test('should handle medication form validation errors', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Add Medication' }).click()
    
    // Try to submit empty form
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('Name is required')).toBeVisible()
    await expect(page.getByText('Dosage is required')).toBeVisible()
    await expect(page.getByText('Unit is required')).toBeVisible()
    
    // Fill invalid values
    await page.getByLabel('Name').fill('a') // Too short
    await page.getByLabel('Dosage').fill('-1') // Negative number
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('Name must be at least 2 characters')).toBeVisible()
    await expect(page.getByText('Dosage must be a positive number')).toBeVisible()
  })

  test('should handle access management form validation', async ({ page }) => {
    await page.goto('/settings')
    await page.getByRole('button', { name: 'Grant Access' }).click()
    
    // Try to submit empty form
    await page.getByRole('button', { name: 'Grant' }).click()
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Select at least one medication group')).toBeVisible()
    
    // Fill invalid email
    await page.getByLabel('Email').fill('invalid-email')
    await page.getByRole('button', { name: 'Grant' }).click()
    await expect(page.getByText('Invalid email address')).toBeVisible()
  })

  test('should handle form submission network errors', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Add Medication' }).click()
    
    // Fill valid form data
    await page.getByLabel('Name').fill('Test Medication')
    await page.getByLabel('Dosage').fill('10')
    await page.getByLabel('Unit').fill('mg')
    
    // Simulate network error
    await page.route('**/api/medications', route => route.abort())
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('Failed to add medication')).toBeVisible()
  })

  test('should handle form retry functionality', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Add Medication' }).click()
    
    // Simulate form error
    await page.addScriptTag({
      content: `
        window.addEventListener('submit', (e) => {
          if (e.target.querySelector('input[name="name"]')) {
            throw new Error('Simulated form error');
          }
        });
      `,
    })
    
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('Form Error')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Try Again' })).toBeVisible()
    
    // Click try again and verify form is reset
    await page.getByRole('button', { name: 'Try Again' }).click()
    await expect(page.getByLabel('Name')).toBeVisible()
  })

  test('should preserve form data after validation errors', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Add Medication' }).click()
    
    // Fill partial form data
    await page.getByLabel('Name').fill('Test Medication')
    await page.getByLabel('Dosage').fill('10')
    
    // Submit and trigger validation error
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('Unit is required')).toBeVisible()
    
    // Verify previous inputs are preserved
    await expect(page.getByLabel('Name')).toHaveValue('Test Medication')
    await expect(page.getByLabel('Dosage')).toHaveValue('10')
  })
}) 