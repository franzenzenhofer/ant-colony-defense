import { chromium } from 'playwright';

async function testGameStep() {
  console.log('🎮 Interactive Game Test - Ant Colony Defense');
  console.log('============================================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1280,800']
  });
  
  const page = await browser.newPage();
  let stepNumber = 1;
  
  try {
    // STEP 1: Load the game
    console.log(`\n📍 STEP ${stepNumber++}: Loading game...`);
    await page.goto('https://ant-colony-defense.franzai.com', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.waitForTimeout(2000);
    
    const title = await page.title();
    console.log(`✓ Page loaded: ${title}`);
    
    // Check if menu is visible
    const menuVisible = await page.locator('.menu-container').isVisible();
    console.log(`✓ Menu visible: ${menuVisible}`);
    
    if (!menuVisible) {
      console.log('❌ FAILED: Menu not visible!');
      const pageContent = await page.textContent('body');
      console.log('Page content:', pageContent?.substring(0, 100));
      return;
    }
    
    // STEP 2: Check for Continue button
    console.log(`\n📍 STEP ${stepNumber++}: Checking Continue button...`);
    const continueButton = page.locator('button:has-text("Continue Game")');
    const hasContinue = await continueButton.isVisible();
    console.log(`✓ Continue button exists: ${hasContinue}`);
    
    // STEP 3: Click New Game
    console.log(`\n📍 STEP ${stepNumber++}: Clicking New Game...`);
    const newGameButton = page.locator('button:has-text("New Game")');
    const newGameVisible = await newGameButton.isVisible();
    console.log(`✓ New Game button visible: ${newGameVisible}`);
    
    if (newGameVisible) {
      await newGameButton.click();
      await page.waitForTimeout(1000);
      console.log('✓ Clicked New Game');
    } else {
      console.log('❌ New Game button not found!');
      return;
    }
    
    // STEP 4: Check level select
    console.log(`\n📍 STEP ${stepNumber++}: Checking level selection...`);
    const levelGrid = await page.locator('.level-grid').isVisible();
    console.log(`✓ Level grid visible: ${levelGrid}`);
    
    const levelCount = await page.locator('.level-card').count();
    console.log(`✓ Number of levels: ${levelCount}`);
    
    if (!levelGrid || levelCount === 0) {
      console.log('❌ FAILED: No levels found!');
      return;
    }
    
    // STEP 5: Click first level
    console.log(`\n📍 STEP ${stepNumber++}: Selecting first level...`);
    await page.locator('.level-card').first().click();
    await page.waitForTimeout(2000);
    console.log('✓ Clicked first level');
    
    // STEP 6: Check game loaded
    console.log(`\n📍 STEP ${stepNumber++}: Checking if game loaded...`);
    const canvasVisible = await page.locator('canvas').isVisible();
    const controlsVisible = await page.locator('.game-controls').isVisible();
    
    console.log(`✓ Game canvas visible: ${canvasVisible}`);
    console.log(`✓ Game controls visible: ${controlsVisible}`);
    
    if (!canvasVisible || !controlsVisible) {
      console.log('❌ FAILED: Game did not load properly!');
      
      // Check for errors
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.waitForTimeout(1000);
      if (errors.length > 0) {
        console.log('Console errors:', errors);
      }
      return;
    }
    
    // STEP 7: Try to select a tower
    console.log(`\n📍 STEP ${stepNumber++}: Selecting a tower...`);
    const towerButtons = await page.locator('.tower-button').count();
    console.log(`✓ Tower buttons found: ${towerButtons}`);
    
    if (towerButtons > 0) {
      await page.locator('.tower-button').first().click();
      console.log('✓ Selected first tower');
    }
    
    // STEP 8: Try to place tower
    console.log(`\n📍 STEP ${stepNumber++}: Placing tower on game board...`);
    await page.locator('canvas').click({ position: { x: 400, y: 300 } });
    await page.waitForTimeout(1000);
    console.log('✓ Clicked on canvas to place tower');
    
    // STEP 9: Check Menu button
    console.log(`\n📍 STEP ${stepNumber++}: Testing Menu button...`);
    const menuButton = page.locator('button:has-text("Menu")');
    const menuButtonVisible = await menuButton.isVisible();
    console.log(`✓ Menu button visible: ${menuButtonVisible}`);
    
    if (menuButtonVisible) {
      await menuButton.click();
      await page.waitForTimeout(1000);
      console.log('✓ Returned to menu');
      
      // STEP 10: Check if Continue appears now
      console.log(`\n📍 STEP ${stepNumber++}: Checking if Continue button appears after playing...`);
      const hasContinueNow = await continueButton.isVisible();
      console.log(`✓ Continue button now visible: ${hasContinueNow}`);
      
      if (hasContinueNow) {
        console.log(`\n📍 STEP ${stepNumber++}: Testing Continue functionality...`);
        await continueButton.click();
        await page.waitForTimeout(2000);
        
        const resumedGame = await page.locator('canvas').isVisible();
        console.log(`✓ Game resumed successfully: ${resumedGame}`);
      } else {
        console.log('⚠️ Continue button still not working!');
      }
    }
    
    console.log('\n✅ TEST COMPLETE!\n');
    console.log('Summary:');
    console.log('- Game loads: ✓');
    console.log('- Menu works: ✓');
    console.log('- Level selection: ✓');
    console.log(`- Game playable: ${canvasVisible ? '✓' : '✗'}`);
    console.log(`- Continue button: ${hasContinueNow ? '✓' : '✗'}`);
    
  } catch (error) {
    console.error(`\n❌ ERROR at step ${stepNumber}:`, error.message);
  } finally {
    console.log('\n🔍 Keeping browser open for 10 seconds...');
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

testGameStep();