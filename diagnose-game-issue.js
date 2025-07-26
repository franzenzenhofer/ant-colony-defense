import { chromium } from 'playwright';

async function diagnoseGame() {
  console.log('🔍 DIAGNOSING ANT COLONY DEFENSE ISSUES');
  console.log('======================================\n');
  
  const browser = await chromium.launch({ 
    headless: true // Run headless for cleaner output
  });
  
  const page = await browser.newPage();
  const errors = [];
  const warnings = [];
  const logs = [];
  
  // Capture ALL console messages
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    
    if (type === 'error') {
      errors.push(text);
      console.log('❌ ERROR:', text);
    } else if (type === 'warning') {
      warnings.push(text);
      console.log('⚠️  WARNING:', text);
    } else if (type === 'log') {
      logs.push(text);
    }
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    console.log('💥 PAGE ERROR:', error.message);
    errors.push('PAGE ERROR: ' + error.message);
  });
  
  try {
    console.log('1️⃣ Loading game homepage...\n');
    await page.goto('https://ant-colony-defense.franzai.com', {
      waitUntil: 'networkidle'
    });
    
    // Check what loaded
    const pageTitle = await page.title();
    console.log('✓ Page title:', pageTitle);
    
    // Check if React loaded
    const hasReactRoot = await page.evaluate(() => {
      return !!document.getElementById('root');
    });
    console.log('✓ React root element:', hasReactRoot);
    
    // Check if any content rendered
    const bodyContent = await page.evaluate(() => {
      const root = document.getElementById('root');
      return {
        rootHTML: root ? root.innerHTML.substring(0, 100) : 'No root',
        rootChildren: root ? root.children.length : 0,
        bodyClasses: document.body.className
      };
    });
    console.log('✓ Root content:', bodyContent);
    
    console.log('\n2️⃣ Attempting to start game...\n');
    
    // Try to click New Game
    try {
      await page.click('button:has-text("New Game")', { timeout: 5000 });
      console.log('✓ Clicked New Game');
    } catch (e) {
      console.log('❌ Could not find New Game button');
      console.log('   Available buttons:', await page.locator('button').allTextContents());
    }
    
    await page.waitForTimeout(2000);
    
    // Check if level select appeared
    const hasLevelSelect = await page.locator('.level-grid').isVisible();
    console.log('✓ Level select visible:', hasLevelSelect);
    
    if (hasLevelSelect) {
      console.log('\n3️⃣ Selecting level...\n');
      await page.click('.level-card:first-child');
      console.log('✓ Clicked first level');
      
      await page.waitForTimeout(3000);
      
      // Check what's visible now
      const gameState = await page.evaluate(() => {
        return {
          canvas: !!document.querySelector('canvas'),
          gameContainer: !!document.querySelector('.game-container'),
          gameScreen: !!document.querySelector('.game-screen'),
          controls: !!document.querySelector('.game-controls'),
          rootContent: document.getElementById('root')?.innerHTML.substring(0, 200)
        };
      });
      
      console.log('\n📊 Game state after level select:');
      console.log(gameState);
    }
    
    console.log('\n🔍 SUMMARY:');
    console.log(`- Errors: ${errors.length}`);
    console.log(`- Warnings: ${warnings.length}`);
    console.log(`- Logs: ${logs.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ ALL ERRORS:');
      errors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
    }
    
    // Check network requests
    const failedRequests = [];
    page.on('requestfailed', request => {
      failedRequests.push(request.url());
    });
    
    // Save page source
    const pageSource = await page.content();
    await require('fs').promises.writeFile('page-source.html', pageSource);
    console.log('\n📄 Page source saved to page-source.html');
    
  } catch (error) {
    console.error('\n💥 DIAGNOSTIC ERROR:', error.message);
  } finally {
    await browser.close();
  }
}

diagnoseGame();