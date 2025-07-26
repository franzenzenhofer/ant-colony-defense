#!/usr/bin/env node

import { chromium } from '@playwright/test';

async function debugCoordinates() {
  console.log('🔍 Debugging coordinate system...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    // Enable console messages
    permissions: ['clipboard-read', 'clipboard-write']
  });
  
  const page = await context.newPage();
  
  // Inject console override to capture hex coordinates
  await page.addInitScript(() => {
    const originalLog = console.log;
    window.debugLogs = [];
    console.log = (...args) => {
      window.debugLogs.push(args);
      originalLog(...args);
    };
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
    
    // Inject debugging code
    await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const originalClick = canvas.onclick;
      
      canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        console.log('Canvas click:', { x, y, rect, clientX: e.clientX, clientY: e.clientY });
      }, true);
      
      // Also log when onHexClick is called
      const oldConsoleLog = console.log;
      console.log = (...args) => {
        if (args[0] && args[0].toString().includes('hex')) {
          oldConsoleLog('HEX EVENT:', ...args);
        }
        oldConsoleLog(...args);
      };
    });
    
    // Get canvas info
    const canvasBox = await page.locator('canvas').boundingBox();
    console.log('📐 Canvas bounding box:', canvasBox);
    
    // Get canvas actual dimensions
    const canvasDims = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return {
        width: canvas.width,
        height: canvas.height,
        style: {
          width: canvas.style.width,
          height: canvas.style.height
        },
        parent: {
          width: canvas.parentElement.clientWidth,
          height: canvas.parentElement.clientHeight
        }
      };
    });
    console.log('📏 Canvas dimensions:', canvasDims);
    
    // Click Anteater button
    await page.click('button:has-text("Anteater")');
    console.log('🦣 Selected Anteater');
    
    // Try clicking at different positions
    const positions = [
      { x: 187, y: 250, desc: 'Center' },
      { x: 100, y: 200, desc: 'Left' },
      { x: 250, y: 300, desc: 'Right' }
    ];
    
    for (const pos of positions) {
      console.log(`\n📍 Clicking at ${pos.desc} (${pos.x}, ${pos.y})...`);
      
      // Use page.mouse for precise control
      await page.mouse.click(canvasBox.x + pos.x, canvasBox.y + pos.y);
      await page.waitForTimeout(500);
      
      // Check resources
      const resources = await page.locator('.resource-item').nth(1).textContent();
      console.log('💰 Resources after click:', resources);
      
      // Get debug logs
      const logs = await page.evaluate(() => window.debugLogs || []);
      if (logs.length > 0) {
        console.log('🔍 Debug logs:', logs);
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'debug-coordinates.png', fullPage: true });
    
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

debugCoordinates().catch(console.error);