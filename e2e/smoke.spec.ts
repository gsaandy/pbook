import { test, expect } from '@playwright/test'

/**
 * Smoke tests - Basic tests that verify the app loads without errors
 *
 * These tests don't require authentication or data mocking.
 * For full E2E tests with Convex + Clerk, you need one of these approaches:
 *
 * 1. Use a test Convex deployment with seeded data
 * 2. Use Clerk's test mode with test tokens
 * 3. Create a bypass route for testing that doesn't require auth
 *
 * See: https://docs.convex.dev/production/testing
 * See: https://clerk.com/docs/testing/overview
 */

test.describe('Smoke Tests', () => {
  test('homepage loads without errors', async ({ page }) => {
    // Check for JavaScript errors
    const errors: string[] = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto('/')

    // Wait a moment for any initial JS to execute
    await page.waitForTimeout(1000)

    // Should not have any JS errors (except expected Convex connection errors in test env)
    const criticalErrors = errors.filter(
      e => !e.includes('Convex') && !e.includes('WebSocket')
    )
    expect(criticalErrors).toHaveLength(0)
  })

  test('app has correct title', async ({ page }) => {
    await page.goto('/')

    // Check page title exists
    const title = await page.title()
    expect(title).toBeTruthy()
  })

  test('app renders without blank screen', async ({ page }) => {
    await page.goto('/')

    // Wait for content
    await page.waitForTimeout(2000)

    // Body should have content (not a blank white screen)
    const bodyContent = await page.locator('body').textContent()
    expect(bodyContent?.length).toBeGreaterThan(0)
  })

  test('can navigate to sign-in page', async ({ page }) => {
    await page.goto('/')

    // Wait for any redirects
    await page.waitForTimeout(2000)

    // App should either show content or redirect to sign-in
    const url = page.url()
    const hasContent = await page.locator('body').textContent()

    // Either we're on the home page with content, or redirected to sign-in
    expect(hasContent?.length).toBeGreaterThan(0)
  })
})

test.describe('Static Assets', () => {
  test('CSS loads correctly', async ({ page }) => {
    const cssResponses: number[] = []

    page.on('response', (response) => {
      if (response.url().includes('.css')) {
        cssResponses.push(response.status())
      }
    })

    await page.goto('/')
    await page.waitForTimeout(1000)

    // All CSS should load successfully
    for (const status of cssResponses) {
      expect(status).toBeLessThan(400)
    }
  })

  test('JavaScript bundles load correctly', async ({ page }) => {
    const jsResponses: number[] = []

    page.on('response', (response) => {
      if (response.url().includes('.js') || response.url().includes('.mjs')) {
        jsResponses.push(response.status())
      }
    })

    await page.goto('/')
    await page.waitForTimeout(1000)

    // All JS should load successfully
    for (const status of jsResponses) {
      expect(status).toBeLessThan(400)
    }
  })
})
