import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processLogos() {
  console.log('Processing logos...');
  const publicDir = path.resolve('public');
  
  const claraPath = path.join(publicDir, 'logo-clara.jpg');
  const escuraPath = path.join(publicDir, 'logo-escura.jpg');

  if (!fs.existsSync(claraPath) || !fs.existsSync(escuraPath)) {
    console.error('Logo files not found!');
    return;
  }

  // 1. Process logo-escura (white logo on black bg -> white logo with transparent bg)
  const escuraMeta = await sharp(escuraPath).metadata();
  console.log('Escura dimensions:', escuraMeta.width, 'x', escuraMeta.height);

  const { data: escuraRaw, info: escuraInfo } = await sharp(escuraPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const numPixels = escuraInfo.width * escuraInfo.height;
  const escuraChannels = escuraInfo.channels;

  // Create RGBA buffer for white logo with transparency
  const lightLogoBuffer = Buffer.alloc(numPixels * 4);
  // Create RGBA buffer for black logo with transparency
  const darkLogoBuffer = Buffer.alloc(numPixels * 4);

  let minX = escuraInfo.width, maxX = 0, minY = escuraInfo.height, maxY = 0;

  for (let i = 0; i < numPixels; i++) {
    const srcIdx = i * escuraChannels;
    const dstIdx = i * 4;
    const r = escuraRaw[srcIdx];
    const g = escuraRaw[srcIdx + 1];
    const b = escuraRaw[srcIdx + 2];
    
    // Luminance
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // Smooth alpha threshold
    // Below 15 is background (black)
    // Above 180 is solid
    let alpha = 0;
    if (lum > 20) {
      alpha = Math.min(255, Math.round(((lum - 20) / (220 - 20)) * 255));
    }

    const x = i % escuraInfo.width;
    const y = Math.floor(i / escuraInfo.width);

    if (alpha > 10) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }

    // Light logo: White (255, 255, 255) with alpha
    lightLogoBuffer[dstIdx] = 255;
    lightLogoBuffer[dstIdx + 1] = 255;
    lightLogoBuffer[dstIdx + 2] = 255;
    lightLogoBuffer[dstIdx + 3] = alpha;

    // Dark logo: Black (10, 10, 15) with alpha
    darkLogoBuffer[dstIdx] = 15;
    darkLogoBuffer[dstIdx + 1] = 15;
    darkLogoBuffer[dstIdx + 2] = 18;
    darkLogoBuffer[dstIdx + 3] = alpha;
  }

  console.log(`Bounding box detected: X: [${minX}, ${maxX}] (${maxX - minX + 1}px), Y: [${minY}, ${maxY}] (${maxY - minY + 1}px)`);

  const bboxWidth = maxX - minX + 1;
  const bboxHeight = maxY - minY + 1;

  // Add a balanced 6% margin around the cropped bounding box
  const paddingX = Math.round(bboxWidth * 0.08);
  const paddingY = Math.round(bboxHeight * 0.08);

  const cropX = Math.max(0, minX - paddingX);
  const cropY = Math.max(0, minY - paddingY);
  const cropW = Math.min(escuraInfo.width - cropX, bboxWidth + paddingX * 2);
  const cropH = Math.min(escuraInfo.height - cropY, bboxHeight + paddingY * 2);

  // 1. Export trimmed high-res transparent PNGs
  const lightSharp = sharp(lightLogoBuffer, {
    raw: {
      width: escuraInfo.width,
      height: escuraInfo.height,
      channels: 4,
    },
  }).extract({ left: cropX, top: cropY, width: cropW, height: cropH });

  const darkSharp = sharp(darkLogoBuffer, {
    raw: {
      width: escuraInfo.width,
      height: escuraInfo.height,
      channels: 4,
    },
  }).extract({ left: cropX, top: cropY, width: cropW, height: cropH });

  await lightSharp.clone().png({ compressionLevel: 9 }).toFile(path.join(publicDir, 'logo-light.png'));
  console.log('Created public/logo-light.png');

  await darkSharp.clone().png({ compressionLevel: 9 }).toFile(path.join(publicDir, 'logo-dark.png'));
  console.log('Created public/logo-dark.png');

  // 2. Square versions for app icon / favicon / pwa (1:1 aspect ratio centered)
  const maxDim = Math.max(cropW, cropH);
  const squarePadX = Math.round((maxDim - cropW) / 2);
  const squarePadY = Math.round((maxDim - cropH) / 2);

  const iconSquare = await lightSharp.clone().extend({
    top: squarePadY + Math.round(maxDim * 0.06),
    bottom: squarePadY + Math.round(maxDim * 0.06),
    left: squarePadX + Math.round(maxDim * 0.06),
    right: squarePadX + Math.round(maxDim * 0.06),
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  }).toBuffer();

  // Create favicon sizes
  await sharp(iconSquare).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32x32.png'));
  await sharp(iconSquare).resize(48, 48).png().toFile(path.join(publicDir, 'favicon.ico'));
  await sharp(iconSquare).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(iconSquare).resize(192, 192).png().toFile(path.join(publicDir, 'logo-192.png'));
  await sharp(iconSquare).resize(512, 512).png().toFile(path.join(publicDir, 'logo-512.png'));
  console.log('Created favicons & touch icons');

  // Also create a styled version with neon purple / obsidian gradient badge
  const size = 512;
  const badgeSvg = `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#181126" />
        <stop offset="50%" stop-color="#0e0a16" />
        <stop offset="100%" stop-color="#050308" />
      </linearGradient>
      <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#a855f7" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#6366f1" stop-opacity="0.2" />
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#a855f7" stop-opacity="0.25" />
        <stop offset="100%" stop-color="#a855f7" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="112" fill="url(#bgGrad)" />
    <circle cx="${size/2}" cy="${size/2}" r="${size*0.4}" fill="url(#glow)" />
    <rect x="2" y="2" width="${size - 4}" height="${size - 4}" rx="110" fill="none" stroke="url(#borderGrad)" stroke-width="3" />
  </svg>`;

  const logoInner = await sharp(iconSquare).resize(360, 360).toBuffer();

  await sharp(Buffer.from(badgeSvg))
    .composite([{ input: logoInner, top: 76, left: 76 }])
    .png()
    .toFile(path.join(publicDir, 'logo-app-badge.png'));

  console.log('Created logo-app-badge.png');
}

processLogos().catch(console.error);
