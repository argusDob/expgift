import { test, expect } from '@playwright/test'

test('desktop golden matches', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  
  // Go to login page
  await page.goto('http://localhost:5173/')
  await page.waitForLoadState('networkidle')
  
  // Fill and submit login form
  await page.fill('input[type="email"]', 'user@example.com')
  await page.fill('input[type="password"]', 'password')
  await page.click('button:has-text("Sign in")')
  
  // Wait for redirect to /home
  await page.waitForURL('**/home')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(300)
  
  const screenshot = await page.screenshot({ fullPage: true })
  expect(screenshot).toMatchSnapshot('golden-1440x900.png', { maxDiffPixels: 5000 })
})
