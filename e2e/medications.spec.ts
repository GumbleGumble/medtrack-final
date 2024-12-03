import { test, expect } from '@playwright/test'

test.describe('Medication Management', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication state
    await page.goto('/auth/signin')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByRole('button', { name: 'Sign in with Email' }).click()
  })

  test('should show empty state', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('No medications added yet')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add Medication' })).toBeVisible()
  })

  test('should open add medication dialog', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Add Medication' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Add Medication' })).toBeVisible()
  })

  test('should validate medication form', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Add Medication' }).click()
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('Name is required')).toBeVisible()
    await expect(page.getByText('Dosage is required')).toBeVisible()
    await expect(page.getByText('Unit is required')).toBeVisible()
    await expect(page.getByText('Frequency is required')).toBeVisible()
  })

  test('should add new medication', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Add Medication' }).click()
    await page.getByLabel('Name').fill('Test Medication')
    await page.getByLabel('Dosage').fill('10')
    await page.getByLabel('Unit').fill('mg')
    await page.getByLabel('Frequency').fill('Daily')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('Test Medication')).toBeVisible()
    await expect(page.getByText('10 mg')).toBeVisible()
    await expect(page.getByText('Daily')).toBeVisible()
  })

  test('should record dose', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Record Dose' }).first().click()
    await expect(page.getByText('Dose recorded')).toBeVisible()
  })

  test('should show medication history', async ({ page }) => {
    await page.goto('/history')
    await expect(page.getByRole('heading', { name: 'Medication History' })).toBeVisible()
    await expect(page.getByRole('table')).toBeVisible()
  })

  test('should show statistics', async ({ page }) => {
    await page.goto('/stats')
    await expect(page.getByRole('heading', { name: 'Statistics' })).toBeVisible()
    await expect(page.getByText('Adherence Rate')).toBeVisible()
  })
}) 