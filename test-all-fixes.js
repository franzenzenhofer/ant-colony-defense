#!/usr/bin/env node

import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testAllFixes() {
  console.log('🎮 Testing all fixes on mobile...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  // Monitor console for errors and game state
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('❌ Console error:', msg.text());
    }
  });
  
  try {
    // Navigate to live site
    await page.goto('https://ant-colony-defense.franzai.com');
    await page.waitForLoadState('networkidle');
    
    // Screenshot 1: Main menu
    await page.screenshot({ 
      path: join(__dirname, 'screenshots', 'fix-1-main-menu.png'),
      fullPage: true
    });
    console.log('📸 Main menu - checking light theme and no ant emojis');
    
    // Start new game
    await page.click('text=New Game');
    await page.waitForTimeout(500);
    
    // Screenshot 2: Level select
    await page.screenshot({ 
      path: join(__dirname, 'screenshots', 'fix-2-level-select.png'),
      fullPage: true
    });
    console.log('📸 Level select');
    
    // Select first level
    await page.click('.level-card:first-child');
    await page.waitForTimeout(1000);
    
    // Screenshot 3: Game board before wave
    await page.screenshot({ 
      path: join(__dirname, 'screenshots', 'fix-3-game-board.png'),
      fullPage: true
    });
    console.log('📸 Game board - checking hexagons and full screen canvas');
    
    // Check canvas dimensions
    const canvasBox = await page.locator('canvas').boundingBox();
    console.log('📐 Canvas dimensions:', canvasBox);
    console.log('✅ Canvas height ratio:', (canvasBox.height / 667 * 100).toFixed(1) + '%');
    
    // Place a tower
    await page.click('button:has-text("Anteater")');
    await page.waitForTimeout(500);
    
    // Click on a hex near the core
    await page.click('canvas', { position: { x: 187, y: 250 } });
    await page.waitForTimeout(500);
    
    // Screenshot 4: After placing tower
    await page.screenshot({ 
      path: join(__dirname, 'screenshots', 'fix-4-tower-placed.png'),
      fullPage: true
    });
    console.log('📸 Tower placed');
    
    // Start wave
    await page.click('button:has-text("Start Wave")');
    await page.waitForTimeout(2000);
    
    // Screenshot 5: During wave with ants
    await page.screenshot({ 
      path: join(__dirname, 'screenshots', 'fix-5-wave-active.png'),
      fullPage: true
    });
    console.log('📸 Wave active - checking if ants are visible');
    
    // Check if tower controls are still visible
    const towerButtonsVisible = await page.locator('button:has-text("Pesticide")').isVisible();
    console.log('🎮 Tower controls visible during wave:', towerButtonsVisible);
    
    // Wait for more action
    await page.waitForTimeout(3000);
    
    // Screenshot 6: Mid-battle
    await page.screenshot({ 
      path: join(__dirname, 'screenshots', 'fix-6-mid-battle.png'),
      fullPage: true
    });
    console.log('📸 Mid-battle');
    
    // Check game state
    const waveText = await page.locator('text=/Wave.*\\/.*2/').textContent();
    console.log('🌊 Wave status:', waveText);
    
    // Test responsiveness - rotate to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(500);
    
    // Screenshot 7: Landscape mode
    await page.screenshot({ 
      path: join(__dirname, 'screenshots', 'fix-7-landscape.png'),
      fullPage: true
    });
    console.log('📸 Landscape mode');
    
  } finally {
    await browser.close();
  }
  
  console.log('✅ All fixes tested!');
}

testAllFixes().catch(console.error);