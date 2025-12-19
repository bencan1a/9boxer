/**
 * Build script: Generate Windows icon (.ico) with all required sizes
 *
 * This script generates a proper Windows .ico file from the source icon.png
 * with all sizes required for modern Windows (10/11).
 *
 * Required sizes for Windows:
 * - 16x16, 32x32, 48x48, 64x64, 128x128, 256x256
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

// Paths
const sourceIcon = path.join(__dirname, '../build/icon.png');
const icoOutput = path.join(__dirname, '../build/icon.ico');

async function generateWindowsIcon() {
  console.log('🔧 Generating Windows icon (.ico) with all required sizes...');
  console.log('Source:', sourceIcon);
  console.log('Output:', icoOutput);

  // Verify source icon exists
  if (!fs.existsSync(sourceIcon)) {
    console.error('❌ Source icon not found:', sourceIcon);
    process.exit(1);
  }

  try {
    // Try using png-to-ico package (more reliable on Windows)
    console.log('Attempting to generate icon with png-to-ico...');
    await execPromise(`npx png-to-ico "${sourceIcon}" > "${icoOutput}"`);

    if (fs.existsSync(icoOutput) && fs.statSync(icoOutput).size > 0) {
      console.log('✅ Generated icon.ico successfully');
      console.log(`   Size: ${Math.round(fs.statSync(icoOutput).size / 1024)}KB`);
      return;
    }
  } catch (error) {
    console.log('⚠️  png-to-ico failed, trying alternative method...');
  }

  try {
    // Alternative: Use to-ico package
    console.log('Attempting with to-ico package...');
    const toIco = require('to-ico');
    const pngBuffer = fs.readFileSync(sourceIcon);

    // Create buffers for different sizes
    const sharp = require('sharp');
    const sizes = [16, 32, 48, 64, 128, 256];
    const buffers = await Promise.all(
      sizes.map(size =>
        sharp(pngBuffer)
          .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer()
      )
    );

    const icoBuffer = await toIco(buffers);
    fs.writeFileSync(icoOutput, icoBuffer);

    console.log('✅ Generated icon.ico successfully with to-ico');
    console.log(`   Size: ${Math.round(icoBuffer.length / 1024)}KB`);
    console.log(`   Included sizes: ${sizes.join('x, ')}x`);
  } catch (error) {
    console.error('❌ Failed to generate icon.ico:', error.message);
    console.log('\n📝 Manual alternatives:');
    console.log('   1. Use ImageMagick: magick convert icon.png -define icon:auto-resize="256,128,64,48,32,16" icon.ico');
    console.log('   2. Use online converter: https://convertio.co/png-ico/');
    console.log('   3. Use icon editor: https://redketchup.io/icon-converter');
    console.log('\nThen save the result as: frontend/build/icon.ico');
    process.exit(1);
  }
}

generateWindowsIcon().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
