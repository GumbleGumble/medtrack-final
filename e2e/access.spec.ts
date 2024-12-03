import { test, expect } from '@playwright/test'

test.describe('Access Management', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication state
    await page.goto('/auth/signin')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByRole('button', { name: 'Sign in with Email' }).click()
  })

  test('should display access management section', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: 'Access Management' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Grant Access' })).toBeVisible()
  })

  test('should open grant access dialog', async ({ page }) => {
    await page.goto('/settings')
    await page.getByRole('button', { name: 'Grant Access' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Grant Access' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Medication Groups')).toBeVisible()
    await expect(page.getByLabel('Can Edit')).toBeVisible()
  })

  test('should validate email input', async ({ page }) => {
    await page.goto('/settings')
    await page.getByRole('button', { name: 'Grant Access' }).click()
    await page.getByRole('button', { name: 'Grant' }).click()
    await expect(page.getByText('Email is required')).toBeVisible()
    
    await page.getByLabel('Email').fill('invalid-email')
    await page.getByRole('button', { name: 'Grant' }).click()
    await expect(page.getByText('Invalid email address')).toBeVisible()
  })

  test('should validate medication group selection', async ({ page }) => {
    await page.goto('/settings')
    await page.getByRole('button', { name: 'Grant Access' }).click()
    await page.getByLabel('Email').fill('user@example.com')
    await page.getByRole('button', { name: 'Grant' }).click()
    await expect(page.getByText('Select at least one medication group')).toBeVisible()
  })

  test('should grant access successfully', async ({ page }) => {
    await page.goto('/settings')
    await page.getByRole('button', { name: 'Grant Access' }).click()
    await page.getByLabel('Email').fill('user@example.com')
    await page.getByLabel('Medication Groups').click()
    await page.getByRole('option', { name: 'Daily Medications' }).click()
    await page.getByLabel('Can Edit').click()
    await page.getByRole('button', { name: 'Grant' }).click()
    await expect(page.getByText('Access granted successfully')).toBeVisible()
  })

  test('should display granted access list', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.getByText('Email')).toBeVisible()
    await expect(page.getByText('Groups')).toBeVisible()
    await expect(page.getByText('Permissions')).toBeVisible()
  })

  test('should revoke access', async ({ page }) => {
    await page.goto('/settings')
    await page.getByRole('button', { name: 'Revoke Access' }).first().click()
    await expect(page.getByRole('dialog', { name: 'Confirm Revoke Access' })).toBeVisible()
    await page.getByRole('button', { name: 'Yes, revoke access' }).click()
    await expect(page.getByText('Access revoked successfully')).toBeVisible()
  })

  test('should handle errors gracefully', async ({ page }) => {
    await page.goto('/settings')
    // Simulate network error by disabling network
    await page.route('**/api/access/**', route => route.abort())
    await page.getByRole('button', { name: 'Grant Access' }).click()
    await page.getByLabel('Email').fill('user@example.com')
    await page.getByLabel('Medication Groups').click()
    await page.getByRole('option', { name: 'Daily Medications' }).click()
    await page.getByRole('button', { name: 'Grant' }).click()
    await expect(page.getByText('Failed to grant access')).toBeVisible()
  })
}) 