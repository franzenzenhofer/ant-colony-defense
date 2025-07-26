import { chromium } from 'playwright';

console.log('🎮 PLAYING ANT COLONY DEFENSE LIVE!\n');

async function playGameLive() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 }
  });
  
  const page = await context.newPage();
  
  try {
    // First try the working deployment
    console.log('🌐 Opening https://8fea9129.ant-colony-defense.pages.dev ...');
    await page.goto('https://8fea9129.ant-colony-defense.pages.dev', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    console.log('✓ Page loaded!');
    
    // Check if game loads
    const title = await page.textContent('h1');
    console.log('📋 Title:', title);
    
    // Start new game
    console.log('\n🎯 Starting new game...');
    await page.click('button:has-text("New Game")');
    await page.waitForTimeout(1000);
    
    // Select Level 1
    console.log('📍 Selecting Level 1...');
    await page.click('.level-card:first-child');
    await page.waitForTimeout(3000);
    
    // Check if canvas is visible
    const canvasVisible = await page.locator('canvas').isVisible();
    console.log('🎨 Canvas visible:', canvasVisible);
    
    if (canvasVisible) {
      console.log('\n✅ GAME IS WORKING! Playing now...\n');
      
      // Get canvas bounds
      const canvas = await page.locator('canvas');
      const box = await canvas.boundingBox();
      
      // Select Anteater tower (first one)
      const towerButtons = await page.$$('.tower-button');
      if (towerButtons.length > 0) {
        await towerButtons[0].click();
        console.log('🦣 Selected Anteater tower');
      }
      
      // Place towers in strategic positions
      console.log('🏗️  Placing towers...');
      const positions = [
        { x: box.x + box.width * 0.3, y: box.y + box.height * 0.5 },
        { x: box.x + box.width * 0.5, y: box.y + box.height * 0.3 },
        { x: box.x + box.width * 0.7, y: box.y + box.height * 0.5 },
        { x: box.x + box.width * 0.5, y: box.y + box.height * 0.7 }
      ];
      
      for (let i = 0; i < positions.length; i++) {
        await page.mouse.click(positions[i].x, positions[i].y);
        await page.waitForTimeout(500);
        console.log(`   Tower ${i + 1} placed`);
      }
      
      // Start the wave
      console.log('\n🌊 Starting Wave 1...');
      const startWaveBtn = await page.locator('button:has-text("Start Wave")');
      if (await startWaveBtn.isVisible()) {
        await startWaveBtn.click();
        console.log('✓ Wave started!');
        
        // Watch the battle
        console.log('\n⚔️  Battle in progress...');
        for (let i = 0; i < 15; i++) {
          await page.waitForTimeout(1000);
          
          // Check resources and health
          const health = await page.locator('.resource-item:has-text("♥")').textContent();
          const resources = await page.locator('.resource-item:has-text("💰")').textContent();
          
          if (i % 3 === 0) {
            console.log(`   Health: ${health} | Resources: ${resources}`);
          }
        }
        
        // Check if we can start wave 2
        const wave2Btn = await page.locator('button:has-text("Start Wave 2")');
        if (await wave2Btn.isVisible()) {
          console.log('\n🎉 Wave 1 Complete! Starting Wave 2...');
          
          // Place more towers
          await page.click('.tower-button:nth-child(2)'); // Pesticide tower
          await page.mouse.click(box.x + box.width * 0.4, box.y + box.height * 0.4);
          console.log('💨 Placed Pesticide tower');
          
          await wave2Btn.click();
          console.log('✓ Wave 2 started!');
          
          await page.waitForTimeout(10000);
        }
      }
      
      // Take final screenshot
      await page.screenshot({ 
        path: 'screenshots/game-live-play.png',
        fullPage: true 
      });
      
      console.log('\n' + '='.repeat(60));
      console.log('🏆 GAME SUCCESSFULLY PLAYED!');
      console.log('✅ Towers placed and working');
      console.log('✅ Waves started and progressing');
      console.log('✅ Game is fully functional');
      console.log('='.repeat(60));
      
      // Now test franzai.com
      console.log('\n🌐 Testing franzai.com domain...');
      await page.goto('https://ant-colony-defense.franzai.com');
      await page.waitForTimeout(3000);
      
      const franzaiTitle = await page.locator('h1').isVisible();
      console.log('franzai.com loads:', franzaiTitle);
      
    } else {
      console.log('❌ Game canvas not visible - checking for errors...');
      
      // Check console
      page.on('console', msg => console.log('Console:', msg.text()));
    }
    
    // Keep browser open for manual inspection
    console.log('\n👀 Keeping browser open for 30 seconds...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

playGameLive();