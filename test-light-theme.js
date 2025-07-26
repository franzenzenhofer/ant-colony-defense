#!/usr/bin/env node

import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testLightTheme() {
  console.log('📸 Testing new light theme on franzai.com...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 }
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to live site
    await page.goto('https://ant-colony-defense.franzai.com');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of main menu
    await page.screenshot({ 
      path: join(__dirname, 'screenshots', 'light-theme-menu.png'),
      fullPage: true
    });
    console.log('✅ Main menu screenshot captured');
    
    // Start new game
    await page.click('text=New Game');
    await page.waitForTimeout(500);
    
    // Select first level
    await page.click('.level-card:first-child');
    await page.waitForTimeout(1000);
    
    // Take screenshot of game
    await page.screenshot({ 
      path: join(__dirname, 'screenshots', 'light-theme-game.png'),
      fullPage: true
    });
    console.log('✅ Game screenshot captured');
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ 
      path: join(__dirname, 'screenshots', 'light-theme-mobile.png'),
      fullPage: true
    });
    console.log('✅ Mobile screenshot captured');
    
  } finally {
    await browser.close();
  }
  
  console.log('✨ Light theme testing complete!');
}

testLightTheme().catch(console.error);