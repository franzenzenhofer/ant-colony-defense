#!/usr/bin/env node

import { chromium } from 'playwright';

async function testGame() {
  console.log('🎮 Testing Ant Colony Defense Game Functionality...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Test 1: Load the game
    console.log('\n📱 Test 1: Loading game...');
    await page.goto('https://ant-colony-defense.franzai.com', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Check if menu container is visible
    const menuVisible = await page.locator('.menu-container').isVisible().catch(() => false);
    console.log(`✓ Menu visible: ${menuVisible}`);
    
    if (!menuVisible) {
      console.log('❌ ERROR: Menu container not found!');
      const content = await page.content();
      console.log('Page content length:', content.length);
      console.log('Title:', await page.title());
      
      // Check for any error messages
      const bodyText = await page.textContent('body');
      console.log('Body text:', bodyText?.substring(0, 200));
      return;
    }
    
    // Test 2: Check Continue button
    console.log('\n📱 Test 2: Testing Continue button...');
    const continueButton = page.locator('button:has-text("Continue Game")');
    const hasContinue = await continueButton.isVisible().catch(() => false);
    console.log(`✓ Continue button visible: ${hasContinue}`);
    
    // Test 3: Start a new game
    console.log('\n📱 Test 3: Starting new game...');
    const newGameButton = page.locator('button:has-text("New Game")');
    await newGameButton.click();
    await page.waitForTimeout(1000);
    
    // Check if level select is visible
    const levelGrid = await page.locator('.level-grid').isVisible().catch(() => false);
    console.log(`✓ Level select visible: ${levelGrid}`);
    
    if (!levelGrid) {
      console.log('❌ ERROR: Level selection not appearing!');
      return;
    }
    
    // Test 4: Select first level
    console.log('\n📱 Test 4: Selecting first level...');
    const firstLevel = page.locator('.level-card').first();
    await firstLevel.click();
    await page.waitForTimeout(2000);
    
    // Check if game canvas loaded
    const canvas = await page.locator('canvas').isVisible().catch(() => false);
    console.log(`✓ Game canvas visible: ${canvas}`);
    
    // Check if game controls loaded
    const controls = await page.locator('.game-controls').isVisible().catch(() => false);
    console.log(`✓ Game controls visible: ${controls}`);
    
    if (!canvas || !controls) {
      console.log('❌ ERROR: Game not loading properly!');
      
      // Log any console errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log('Console error:', msg.text());
        }
      });
      
      return;
    }
    
    // Test 5: Try to place a tower
    console.log('\n📱 Test 5: Testing tower placement...');
    const towerButton = page.locator('.tower-button').first();
    await towerButton.click();
    console.log('✓ Tower selected');
    
    // Click on canvas to place tower
    await page.locator('canvas').click({ position: { x: 300, y: 300 } });
    console.log('✓ Clicked on canvas to place tower');
    
    // Test 6: Return to menu
    console.log('\n📱 Test 6: Returning to menu...');
    const menuButton = page.locator('button:has-text("Menu")');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(1000);
      
      // Check if Continue button now appears
      const hasContinueNow = await continueButton.isVisible().catch(() => false);
      console.log(`✓ Continue button after playing: ${hasContinueNow}`);
      
      if (hasContinueNow) {
        console.log('\n📱 Test 7: Testing Continue functionality...');
        await continueButton.click();
        await page.waitForTimeout(2000);
        
        const canvasAfterContinue = await page.locator('canvas').isVisible().catch(() => false);
        console.log(`✓ Game resumed: ${canvasAfterContinue}`);
      }
    }
    
    console.log('\n✅ Game functionality test complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await page.waitForTimeout(5000); // Keep browser open to see results
    await browser.close();
  }
}

testGame();