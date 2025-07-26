import { chromium } from 'playwright';

async function testDeployedGame() {
  console.log('🎮 Testing deployed game at ant-colony-defense.franzai.com...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  
  // Monitor console for errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console error:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.log('💥 Page error:', error.message);
  });
  
  try {
    // Test deployed site
    console.log('📍 Loading ant-colony-defense.franzai.com...');
    await page.goto('https://ant-colony-defense.franzai.com', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Take screenshot of main menu
    await page.screenshot({ path: 'screenshots/deployed-main-menu.png' });
    console.log('✓ Main menu loaded');
    
    // Check version
    const versionText = await page.locator('.version-display').textContent();
    console.log('📦 Version:', versionText);
    
    // Test New Game flow
    console.log('\n🎮 Starting New Game...');
    await page.click('button:has-text("New Game")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/deployed-level-select.png' });
    console.log('✓ Level select loaded');
    
    // Select Level 1
    await page.click('.level-card:first-child');
    await page.waitForTimeout(3000);
    
    // Check if game loaded
    const canvasVisible = await page.locator('canvas').isVisible();
    if (canvasVisible) {
      console.log('✅ GAME LOADED SUCCESSFULLY!');
      await page.screenshot({ path: 'screenshots/deployed-game-running.png' });
      
      // Test game interaction
      console.log('\n🎯 Testing game interaction...');
      
      // Place a tower
      const canvas = await page.locator('canvas');
      const box = await canvas.boundingBox();
      if (box) {
        // Click near center to place tower
        await page.mouse.click(box.x + box.width/2, box.y + box.height/2);
        await page.waitForTimeout(1000);
        console.log('✓ Clicked on game board');
      }
      
      // Start wave
      const startButton = page.locator('button:has-text("Start Wave")');
      if (await startButton.isVisible()) {
        await startButton.click();
        console.log('✓ Started wave');
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'screenshots/deployed-wave-active.png' });
      }
      
      // Check game is still running
      const stillVisible = await page.locator('canvas').isVisible();
      console.log('✓ Game still running:', stillVisible);
      
    } else {
      console.log('❌ GAME DID NOT LOAD - Canvas not visible');
      await page.screenshot({ path: 'screenshots/deployed-error-state.png' });
    }
    
    // Test Continue button
    console.log('\n🔄 Testing Continue functionality...');
    await page.goto('https://ant-colony-defense.franzai.com');
    await page.waitForTimeout(2000);
    
    const continueButton = page.locator('button:has-text("Continue")');
    if (await continueButton.isVisible()) {
      await continueButton.click();
      await page.waitForTimeout(2000);
      const afterContinue = await page.locator('canvas').isVisible();
      console.log('✓ Continue button result:', afterContinue ? 'Game loaded' : 'Did not load');
    }
    
    console.log('\n✅ Testing complete!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testDeployedGame();