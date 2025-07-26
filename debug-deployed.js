import { chromium } from 'playwright';

async function debugDeployed() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Capture ALL console messages
  const messages = [];
  page.on('console', msg => {
    messages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error);
  });
  
  try {
    console.log('Loading site...');
    await page.goto('https://ant-colony-defense.franzai.com');
    await page.waitForTimeout(3000);
    
    // Click through to game
    await page.click('button:has-text("New Game")');
    await page.waitForTimeout(1000);
    
    await page.click('.level-card:first-child');
    await page.waitForTimeout(3000);
    
    // Check what happened
    console.log('\nConsole messages:');
    messages.forEach((msg, i) => {
      console.log(`${i + 1}. [${msg.type}] ${msg.text}`);
      if (msg.location?.url) {
        console.log(`   at ${msg.location.url}:${msg.location.lineNumber}`);
      }
    });
    
    // Check page content
    const bodyText = await page.textContent('body');
    console.log('\nPage contains:', bodyText.substring(0, 200) + '...');
    
    // Check for error elements
    const errorElements = await page.$$('.error, .exception, [data-error]');
    console.log('\nError elements found:', errorElements.length);
    
  } finally {
    await browser.close();
  }
}

debugDeployed();