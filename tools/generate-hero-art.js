const fs = require("fs");
const path = require("path");

const bundledModules = "C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const sharp = require(path.join(bundledModules, "sharp"));

const outputDir = path.join(process.cwd(), "assets");
fs.mkdirSync(outputDir, { recursive: true });

const svg = `
<svg width="2000" height="1180" viewBox="0 0 2000 1180" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#dceafb"/>
      <stop offset="0.5" stop-color="#c7ddf2"/>
      <stop offset="1" stop-color="#e9f1f7"/>
    </linearGradient>
    <linearGradient id="far" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#91aac3"/>
      <stop offset="1" stop-color="#c9d8e5"/>
    </linearGradient>
    <linearGradient id="mid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6e8ba8"/>
      <stop offset="1" stop-color="#b8c9d9"/>
    </linearGradient>
    <linearGradient id="near" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#496b8e"/>
      <stop offset="1" stop-color="#8eabc4"/>
    </linearGradient>
    <filter id="mist"><feGaussianBlur stdDeviation="22"/></filter>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="21"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="table" tableValues="0 0.075"/></feComponentTransfer>
    </filter>
  </defs>
  <rect width="2000" height="1180" fill="url(#sky)"/>
  <circle cx="1535" cy="210" r="130" fill="#fff8df" opacity="0.56"/>
  <path d="M0 560 L180 440 L330 505 L510 325 L660 490 L830 360 L1020 515 L1215 300 L1395 480 L1600 340 L1800 500 L2000 390 L2000 820 L0 820 Z" fill="url(#far)" opacity="0.62"/>
  <path d="M0 720 L240 500 L395 650 L650 315 L910 665 L1160 400 L1410 650 L1635 420 L1860 650 L2000 530 L2000 940 L0 940 Z" fill="url(#mid)"/>
  <path d="M0 800 L275 600 L450 735 L690 420 L835 610 L1010 510 L1215 735 L1450 500 L1630 700 L1845 535 L2000 710 L2000 1180 L0 1180 Z" fill="url(#near)"/>
  <g fill="#f8fbff" opacity="0.9">
    <path d="M510 505 L650 315 L720 448 L680 430 L650 470 L620 425 L585 468 Z"/>
    <path d="M1070 475 L1160 400 L1230 498 L1190 480 L1160 510 L1128 476 Z"/>
    <path d="M1370 560 L1450 500 L1530 590 L1490 574 L1450 605 L1418 568 Z"/>
    <path d="M1770 595 L1845 535 L1920 620 L1880 604 L1848 633 L1815 598 Z"/>
  </g>
  <g fill="none" stroke="#dce9f4" stroke-width="14" opacity="0.38">
    <path d="M60 975 C420 900 610 970 940 900 C1270 830 1540 920 1980 825"/>
    <path d="M20 1040 C360 960 700 1070 1040 975 C1390 875 1650 1010 2020 915"/>
  </g>
  <g filter="url(#mist)" fill="#f6fbff" opacity="0.42">
    <ellipse cx="520" cy="730" rx="430" ry="80"/>
    <ellipse cx="1440" cy="780" rx="520" ry="92"/>
  </g>
  <rect width="2000" height="1180" filter="url(#grain)" opacity="0.8"/>
</svg>`;

async function run() {
  const hero = sharp(Buffer.from(svg)).png({ quality: 94, compressionLevel: 9 });
  await hero.toFile(path.join(outputDir, "hero-mountain.png"));
  await sharp(Buffer.from(svg))
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .png({ quality: 94, compressionLevel: 9 })
    .toFile(path.join(outputDir, "og-cover.png"));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
