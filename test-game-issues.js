#!/usr/bin/env node

import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testGameIssues() {
  console.log('🔍 Testing game issues on mobile...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  // Monitor console errors
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
      path: join(__dirname, 'screenshots', 'issue-1-main-menu.png'),
      fullPage: true
    });
    console.log('📸 Main menu screenshot');
    
    // Start new game
    await page.click('text=New Game');
    await page.waitForTimeout(500);
    
    // Screenshot 2: Level select
    await page.screenshot({ 
      path: join(__dirname, 'screenshots', 'issue-2-level-select.png'),
      fullPage: true
    });
    console.log('📸 Level select screenshot');
    
    // Select first level
    await page.click('.level-card:first-child');
    await page.waitForTimeout(1000);
    
    // Screenshot 3: Game board
    await page.screenshot({ 
      path: join(__dirname, 'screenshots', 'issue-3-game-board.png'),
      fullPage: true
    });
    console.log('📸 Game board screenshot');
    
    // Try to click Start Wave
    const startWaveButton = await page.locator('button:has-text("Start Wave")');
    if (await startWaveButton.isVisible()) {
      console.log('✅ Start Wave button found');
      await startWaveButton.click();
      console.log('🖱️ Clicked Start Wave');
      
      await page.waitForTimeout(2000);
      
      // Screenshot 4: After clicking start wave
      await page.screenshot({ 
        path: join(__dirname, 'screenshots', 'issue-4-after-start-wave.png'),
        fullPage: true
      });
      console.log('📸 After Start Wave screenshot');
    } else {
      console.log('❌ Start Wave button not found!');
    }
    
    // Check canvas size
    const canvas = await page.locator('canvas');
    const canvasBox = await canvas.boundingBox();
    console.log('📐 Canvas dimensions:', canvasBox);
    
    // Check if hexagons are visible
    const hexVisible = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      // Check if there's any non-background color
      const bgColor = [248, 249, 250]; // Our light background
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i] !== bgColor[0] || 
            imageData.data[i+1] !== bgColor[1] || 
            imageData.data[i+2] !== bgColor[2]) {
          return true;
        }
      }
      return false;
    });
    
    console.log('🔷 Hexagons visible:', hexVisible);
    
  } finally {
    await browser.close();
  }
  
  console.log('✅ Issue testing complete!');
}

testGameIssues().catch(console.error);