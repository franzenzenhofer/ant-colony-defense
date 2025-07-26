#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Quick deployment to ant-colony-defense.franzai.com');

try {
  // 1. Build
  console.log('\n🔨 Building...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // 2. Deploy
  console.log('\n☁️ Deploying to Cloudflare...');
  execSync('wrangler deploy', { stdio: 'inherit' });
  
  console.log('\n✅ Deployment complete!');
  console.log('🌐 Live at: https://ant-colony-defense.franzai.com');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}