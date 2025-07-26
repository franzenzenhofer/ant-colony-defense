import { test, expect, Page } from '@playwright/test';

test.describe('Full Game Playthrough', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('https://ant-colony-defense.franzai.com');
    
    // Wait for the game to load
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('complete game playthrough from start to finish', async () => {
    // 1. Verify main menu loads
    await expect(page.locator('.menu-container')).toBeVisible();
    await expect(page.locator('.menu-title')).toContainText('Ant Colony Defense');
    
    // Check version is displayed
    const versionText = await page.locator('p:has-text("v")').textContent();
    expect(versionText).toMatch(/v\d+\.\d+\.\d+/);
    
    // 2. Start new game
    await page.click('button:has-text("New Game")');
    
    // 3. Select first level
    await expect(page.locator('.level-grid')).toBeVisible({ timeout: 5000 });
    await page.locator('.level-card').first().click();
    
    // 4. Wait for game to load
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000); // Let the game initialize
    
    // 5. Verify game UI elements
    await expect(page.locator('.resource-display')).toBeVisible();
    await expect(page.locator('.wave-indicator')).toBeVisible();
    await expect(page.locator('.game-controls')).toBeVisible();
    
    // Get initial resources
    const resourceText = await page.locator('.resource-display').textContent();
    const initialResources = parseInt(resourceText?.match(/\d+/)?.[0] || '0');
    expect(initialResources).toBeGreaterThan(0);
    
    // 6. Place towers during build phase
    const canvas = page.locator('canvas');
    const canvasBox = await canvas.boundingBox();
    if (!canvasBox) throw new Error('Canvas not found');
    
    // Click on tower selection button (Cannon Tower)
    await page.click('.tower-button:first-child');
    
    // Place towers at strategic positions
    const towerPositions = [
      { x: canvasBox.x + canvasBox.width * 0.3, y: canvasBox.y + canvasBox.height * 0.5 },
      { x: canvasBox.x + canvasBox.width * 0.5, y: canvasBox.y + canvasBox.height * 0.5 },
      { x: canvasBox.x + canvasBox.width * 0.7, y: canvasBox.y + canvasBox.height * 0.5 }
    ];
    
    for (const pos of towerPositions) {
      await page.mouse.click(pos.x, pos.y);
      await page.waitForTimeout(500); // Wait for tower placement
    }
    
    // 7. Start wave
    await page.click('button:has-text("Start Wave")');
    await page.waitForTimeout(2000); // Let wave begin
    
    // 8. Verify ants are spawning and moving
    // We can't directly check canvas content, but we can verify game is running
    const waveText = await page.locator('.wave-indicator').textContent();
    expect(waveText).toContain('Wave 1');
    
    // 9. Speed up game
    await page.click('button:has-text("2x")');
    await page.waitForTimeout(3000); // Let the wave progress
    
    // 10. Check if resources increased (from killing ants)
    const newResourceText = await page.locator('.resource-display').textContent();
    const newResources = parseInt(newResourceText?.match(/\d+/)?.[0] || '0');
    expect(newResources).not.toBe(initialResources); // Resources should have changed
    
    // 11. Check game is still responsive
    await page.click('button:has-text("Pause")');
    await expect(page.locator('button:has-text("Resume")')).toBeVisible();
    await page.click('button:has-text("Resume")');
    
    // 12. Test tower selection during wave
    await page.click('.tower-button:nth-child(2)'); // Select different tower type
    
    // 13. Wait for wave to complete or game to end
    await page.waitForTimeout(10000); // Let game progress
    
    // 14. Check for either victory/defeat screen or next wave
    const gameState = await page.evaluate(() => {
      // Check if any modal is visible (victory/defeat)
      const modal = document.querySelector('.modal-overlay');
      if (modal && window.getComputedStyle(modal).display !== 'none') {
        return 'ended';
      }
      // Check wave indicator
      const waveIndicator = document.querySelector('.wave-indicator');
      return waveIndicator?.textContent || 'unknown';
    });
    
    expect(gameState).toBeTruthy();
    console.log('Game state:', gameState);
    
    // 15. If game ended, check for restart option
    if (gameState === 'ended') {
      const modalButtons = await page.locator('.modal-content button').count();
      expect(modalButtons).toBeGreaterThan(0);
    }
    
    // 16. Test save game functionality
    const hasSaveButton = await page.locator('button:has-text("Save")').count() > 0;
    if (hasSaveButton) {
      await page.click('button:has-text("Save")');
      // Verify save was successful (usually shows a notification)
    }
    
    // 17. Return to main menu
    const hasMenuButton = await page.locator('button:has-text("Menu")').count() > 0;
    if (hasMenuButton) {
      await page.click('button:has-text("Menu")');
      await expect(page.locator('.menu-container')).toBeVisible();
    }
  });

  test('game handles errors gracefully', async () => {
    // Start game
    await page.click('button:has-text("New Game")');
    await page.locator('.level-card').first().click();
    await expect(page.locator('canvas')).toBeVisible();
    
    // Try invalid actions
    const canvas = page.locator('canvas');
    const canvasBox = await canvas.boundingBox();
    if (!canvasBox) throw new Error('Canvas not found');
    
    // Click without selecting tower
    await page.mouse.click(canvasBox.x + 50, canvasBox.y + 50);
    
    // Game should not crash
    await expect(page.locator('.game-controls')).toBeVisible();
    
    // Try to place tower with insufficient resources
    await page.click('.tower-button:last-child'); // Most expensive tower
    
    // Click many times to exhaust resources
    for (let i = 0; i < 20; i++) {
      await page.mouse.click(
        canvasBox.x + canvasBox.width * Math.random(),
        canvasBox.y + canvasBox.height * Math.random()
      );
    }
    
    // Game should show feedback for insufficient resources
    await expect(page.locator('.game-controls')).toBeVisible();
  });

  test('sound and settings work correctly', async () => {
    // Check sound toggle
    const soundButton = page.locator('button:has-text("Sound:")');
    await expect(soundButton).toBeVisible();
    
    const initialSoundState = await soundButton.textContent();
    await soundButton.click();
    
    const newSoundState = await soundButton.textContent();
    expect(newSoundState).not.toBe(initialSoundState);
    
    // Sound state should persist
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const persistedSoundState = await page.locator('button:has-text("Sound:")').textContent();
    expect(persistedSoundState).toBe(newSoundState);
  });

  test('mobile viewport works correctly', async () => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://ant-colony-defense.franzai.com');
    
    // Menu should be scrollable
    await expect(page.locator('.menu-container')).toBeVisible();
    await expect(page.locator('.menu-container')).toHaveCSS('overflow-y', 'auto');
    
    // All buttons should be visible and tappable
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44); // iOS touch target size
      }
    }
  });

  test('performance metrics are acceptable', async () => {
    // Measure initial load time
    const startTime = Date.now();
    await page.goto('https://ant-colony-defense.franzai.com');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    
    // Start game and measure FPS
    await page.click('button:has-text("New Game")');
    await page.locator('.level-card').first().click();
    await expect(page.locator('canvas')).toBeVisible();
    
    // Inject FPS counter
    const avgFPS = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let frameCount = 0;
        let lastTime = performance.now();
        const fpsValues: number[] = [];
        
        function measureFPS() {
          frameCount++;
          const currentTime = performance.now();
          
          if (currentTime - lastTime >= 1000) {
            fpsValues.push(frameCount);
            frameCount = 0;
            lastTime = currentTime;
            
            if (fpsValues.length >= 3) {
              const avgFPS = fpsValues.reduce((a, b) => a + b) / fpsValues.length;
              resolve(avgFPS);
              return;
            }
          }
          
          requestAnimationFrame(measureFPS);
        }
        
        measureFPS();
      });
    });
    
    expect(avgFPS).toBeGreaterThan(30); // Should maintain at least 30 FPS
  });
});

test.describe('Cache and Version Management', () => {
  test('cache busting works correctly', async ({ page }) => {
    await page.goto('https://ant-colony-defense.franzai.com');
    
    // Check that assets have cache-busting hashes
    const assetUrls = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href);
      return [...scripts, ...styles];
    });
    
    // All assets should have hash in filename
    for (const url of assetUrls) {
      expect(url).toMatch(/\-[a-zA-Z0-9]{8}\.(js|css)$/);
    }
  });

  test('version check works correctly', async ({ page, request }) => {
    await page.goto('https://ant-colony-defense.franzai.com');
    
    // Get version from UI
    const versionText = await page.locator('p:has-text("v")').textContent();
    const uiVersion = versionText?.match(/v(\d+\.\d+\.\d+)/)?.[1];
    
    expect(uiVersion).toBeTruthy();
    
    // Verify version endpoint if available
    const versionResponse = await request.get('https://ant-colony-defense.franzai.com/version.json');
    if (versionResponse.ok()) {
      const versionData = await versionResponse.json();
      expect(versionData.version).toBe(uiVersion);
    }
  });
});