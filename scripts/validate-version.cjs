#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const appPackageJsonPath = path.join(__dirname, '../package.json');
const tauriConfigPath = path.join(__dirname, '../src-tauri/tauri.conf.json');
const cargoTomlPath = path.join(__dirname, '../Cargo.toml');
const readmePath = path.join(__dirname, '../README.md');

const appPackageJson = JSON.parse(fs.readFileSync(appPackageJsonPath, 'utf8'));
const sourceVersion = appPackageJson.version;

if (!sourceVersion) {
    console.error('Error: No version found in package.json');
    process.exit(1);
}

const readme = fs.readFileSync(readmePath, 'utf8');
const cargoToml = fs.readFileSync(cargoTomlPath, 'utf8');

const cargoVersionMatch = cargoToml.match(/^version\s*=\s*"([\d.]+)"/m);
const badgeVersionMatch = readme.match(/\[badge-version\]:\s*https:\/\/img\.shields\.io\/badge\/version-([\d.]+)-blue/);
const releaseTagVersions = Array.from(readme.matchAll(/\/releases\/download\/v([\d.]+)\//g), (m) => m[1]);
const artifactVersions = Array.from(readme.matchAll(/(?:FanJi|AniTodo)_([\d.]+)_/g), (m) => m[1]);

const unique = (arr) => [...new Set(arr)];

const versions = {
    'package.json': sourceVersion,
    'src-tauri/tauri.conf.json': JSON.parse(fs.readFileSync(tauriConfigPath, 'utf8')).version,
    'Cargo.toml': cargoVersionMatch ? cargoVersionMatch[1] : null,
    'README.md badge': badgeVersionMatch ? badgeVersionMatch[1] : null,
};

let allMatch = true;
const mismatches = [];

for (const [file, version] of Object.entries(versions)) {
    if (version !== sourceVersion) {
        allMatch = false;
        mismatches.push({ file, found: version, expected: sourceVersion });
    }
}

for (const version of unique(releaseTagVersions)) {
    if (version !== sourceVersion) {
        allMatch = false;
        mismatches.push({ file: 'README.md release tag links', found: version, expected: sourceVersion });
    }
}

for (const version of unique(artifactVersions)) {
    if (version !== sourceVersion) {
        allMatch = false;
        mismatches.push({ file: 'README.md artifact filenames', found: version, expected: sourceVersion });
    }
}

if (!allMatch) {
    console.error('Version mismatch detected!');
    mismatches.forEach(({ file, found, expected }) => {
        console.error(`  - ${file}: found "${found}", expected "${expected}"`);
    });
    process.exit(1);
}

process.exit(0);
