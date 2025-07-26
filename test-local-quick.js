import { chromium } from 'playwright';

async function testLocal() {
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 400, height: 800 }
  });
  
  const page = await browser.newPage();
  
  // Monitor errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  try {
    // Test local dev server
    console.log('Testing local dev server...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Click new game
    await page.click('button:has-text("New Game")');
    await page.waitForTimeout(1000);
    
    // Click level 1
    const levelCard = await page.$('.level-card');
    if (levelCard) {
      await levelCard.click();
      console.log('Clicked level 1');
      await page.waitForTimeout(5000);
      
      // Check if game loaded
      const canvas = await page.$('canvas');
      const gameVisible = canvas ? await canvas.isVisible() : false;
      console.log('Game canvas visible:', gameVisible);
      
      if (gameVisible) {
        console.log('✅ GAME WORKS LOCALLY!');
        
        // Try placing a tower
        const box = await canvas.boundingBox();
        if (box) {
          await page.mouse.click(box.x + 100, box.y + 100);
          console.log('Clicked to place tower');
        }
      } else {
        console.log('❌ GAME NOT VISIBLE');
      }
    }
    
    await page.waitForTimeout(10000);
    
  } finally {
    await browser.close();
  }
}

testLocal();