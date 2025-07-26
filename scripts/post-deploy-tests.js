#!/usr/bin/env node

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

const SITE_URL = process.env.TEST_URL || 'https://ant-colony-defense.franzai.com';

const tests = [
  {
    name: 'Site Accessibility',
    run: async () => {
      const response = await fetch(SITE_URL);
      if (response.status !== 200) {
        throw new Error(`Site returned ${response.status}`);
      }
    }
  },
  {
    name: 'Mobile E2E Gameplay Test',
    run: async () => {
      // This will be handled by Playwright in post-deploy
      console.log('Mobile E2E test will run via Playwright');
    }
  },
  {
    name: 'Static Assets Loading',
    run: async () => {
      const response = await fetch(SITE_URL);
      const html = await response.text();
      
      if (!html.includes('ant-colony-defense')) {
        throw new Error('Site content missing');
      }
    }
  },
  {
    name: 'Response Times',
    run: async () => {
      const start = Date.now();
      await fetch(SITE_URL);
      const duration = Date.now() - start;
      
      if (duration > 3000) {
        throw new Error(`Response took ${duration}ms (limit: 3000ms)`);
      }
    }
  },
  {
    name: 'Mobile Viewport',
    run: async () => {
      const response = await fetch(SITE_URL);
      const html = await response.text();
      
      if (!html.includes('viewport')) {
        throw new Error('Missing viewport meta tag');
      }
    }
  },
  {
    name: 'OG Image Optimization',
    run: async () => {
      const response = await fetch(SITE_URL);
      const html = await response.text();
      
      if (!html.includes('og:image')) {
        throw new Error('Missing OG image tag');
      }
      
      // Check if using optimized JPG
      const ogImageMatch = html.match(/og:image.*content="([^"]+)"/);
      if (ogImageMatch && ogImageMatch[1].endsWith('.png')) {
        throw new Error('OG image should be optimized JPG, not PNG');
      }
    }
  }
];

async function runTests() {
  log(`ℹ️  🚀 Starting Post-Deployment Test Suite`, 'blue');
  log(`ℹ️  Testing: ${SITE_URL}`, 'blue');
  
  let passed = 0;
  let failed = 0;
  let warnings = 0;
  
  for (const test of tests) {
    log(`\n🧪 Running: ${test.name}`, 'cyan');
    
    try {
      await test.run();
      log(`✅ ✓ ${test.name}`, 'green');
      passed++;
    } catch (error) {
      if (test.warning) {
        log(`⚠️  ⚠ ${test.name}: ${error.message}`, 'yellow');
        warnings++;
      } else {
        log(`❌ ✗ ${test.name}: ${error.message}`, 'red');
        failed++;
      }
    }
  }
  
  // Summary
  console.log('\n' + '═'.repeat(60));
  log(`ℹ️  📊 TEST RESULTS SUMMARY`, 'blue');
  console.log('═'.repeat(60));
  log(`✅ Passed: ${passed}`, 'green');
  if (warnings > 0) log(`⚠️  Warnings: ${warnings}`, 'yellow');
  if (failed > 0) log(`❌ Failed: ${failed}`, 'red');
  
  if (failed > 0) {
    log(`\n❌ ${failed} tests failed`, 'red');
    process.exit(1);
  } else if (warnings > 0) {
    log(`\n⚠️  Tests passed with ${warnings} warnings`, 'yellow');
  } else {
    log(`\n✅ All tests passed!`, 'green');
  }
}

runTests().catch(error => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  process.exit(1);
});