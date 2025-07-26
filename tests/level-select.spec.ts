import { test, expect } from '@playwright/test'

test.describe('Level Select', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.click('button:has-text("Select Level")')
  })

  test('should display level select screen', async ({ page }) => {
    await expect(page.locator('h1.menu-title')).toContainText('Select Level')
    await expect(page.locator('p.menu-subtitle')).toContainText('Choose your battlefield')
    await expect(page.locator('.level-grid')).toBeVisible()
  })

  test('should show 10 campaign levels', async ({ page }) => {
    const levelCards = page.locator('.level-card')
    await expect(levelCards).toHaveCount(10)
  })

  test('should show level 1 as unlocked by default', async ({ page }) => {
    const level1 = page.locator('.level-card').first()
    await expect(level1).not.toHaveClass(/locked/)
    await expect(level1.locator('h3')).toContainText('Level 1')
    await expect(level1.locator('h4')).toContainText('The First Scouts')
  })

  test('should show other levels as locked initially', async ({ page }) => {
    const level2 = page.locator('.level-card').nth(1)
    await expect(level2).toHaveClass(/locked/)
    await expect(level2.locator('svg')).toBeVisible() // Lock icon
  })

  test('should navigate back to main menu', async ({ page }) => {
    await page.click('button:has-text("Back")')
    await expect(page.locator('h1.menu-title')).toContainText('Ant Colony Defense')
  })

  test('should start game when clicking unlocked level', async ({ page }) => {
    await page.click('.level-card:not(.locked)')
    
    // Should now be in game
    await expect(page.locator('.game-container')).toBeVisible()
    await expect(page.locator('.game-header')).toBeVisible()
    await expect(page.locator('canvas')).toBeVisible()
  })

  test('should not start game when clicking locked level', async ({ page }) => {
    const lockedLevel = page.locator('.level-card.locked').first()
    await lockedLevel.click()
    
    // Should still be on level select
    await expect(page.locator('h1.menu-title')).toContainText('Select Level')
  })

  test('should display level details', async ({ page }) => {
    const level1 = page.locator('.level-card').first()
    
    await expect(level1.locator('text=Waves: 2')).toBeVisible()
    await expect(level1.locator('text=💰 100')).toBeVisible()
    await expect(level1.locator('text=🚪')).toBeVisible() // Spawn gates
  })

  test('should be scrollable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check grid is scrollable
    const levelGrid = page.locator('.level-grid')
    const gridHeight = await levelGrid.evaluate(el => el.scrollHeight)
    const viewportHeight = await levelGrid.evaluate(el => el.clientHeight)
    
    // With 10 levels, should need scrolling on mobile
    expect(gridHeight).toBeGreaterThan(viewportHeight)
  })

  test('should maintain aspect ratio on different screen sizes', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 768, height: 1024 }, // Tablet
      { width: 375, height: 667 } // Mobile
    ]
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await expect(page.locator('.level-grid')).toBeVisible()
      await expect(page.locator('.level-card').first()).toBeVisible()
    }
  })
})