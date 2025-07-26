import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  try {
    // Load the game
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
    
    // Take main menu screenshot
    await page.waitForSelector('.menu-container', { timeout: 5000 });
    await page.screenshot({ path: 'screenshots/main-menu.png' });
    console.log('✓ Main menu screenshot captured');
    
    // Click How to Play
    await page.click('button:has-text("How to Play")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/how-to-play.png' });
    console.log('✓ How to Play screenshot captured');
    
    // Go back to menu
    await page.click('button:has-text("Back to Menu")');
    await page.waitForTimeout(500);
    
    // Go to level selection
    await page.click('button:has-text("Select Level")');
    await page.waitForSelector('.level-select-container', { timeout: 5000 });
    await page.screenshot({ path: 'screenshots/level-select.png' });
    console.log('✓ Level selection screenshot captured');
    
    // Start first level
    await page.click('.level-card:not(.locked)');
    await page.waitForSelector('.game-container', { timeout: 5000 });
    await page.waitForTimeout(1000); // Let game render
    await page.screenshot({ path: 'screenshots/gameplay.png' });
    console.log('✓ Gameplay screenshot captured');
    
    // Select a tower
    await page.click('.tower-button');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/tower-selected.png' });
    console.log('✓ Tower selection screenshot captured');
    
    // Click on canvas to place tower
    const canvas = await page.locator('canvas');
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'screenshots/tower-placed.png' });
      console.log('✓ Tower placed screenshot captured');
    }
    
    // Start wave
    await page.click('button:has-text("Start Wave")');
    await page.waitForTimeout(2000); // Let wave start
    await page.screenshot({ path: 'screenshots/wave-active.png' });
    console.log('✓ Wave active screenshot captured');
    
    // Test responsive design
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/tablet-view.png' });
    console.log('✓ Tablet view screenshot captured');
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/mobile-view.png' });
    console.log('✓ Mobile view screenshot captured');
    
    console.log('\n✅ All screenshots captured successfully!');
    
  } catch (error) {
    console.error('Error capturing screenshots:', error);
    // Take error screenshot
    await page.screenshot({ path: 'screenshots/error-state.png' });
  } finally {
    await browser.close();
  }
})();