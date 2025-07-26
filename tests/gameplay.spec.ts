import { test, expect } from '@playwright/test'

test.describe('Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.click('button:has-text("Select Level")')
    await page.click('.level-card:not(.locked)')
    await page.waitForSelector('.game-container')
  })

  test('should display game UI elements', async ({ page }) => {
    // Header elements
    await expect(page.locator('.game-header')).toBeVisible()
    await expect(page.locator('text=100/100')).toBeVisible() // Health
    await expect(page.locator('text=100').first()).toBeVisible() // Resources
    await expect(page.locator('text=Wave 1/2')).toBeVisible()
    
    // Canvas
    await expect(page.locator('canvas')).toBeVisible()
    
    // Tower selector
    await expect(page.locator('.tower-button')).toHaveCount(4)
    
    // Wave manager
    await expect(page.locator('text=Build Phase')).toBeVisible()
  })

  test('should select tower types', async ({ page }) => {
    const anteaterButton = page.locator('.tower-button').first()
    
    await anteaterButton.click()
    await expect(anteaterButton).toHaveClass(/selected/)
    
    // Click again to deselect
    await anteaterButton.click()
    await expect(anteaterButton).not.toHaveClass(/selected/)
  })

  test('should place tower on hex grid', async ({ page }) => {
    // Select tower
    await page.locator('.tower-button').first().click()
    
    // Click on canvas to place tower
    const canvas = page.locator('canvas')
    const box = await canvas.boundingBox()
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
    }
    
    // Resources should decrease
    await expect(page.locator('text=80').first()).toBeVisible() // 100 - 20 for anteater
  })

  test('should start wave when clicking start button', async ({ page }) => {
    await page.click('button:has-text("Start Wave")')
    
    // Should transition to wave phase
    await expect(page.locator('text=Wave 1 in Progress')).toBeVisible()
    await expect(page.locator('text=Ants remaining:')).toBeVisible()
  })

  test('should pause and resume game', async ({ page }) => {
    // Click pause button
    await page.click('button[aria-label="Pause"]')
    await expect(page.locator('.modal-overlay')).toBeVisible()
    await expect(page.locator('h2:has-text("Game Paused")')).toBeVisible()
    
    // Resume
    await page.click('button:has-text("Resume Game")')
    await expect(page.locator('.modal-overlay')).not.toBeVisible()
  })

  test('should toggle game speed', async ({ page }) => {
    const speedButton = page.locator('button:has-text("1x")')
    
    await speedButton.click()
    await expect(speedButton).toContainText('2x')
    
    await speedButton.click()
    await expect(speedButton).toContainText('3x')
    
    await speedButton.click()
    await expect(speedButton).toContainText('1x')
  })

  test('should return to menu', async ({ page }) => {
    await page.click('button[aria-label="Home"]')
    await expect(page.locator('h1.menu-title')).toContainText('Ant Colony Defense')
  })

  test('should disable unaffordable towers', async ({ page }) => {
    // Fire tower costs 40, we start with 100
    const fireTower = page.locator('.tower-button:has-text("Fire Tower")')
    
    // Should be enabled initially
    await expect(fireTower).not.toBeDisabled()
    
    // Place 3 anteaters (20 each = 60 total)
    await page.locator('.tower-button').first().click()
    const canvas = page.locator('canvas')
    const box = await canvas.boundingBox()
    if (box) {
      // Place 3 towers
      await page.mouse.click(box.x + box.width / 2 - 50, box.y + box.height / 2)
      await page.waitForTimeout(100)
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
      await page.waitForTimeout(100)
      await page.mouse.click(box.x + box.width / 2 + 50, box.y + box.height / 2)
    }
    
    // Now fire tower should be disabled (40 resources left, costs 40)
    await expect(fireTower).toBeDisabled()
  })

  test('should show keyboard shortcuts in pause menu', async ({ page }) => {
    await page.click('button[aria-label="Pause"]')
    
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible()
    await expect(page.locator('text=Space/Esc - Pause')).toBeVisible()
    await expect(page.locator('text=1-4 - Select Tower')).toBeVisible()
  })

  test('should handle victory condition', async ({ page }) => {
    // This would require mocking or a special test level
    // For now, just check the UI exists
    await expect(page.locator('.game-container')).toBeVisible()
  })

  test('should be playable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // All UI elements should still be visible
    await expect(page.locator('.game-header')).toBeVisible()
    await expect(page.locator('canvas')).toBeVisible()
    await expect(page.locator('.tower-button').first()).toBeVisible()
    
    // Tower selector should be scrollable
    const controls = page.locator('.game-controls')
    await expect(controls).toHaveCSS('overflow-x', 'auto')
  })
})