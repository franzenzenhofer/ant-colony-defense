import { chromium } from 'playwright';

async function testLatest() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[${msg.type()}]`, msg.text());
  });
  
  page.on('pageerror', error => {
    console.log('[ERROR]', error.message);
  });
  
  try {
    // Test latest deployment directly
    console.log('Testing latest deployment...');
    await page.goto('https://b22343ef.ant-colony-defense.pages.dev', { 
      waitUntil: 'networkidle' 
    });
    
    await page.waitForTimeout(3000);
    
    // Click New Game
    const newGame = await page.$('button:has-text("New Game")');
    if (newGame) {
      await newGame.click();
      await page.waitForTimeout(2000);
      
      // Click level
      const level = await page.$('.level-card');
      if (level) {
        await level.click();
        await page.waitForTimeout(5000);
        
        // Check canvas
        const canvas = await page.$('canvas');
        const visible = canvas ? await canvas.isVisible() : false;
        console.log('\nCANVAS VISIBLE:', visible);
        
        if (visible) {
          console.log('✅ GAME LOADS WITH UNMINIFIED BUILD!');
          
          // Try placing tower
          const box = await canvas.boundingBox();
          if (box) {
            await page.mouse.click(box.x + 100, box.y + 100);
            console.log('Clicked to place tower');
            await page.waitForTimeout(2000);
          }
        }
      }
    }
    
    await page.waitForTimeout(10000);
    
  } finally {
    await browser.close();
  }
}

testLatest();