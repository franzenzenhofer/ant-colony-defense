#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRANZAI_URL = 'https://ant-colony-defense.franzai.com';
const TIMEOUT = 30000;

async function verifyDeployment() {
  console.log('🔍 DEPLOYMENT VERIFICATION STARTING...\n');
  
  // Get expected version from package.json
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  const expectedVersion = packageJson.version;
  console.log(`📦 Expected version: ${expectedVersion}`);
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  let deploymentValid = false;
  
  try {
    // Load the franzai.com URL
    console.log(`\n🌐 Checking ${FRANZAI_URL}...`);
    
    const response = await page.goto(FRANZAI_URL, { 
      waitUntil: 'networkidle',
      timeout: TIMEOUT 
    });
    
    if (response.status() !== 200) {
      console.error(`❌ Site returned status ${response.status()}`);
      return false;
    }
    
    // Check for JavaScript errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    // Wait for page to fully load
    await page.waitForTimeout(3000);
    
    // Check version in multiple ways
    console.log('\n📋 Version checks:');
    
    // 1. Check version display on page
    const versionElement = await page.$('.version-display');
    if (versionElement) {
      const displayedVersion = await versionElement.textContent();
      console.log(`   UI Version: ${displayedVersion}`);
      if (displayedVersion.includes(expectedVersion)) {
        console.log('   ✅ UI version matches');
      } else {
        console.log('   ❌ UI version mismatch');
      }
    }
    
    // 2. Check script tags for version
    const scriptSrcs = await page.$$eval('script[src]', scripts => 
      scripts.map(s => s.src)
    );
    
    const versionInScripts = scriptSrcs.some(src => src.includes(expectedVersion));
    console.log(`   Script versions: ${versionInScripts ? '✅ Match' : '❌ Mismatch'}`);
    
    if (!versionInScripts) {
      const foundVersions = scriptSrcs
        .map(src => {
          const match = src.match(/(\d+\.\d+\.\d+)/);
          return match ? match[1] : null;
        })
        .filter(Boolean);
      console.log(`   Found versions in scripts: ${foundVersions.join(', ')}`);
    }
    
    // 3. Check CSS for version
    const cssSrcs = await page.$$eval('link[rel="stylesheet"]', links => 
      links.map(l => l.href)
    );
    
    const versionInCSS = cssSrcs.some(src => src.includes(expectedVersion));
    console.log(`   CSS versions: ${versionInCSS ? '✅ Match' : '❌ Mismatch'}`);
    
    // 4. Test if game actually works
    console.log('\n🎮 Functionality test:');
    
    // Click New Game
    await page.click('button:has-text("New Game")');
    await page.waitForTimeout(1000);
    
    // Click Level 1
    await page.click('.level-card:first-child');
    await page.waitForTimeout(3000);
    
    // Check if canvas is visible (game loaded)
    const canvasVisible = await page.locator('canvas').isVisible();
    console.log(`   Game loads: ${canvasVisible ? '✅ Yes' : '❌ No'}`);
    
    // Check for errors
    if (errors.length > 0) {
      console.log('\n❌ JavaScript errors detected:');
      errors.forEach(err => console.log(`   - ${err}`));
    }
    
    // Final verdict
    deploymentValid = versionInScripts && versionInCSS && canvasVisible && errors.length === 0;
    
    console.log('\n' + '='.repeat(60));
    if (deploymentValid) {
      console.log(`✅ DEPLOYMENT SUCCESSFUL!`);
      console.log(`✅ Version ${expectedVersion} is LIVE on ${FRANZAI_URL}`);
      console.log(`✅ Game is playable without errors`);
    } else {
      console.log(`❌ DEPLOYMENT FAILED!`);
      console.log(`❌ ${FRANZAI_URL} is NOT running version ${expectedVersion}`);
      console.log(`❌ Or the game is broken`);
    }
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    deploymentValid = false;
  } finally {
    await browser.close();
  }
  
  // Exit with appropriate code
  process.exit(deploymentValid ? 0 : 1);
}

// Run verification
verifyDeployment().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});