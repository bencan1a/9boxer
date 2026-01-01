#!/usr/bin/env node

const data = {
  translations: [
    { name: "translation-CxqGyqpJ.js", size: 16.25, gzip: 5.76 },
    { name: "translation-DXIE1Sez.js", size: 18.01, gzip: 6.44 },
    { name: "translation-92iHr8EU.js", size: 18.09, gzip: 6.87 },
    { name: "translation-CtmIjriM.js", size: 18.33, gzip: 6.62 },
    { name: "translation-WcZFzw0D.js", size: 18.65, gzip: 6.63 },
    { name: "translation-BJAw3s31.js", size: 20.01, gzip: 7.32 },
    { name: "translation-_80Y6IN9.js", size: 29.75, gzip: 7.44 }, // English
  ],
  vendors: [
    { name: "vendor-emotion-hJ3u0xn_.js", size: 19.27, gzip: 8.3 },
    { name: "vendor-dnd-DqcwwXcb.js", size: 41.85, gzip: 14.05 },
    { name: "vendor-i18n-Cz3UYUoS.js", size: 49.52, gzip: 15.71 },
    { name: "vendor-other-D-uGMlZi.js", size: 208.55, gzip: 76.28 },
    { name: "vendor-react-wfYGfEgt.js", size: 210.97, gzip: 67.53 },
    { name: "vendor-recharts-CobQnET3.js", size: 236.78, gzip: 55.72 },
    { name: "vendor-mui-CtcyM664.js", size: 330.3, gzip: 97.49 },
  ],
  app: { name: "index-u8-p6aP8.js", size: 148.15, gzip: 38.24 },
};

// Initial load (app + vendors + English only)
const initialLoadUncompressed =
  data.app.size + data.vendors.reduce((sum, v) => sum + v.size, 0) + 29.75; // English translation

const initialLoadGzipped =
  data.app.gzip + data.vendors.reduce((sum, v) => sum + v.gzip, 0) + 7.44; // English translation gzipped

// Total if all translations loaded
const totalUncompressed =
  initialLoadUncompressed +
  data.translations.slice(0, -1).reduce((sum, t) => sum + t.size, 0);

const totalGzipped =
  initialLoadGzipped +
  data.translations.slice(0, -1).reduce((sum, t) => sum + t.gzip, 0);

console.log("=== Bundle Size Analysis ===\n");
console.log("Initial Load (with English only):");
console.log(`  Uncompressed: ${initialLoadUncompressed.toFixed(2)} KB`);
console.log(`  Gzipped: ${initialLoadGzipped.toFixed(2)} KB`);
console.log("");
console.log("If all 7 translations loaded:");
console.log(`  Uncompressed: ${totalUncompressed.toFixed(2)} KB`);
console.log(`  Gzipped: ${totalGzipped.toFixed(2)} KB`);
console.log("");
console.log("Savings from lazy translations:");
console.log(
  `  Uncompressed: ${(totalUncompressed - initialLoadUncompressed).toFixed(2)} KB`
);
console.log(`  Gzipped: ${(totalGzipped - initialLoadGzipped).toFixed(2)} KB`);
console.log("");
console.log("Breakdown by vendor:");
data.vendors.forEach((v) => {
  console.log(
    `  ${v.name}: ${v.size.toFixed(2)} KB (gzip: ${v.gzip.toFixed(2)} KB)`
  );
});
