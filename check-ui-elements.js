import { chromium } from 'playwright';

async function checkUI() {
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 390, height: 844 }
  });
  
  const page = await browser.newPage();
  
  try {
    await page.goto('https://8fea9129.ant-colony-defense.pages.dev');
    await page.waitForTimeout(2000);
    
    await page.click('button:has-text("New Game")');
    await page.waitForTimeout(1000);
    
    await page.click('.level-card:first-child');
    await page.waitForTimeout(3000);
    
    // Check what's visible
    console.log('Canvas visible:', await page.locator('canvas').isVisible());
    console.log('Tower selector visible:', await page.locator('.tower-selector').isVisible());
    console.log('Game header visible:', await page.locator('.game-header').isVisible());
    console.log('Wave controls visible:', await page.locator('.wave-controls').isVisible());
    
    // Count tower buttons
    const towerButtons = await page.$$('.tower-button');
    console.log('Tower buttons found:', towerButtons.length);
    
    // Check for any buttons
    const allButtons = await page.$$('button');
    console.log('\nAll buttons on page:');
    for (const btn of allButtons) {
      const text = await btn.textContent();
      const visible = await btn.isVisible();
      console.log(`- "${text}" (visible: ${visible})`);
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: 'screenshots/ui-check.png',
      fullPage: true 
    });
    
    console.log('\nScreenshot saved to screenshots/ui-check.png');
    
    await page.waitForTimeout(10000);
    
  } finally {
    await browser.close();
  }
}

checkUI();