import { chromium } from 'playwright';

async function testLocalGame() {
  console.log('🔍 Testing local development server...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console error:', msg.text());
      // Get stack trace
      msg.args().forEach(async (arg, i) => {
        try {
          const val = await arg.jsonValue();
          console.log(`   Arg ${i}:`, val);
        } catch (e) {}
      });
    }
  });
  
  page.on('pageerror', error => {
    console.log('💥 Page error:', error.message);
    console.log('   Stack:', error.stack);
  });
  
  try {
    await page.goto('http://localhost:5174');
    console.log('✓ Loaded local dev server');
    
    await page.waitForTimeout(2000);
    
    // Click New Game
    await page.click('button:has-text("New Game")');
    console.log('✓ Clicked New Game');
    
    await page.waitForTimeout(1000);
    
    // Click first level
    await page.click('.level-card:first-child');
    console.log('✓ Clicked level 1');
    
    // Wait to see the error
    await page.waitForTimeout(5000);
    
    // Check game state
    const gameVisible = await page.locator('canvas').isVisible();
    console.log('Game canvas visible:', gameVisible);
    
    // Keep open to see error
    await page.waitForTimeout(30000);
    
  } finally {
    await browser.close();
  }
}

testLocalGame();