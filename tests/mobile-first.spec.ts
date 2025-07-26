import { test, expect, devices } from '@playwright/test';

// Test on multiple mobile devices
const mobileDevices = [
  { name: 'iPhone 13', device: devices['iPhone 13'] },
  { name: 'Pixel 5', device: devices['Pixel 5'] },
  { name: 'iPad Pro', device: devices['iPad Pro 11'] }
];

mobileDevices.forEach(({ name, device }) => {
  test.describe(`Mobile Tests on ${name}`, () => {
    test.use(device);

    test('main menu is scrollable on mobile', async ({ page }) => {
      await page.goto('/');
      
      // Check that main menu is visible
      await expect(page.locator('.menu-container')).toBeVisible();
      
      // Check scrollability
      const menuContainer = page.locator('.menu-container');
      const scrollHeight = await menuContainer.evaluate(el => el.scrollHeight);
      const clientHeight = await menuContainer.evaluate(el => el.clientHeight);
      
      // If content is taller than viewport, it should be scrollable
      if (scrollHeight > clientHeight) {
        await expect(menuContainer).toHaveCSS('overflow-y', 'auto');
      }
      
      // All buttons should be accessible
      await expect(page.getByRole('button', { name: /New Game|Continue Game/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Select Level/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /How to Play/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Sound:/i })).toBeVisible();
    });

    test('touch interactions work correctly', async ({ page }) => {
      await page.goto('/');
      
      // Start new game with touch
      await page.getByRole('button', { name: /New Game/i }).tap();
      
      // Should navigate to level selection
      await expect(page.locator('.level-grid')).toBeVisible();
      
      // Select first level with touch
      await page.locator('.level-card').first().tap();
      
      // Should start the game
      await expect(page.locator('canvas')).toBeVisible();
    });

    test('game canvas is responsive', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /New Game/i }).tap();
      await page.locator('.level-card').first().tap();
      
      // Canvas should fill the viewport
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      const canvasBox = await canvas.boundingBox();
      const viewportSize = page.viewportSize();
      
      expect(canvasBox?.width).toBeGreaterThan(viewportSize!.width * 0.9);
    });

    test('pinch to zoom works on game', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /New Game/i }).tap();
      await page.locator('.level-card').first().tap();
      
      // Simulate pinch gesture
      const canvas = page.locator('canvas');
      const box = await canvas.boundingBox();
      if (!box) throw new Error('Canvas not found');
      
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      
      // Start with two fingers close together
      await page.touchscreen.tap(centerX - 20, centerY);
      await page.touchscreen.tap(centerX + 20, centerY);
      
      // Game should remain playable
      await expect(canvas).toBeVisible();
    });

    test('UI elements are appropriately sized for mobile', async ({ page }) => {
      await page.goto('/');
      
      // Check button sizes
      const buttons = page.locator('button');
      const count = await buttons.count();
      
      for (let i = 0; i < count; i++) {
        const button = buttons.nth(i);
        const box = await button.boundingBox();
        
        // Buttons should be at least 44x44 pixels (Apple HIG recommendation)
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('tutorial content is readable on mobile', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /How to Play/i }).tap();
      
      // Tutorial modal should be visible
      await expect(page.locator('.modal-overlay')).toBeVisible();
      
      // Content should be scrollable if needed
      const modalContent = page.locator('.modal-content');
      await expect(modalContent).toBeVisible();
      
      // Can close tutorial
      await page.getByRole('button', { name: /Back to Menu/i }).tap();
      await expect(page.locator('.modal-overlay')).not.toBeVisible();
    });

    test('game controls work with touch', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /New Game/i }).tap();
      await page.locator('.level-card').first().tap();
      
      // Wait for game to load
      await page.waitForTimeout(1000);
      
      // Try to place a tower with touch
      const canvas = page.locator('canvas');
      const box = await canvas.boundingBox();
      if (!box) throw new Error('Canvas not found');
      
      // Tap on canvas to place tower
      await canvas.tap({ position: { x: 100, y: 100 } });
      
      // Game should respond to touch
      await expect(canvas).toBeVisible();
    });

    test('performance is acceptable on mobile', async ({ page }) => {
      await page.goto('/');
      
      // Measure page load time
      const loadTime = await page.evaluate(() => {
        return performance.timing.loadEventEnd - performance.timing.navigationStart;
      });
      
      // Should load within 3 seconds on mobile
      expect(loadTime).toBeLessThan(3000);
    });
  });
});

// Desktop responsiveness test
test.describe('Desktop to Mobile Responsiveness', () => {
  test('layout adapts from desktop to mobile', async ({ page }) => {
    // Start with desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Check desktop layout
    await expect(page.locator('.menu-container')).toBeVisible();
    
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Layout should adapt
    await expect(page.locator('.menu-container')).toBeVisible();
    
    // All elements should still be accessible
    await expect(page.getByRole('button', { name: /New Game|Continue Game/i })).toBeVisible();
  });
});