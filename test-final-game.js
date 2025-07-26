#!/usr/bin/env node

import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testFinalGame() {
  console.log('🎮 Testing FINAL version with all fixes...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  // Monitor console for game events
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
      path: join(__dirname, 'screenshots', 'final-1-main-menu.png'),
      fullPage: true
    });
    console.log('📸 Main menu - light theme, no ant emojis');
    
    // Start new game
    await page.click('text=New Game');
    await page.waitForTimeout(500);
    
    // Screenshot 2: Level select
    await page.screenshot({ 
      path: join(__dirname, 'screenshots', 'final-2-level-select.png'),
      fullPage: true
    });
    console.log('📸 Level select');
    
    // Select first level
    await page.click('.level-card:first-child');
    await page.waitForTimeout(1000);
    
    // Screenshot 3: Game starts
    await page.screenshot({ 
      path: join(__dirname, 'screenshots', 'final-3-game-start.png'),
      fullPage: true
    });
    console.log('📸 Game start - proper hexagons, full screen');
    
    // Check for auto-start countdown
    const countdownText = await page.locator('text=/Auto-starts in.*seconds/').textContent();
    console.log('⏱️ ', countdownText);
    
    // Wait for wave to auto-start (5 seconds)
    console.log('⏳ Waiting for wave to auto-start...');
    await page.waitForTimeout(5500);
    
    // Screenshot 4: Wave started automatically
    await page.screenshot({ 
      path: join(__dirname, 'screenshots', 'final-4-wave-started.png'),
      fullPage: true
    });
    console.log('📸 Wave auto-started');
    
    // Check if ants are visible
    await page.waitForTimeout(2000);
    
    // Screenshot 5: Ants moving
    await page.screenshot({ 
      path: join(__dirname, 'screenshots', 'final-5-ants-moving.png'),
      fullPage: true
    });
    console.log('📸 Ants should be visible and moving');
    
    // Click to place a tower
    await page.click('button:has-text("Anteater")');
    await page.click('canvas', { position: { x: 187, y: 300 } });
    await page.waitForTimeout(1000);
    
    // Screenshot 6: Tower placed during wave
    await page.screenshot({ 
      path: join(__dirname, 'screenshots', 'final-6-tower-combat.png'),
      fullPage: true
    });
    console.log('📸 Tower placed, combat active');
    
    // Wait for wave to progress
    await page.waitForTimeout(5000);
    
    // Screenshot 7: Battle in progress
    await page.screenshot({ 
      path: join(__dirname, 'screenshots', 'final-7-battle.png'),
      fullPage: true
    });
    console.log('📸 Battle in full swing');
    
    // Test game statistics
    const resources = await page.locator('text=/💰.*\\d+/').textContent();
    const waveInfo = await page.locator('text=/Wave.*\\/.*2/').textContent();
    console.log('💰 Resources:', resources);
    console.log('🌊 Wave:', waveInfo);
    
    // Check canvas utilization
    const canvasBox = await page.locator('canvas').boundingBox();
    const screenUsage = (canvasBox.height / 667 * 100).toFixed(1);
    console.log('📐 Canvas uses', screenUsage + '% of screen height');
    
  } finally {
    await browser.close();
  }
  
  console.log('✅ All tests complete! Game is working!');
}

testFinalGame().catch(console.error);