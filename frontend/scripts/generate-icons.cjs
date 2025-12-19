/**
 * Build script: Generate platform-specific icons from source PNG
 *
 * This script generates .icns (macOS) file from the source icon.png file.
 * Windows .ico file already exists and doesn't need regeneration.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

// Paths
const sourceIcon = path.join(__dirname, '../build/icon.png');
const icnsOutput = path.join(__dirname, '../build/icon.icns');
const buildDir = path.join(__dirname, '../build');

async function generateIcns() {
  console.log('🔧 Generating macOS icon (.icns)...');

  try {
    // Use icon-gen package to generate icns
    const iconGenPath = path.join(__dirname, '..', 'node_modules', '.bin', 'icon-gen');
    await execPromise(`npx icon-gen --input "${sourceIcon}" --output "${buildDir}" --icns`);

    // icon-gen creates icon.icns in the output directory
    if (fs.existsSync(icnsOutput)) {
      console.log('✅ Generated icon.icns');
    } else {
      throw new Error('icon.icns was not created');
    }
  } catch (error) {
    console.error('❌ Failed to generate icon.icns:', error.message);
    console.log('\nℹ️  Alternative: You can generate icon.icns manually using:');
    console.log('   - macOS: Use iconutil or Image2icon app');
    console.log('   - Online: Use https://cloudconvert.com/png-to-icns');
    console.log('   - Then save the file as: frontend/build/icon.icns');
    process.exit(1);
  }
}

async function main() {
  console.log('📦 Icon Generation Script');
  console.log('Source:', sourceIcon);

  // Verify source icon exists
  if (!fs.existsSync(sourceIcon)) {
    console.error('❌ Source icon not found:', sourceIcon);
    process.exit(1);
  }

  // Check if icns already exists
  if (fs.existsSync(icnsOutput)) {
    console.log('ℹ️  icon.icns already exists');
    const answer = await new Promise((resolve) => {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      readline.question('Regenerate? (y/N): ', (ans) => {
        readline.close();
        resolve(ans.toLowerCase() === 'y');
      });
    });

    if (!answer) {
      console.log('✅ Skipping icon generation');
      return;
    }
  }

  // Generate macOS icon
  await generateIcns();

  console.log('✅ Icon generation complete!');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
