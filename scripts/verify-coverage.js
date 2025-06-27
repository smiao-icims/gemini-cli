#!/usr/bin/env node

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Verify test coverage meets Definition of Done requirements
 */
function verifyCoverage() {
  console.log('🔍 Verifying test coverage against DoD requirements...\n');

  const packages = ['cli', 'core'];
  let allPackagesPass = true;

  for (const pkg of packages) {
    console.log(`📦 Checking ${pkg} package coverage...`);
    
    const coveragePath = path.join(__dirname, '..', 'packages', pkg, 'coverage', 'coverage-summary.json');
    
    if (!fs.existsSync(coveragePath)) {
      console.error(`❌ Coverage file not found: ${coveragePath}`);
      console.error(`   Run: npm run test:coverage in packages/${pkg}`);
      allPackagesPass = false;
      continue;
    }

    try {
      const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      const total = coverage.total;

      const thresholds = {
        lines: 90,
        functions: 90,
        branches: 80,
        statements: 90
      };

      console.log(`   Lines:      ${total.lines.pct}% (threshold: ${thresholds.lines}%)`);
      console.log(`   Functions:  ${total.functions.pct}% (threshold: ${thresholds.functions}%)`);
      console.log(`   Branches:   ${total.branches.pct}% (threshold: ${thresholds.branches}%)`);
      console.log(`   Statements: ${total.statements.pct}% (threshold: ${thresholds.statements}%)`);

      const meetsThresholds = 
        total.lines.pct >= thresholds.lines &&
        total.functions.pct >= thresholds.functions &&
        total.branches.pct >= thresholds.branches &&
        total.statements.pct >= thresholds.statements;

      if (meetsThresholds) {
        console.log(`   ✅ ${pkg} package meets coverage requirements\n`);
      } else {
        console.log(`   ❌ ${pkg} package does not meet coverage requirements\n`);
        allPackagesPass = false;
      }

    } catch (error) {
      console.error(`❌ Error reading coverage for ${pkg}:`, error.message);
      allPackagesPass = false;
    }
  }

  if (allPackagesPass) {
    console.log('🎉 All packages meet Definition of Done coverage requirements!');
    console.log('\n✅ DoD Coverage Checklist:');
    console.log('   ✅ Line Coverage: ≥90% achieved');
    console.log('   ✅ Function Coverage: ≥90% achieved');
    console.log('   ✅ Branch Coverage: ≥80% achieved');
    console.log('   ✅ Statement Coverage: ≥90% achieved');
    process.exit(0);
  } else {
    console.log('❌ Coverage requirements not met. Please add tests to meet DoD requirements.');
    console.log('\n📋 DoD Coverage Requirements:');
    console.log('   • Line Coverage: ≥90%');
    console.log('   • Function Coverage: ≥90%');
    console.log('   • Branch Coverage: ≥80%');
    console.log('   • Statement Coverage: ≥90%');
    console.log('\n💡 Tips:');
    console.log('   • Add unit tests for uncovered functions');
    console.log('   • Test edge cases and error conditions');
    console.log('   • Mock external dependencies properly');
    console.log('   • Follow the testing guidelines in TESTING_GUIDELINES.md');
    process.exit(1);
  }
}

// Run coverage verification
verifyCoverage(); 