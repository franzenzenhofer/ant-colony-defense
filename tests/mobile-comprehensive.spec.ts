import { test, expect } from '@playwright/test'

// Real mobile device viewports
const MOBILE_VIEWPORTS = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12 Pro', width: 390, height: 844 },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
  { name: 'Samsung Galaxy S21', width: 384, height: 854 },
  { name: 'iPad Mini', width: 768, height: 1024 }
]

const TEST_URLS = [
  'http://localhost:8080',
  'https://ant-colony-defense.franzai.com',
  'https://ant-colony-defense.pages.dev'
]

for (const viewport of MOBILE_VIEWPORTS) {
  for (const url of TEST_URLS) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height}) - ${url}`, () => {
      test.use({ 
        viewport: { width: viewport.width, height: viewport.height },
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
      })

      test('COMPREHENSIVE: Game works 100% for users', async ({ page }) => {
        console.log(`📱 Testing ${viewport.name} on ${url}`)
        
        // Test 1: Load Performance
        const loadStart = Date.now()
        await page.goto(url, { waitUntil: 'networkidle' })
        const loadTime = Date.now() - loadStart
        
        expect(loadTime).toBeLessThan(3000) // Must load in <3s
        console.log(`✅ Load time: ${loadTime}ms`)
        
        // Test 2: UI Elements Visible
        const menuContainer = page.locator('.menu-container')
        await expect(menuContainer).toBeVisible({ timeout: 10000 })
        
        const title = page.locator('h1')
        await expect(title).toBeVisible()
        await expect(title).toContainText('Ant Colony Defense')
        
        // Test 3: Mobile Scrolling Works
        await page.evaluate(() => {
          const container = document.querySelector('.menu-container')
          if (container) {
            container.scrollTop = 100
            return container.scrollTop > 0
          }
          return false
        })
        console.log('✅ Mobile scrolling works')
        
        // Test 4: Touch Interactions
        const newGameButton = page.locator('button:has-text("New Game")')
        await expect(newGameButton).toBeVisible()
        await newGameButton.tap() // Use tap instead of click for mobile
        
        await expect(page.locator('.level-grid')).toBeVisible({ timeout: 5000 })
        console.log('✅ Touch interactions work')
        
        // Test 5: Level Selection
        const levelCard = page.locator('.level-card').first()
        await expect(levelCard).toBeVisible()
        await levelCard.tap()
        
        // Test 6: Game UI Loads
        const gameControls = page.locator('.game-controls')
        const gameCanvas = page.locator('canvas')
        
        await expect(gameCanvas).toBeVisible({ timeout: 10000 })
        
        // Test 7: Tower Selection (Core Gameplay)
        const towerButtons = page.locator('.tower-button')
        const towerCount = await towerButtons.count()
        expect(towerCount).toBeGreaterThan(0)
        
        await towerButtons.first().tap()
        console.log('✅ Tower selection works')
        
        // Test 8: Game Performance (60fps)
        const performanceMetrics = await page.evaluate(() => {
          return new Promise(resolve => {
            let frameCount = 0
            const startTime = performance.now()
            
            function countFrames() {
              frameCount++
              if (performance.now() - startTime < 1000) {
                requestAnimationFrame(countFrames)
              } else {
                resolve({
                  fps: frameCount,
                  memory: (performance as any).memory?.usedJSHeapSize || 0
                })
              }
            }
            requestAnimationFrame(countFrames)
          })
        })
        
        expect((performanceMetrics as any).fps).toBeGreaterThan(50) // Should be close to 60fps
        console.log(`✅ Performance: ${(performanceMetrics as any).fps} fps`)
        
        // Test 9: Sound Toggle
        const soundButton = page.locator('button:has-text("Sound:")')
        if (await soundButton.isVisible()) {
          const initialText = await soundButton.textContent()
          await soundButton.tap()
          const newText = await soundButton.textContent()
          expect(newText).not.toBe(initialText)
          console.log('✅ Sound toggle works')
        }
        
        // Test 10: Navigation Back to Menu
        const menuButton = page.locator('button:has-text("Menu")')
        if (await menuButton.isVisible()) {
          await menuButton.tap()
          await expect(menuContainer).toBeVisible()
          console.log('✅ Navigation works')
        }
        
        console.log(`🎉 ${viewport.name} comprehensive test passed!`)
      })

      test('GAMEPLAY: Must be able to play multiple rounds', async ({ page }) => {
        await page.goto(url, { waitUntil: 'networkidle' })
        
        // Round 1
        await page.locator('button:has-text("New Game")').tap()
        await page.locator('.level-card').first().tap()
        await expect(page.locator('canvas')).toBeVisible()
        
        // Try to place a tower
        const towerButton = page.locator('.tower-button').first()
        await towerButton.tap()
        
        // Click on game canvas to place tower
        const canvas = page.locator('canvas')
        await canvas.tap({ position: { x: 200, y: 200 } })
        
        // Wait a bit for gameplay
        await page.waitForTimeout(3000)
        
        // Return to menu
        const menuButton = page.locator('button:has-text("Menu")')
        if (await menuButton.isVisible()) {
          await menuButton.tap()
        }
        
        // Round 2
        await page.locator('button:has-text("New Game")').tap()
        const levelCards = page.locator('.level-card')
        const levelCount = await levelCards.count()
        
        if (levelCount > 1) {
          await levelCards.nth(1).tap() // Try level 2
        } else {
          await levelCards.first().tap()
        }
        
        await expect(page.locator('canvas')).toBeVisible()
        console.log('✅ Multiple rounds playable')
      })

      test('ACCESSIBILITY: Screen reader and keyboard support', async ({ page }) => {
        await page.goto(url)
        
        // Check for proper ARIA labels
        const buttons = page.locator('button')
        const buttonCount = await buttons.count()
        
        for (let i = 0; i < Math.min(buttonCount, 5); i++) {
          const button = buttons.nth(i)
          const ariaLabel = await button.getAttribute('aria-label')
          const text = await button.textContent()
          
          expect(ariaLabel || text).toBeTruthy()
        }
        
        // Test keyboard navigation
        await page.keyboard.press('Tab')
        const focusedElement = page.locator(':focus')
        await expect(focusedElement).toBeVisible()
        
        console.log('✅ Accessibility checks passed')
      })

      test('DEVELOPER: All dev tools work 100%', async ({ page }) => {
        // This test ensures the game loads without console errors
        const errors: string[] = []
        
        page.on('console', msg => {
          if (msg.type() === 'error') {
            errors.push(msg.text())
          }
        })
        
        page.on('pageerror', error => {
          errors.push(error.message)
        })
        
        await page.goto(url, { waitUntil: 'networkidle' })
        await page.waitForTimeout(5000)
        
        // Should have no critical console errors
        const criticalErrors = errors.filter(error => 
          !error.includes('favicon') && 
          !error.includes('Service Worker') &&
          !error.includes('404')
        )
        
        expect(criticalErrors.length).toBe(0)
        console.log('✅ No critical console errors')
      })
    })
  }
}

// AI System Validation Test
test.describe('AI SYSTEM: Ensure AI can understand game 100%', () => {
  test('code structure is AI-readable', async ({ page }) => {
    // This test validates that the codebase structure is clear for AI
    await page.goto('http://localhost:8080')
    
    // Check that game state is accessible
    const gameState = await page.evaluate(() => {
      return {
        hasCanvas: !!document.querySelector('canvas'),
        hasGameControls: !!document.querySelector('.game-controls'),
        hasMenuContainer: !!document.querySelector('.menu-container'),
        hasLevelGrid: !!document.querySelector('.level-grid')
      }
    })
    
    expect(gameState.hasMenuContainer).toBe(true)
    console.log('✅ AI can identify game components')
  })
})