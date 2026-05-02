#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

const appPackageJsonPath = path.join(__dirname, '../package.json');
const syncVersionScript = path.join(__dirname, 'sync-version.cjs');
const validateVersionScript = path.join(__dirname, 'validate-version.cjs');

const appPackageJson = JSON.parse(fs.readFileSync(appPackageJsonPath, 'utf8'));
const currentVersion = appPackageJson.version;

if (!currentVersion) {
    console.error('Error: No version found in package.json');
    process.exit(1);
}

const rawVersionArg = process.argv[2];
const versionArg = rawVersionArg ? rawVersionArg.replace(/^v/, '') : rawVersionArg;

if (!versionArg) {
    console.error('Error: Please specify version bump type (patch/minor/major) or exact version (e.g., 0.3.0)');
    process.exit(1);
}

let newVersion;
if (versionArg === 'patch' || versionArg === 'minor' || versionArg === 'major') {
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    switch (versionArg) {
        case 'patch':
            newVersion = `${major}.${minor}.${patch + 1}`;
            break;
        case 'minor':
            newVersion = `${major}.${minor + 1}.0`;
            break;
        case 'major':
            newVersion = `${major + 1}.0.0`;
            break;
    }
} else {
    if (!/^\d+\.\d+\.\d+$/.test(versionArg)) {
        console.error(`Error: Invalid version format "${versionArg}". Expected format: X.Y.Z (e.g., 0.3.0)`);
        process.exit(1);
    }
    newVersion = versionArg;
}

appPackageJson.version = newVersion;
fs.writeFileSync(appPackageJsonPath, JSON.stringify(appPackageJson, null, 2) + '\n');

try {
    execSync(`node "${syncVersionScript}"`, {stdio: 'inherit'});
} catch (error) {
    console.error('Failed to sync versions');
    process.exit(1);
}

try {
    execSync(`node "${validateVersionScript}"`, {stdio: 'inherit'});
} catch (error) {
    console.error('Version validation failed');
    process.exit(1);
}

try {
    execSync('git status --short', {stdio: 'inherit'});
} catch (error) {
}

