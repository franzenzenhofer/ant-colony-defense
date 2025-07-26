const { chromium } = require('@playwright/test');

(async () => {
  console.log('🎮 Testing Ant Colony Defense...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Load game
    console.log('Loading game...');
    await page.goto('https://ant-colony-defense.franzai.com');
    await page.waitForTimeout(3000);
    
    // Take screenshot of main menu
    await page.screenshot({ path: 'game-menu.png' });
    console.log('✓ Menu screenshot saved');
    
    // Check if New Game button exists
    const newGame = await page.locator('button:has-text("New Game")').isVisible();
    console.log('New Game button visible:', newGame);
    
    // Check if Continue button exists
    const continueBtn = await page.locator('button:has-text("Continue")').isVisible();
    console.log('Continue button visible:', continueBtn);
    
    // Try to start new game
    if (newGame) {
      await page.click('button:has-text("New Game")');
      await page.waitForTimeout(2000);
      
      // Check if level select appears
      const levelSelect = await page.locator('.level-grid').isVisible();
      console.log('Level select visible:', levelSelect);
      
      if (levelSelect) {
        // Click first level
        await page.locator('.level-card').first().click();
        await page.waitForTimeout(3000);
        
        // Check if game loads
        const canvas = await page.locator('canvas').isVisible();
        console.log('Game canvas visible:', canvas);
        
        await page.screenshot({ path: 'game-play.png' });
        console.log('✓ Gameplay screenshot saved');
      }
    }
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
})();