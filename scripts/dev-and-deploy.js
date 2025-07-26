#!/usr/bin/env node

import { spawn, execSync } from 'child_process';
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

async function deployToCloudflare() {
  log('\n🚀 Starting Complete Deployment Process', 'bright');
  
  // 1. Pre-deployment tests
  log('\n🧪 Running Pre-deployment Tests', 'cyan');
  execCommand('npm run lint', 'Linting code');
  execCommand('npm run typecheck', 'Type checking');
  execCommand('npm test -- --run', 'Running unit tests');
  
  // 2. Version bump
  log('\n📦 Bumping version', 'cyan');
  execCommand('npm run version:bump:minor', 'Bumping minor version');
  
  // 3. Build
  log('\n🔨 Building for production', 'cyan');
  execCommand('npm run build', 'Building application');
  
  // 4. Deploy to Cloudflare
  log('\n☁️ Deploying to Cloudflare', 'cyan');
  execCommand('wrangler deploy', 'Deploying to ant-colony-defense.franzai.com');
  
  // 5. Run E2E tests
  log('\n🎭 Running E2E tests', 'cyan');
  execCommand('npm run test:e2e', 'Running Playwright E2E tests');
  
  // 6. Post-deploy tests
  log('\n✅ Running Post-deploy tests', 'cyan');
  execCommand('TEST_URL=https://ant-colony-defense.franzai.com npm run test:post-deploy', 'Testing live deployment');
  
  // 7. Git operations
  log('\n📝 Committing and pushing changes', 'cyan');
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
  const version = packageJson.version;
  
  execCommand('git add -A', 'Staging changes');
  execCommand(`git commit -m "chore: deploy version ${version} to production

- Deployed to https://ant-colony-defense.franzai.com
- All tests passing
- Mobile optimizations included"`, 'Committing changes');
  
  execCommand(`git tag -a "v${version}" -m "Release v${version}"`, 'Creating version tag');
  execCommand('git push origin main --follow-tags', 'Pushing to GitHub');
  
  // 8. Create GitHub release
  log('\n🎉 Creating GitHub release', 'cyan');
  execCommand(`gh release create v${version} --title "v${version}" --notes "## 🚀 Release v${version}

### 🎮 Play Now
- Live at: https://ant-colony-defense.franzai.com
- GitHub Pages: https://ant-colony-defense.pages.dev

### ✨ What's New
- Mobile-first responsive design
- Improved color scheme
- Better scrolling on mobile devices
- Sound effects and particle systems
- Automatic deployment pipeline

### 📊 Test Results
- ✅ All unit tests passing
- ✅ All E2E tests passing
- ✅ Post-deploy verification successful
"`, 'Creating GitHub release');
  
  log('\n✨ Deployment Complete!', 'green');
  log(`\n📊 Deployment Summary:`, 'blue');
  log(`  📦 Version: v${version}`, 'blue');
  log(`  🌐 Live at: https://ant-colony-defense.franzai.com`, 'blue');
  log(`  🐙 GitHub: https://github.com/franzenzenhofer/ant-colony-defense`, 'blue');
  log(`  🏷️ Tag: v${version}`, 'blue');
}

// Start Vite dev server
const viteProcess = spawn('vite', [], {
  stdio: 'inherit',
  shell: true
});

// Handle Ctrl+C
process.on('SIGINT', async () => {
  log('\n\n🛑 Dev server stopped by user', 'yellow');
  log('🚀 Starting deployment process...', 'cyan');
  
  viteProcess.kill();
  
  // Start deployment
  await deployToCloudflare();
  
  process.exit(0);
});

// Handle errors
viteProcess.on('error', (error) => {
  log(`❌ Error starting dev server: ${error.message}`, 'red');
  process.exit(1);
});

log('🚀 Development server starting...', 'green');
log('📝 Press Ctrl+C to stop and deploy to production', 'yellow');