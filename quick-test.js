import { chromium } from 'playwright';

async function quickTest() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[${msg.type()}]`, msg.text());
  });
  
  page.on('pageerror', error => {
    console.log('[ERROR]', error.message);
  });
  
  try {
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(3000);
    
    const title = await page.textContent('h1');
    console.log('Title:', title);
    
    const hasNewGame = await page.$('button:has-text("New Game")');
    console.log('Has New Game:', !!hasNewGame);
    
    if (hasNewGame) {
      await hasNewGame.click();
      await page.waitForTimeout(2000);
      
      const hasLevelCard = await page.$('.level-card');
      console.log('Has Level Card:', !!hasLevelCard);
      
      if (hasLevelCard) {
        await hasLevelCard.click();
        await page.waitForTimeout(3000);
        
        const hasCanvas = await page.$('canvas');
        console.log('Has Canvas:', !!hasCanvas);
        
        if (hasCanvas) {
          const visible = await hasCanvas.isVisible();
          console.log('Canvas Visible:', visible);
        }
      }
    }
    
  } finally {
    await browser.close();
  }
}

quickTest();