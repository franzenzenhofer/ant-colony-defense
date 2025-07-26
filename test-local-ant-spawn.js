#!/usr/bin/env node

import { chromium } from '@playwright/test';

async function testLocalAntSpawn() {
  console.log('🐜 Testing ant spawning on local dev server...');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  // Capture console messages
  page.on('console', msg => {
    console.log('Console:', msg.text());
  });
  
  try {
    // Navigate to local dev server
    await page.goto('http://localhost:5174');
    await page.waitForLoadState('networkidle');
    
    // Start new game
    await page.click('text=New Game');
    await page.waitForTimeout(500);
    
    // Select first level
    await page.click('.level-card:first-child');
    
    console.log('Waiting for console logs...');
    await page.waitForTimeout(10000);
    
  } finally {
    await browser.close();
  }
}

testLocalAntSpawn().catch(console.error);