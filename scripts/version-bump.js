#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bumpType = process.argv[2] || 'patch';

// Read package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

// Bump version
const [major, minor, patch] = packageJson.version.split('.').map(Number);
let newVersion;

switch (bumpType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
  default:
    newVersion = `${major}.${minor}.${patch + 1}`;
}

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

// Create version info
const versionInfo = {
  version: newVersion,
  buildTime: new Date().toISOString(),
  commit: process.env.GITHUB_SHA || 'local'
};

// Write version info
const versionPath = path.join(__dirname, '..', 'src', 'version.json');
fs.mkdirSync(path.dirname(versionPath), { recursive: true });
fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2));

console.log(`✅ Version bumped: ${packageJson.version} → ${newVersion}`);