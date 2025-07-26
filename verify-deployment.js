import { chromium } from 'playwright';

async function verifyDeployment() {
  console.log('🔍 Verifying deployment...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Capture all console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text()
    });
  });
  
  try {
    // Check main page
    console.log('1. Testing main page load...');
    const response = await page.goto('https://ant-colony-defense.franzai.com', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    console.log('   Status:', response.status());
    
    // Wait a bit for JS to load
    await page.waitForTimeout(3000);
    
    // Check for main elements
    const hasTitle = await page.locator('h1:has-text("Ant Colony Defense")').count();
    console.log('   Has title:', hasTitle > 0);
    
    const hasNewGameButton = await page.locator('button:has-text("New Game")').count();
    console.log('   Has New Game button:', hasNewGameButton > 0);
    
    // Check console errors
    const errors = consoleMessages.filter(m => m.type === 'error');
    if (errors.length > 0) {
      console.log('\n   Console errors found:');
      errors.forEach(e => console.log('   -', e.text));
    }
    
    // Try to click New Game
    console.log('\n2. Testing New Game flow...');
    if (hasNewGameButton > 0) {
      await page.click('button:has-text("New Game")');
      await page.waitForTimeout(2000);
      
      const hasLevelSelect = await page.locator('.level-select').count();
      console.log('   Level select visible:', hasLevelSelect > 0);
      
      if (hasLevelSelect > 0) {
        // Click first level
        await page.click('.level-card:first-child');
        await page.waitForTimeout(3000);
        
        // Check for game canvas
        const hasCanvas = await page.locator('canvas').count();
        console.log('   Canvas element exists:', hasCanvas > 0);
        
        if (hasCanvas > 0) {
          const canvasVisible = await page.locator('canvas').isVisible();
          console.log('   Canvas is visible:', canvasVisible);
          
          // Check canvas size
          const canvasBox = await page.locator('canvas').boundingBox();
          if (canvasBox) {
            console.log('   Canvas dimensions:', canvasBox.width, 'x', canvasBox.height);
          }
        }
        
        // Check for game UI elements
        const hasGameUI = await page.locator('.game-header').count();
        console.log('   Game UI present:', hasGameUI > 0);
      }
    }
    
    // Check asset loading
    console.log('\n3. Checking asset loading...');
    const failedRequests = [];
    page.on('requestfailed', request => {
      failedRequests.push(request.url());
    });
    
    // Reload to capture all requests
    await page.reload();
    await page.waitForTimeout(3000);
    
    if (failedRequests.length > 0) {
      console.log('   Failed requests:');
      failedRequests.forEach(url => console.log('   -', url));
    } else {
      console.log('   All assets loaded successfully');
    }
    
    // Final console error check
    const finalErrors = consoleMessages.filter(m => m.type === 'error');
    console.log('\n4. Final status:');
    console.log('   Total console errors:', finalErrors.length);
    console.log('   Page loaded:', true);
    
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await browser.close();
  }
}

verifyDeployment();