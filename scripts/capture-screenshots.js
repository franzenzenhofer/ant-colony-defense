#!/usr/bin/env node

const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function captureScreenshots() {
  console.log('📸 Capturing game screenshots...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Start local server
  console.log('Starting local server...');
  const server = require('child_process').spawn('npm', ['run', 'preview'], {
    detached: false,
    stdio: 'pipe'
  });
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    // Navigate to game
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');
    
    // Take desktop screenshot
    await page.setViewportSize({ width: 1200, height: 630 });
    await page.screenshot({ 
      path: path.join(__dirname, '..', 'public', 'game-screenshot.jpg'),
      quality: 85,
      type: 'jpeg'
    });
    console.log('✅ Desktop screenshot captured');
    
    // Take mobile screenshot
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ 
      path: path.join(__dirname, '..', 'public', 'game-screenshot-mobile.jpg'),
      quality: 85,
      type: 'jpeg'
    });
    console.log('✅ Mobile screenshot captured');
    
  } finally {
    await browser.close();
    server.kill();
  }
  
  console.log('✅ All screenshots captured successfully');
}

captureScreenshots().catch(error => {
  console.error('❌ Screenshot capture failed:', error);
  process.exit(1);
});