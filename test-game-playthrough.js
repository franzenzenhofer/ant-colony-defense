import { chromium } from 'playwright';

async function playGameRounds() {
  console.log('🎮 Playing multiple rounds of Ant Colony Defense...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox'],
    viewport: { width: 390, height: 844 } // Mobile viewport
  });
  
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  });
  
  const page = await context.newPage();
  
  // Monitor for errors
  let hasErrors = false;
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console error:', msg.text());
      hasErrors = true;
    }
  });
  
  try {
    // Round 1
    console.log('📱 ROUND 1 - Mobile Viewport Test');
    console.log('Loading game...');
    await page.goto('https://ant-colony-defense.franzai.com', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Check version if available
    const versionElement = await page.$('.version-display');
    if (versionElement) {
      const version = await versionElement.textContent();
      console.log('Version:', version);
    }
    
    // Start new game
    console.log('Starting new game...');
    await page.click('button:has-text("New Game")');
    await page.waitForTimeout(1000);
    
    // Select level 1
    console.log('Selecting Level 1...');
    await page.click('.level-card:first-child');
    await page.waitForTimeout(3000);
    
    // Check if game loaded
    const canvas = await page.locator('canvas');
    if (await canvas.isVisible()) {
      console.log('✅ Game loaded successfully!');
      
      // Take screenshot
      await page.screenshot({ 
        path: 'screenshots/round1-game-loaded.png',
        fullPage: true 
      });
      
      // Try to select a tower
      const towerButtons = await page.$$('.tower-selector button');
      if (towerButtons.length > 0) {
        console.log('Selecting basic tower...');
        await towerButtons[0].click();
        await page.waitForTimeout(500);
        
        // Place tower
        const box = await canvas.boundingBox();
        if (box) {
          // Click multiple positions to place towers
          const positions = [
            { x: box.x + box.width * 0.3, y: box.y + box.height * 0.5 },
            { x: box.x + box.width * 0.7, y: box.y + box.height * 0.5 },
            { x: box.x + box.width * 0.5, y: box.y + box.height * 0.3 }
          ];
          
          for (const pos of positions) {
            await page.mouse.click(pos.x, pos.y);
            await page.waitForTimeout(500);
            console.log(`Placed tower at ${Math.round(pos.x)}, ${Math.round(pos.y)}`);
          }
        }
      }
      
      // Start wave
      const startWaveBtn = await page.$('button:has-text("Start Wave")');
      if (startWaveBtn) {
        console.log('Starting wave...');
        await startWaveBtn.click();
        
        // Watch the wave progress
        await page.waitForTimeout(10000);
        await page.screenshot({ 
          path: 'screenshots/round1-wave-active.png',
          fullPage: true 
        });
        
        // Check game state
        const health = await page.$eval('.resource-item:has-text("♥")', el => el.textContent);
        console.log('Core health:', health);
      }
      
      console.log('✅ Round 1 complete!\n');
      
    } else {
      console.log('❌ Game failed to load - canvas not visible');
      hasErrors = true;
      return;
    }
    
    // Round 2 - Test Continue
    console.log('📱 ROUND 2 - Testing Continue Feature');
    await page.goto('https://ant-colony-defense.franzai.com');
    await page.waitForTimeout(2000);
    
    const continueBtn = await page.$('button:has-text("Continue")');
    if (continueBtn) {
      console.log('Clicking Continue...');
      await continueBtn.click();
      await page.waitForTimeout(3000);
      
      if (await canvas.isVisible()) {
        console.log('✅ Continue worked - game resumed!');
        await page.screenshot({ 
          path: 'screenshots/round2-continued.png',
          fullPage: true 
        });
      } else {
        // Try level select as fallback
        const levelCards = await page.$$('.level-card');
        if (levelCards.length > 0) {
          console.log('Continue went to level select, choosing level 2...');
          if (levelCards[1]) {
            await levelCards[1].click();
          } else {
            await levelCards[0].click();
          }
          await page.waitForTimeout(3000);
        }
      }
    }
    
    // Play another wave
    if (await canvas.isVisible()) {
      console.log('Playing another round...');
      
      // Place more towers
      const box = await canvas.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width * 0.4, box.y + box.height * 0.6);
        await page.waitForTimeout(500);
      }
      
      // Start wave if button available
      const waveBtn = await page.$('button:has-text("Start Wave")');
      if (waveBtn) {
        await waveBtn.click();
        await page.waitForTimeout(8000);
      }
      
      console.log('✅ Round 2 complete!\n');
    }
    
    // Round 3 - Test pause/resume
    console.log('📱 ROUND 3 - Testing Pause/Resume');
    
    // Pause game
    const pauseBtn = await page.$('button[aria-label="Pause"]');
    if (pauseBtn) {
      console.log('Pausing game...');
      await pauseBtn.click();
      await page.waitForTimeout(1000);
      
      // Resume
      const resumeBtn = await page.$('button:has-text("Resume Game")');
      if (resumeBtn) {
        console.log('Resuming game...');
        await resumeBtn.click();
        await page.waitForTimeout(2000);
      }
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: 'screenshots/round3-final-state.png',
      fullPage: true 
    });
    
    console.log('\n' + '='.repeat(50));
    console.log(hasErrors ? '⚠️  GAME HAD ERRORS' : '✅ GAME WORKING PROPERLY');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Keep browser open for manual inspection
    console.log('\nKeeping browser open for 30 seconds...');
    await page.waitForTimeout(30000);
    await browser.close();
  }
}

playGameRounds();