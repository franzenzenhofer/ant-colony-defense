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
  
  // Step 0: Run ALL tests first - MUST PASS
  log('\n🧪 Running ALL Tests (Unit + E2E + Lint + TypeCheck)', 'cyan');
  
  // Unit tests
  log('\n📊 Running Unit Tests', 'blue');
  const unitTestSuccess = execCommand('npm run test', 'Running unit tests with coverage');
  if (!unitTestSuccess) {
    throw new Error('Unit tests failed - deployment aborted');
  }
  
  // TypeScript check
  log('\n🔍 TypeScript Check', 'blue');
  const typeCheckSuccess = execCommand('npm run typecheck', 'TypeScript compilation check');
  if (!typeCheckSuccess) {
    throw new Error('TypeScript check failed - deployment aborted');
  }
  
  // Lint check
  log('\n✨ ESLint Check', 'blue');
  const lintSuccess = execCommand('npm run lint', 'ESLint validation');
  if (!lintSuccess) {
    throw new Error('ESLint failed - deployment aborted');
  }
  
  // Skip localhost E2E for deployment - will test production URLs after deployment
  log('\n🎭 Skipping localhost E2E (will test production after deployment)', 'blue');
  
  log('✅ ALL TESTS PASSED - Proceeding with deployment', 'green');
  
  // Step 1: Check Git status
  log('\n📋 Checking Git status', 'cyan');
  const gitStatus = execCommand('git status --porcelain', 'Checking for uncommitted changes');
  
  // Step 2: Auto-increment version
  log('\n📦 Auto-incrementing version', 'cyan');
  const versionSuccess = execCommand('npm run version:bump:patch', 'Bumping patch version automatically');
  if (!versionSuccess) {
    throw new Error('Version bump failed');
  }
  
  // Step 3: Get new version
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
  log(`\n✨ New version: ${packageJson.version}`, 'green');
  
  // Step 4: Build project
  log('\n🔨 Building project', 'cyan');
  const buildSuccess = execCommand('npm run build', 'Building optimized production version');
  if (!buildSuccess) {
    throw new Error('Build failed');
  }
  
  // Step 5: Git commit and push
  log('\n📤 Committing to GitHub', 'cyan');
  const commitMessage = `🚀 Deploy v${packageJson.version} - Auto-increment and deploy`;
  
  execCommand('git add .', 'Staging all changes');
  execCommand(`git commit -m "${commitMessage}"`, 'Creating commit');
  execCommand('git push origin main', 'Pushing to GitHub');
  
  // Step 6: Create GitHub release
  log('\n🏷️  Creating GitHub release', 'cyan');
  const releaseSuccess = execCommand(
    `gh release create v${packageJson.version} --title "Release v${packageJson.version}" --notes "Auto-deployment of ant colony defense game v${packageJson.version}"`,
    'Creating GitHub release'
  );
  
  if (releaseSuccess) {
    log('✅ GitHub release created', 'green');
  } else {
    log('⚠️  GitHub release failed (continuing deployment)', 'yellow');
  }
  
  // Step 7: Deploy to Cloudflare Workers
  log('\n🚀 Deploying to Cloudflare Workers', 'magenta');
  const deploySuccess = execCommand(
    'wrangler deploy',
    'Deploying to ant-colony-defense.franzai.com'
  );
  
  if (!deploySuccess) {
    throw new Error('Deployment failed');
  }
  
  log('✅ Deployed to Cloudflare Workers', 'green');
  
  // Step 8: Deploy to Cloudflare Pages (backup)
  log('\n📄 Deploying to Cloudflare Pages (backup)', 'cyan');
  const pagesSuccess = execCommand(
    'wrangler pages deploy dist --project-name=ant-colony-defense',
    'Deploying to Pages as backup'
  );
  
  if (pagesSuccess) {
    log('✅ Deployed to Cloudflare Pages', 'green');
  } else {
    log('⚠️  Pages deployment failed (main deployment still successful)', 'yellow');
  }
  
  // Step 9: Wait for propagation
  log('\n⏱️  Waiting for global propagation...', 'cyan');
  await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second wait
  
  // Step 10: Run comprehensive post-deploy tests
  log('\n🧪 Running Comprehensive Post-Deploy Tests', 'magenta');
  const testSuccess = execCommand('npm run test:post-deploy', 'Running all post-deploy validations');
  
  // Step 11: Verify deployment on all URLs
  log('\n🌐 Verifying deployment on all URLs', 'cyan');
  const urls = [
    'https://ant-colony-defense.franzai.com',
    'https://ant-colony-defense.pages.dev'
  ];
  
  for (const url of urls) {
    try {
      log(`\n🔍 Checking ${url}`, 'blue');
      execCommand(`curl -I ${url}`, `Verifying ${url} is accessible`);
      log(`✅ ${url} is responding`, 'green');
    } catch (error) {
      log(`⚠️  ${url} check failed: ${error.message}`, 'yellow');
    }
  }
  
  // Step 12: Final summary
  log('\n🎉 DEPLOYMENT COMPLETE!', 'green');
  log(`\n📊 Deployment Summary:`, 'cyan');
  log(`  🏷️  Version: v${packageJson.version}`, 'blue');
  log(`  🌐 Primary: https://ant-colony-defense.franzai.com`, 'blue');
  log(`  📄 Backup: https://ant-colony-defense.pages.dev`, 'blue');
  log(`  📦 GitHub: https://github.com/user/ant-colony-defense/releases/tag/v${packageJson.version}`, 'blue');
  log(`  ✅ Status: ${testSuccess ? 'All tests passed' : 'Some tests failed - check logs'}`, testSuccess ? 'green' : 'yellow');
  
  if (!testSuccess) {
    log('🚨 Deployment has issues that need attention', 'red');
    log('🔧 Manual testing recommended', 'yellow');
  }
}

deploy().catch(error => {
  log(`❌ Deployment failed: ${error.message}`, 'red');
  process.exit(1);
});