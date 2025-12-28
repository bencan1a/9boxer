/**
 * Generate icon files from the Logo component
 *
 * This script:
 * 1. Renders the Logo component (gradient-bordered variant) at various sizes
 * 2. Captures screenshots as PNG files
 * 3. Saves to frontend/build/ directory
 *
 * After running this, use frontend/scripts/create_icon.py to generate .ico file
 */

import { chromium } from "@playwright/test";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// SVG template for gradient-bordered logo
function getLogoSVG(size: number): string {
  const gap = size * 0.05;
  const boxSize = (size - gap * 2) / 3;
  const cornerRadius = size * 0.04;
  const strokeWidth = size * 0.03;

  // Gradient colors from splash screen
  const gradientStart = "#1e3c72";
  const gradientMid = "#2a5298";
  const gradientEnd = "#7e22ce";

  // Border color for light mode (dark borders)
  const borderColor = "rgba(0, 0, 0, 0.3)";

  // Grid positions
  const positions = [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: 2 },
    { row: 1, col: 0 },
    { row: 1, col: 1 },
    { row: 1, col: 2 },
    { row: 2, col: 0 },
    { row: 2, col: 1 },
    { row: 2, col: 2 },
  ];

  const getBoxPosition = (row: number, col: number) => ({
    x: col * (boxSize + gap),
    y: row * (boxSize + gap),
  });

  const boxes = positions
    .map((pos, i) => {
      const { x, y } = getBoxPosition(pos.row, pos.col);
      const isCenter = i === 4;

      return `
      <rect
        x="${x}"
        y="${y}"
        width="${boxSize}"
        height="${boxSize}"
        rx="${cornerRadius / 2}"
        fill="${isCenter ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.2)"}"
        stroke="${borderColor}"
        stroke-width="${strokeWidth}"
        ${isCenter ? 'filter="url(#glow-bordered)"' : ""}
      />`;
    })
    .join("");

  return `
    <svg
      width="${size}"
      height="${size}"
      viewBox="0 0 ${size} ${size}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="grad-box-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${gradientStart}" />
          <stop offset="50%" stop-color="${gradientMid}" />
          <stop offset="100%" stop-color="${gradientEnd}" />
        </linearGradient>
        <filter id="glow-bordered">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="url(#grad-box-fill)" />
      ${boxes}
    </svg>`;
}

async function generateIcons() {
  const sizes = [16, 32, 48, 64, 128, 256, 512, 1024];
  const buildDir = join(__dirname, "..", "build");

  // Create build directory if it doesn't exist
  mkdirSync(buildDir, { recursive: true });

  console.log("Generating logo icon files...");
  console.log("=".repeat(50));

  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const size of sizes) {
    console.log(`Generating ${size}x${size} icon...`);

    const svg = getLogoSVG(size);
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              width: ${size}px;
              height: ${size}px;
              background: transparent;
            }
          </style>
        </head>
        <body>
          ${svg}
        </body>
      </html>
    `;

    await page.setContent(html);
    await page.setViewportSize({ width: size, height: size });

    const outputPath = join(buildDir, `icon_${size}x${size}.png`);
    await page.screenshot({
      path: outputPath,
      omitBackground: true,
    });

    console.log(`   [OK] Saved: icon_${size}x${size}.png`);
  }

  await browser.close();

  // Also save the main icon.png (512x512)
  const mainIconSrc = join(buildDir, "icon_512x512.png");
  const mainIconDest = join(buildDir, "icon.png");
  const fs = await import("fs/promises");
  await fs.copyFile(mainIconSrc, mainIconDest);
  console.log("\n[OK] Saved main icon: icon.png (512x512)");

  console.log("\n" + "=".repeat(50));
  console.log("All PNG icons generated successfully!");
  console.log(`Output directory: ${buildDir}`);
  console.log("\nNext steps:");
  console.log("  1. Run: cd frontend && python scripts/create_icon.py");
  console.log("     (Creates Windows .ico file)");
  console.log("  2. For macOS .icns: Use online converter or macOS iconutil");
  console.log("     (Electron Builder can auto-generate from icon.png)");
}

// Run the script
generateIcons().catch((error) => {
  console.error("\n[ERROR]", error);
  process.exit(1);
});
