import { chromium } from 'playwright';

async function testDeployed() {
  console.log('🎮 Testing deployed game...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 400, height: 800 }
  });
  
  const page = await context.newPage();
  
  // Monitor console
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Error:', msg.text());
    }
  });
  
  try {
    // Test main site
    console.log('1. Loading ant-colony-defense.franzai.com...');
    await page.goto('https://ant-colony-defense.franzai.com', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'screenshots/test-main-menu.png',
      fullPage: true 
    });
    
    // Check main menu
    const hasTitle = await page.locator('h1:has-text("Ant Colony Defense")').isVisible();
    console.log('   Title visible:', hasTitle);
    
    const hasNewGame = await page.locator('button:has-text("New Game")').isVisible();
    console.log('   New Game button:', hasNewGame);
    
    if (hasNewGame) {
      // Click New Game
      console.log('\n2. Starting new game...');
      await page.click('button:has-text("New Game")');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'screenshots/test-level-select.png',
        fullPage: true 
      });
      
      // Click first level
      const levelCard = await page.locator('.level-card').first();
      if (await levelCard.isVisible()) {
        console.log('   Clicking Level 1...');
        await levelCard.click();
        await page.waitForTimeout(5000);
        
        // Check if game loaded
        const canvas = await page.locator('canvas');
        const canvasVisible = await canvas.isVisible();
        console.log('   Canvas visible:', canvasVisible);
        
        if (canvasVisible) {
          console.log('\n✅ GAME LOADS SUCCESSFULLY!');
          
          await page.screenshot({ 
            path: 'screenshots/test-game-loaded.png',
            fullPage: true 
          });
          
          // Try to interact with game
          console.log('\n3. Testing game interaction...');
          
          // Select a tower
          const towerButton = await page.locator('.tower-selector button').first();
          if (await towerButton.isVisible()) {
            await towerButton.click();
            console.log('   Selected tower');
          }
          
          // Click on canvas to place tower
          const box = await canvas.boundingBox();
          if (box) {
            await page.mouse.click(box.x + box.width/2, box.y + box.height/2);
            console.log('   Clicked to place tower');
            await page.waitForTimeout(1000);
          }
          
          // Start wave
          const startWave = await page.locator('button:has-text("Start Wave")');
          if (await startWave.isVisible()) {
            await startWave.click();
            console.log('   Started wave');
            await page.waitForTimeout(5000);
            
            await page.screenshot({ 
              path: 'screenshots/test-wave-running.png',
              fullPage: true 
            });
          }
          
          // Check game still running
          const stillVisible = await canvas.isVisible();
          console.log('   Game still running:', stillVisible);
          
        } else {
          console.log('\n❌ GAME DID NOT LOAD - Canvas not visible');
        }
      }
    }
    
    console.log('\n='.repeat(50));
    console.log('Test complete. Check screenshots directory.');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await page.waitForTimeout(10000); // Keep open for inspection
    await browser.close();
  }
}

testDeployed();