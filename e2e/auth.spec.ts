import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should show sign in page', async ({ page }) => {
    await page.goto('/auth/signin')
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in with Email' })).toBeVisible()
  })

  test('should handle invalid email', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.getByLabel('Email').fill('invalid-email')
    await page.getByRole('button', { name: 'Sign in with Email' }).click()
    await expect(page.getByText('Invalid email')).toBeVisible()
  })

  test('should handle valid email submission', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByRole('button', { name: 'Sign in with Email' }).click()
    await expect(page.getByText('Check your email')).toBeVisible()
  })
}) 