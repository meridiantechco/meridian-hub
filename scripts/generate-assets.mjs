import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateAssets() {
  const publicDir = path.resolve('public');
  
  // Read the pure path from logo-raw.svg
  const rawSvg = fs.readFileSync(path.join(publicDir, 'logo-raw.svg'), 'utf-8');
  const pathMatch = rawSvg.match(/<path d="([^"]+)"/);
  if (!pathMatch) {
    throw new Error('Path not found in logo-raw.svg');
  }
  const pathD = pathMatch[1];

  // The symbol bounds in 1600x1600 coordinate system are:
  // X: 628 to 1002 (width = 374, center = 815)
  // Y: 598 to 1028 (height = 430, center = 813)
  
  // Let's create a normalized viewBox with balanced padding
  // Width: 420, Height: 480, X: 605, Y: 574
  const vbX = 605;
  const vbY = 574;
  const vbW = 420;
  const vbH = 480;

  const createSvg = (fillColor) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" width="${vbW}" height="${vbH}">
  <path d="${pathD}" fill="${fillColor}" fill-rule="evenodd" stroke="none" />
</svg>`;

  const svgCurrentColor = createSvg('currentColor');
  const svgWhite = createSvg('#ffffff');
  const svgBlack = createSvg('#09090b');
  const svgPurple = createSvg('#a855f7');

  fs.writeFileSync(path.join(publicDir, 'logo.svg'), svgCurrentColor);
  fs.writeFileSync(path.join(publicDir, 'logo-white.svg'), svgWhite);
  fs.writeFileSync(path.join(publicDir, 'logo-black.svg'), svgBlack);
  fs.writeFileSync(path.join(publicDir, 'logo-purple.svg'), svgPurple);
  console.log('Saved SVG files.');

  // Square SVG for icons / favicon (centered in square viewBox)
  const sqSize = Math.max(vbW, vbH) + 40; // 520
  const sqX = Math.round(815 - sqSize / 2);
  const sqY = Math.round(813 - sqSize / 2);
  
  const createSquareSvg = (fillColor) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${sqX} ${sqY} ${sqSize} ${sqSize}" width="${sqSize}" height="${sqSize}">
  <path d="${pathD}" fill="${fillColor}" fill-rule="evenodd" stroke="none" />
</svg>`;

  fs.writeFileSync(path.join(publicDir, 'logo-icon.svg'), createSquareSvg('currentColor'));
  fs.writeFileSync(path.join(publicDir, 'logo-icon-white.svg'), createSquareSvg('#ffffff'));

  // High-res Transparent PNGs (1024x1024)
  const whiteSquareSvgBuffer = Buffer.from(createSquareSvg('#ffffff'));
  const blackSquareSvgBuffer = Buffer.from(createSquareSvg('#09090b'));
  const purpleSquareSvgBuffer = Buffer.from(createSquareSvg('#a855f7'));

  await sharp(whiteSquareSvgBuffer)
    .resize(1024, 1024)
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'logo-light.png'));

  await sharp(blackSquareSvgBuffer)
    .resize(1024, 1024)
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'logo-dark.png'));

  await sharp(purpleSquareSvgBuffer)
    .resize(1024, 1024)
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'logo-purple.png'));

  // Favicons & PWA icons
  await sharp(whiteSquareSvgBuffer).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32x32.png'));
  await sharp(whiteSquareSvgBuffer).resize(48, 48).png().toFile(path.join(publicDir, 'favicon.ico'));
  await sharp(whiteSquareSvgBuffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(whiteSquareSvgBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'logo-192.png'));
  await sharp(whiteSquareSvgBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'logo-512.png'));

  // App Badge with obsidian background and neon glow
  const badgeSize = 512;
  const badgeSvg = `
  <svg width="${badgeSize}" height="${badgeSize}" viewBox="0 0 ${badgeSize} ${badgeSize}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#181126" />
        <stop offset="50%" stop-color="#0e0a16" />
        <stop offset="100%" stop-color="#050308" />
      </linearGradient>
      <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#c084fc" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#a855f7" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#6366f1" stop-opacity="0.2" />
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#a855f7" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#a855f7" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="${badgeSize}" height="${badgeSize}" rx="112" fill="url(#bgGrad)" />
    <circle cx="${badgeSize/2}" cy="${badgeSize/2}" r="${badgeSize*0.4}" fill="url(#glow)" />
    <rect x="2" y="2" width="${badgeSize - 4}" height="${badgeSize - 4}" rx="110" fill="none" stroke="url(#borderGrad)" stroke-width="3" />
  </svg>`;

  const logoInner = await sharp(whiteSquareSvgBuffer)
    .resize(340, 340)
    .png()
    .toBuffer();

  await sharp(Buffer.from(badgeSvg))
    .composite([{ input: logoInner, top: 86, left: 86 }])
    .png()
    .toFile(path.join(publicDir, 'logo-app-badge.png'));

  console.log('Finished generating all assets!');
}

generateAssets().catch(console.error);
