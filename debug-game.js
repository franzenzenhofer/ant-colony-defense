#!/usr/bin/env node

import { chromium } from '@playwright/test';

async function debugGame() {
  console.log('🔍 Debugging Ant Colony Defense...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('No path found') || text.includes('ant') || text.includes('spawn') || text.includes('wave')) {
      console.log('🐜 Console:', text);
    }
  });
  
  page.on('pageerror', err => {
    console.error('❌ Page error:', err);
  });
  
  try {
    // Navigate to game
    await page.goto('https://ant-colony-defense.franzai.com');
    await page.waitForLoadState('networkidle');
    
    // Start new game
    await page.click('text=New Game');
    await page.waitForTimeout(500);
    
    // Select first level
    await page.click('.level-card:first-child');
    await page.waitForTimeout(2000);
    
    // Get canvas info
    const canvasBox = await page.locator('canvas').boundingBox();
    console.log('📐 Canvas dimensions:', canvasBox);
    
    // Try to place a tower properly
    console.log('🏰 Attempting to place tower...');
    
    // First click the tower button
    await page.click('button:has-text("Anteater")');
    await page.waitForTimeout(500);
    
    // Check if button is selected
    const buttonClass = await page.locator('button:has-text("Anteater")').getAttribute('class');
    console.log('🔘 Button class after click:', buttonClass);
    
    // Click on a hex near the core
    const centerX = canvasBox.x + canvasBox.width / 2;
    const centerY = canvasBox.y + canvasBox.height / 2;
    
    console.log(`📍 Clicking at: ${centerX - 50}, ${centerY - 50}`);
    await page.mouse.click(centerX - 50, centerY - 50);
    await page.waitForTimeout(1000);
    
    // Check resources
    const resources = await page.locator('.resource-item').nth(1).textContent();
    console.log('💰 Resources after click:', resources);
    
    // Check wave status
    const waveStatus = await page.locator('text=/Wave.*progress/').textContent().catch(() => 'No wave status');
    console.log('🌊 Wave status:', waveStatus);
    
    // Check ant count
    const antCount = await page.locator('text=/Ants remaining:/').textContent().catch(() => 'No ant count');
    console.log('🐜 Ant count:', antCount);
    
    // Take screenshot
    await page.screenshot({ path: 'debug-game-state.png', fullPage: true });
    console.log('📸 Screenshot saved as debug-game-state.png');
    
    // Wait and check again
    console.log('⏳ Waiting 5 seconds to see if ants spawn...');
    await page.waitForTimeout(5000);
    
    const antCount2 = await page.locator('text=/Ants remaining:/').textContent().catch(() => 'No ant count');
    console.log('🐜 Ant count after wait:', antCount2);
    
    // Check for any visible ants on canvas
    const canvasScreenshot = await page.locator('canvas').screenshot({ path: 'debug-canvas-only.png' });
    console.log('📸 Canvas screenshot saved');
    
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

debugGame().catch(console.error);