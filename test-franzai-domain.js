import { chromium } from 'playwright';

async function testFranzaiDomain() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Testing franzai.com domain...\n');
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  try {
    await page.goto('https://ant-colony-defense.franzai.com');
    await page.waitForTimeout(3000);
    
    console.log('Page loaded');
    
    // Check version
    const scripts = await page.$$eval('script', scripts => 
      scripts.map(s => s.src).filter(src => src.includes('assets'))
    );
    console.log('Script versions:', scripts);
    
    // Try to play
    await page.click('button:has-text("New Game")');
    await page.waitForTimeout(1000);
    
    await page.click('.level-card:first-child');
    await page.waitForTimeout(5000);
    
    // Check if canvas is visible
    const canvasVisible = await page.locator('canvas').isVisible();
    console.log('Canvas visible:', canvasVisible);
    
    if (!canvasVisible) {
      console.log('FRANZAI.COM IS STILL BROKEN!');
      
      // Take screenshot
      await page.screenshot({ 
        path: 'screenshots/franzai-broken.png',
        fullPage: true 
      });
    }
    
    await page.waitForTimeout(10000);
    
  } finally {
    await browser.close();
  }
}

testFranzaiDomain();