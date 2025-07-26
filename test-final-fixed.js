import { chromium } from 'playwright';

async function testFinalFixed() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 400, height: 800 }
  });
  
  const page = await context.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('❌ Error:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log('💥 Page error:', error.message);
  });
  
  try {
    // Test latest deployment
    console.log('🎮 Testing latest deployment...');
    await page.goto('https://8fea9129.ant-colony-defense.pages.dev', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    
    await page.waitForTimeout(3000);
    console.log('✓ Page loaded');
    
    // Click New Game
    await page.click('button:has-text("New Game")');
    console.log('✓ Clicked New Game');
    await page.waitForTimeout(2000);
    
    // Click Level 1
    await page.click('.level-card:first-child');
    console.log('✓ Clicked Level 1');
    await page.waitForTimeout(5000);
    
    // Check if game loaded
    const canvas = await page.$('canvas');
    const canvasVisible = canvas ? await canvas.isVisible() : false;
    
    if (canvasVisible) {
      console.log('\n🎉 SUCCESS! GAME LOADS AND DISPLAYS!');
      
      // Take screenshot
      await page.screenshot({ 
        path: 'screenshots/game-working.png',
        fullPage: true 
      });
      
      // Try to interact
      console.log('\n🎮 Testing game interaction...');
      
      // Select first tower
      const towerBtn = await page.$('.tower-selector button');
      if (towerBtn) {
        await towerBtn.click();
        console.log('✓ Selected tower');
      }
      
      // Click on canvas to place tower
      const box = await canvas.boundingBox();
      if (box) {
        // Try placing multiple towers
        const positions = [
          { x: box.x + box.width * 0.3, y: box.y + box.height * 0.5 },
          { x: box.x + box.width * 0.7, y: box.y + box.height * 0.5 },
          { x: box.x + box.width * 0.5, y: box.y + box.height * 0.3 }
        ];
        
        for (const pos of positions) {
          await page.mouse.click(pos.x, pos.y);
          await page.waitForTimeout(500);
          console.log(`✓ Placed tower at ${Math.round(pos.x - box.x)}, ${Math.round(pos.y - box.y)}`);
        }
      }
      
      // Start wave
      const startWave = await page.$('button:has-text("Start Wave")');
      if (startWave) {
        await startWave.click();
        console.log('✓ Started wave');
        
        // Watch the wave
        await page.waitForTimeout(10000);
        
        // Take screenshot during wave
        await page.screenshot({ 
          path: 'screenshots/wave-active.png',
          fullPage: true 
        });
        
        console.log('✓ Wave running');
      }
      
      // Check final state
      const stillVisible = await canvas.isVisible();
      console.log('\n✅ Game still running:', stillVisible);
      console.log('Total errors:', errors.length);
      
    } else {
      console.log('\n❌ GAME DID NOT LOAD');
      console.log('Canvas visible:', canvasVisible);
      console.log('Errors:', errors);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(canvasVisible ? '✅ GAME IS WORKING!' : '❌ GAME STILL BROKEN');
    console.log('='.repeat(50));
    
    // Keep open for manual testing
    await page.waitForTimeout(20000);
    
  } finally {
    await browser.close();
  }
}

testFinalFixed();