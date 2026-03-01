#!/usr/bin/env node

/**
 * Pre-flight check script
 * Verifies all dependencies and configurations are correct
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Running Pre-flight Checks...\n');

const checks = {
    passed: 0,
    failed: 0,
    warnings: 0
};

function checkPass(message) {
    console.log(`✅ ${message}`);
    checks.passed++;
}

function checkFail(message) {
    console.log(`❌ ${message}`);
    checks.failed++;
}

function checkWarn(message) {
    console.log(`⚠️  ${message}`);
    checks.warnings++;
}

// Check Node modules
if (fs.existsSync('node_modules')) {
    checkPass('node_modules exists');

    // Check critical packages
    const criticalPackages = [
        'react',
        'react-dom',
        'framer-motion',
        'three',
        '@react-three/fiber',
        'lucide-react',
        'axios',
        'react-dropzone'
    ];

    criticalPackages.forEach(pkg => {
        if (fs.existsSync(`node_modules/${pkg}`)) {
            checkPass(`Package installed: ${pkg}`);
        } else {
            checkFail(`Package missing: ${pkg}`);
        }
    });
} else {
    checkFail('node_modules not found - run npm install');
}

// Check source files
const criticalFiles = [
    'src/App.tsx',
    'src/main.tsx',
    'src/api.ts',
    'src/components/FileConverter.tsx',
    'src/components/Background3D.tsx',
    'src/components/ConversionCard.tsx',
    'src/index.css'
];

criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
        checkPass(`Source file exists: ${file}`);
    } else {
        checkFail(`Source file missing: ${file}`);
    }
});

// Check config files
const configFiles = [
    'package.json',
    'vite.config.ts',
    'tailwind.config.js',
    'tsconfig.json',
    'index.html'
];

configFiles.forEach(file => {
    if (fs.existsSync(file)) {
        checkPass(`Config file exists: ${file}`);
    } else {
        checkFail(`Config file missing: ${file}`);
    }
});

// Print summary
console.log('\n' + '='.repeat(50));
console.log('📊 Summary:');
console.log(`   ✅ Passed: ${checks.passed}`);
console.log(`   ⚠️  Warnings: ${checks.warnings}`);
console.log(`   ❌ Failed: ${checks.failed}`);
console.log('='.repeat(50) + '\n');

if (checks.failed === 0) {
    console.log('🎉 All checks passed! Ready to run: npm run dev\n');
    process.exit(0);
} else {
    console.log('❌ Some checks failed. Please fix issues before running.\n');
    process.exit(1);
}
