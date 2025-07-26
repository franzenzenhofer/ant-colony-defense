# Cloudflare Subdomain Deployment Learnings 🚀

## Overview
This document captures learnings from the Color Me Same project's deployment to a subdomain under franzai.com, which we'll apply to deploy Ant Colony Defense.

## Key Learnings from Color Me Same

### 1. **Wrangler Configuration Structure**
```toml
name = "project-name"
main = "src/worker.js"
compatibility_date = "2024-01-01"

[assets]
directory = "./dist"
not_found_handling = "single-page-application"

[[routes]]
pattern = "subdomain.franzai.com/*"
zone_name = "franzai.com"
```

### 2. **Deployment Script Architecture**
The Color Me Same project uses a comprehensive deployment script that:
- Handles version bumping (via predeploy hook)
- Builds the project (via predeploy hook)
- Deploys to Cloudflare using `wrangler deploy`
- Runs post-deploy tests
- Commits version changes
- Tags releases
- Pushes to GitHub with tags

### 3. **Package.json Scripts**
```json
{
  "scripts": {
    "predeploy": "npm run version:bump:minor && npm run build",
    "deploy": "node scripts/deploy-complete.js",
    "build": "vite build && npm run build:worker",
    "build:worker": "echo 'Worker uses static assets from dist/'"
  }
}
```

### 4. **Route Pattern for Subdomains**
- Uses pattern: `subdomain.franzai.com/*`
- Requires zone_name: `franzai.com`
- No need for separate DNS configuration (handled by Cloudflare)

### 5. **Build Process**
1. Vite builds the static assets to `dist/`
2. Wrangler serves these assets via the Worker
3. Worker handles routing and serves the SPA

## Implementation Plan for Ant Colony Defense

### Step 1: Create Worker File
Create a minimal worker that serves static assets.

### Step 2: Configure Wrangler
Create `wrangler.toml` with:
- Project name: `ant-colony-defense`
- Routes pattern: `ant-colony-defense.franzai.com/*`
- Zone name: `franzai.com`
- Assets directory: `./dist`

### Step 3: Update Deploy Script
Modify the existing deploy script to:
- Use `wrangler deploy` instead of `wrangler pages deploy`
- Update URLs in post-deploy tests
- Update success messages

### Step 4: Update Package.json
Add worker-specific build commands if needed.

### Step 5: Test Deployment
Deploy and verify the subdomain works correctly.

## Benefits of This Approach
1. **Consistent Domain**: All projects under franzai.com
2. **No DNS Configuration**: Cloudflare handles subdomain routing
3. **Better Performance**: Worker at edge locations
4. **Unified Deployment**: Same process for all projects

## Potential Issues & Solutions
1. **Asset Paths**: Ensure all assets use relative paths
2. **API Calls**: Update any hardcoded URLs
3. **Worker Limits**: Monitor Worker CPU/memory usage
4. **Caching**: Configure proper cache headers

## Commands Reference
```bash
# Deploy to production
npm run deploy

# Deploy to preview
wrangler deploy --env preview

# View logs
wrangler tail

# Check deployment
curl -I https://ant-colony-defense.franzai.com
```

## Next Steps
1. Create worker.js file
2. Create wrangler.toml configuration
3. Update deployment scripts
4. Test deployment to subdomain
5. Update all documentation with new URL