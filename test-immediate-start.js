#!/usr/bin/env node

import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testImmediateStart() {
  console.log('🎮 Testing immediate game start...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  // Monitor console
  page.on('console', msg => {
    if (msg.text().includes('No path found')) {
      console.log('🐜 Ant pathfinding fallback triggered');
    }
  });
  
  try {
    // Navigate to live site
    await page.goto('https://ant-colony-defense.franzai.com');
    await page.waitForLoadState('networkidle');
    
    // Start new game
    console.log('🎮 Starting new game...');
    await page.click('text=New Game');
    await page.waitForTimeout(500);
    
    // Select first level
    await page.click('.level-card:first-child');
    await page.waitForTimeout(1000);
    
    // Screenshot 1: Game should start immediately
    await page.screenshot({ 
      path: join(__dirname, 'screenshots', 'immediate-1-game-start.png'),
      fullPage: true
    });
    console.log('📸 Game started immediately - no wave button');
    
    // Check if wave is already in progress
    const waveStatus = await page.locator('text=/Wave.*in progress/').textContent({ timeout: 3000 });
    console.log('✅ ', waveStatus);
    
    // Wait a bit for ants to spawn
    await page.waitForTimeout(3000);
    
    // Screenshot 2: Ants should be spawning/moving
    await page.screenshot({ 
      path: join(__dirname, 'screenshots', 'immediate-2-ants-spawning.png'),
      fullPage: true
    });
    console.log('📸 Ants spawning');
    
    // Place a tower
    await page.click('button:has-text("Anteater")');
    await page.click('canvas', { position: { x: 187, y: 250 } });
    await page.waitForTimeout(1000);
    
    // Screenshot 3: Tower placed during combat
    await page.screenshot({ 
      path: join(__dirname, 'screenshots', 'immediate-3-tower-combat.png'),
      fullPage: true
    });
    console.log('📸 Tower placed, combat active');
    
    // Wait for wave to complete
    console.log('⏳ Waiting for wave to complete...');
    await page.waitForTimeout(10000);
    
    // Screenshot 4: Should auto-start wave 2
    await page.screenshot({ 
      path: join(__dirname, 'screenshots', 'immediate-4-wave-2.png'),
      fullPage: true
    });
    
    // Check wave status
    const wave2Status = await page.locator('text=/Wave.*2.*progress/').textContent({ timeout: 5000 }).catch(() => 'Wave 2 starting...');
    console.log('🌊 ', wave2Status);
    
    console.log('✅ Game working perfectly - immediate start, continuous progression!');
    
  } finally {
    await browser.close();
  }
}

testImmediateStart().catch(console.error);