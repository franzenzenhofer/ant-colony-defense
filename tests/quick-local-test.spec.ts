import { test, expect } from '@playwright/test';

test('quick local game test', async ({ page }) => {
  // Test local version
  await page.goto('http://localhost:5173');
  
  // Check main menu
  await expect(page.locator('.menu-container')).toBeVisible({ timeout: 5000 });
  
  // Start game
  await page.click('button:has-text("New Game")');
  
  // Should show level selection
  const levelGrid = page.locator('.level-grid');
  const isLevelGridVisible = await levelGrid.isVisible({ timeout: 3000 }).catch(() => false);
  
  if (isLevelGridVisible) {
    console.log('✅ Level selection visible');
    await page.locator('.level-card').first().click();
  } else {
    console.log('❌ Level selection not found');
  }
  
  // Check if canvas appears
  const canvas = page.locator('canvas');
  const isCanvasVisible = await canvas.isVisible({ timeout: 5000 }).catch(() => false);
  
  if (isCanvasVisible) {
    console.log('✅ Game canvas loaded');
  } else {
    console.log('❌ Game canvas NOT loaded');
    
    // Check for any error messages
    const body = await page.locator('body').textContent();
    console.log('Page content:', body?.substring(0, 500));
  }
  
  // Take screenshot for debugging
  await page.screenshot({ path: 'game-state.png', fullPage: true });
});