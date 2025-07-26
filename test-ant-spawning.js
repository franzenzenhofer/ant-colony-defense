#!/usr/bin/env node

import { chromium } from '@playwright/test';

async function testAntSpawning() {
  console.log('🐜 Testing ant spawning system...');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true // Open devtools to see console
  });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  // Capture all console messages
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    if (text.includes('ant') || text.includes('spawn') || text.includes('wave')) {
      console.log('🔍 Console:', text);
    }
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
    
    console.log('\n📊 Initial game state:');
    
    // Get game state info
    const gameInfo = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return {
        canvasSize: { width: canvas.width, height: canvas.height },
        canvasStyle: { width: canvas.style.width, height: canvas.style.height }
      };
    });
    console.log('Canvas:', gameInfo);
    
    // Wait for wave to start and ants to spawn
    console.log('\n⏳ Waiting for ants to spawn...');
    await page.waitForTimeout(5000);
    
    // Check console logs
    console.log('\n📝 Console logs related to ants:');
    consoleLogs.forEach(log => {
      if (log.includes('ant') || log.includes('spawn') || log.includes('wave')) {
        console.log('  -', log);
      }
    });
    
    // Get current game state
    const antStatus = await page.locator('text=/Ants remaining:.*\\d+/').textContent();
    console.log('\n📊 Ant status:', antStatus);
    
    // Take screenshot
    await page.screenshot({ path: 'test-ant-spawning.png', fullPage: true });
    
    // Try to get ant positions from the game state
    const antData = await page.evaluate(() => {
      // Try to access React component state
      const root = document.getElementById('root');
      const reactKey = Object.keys(root).find(key => key.startsWith('__react'));
      if (reactKey) {
        try {
          const node = root[reactKey];
          // This is a hack to try to get game state
          return { reactFound: true, keys: Object.keys(node) };
        } catch (e) {
          return { reactFound: false, error: e.message };
        }
      }
      return { reactFound: false };
    });
    console.log('\n🔍 React state access:', antData);
    
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

testAntSpawning().catch(console.error);