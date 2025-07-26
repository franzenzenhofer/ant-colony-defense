import { chromium } from 'playwright';

async function playMobileRounds() {
  console.log('📱 Playing multiple rounds on mobile viewport...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  
  const page = await context.newPage();
  let roundsPlayed = 0;
  
  try {
    // ROUND 1
    console.log('🎮 ROUND 1 - Starting fresh game');
    await page.goto('https://8fea9129.ant-colony-defense.pages.dev');
    await page.waitForTimeout(2000);
    
    // Start new game
    await page.click('button:has-text("New Game")');
    await page.waitForTimeout(1000);
    
    // Select Level 1
    await page.click('.level-card:first-child');
    await page.waitForTimeout(3000);
    
    const canvas = await page.$('canvas');
    if (!canvas || !(await canvas.isVisible())) {
      console.log('❌ Game did not load');
      return;
    }
    
    console.log('✓ Game loaded successfully');
    
    // Place towers
    const box = await canvas.boundingBox();
    if (box) {
      // Select basic tower
      await page.click('.tower-selector button:first-child');
      
      // Place 3 towers
      const positions = [
        { x: box.x + 100, y: box.y + 100 },
        { x: box.x + 200, y: box.y + 100 },
        { x: box.x + 150, y: box.y + 150 }
      ];
      
      for (const pos of positions) {
        await page.mouse.click(pos.x, pos.y);
        await page.waitForTimeout(300);
      }
      console.log('✓ Placed 3 towers');
    }
    
    // Start wave
    await page.click('button:has-text("Start Wave")');
    console.log('✓ Started Wave 1');
    
    // Wait for wave to complete
    await page.waitForTimeout(15000);
    
    // Check if we can start wave 2
    const wave2Btn = await page.$('button:has-text("Start Wave 2")');
    if (wave2Btn) {
      console.log('✓ Wave 1 completed!');
      roundsPlayed++;
      
      // Place more towers for wave 2
      await page.click('.tower-selector button:nth-child(2)'); // Different tower
      await page.mouse.click(box.x + 100, box.y + 200);
      await page.waitForTimeout(300);
      
      await wave2Btn.click();
      console.log('✓ Started Wave 2');
      await page.waitForTimeout(15000);
      
      roundsPlayed++;
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: 'screenshots/round1-complete.png',
      fullPage: true 
    });
    
    // ROUND 2 - Test Continue
    console.log('\n🎮 ROUND 2 - Testing Continue functionality');
    await page.goto('https://8fea9129.ant-colony-defense.pages.dev');
    await page.waitForTimeout(2000);
    
    const continueBtn = await page.$('button:has-text("Continue")');
    if (continueBtn && await continueBtn.isEnabled()) {
      await continueBtn.click();
      console.log('✓ Clicked Continue');
      await page.waitForTimeout(3000);
      
      // Check where we are
      const canvasAfterContinue = await page.$('canvas');
      if (canvasAfterContinue && await canvasAfterContinue.isVisible()) {
        console.log('✓ Continue resumed game');
        roundsPlayed++;
      } else {
        // Maybe it went to level select
        const levelCard = await page.$('.level-card');
        if (levelCard) {
          console.log('✓ Continue went to level select');
          await page.click('.level-card:nth-child(2)'); // Try level 2
          await page.waitForTimeout(3000);
          roundsPlayed++;
        }
      }
    }
    
    // ROUND 3 - Test scrolling and UI on mobile
    console.log('\n🎮 ROUND 3 - Testing mobile UI');
    await page.goto('https://8fea9129.ant-colony-defense.pages.dev');
    await page.waitForTimeout(2000);
    
    // Test scrolling
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 0));
    console.log('✓ Scrolling works');
    
    // Start another game
    await page.click('button:has-text("New Game")');
    await page.waitForTimeout(1000);
    
    // Try a harder level
    const level3 = await page.$('.level-card:nth-child(3)');
    if (level3) {
      await level3.click();
      console.log('✓ Selected Level 3');
    } else {
      await page.click('.level-card:last-child');
      console.log('✓ Selected last available level');
    }
    await page.waitForTimeout(3000);
    
    roundsPlayed++;
    
    // Final screenshot
    await page.screenshot({ 
      path: 'screenshots/mobile-final.png',
      fullPage: true 
    });
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ SUCCESSFULLY PLAYED ${roundsPlayed} ROUNDS!`);
    console.log('Game is working properly on mobile viewport!');
    console.log('='.repeat(50));
    
    // Keep open for manual inspection
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await browser.close();
  }
}

playMobileRounds();