#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function execCommand(command, description) {
  try {
    log(`\n${description}`, 'magenta');
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`❌ Failed: ${description}`, 'red');
    return false;
  }
}

async function deploy() {
  log('\n🚀 Starting Complete Deployment Process', 'magenta');
  
  // Get version
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
  log(`\nℹ️  Deploying version: ${packageJson.version}`, 'blue');
  
  // Deploy to Cloudflare Workers
  log('\n🚀 Deploying to Cloudflare Workers', 'magenta');
  const deploySuccess = execCommand(
    'wrangler pages deploy dist --project-name=ant-colony-defense',
    ''
  );
  
  if (!deploySuccess) {
    throw new Error('Deployment failed');
  }
  
  log('✅ Deployed to Cloudflare Workers', 'green');
  
  // Run post-deploy tests
  log('\n🚀 Running Post-Deploy Tests', 'magenta');
  const testSuccess = execCommand('npm run test:post-deploy', '');
  
  if (!testSuccess) {
    log('🚨 Deployment has issues that need attention', 'red');
  }
}

deploy().catch(error => {
  log(`❌ Deployment failed: ${error.message}`, 'red');
  process.exit(1);
});