import { test, expect } from '@playwright/test'

test.describe('Main Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should display game title and subtitle', async ({ page }) => {
    await expect(page.locator('h1.menu-title')).toContainText('Ant Colony Defense')
    await expect(page.locator('p.menu-subtitle')).toContainText('Strategic Tower Defense with Real Colony AI')
  })

  test('should show all menu buttons', async ({ page }) => {
    const newGameButton = page.locator('button:has-text("New Game")')
    const selectLevelButton = page.locator('button:has-text("Select Level")')
    const howToPlayButton = page.locator('button:has-text("How to Play")')
    const soundButton = page.locator('button:has-text("Sound:")')
    
    await expect(newGameButton).toBeVisible()
    await expect(selectLevelButton).toBeVisible()
    await expect(howToPlayButton).toBeVisible()
    await expect(soundButton).toBeVisible()
  })

  test('should navigate to level select when clicking New Game', async ({ page }) => {
    await page.click('button:has-text("New Game")')
    await expect(page.locator('h1.menu-title')).toContainText('Select Level')
    await expect(page.locator('.level-grid')).toBeVisible()
  })

  test('should show tutorial when clicking How to Play', async ({ page }) => {
    await page.click('button:has-text("How to Play")')
    await expect(page.locator('h2.menu-title')).toContainText('How to Play')
    await expect(page.locator('text=Objective')).toBeVisible()
    await expect(page.locator('text=Ant Types')).toBeVisible()
    await expect(page.locator('text=Tower Types')).toBeVisible()
  })

  test('should toggle sound on/off', async ({ page }) => {
    const soundButton = page.locator('button:has-text("Sound:")')
    
    // Check initial state
    await expect(soundButton).toContainText('Sound: On')
    
    // Toggle off
    await soundButton.click()
    await expect(soundButton).toContainText('Sound: Off')
    
    // Toggle back on
    await soundButton.click()
    await expect(soundButton).toContainText('Sound: On')
  })

  test('should persist sound preference', async ({ page, context }) => {
    // Turn sound off
    await page.click('button:has-text("Sound:")')
    await expect(page.locator('button:has-text("Sound:")')).toContainText('Sound: Off')
    
    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Check sound is still off
    await expect(page.locator('button:has-text("Sound:")')).toContainText('Sound: Off')
  })

  test('should return from tutorial to main menu', async ({ page }) => {
    await page.click('button:has-text("How to Play")')
    await expect(page.locator('h2.menu-title')).toContainText('How to Play')
    
    await page.click('button:has-text("Back to Menu")')
    await expect(page.locator('h1.menu-title')).toContainText('Ant Colony Defense')
  })

  test('should display version number', async ({ page }) => {
    await expect(page.locator('text=v1.0.0')).toBeVisible()
    await expect(page.locator('text=Made with 🐜 by Franz AI')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check all elements are still visible
    await expect(page.locator('h1.menu-title')).toBeVisible()
    await expect(page.locator('button:has-text("New Game")')).toBeVisible()
    
    // Check responsive styling
    const title = page.locator('h1.menu-title')
    const fontSize = await title.evaluate(el => 
      window.getComputedStyle(el).fontSize
    )
    expect(parseFloat(fontSize)).toBeLessThanOrEqual(32) // 2rem on mobile
  })
})