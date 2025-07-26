import { test, expect } from '@playwright/test'

test.describe('PERFORMANCE VALIDATION: <3s load, 60fps, memory checks', () => {
  const PERFORMANCE_URLS = [
    'http://localhost:8080',
    'https://ant-colony-defense.franzai.com',
    'https://ant-colony-defense.pages.dev'
  ]

  for (const url of PERFORMANCE_URLS) {
    test(`${url} - Load Time Performance`, async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto(url, { waitUntil: 'networkidle' })
      
      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(3000) // Must be <3 seconds
      
      console.log(`✅ ${url} loaded in ${loadTime}ms`)
    })

    test(`${url} - Gameplay Performance (60fps)`, async ({ page }) => {
      await page.goto(url, { waitUntil: 'networkidle' })
      
      // Start a game
      await page.click('button:has-text("New Game")')
      await page.click('.level-card:first-child')
      await expect(page.locator('canvas')).toBeVisible()
      
      // Measure FPS during active gameplay
      const performanceData = await page.evaluate(() => {
        return new Promise(resolve => {
          let frameCount = 0
          let lastTime = performance.now()
          const samples: number[] = []
          
          function measureFrame() {
            frameCount++
            const currentTime = performance.now()
            const deltaTime = currentTime - lastTime
            
            if (deltaTime > 0) {
              samples.push(1000 / deltaTime) // FPS calculation
            }
            
            lastTime = currentTime
            
            if (frameCount < 180) { // Measure for 3 seconds at 60fps
              requestAnimationFrame(measureFrame)
            } else {
              const avgFps = samples.reduce((sum, fps) => sum + fps, 0) / samples.length
              const minFps = Math.min(...samples)
              const maxFps = Math.max(...samples)
              
              resolve({
                averageFps: avgFps,
                minimumFps: minFps,
                maximumFps: maxFps,
                totalFrames: frameCount,
                memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
              })
            }
          }
          
          requestAnimationFrame(measureFrame)
        })
      })

      const perf = performanceData as any
      
      expect(perf.averageFps).toBeGreaterThan(55) // Should maintain >55 fps average
      expect(perf.minimumFps).toBeGreaterThan(45) // Should never drop below 45 fps
      expect(perf.memoryUsage).toBeLessThan(50 * 1024 * 1024) // <50MB memory usage
      
      console.log(`✅ ${url} performance:`)
      console.log(`  📊 Average FPS: ${perf.averageFps.toFixed(1)}`)
      console.log(`  📊 Minimum FPS: ${perf.minimumFps.toFixed(1)}`)
      console.log(`  📊 Memory: ${(perf.memoryUsage / 1024 / 1024).toFixed(1)}MB`)
    })

    test(`${url} - Memory Leak Detection`, async ({ page }) => {
      await page.goto(url, { waitUntil: 'networkidle' })
      
      // Get initial memory
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0
      })
      
      // Simulate multiple game sessions
      for (let i = 0; i < 3; i++) {
        await page.click('button:has-text("New Game")')
        await page.click('.level-card:first-child')
        await page.waitForTimeout(2000)
        
        // Return to menu
        const menuButton = page.locator('button:has-text("Menu")')
        if (await menuButton.isVisible()) {
          await menuButton.click()
          await page.waitForTimeout(1000)
        }
      }
      
      // Force garbage collection
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc()
        }
      })
      
      await page.waitForTimeout(2000)
      
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0
      })
      
      const memoryIncrease = finalMemory - initialMemory
      const memoryIncreasePercent = (memoryIncrease / initialMemory) * 100
      
      // Memory should not increase by more than 50% after multiple sessions
      expect(memoryIncreasePercent).toBeLessThan(50)
      
      console.log(`✅ ${url} memory leak test:`)
      console.log(`  📊 Initial: ${(initialMemory / 1024 / 1024).toFixed(1)}MB`)
      console.log(`  📊 Final: ${(finalMemory / 1024 / 1024).toFixed(1)}MB`)
      console.log(`  📊 Increase: ${memoryIncreasePercent.toFixed(1)}%`)
    })

    test(`${url} - Bundle Size Check`, async ({ page }) => {
      const response = await page.goto(url)
      expect(response?.status()).toBe(200)
      
      // Check total bundle size by measuring all resource sizes
      const resourceSizes = await page.evaluate(async () => {
        const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
        let totalSize = 0
        
        for (const entry of entries) {
          if (entry.transferSize) {
            totalSize += entry.transferSize
          }
        }
        
        return {
          totalTransferSize: totalSize,
          resourceCount: entries.length,
          jsSize: entries
            .filter(e => e.name.includes('.js'))
            .reduce((sum, e) => sum + (e.transferSize || 0), 0),
          cssSize: entries
            .filter(e => e.name.includes('.css'))
            .reduce((sum, e) => sum + (e.transferSize || 0), 0)
        }
      })
      
      // Total bundle should be <150KB as requested
      expect(resourceSizes.totalTransferSize).toBeLessThan(150 * 1024)
      
      console.log(`✅ ${url} bundle size:`)
      console.log(`  📦 Total: ${(resourceSizes.totalTransferSize / 1024).toFixed(1)}KB`)
      console.log(`  📦 JS: ${(resourceSizes.jsSize / 1024).toFixed(1)}KB`)
      console.log(`  📦 CSS: ${(resourceSizes.cssSize / 1024).toFixed(1)}KB`)
    })

    test(`${url} - Network Performance`, async ({ page }) => {
      // Simulate slow 3G network
      await page.route('**/*', route => {
        // Add 200ms delay to simulate network latency
        setTimeout(() => route.continue(), 200)
      })
      
      const startTime = Date.now()
      await page.goto(url, { waitUntil: 'networkidle' })
      const loadTime = Date.now() - startTime
      
      // Should still load reasonably fast on slow network
      expect(loadTime).toBeLessThan(8000) // <8s on slow network
      
      // Game should still be playable
      await page.click('button:has-text("New Game")')
      await page.click('.level-card:first-child')
      await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 })
      
      console.log(`✅ ${url} slow network performance: ${loadTime}ms`)
    })
  }
})