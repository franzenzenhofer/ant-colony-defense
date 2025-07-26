import { chromium } from 'playwright';

async function playGameRounds() {
  console.log('🎮 PLAYING ANT COLONY DEFENSE - MULTIPLE ROUNDS');
  console.log('==============================================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1280,800']
  });
  
  const page = await browser.newPage();
  
  // Monitor console for errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console error:', msg.text());
    }
  });
  
  try {
    // ROUND 1: PLAY LEVEL 1
    console.log('🎯 ROUND 1: Starting fresh game...\n');
    
    await page.goto('https://ant-colony-defense.franzai.com');
    await page.waitForTimeout(2000);
    
    // Click New Game
    await page.click('button:has-text("New Game")');
    await page.waitForTimeout(1000);
    
    // Wait for level select and click level 1
    await page.waitForSelector('.level-card', { timeout: 5000 });
    await page.click('.level-card:first-child');
    console.log('✓ Selected Level 1');
    
    // Wait longer for game to load
    await page.waitForTimeout(5000);
    
    // Check what's visible
    const gameElements = {
      canvas: await page.locator('canvas').isVisible(),
      controls: await page.locator('.game-controls').isVisible(),
      resources: await page.locator('.resource-display').isVisible(),
      header: await page.locator('.game-header').isVisible()
    };
    
    console.log('Game elements visible:', gameElements);
    
    if (!gameElements.canvas) {
      // Maybe we're still in level select?
      const stillInLevelSelect = await page.locator('.level-grid').isVisible();
      console.log('Still in level select?', stillInLevelSelect);
      
      // Try clicking the level again
      if (stillInLevelSelect) {
        console.log('Clicking level again...');
        await page.click('.level-card:first-child');
        await page.waitForTimeout(3000);
      }
      
      // Check again
      gameElements.canvas = await page.locator('canvas').isVisible();
    }
    
    if (gameElements.canvas) {
      console.log('\n✅ GAME LOADED! Playing Level 1...\n');
      
      // Select a tower
      const towerButtons = page.locator('.tower-button');
      const towerCount = await towerButtons.count();
      console.log(`Found ${towerCount} tower types`);
      
      if (towerCount > 0) {
        // Select anteater tower (first one)
        await towerButtons.first().click();
        console.log('✓ Selected Anteater tower');
        
        // Place some towers
        const positions = [
          { x: 300, y: 200 },
          { x: 400, y: 300 },
          { x: 300, y: 400 },
          { x: 200, y: 300 }
        ];
        
        for (const pos of positions) {
          await page.click('canvas', { position: pos });
          await page.waitForTimeout(500);
        }
        console.log('✓ Placed 4 towers');
        
        // Look for start wave button
        const startWaveButton = page.locator('button:has-text("Start Wave"), button:has-text("Next Wave")');
        if (await startWaveButton.isVisible()) {
          await startWaveButton.click();
          console.log('✓ Started wave');
          
          // Watch the game for 10 seconds
          console.log('⏱️ Watching wave progress...');
          await page.waitForTimeout(10000);
        }
        
        // Return to menu
        const menuButton = page.locator('button:has-text("Menu")');
        if (await menuButton.isVisible()) {
          await menuButton.click();
          await page.waitForTimeout(2000);
          console.log('✓ Returned to menu');
        }
      }
    } else {
      console.log('❌ GAME CANVAS NOT LOADING!');
      
      // Take a screenshot to see what's happening
      await page.screenshot({ path: 'game-not-loading.png' });
      console.log('📸 Screenshot saved as game-not-loading.png');
    }
    
    // ROUND 2: TRY CONTINUE
    console.log('\n🎯 ROUND 2: Testing Continue functionality...\n');
    
    const continueButton = page.locator('button:has-text("Continue Game")');
    const hasContinue = await continueButton.isVisible();
    
    if (hasContinue) {
      console.log('✓ Continue button found!');
      await continueButton.click();
      await page.waitForTimeout(3000);
      
      const resumedCanvas = await page.locator('canvas').isVisible();
      console.log(`Game resumed: ${resumedCanvas}`);
      
      if (resumedCanvas) {
        console.log('✅ CONTINUE WORKS! Playing resumed game...');
        await page.waitForTimeout(5000);
      }
    } else {
      console.log('❌ Continue button not visible');
      
      // Try New Game again for round 2
      console.log('Starting new game for Round 2...');
      await page.click('button:has-text("New Game")');
      await page.waitForTimeout(1000);
      
      // Try level 2 this time
      const levelCards = page.locator('.level-card');
      const levelCount = await levelCards.count();
      if (levelCount > 1) {
        await levelCards.nth(1).click();
        console.log('✓ Selected Level 2');
      } else {
        await levelCards.first().click();
        console.log('✓ Selected Level 1 again');
      }
      
      await page.waitForTimeout(5000);
    }
    
    // Final check
    console.log('\n📊 FINAL STATUS:');
    const finalCheck = {
      inMenu: await page.locator('.menu-container').isVisible(),
      inGame: await page.locator('canvas').isVisible(),
      inLevelSelect: await page.locator('.level-grid').isVisible()
    };
    
    console.log('Current screen:', finalCheck);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    await page.screenshot({ path: 'error-screenshot.png' });
    console.log('📸 Error screenshot saved');
  } finally {
    console.log('\n🔍 Keeping browser open for inspection...');
    await page.waitForTimeout(15000);
    await browser.close();
  }
}

playGameRounds();