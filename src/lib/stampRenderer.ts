import { FilterStyle, StampItem } from '../types';

/**
 * Applies artistic filters directly to Canvas 2D context image data
 */
export function applyFilterToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filterStyle: FilterStyle
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  switch (filterStyle) {
    case 'sepia': {
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
        data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
        data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
      }
      break;
    }

    case 'monochrome': {
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        // High contrast sumi ink style
        const ink = gray < 120 ? Math.max(20, gray * 0.7) : Math.min(240, gray * 1.1);
        data[i] = ink;
        data[i + 1] = ink;
        data[i + 2] = ink;
      }
      break;
    }

    case 'halftone': {
      // Dithered halftone dot aesthetic
      const step = 4;
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          let sum = 0;
          let count = 0;
          for (let dy = 0; dy < step && y + dy < height; dy++) {
            for (let dx = 0; dx < step && x + dx < width; dx++) {
              const idx = ((y + dy) * width + (x + dx)) * 4;
              sum += data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
              count++;
            }
          }
          const avg = sum / count;
          const radius = (1 - avg / 255) * (step / 1.4);

          for (let dy = 0; dy < step && y + dy < height; dy++) {
            for (let dx = 0; dx < step && x + dx < width; dx++) {
              const idx = ((y + dy) * width + (x + dx)) * 4;
              const dist = Math.hypot(dx - step / 2, dy - step / 2);
              if (dist <= radius) {
                // Indigo/black halftone dot
                data[idx] = 30;
                data[idx + 1] = 35;
                data[idx + 2] = 50;
              } else {
                // Paper tone
                data[idx] = 245;
                data[idx + 1] = 240;
                data[idx + 2] = 230;
              }
            }
          }
        }
      }
      break;
    }

    case 'risograph': {
      // Vermilion + Indigo duotone risograph
      for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
        if (gray < 0.5) {
          // Deep indigo ink
          const factor = gray * 2;
          data[i] = Math.round(30 + factor * 180);
          data[i + 1] = Math.round(40 + factor * 100);
          data[i + 2] = Math.round(80 + factor * 80);
        } else {
          // Bright vermilion warm ink
          const factor = (gray - 0.5) * 2;
          data[i] = Math.round(220 - factor * 20);
          data[i + 1] = Math.round(70 + factor * 150);
          data[i + 2] = Math.round(50 + factor * 170);
        }
      }
      break;
    }

    case 'ukiyoe': {
      // Woodblock print look with rich saturation and outlined darks
      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Boost saturation & contrast
        r = Math.min(255, Math.max(0, (r - 128) * 1.3 + 128));
        g = Math.min(255, Math.max(0, (g - 128) * 1.3 + 128));
        b = Math.min(255, Math.max(0, (b - 128) * 1.3 + 128));

        // Warm japanese color shift
        data[i] = Math.min(255, r * 1.05 + 10);
        data[i + 1] = Math.min(255, g * 0.98);
        data[i + 2] = Math.min(255, b * 0.90);
      }
      break;
    }

    case 'watercolor': {
      // Soft watercolor bloom
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        data[i] = Math.min(255, r * 0.9 + 30);
        data[i + 1] = Math.min(255, g * 0.95 + 25);
        data[i + 2] = Math.min(255, b * 0.85 + 20);
      }
      break;
    }

    case 'retroGrain': {
      // Warm vintage film grain
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 25;
        data[i] = Math.min(255, Math.max(0, data[i] + noise + 10));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise + 5));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise - 10));
      }
      break;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Renders high-resolution printable/downloadable digital postage stamp on canvas
 * with authentic serrated/perforated edges and transparent cutout teeth
 */
export async function renderStampToCanvas(
  stamp: StampItem,
  exportWidth = 1200,
  exportHeight = 1500
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = exportWidth;
  canvas.height = exportHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  // Clear canvas (transparent background)
  ctx.clearRect(0, 0, exportWidth, exportHeight);

  // 1. Fill base stamp paper background across full surface (with user selected paper color)
  const paperColor = stamp.frameColor || '#F5F0E6';
  ctx.fillStyle = paperColor;
  ctx.fillRect(0, 0, exportWidth, exportHeight);

  // 2. Punch out serrated scalloped stamp perforations (teeth) with transparent cutouts
  const holeRadius = Math.round(exportWidth * 0.018); // ~22px
  const numHolesX = Math.round(exportWidth / (holeRadius * 2.2));
  const stepX = exportWidth / numHolesX;

  const numHolesY = Math.round(exportHeight / (holeRadius * 2.2));
  const stepY = exportHeight / numHolesY;

  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = '#000000';

  // Top and bottom serrated holes
  for (let i = 0; i <= numHolesX; i++) {
    const x = i * stepX;
    // Top edge hole
    ctx.beginPath();
    ctx.arc(x, 0, holeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Bottom edge hole
    ctx.beginPath();
    ctx.arc(x, exportHeight, holeRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Left and right serrated holes
  for (let j = 0; j <= numHolesY; j++) {
    const y = j * stepY;
    // Left edge hole
    ctx.beginPath();
    ctx.arc(0, y, holeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Right edge hole
    ctx.beginPath();
    ctx.arc(exportWidth, y, holeRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 3. Stamp Inner Printable Box Margins
  const marginX = Math.round(exportWidth * 0.07); // 7% margin
  const marginY = Math.round(exportHeight * 0.07);
  const stampBoxW = exportWidth - marginX * 2;
  const stampBoxH = exportHeight - marginY * 2;

  // Inner parchment/paper box
  ctx.fillStyle = '#FAF8F5';
  ctx.fillRect(marginX, marginY, stampBoxW, stampBoxH);

  // Dark border frame around inner printable area
  ctx.lineWidth = Math.round(exportWidth * 0.007);
  ctx.strokeStyle = '#2b2825';
  ctx.strokeRect(marginX, marginY, stampBoxW, stampBoxH);

  // 4. Header Text (Country / Header)
  const headerHeight = Math.round(exportHeight * 0.08);
  ctx.fillStyle = '#2b2825';
  ctx.font = `bold ${Math.round(exportWidth * 0.042)}px "Cormorant Garamond", "Noto Serif", "Playfair Display", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Use user provided subtitle/kanji if present, otherwise default to Italian Post
  const headerText = stamp.kanjiTitle && stamp.kanjiTitle.trim() !== '' ? stamp.kanjiTitle : 'POSTE ITALIANE';
  ctx.fillText(headerText, exportWidth / 2, marginY + headerHeight / 2);

  // 5. Draw Image Area with Filter
  const imgAreaX = marginX + Math.round(stampBoxW * 0.05);
  const imgAreaY = marginY + headerHeight + Math.round(stampBoxH * 0.01);
  const imgAreaW = stampBoxW - Math.round(stampBoxW * 0.10);
  const imgAreaH = stampBoxH - headerHeight - Math.round(stampBoxH * 0.22);

  // Draw inner frame around image
  ctx.lineWidth = Math.round(exportWidth * 0.004);
  ctx.strokeStyle = '#2b2825';
  ctx.strokeRect(imgAreaX, imgAreaY, imgAreaW, imgAreaH);

  // Load photo
  if (stamp.imageUrl) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image failed to load'));
        img.src = stamp.imageUrl;
      });

      // Offscreen canvas for filter processing
      const offCanvas = document.createElement('canvas');
      offCanvas.width = imgAreaW;
      offCanvas.height = imgAreaH;
      const offCtx = offCanvas.getContext('2d')!;

      // Draw object-fit cover
      const imgAspect = img.width / img.height;
      const areaAspect = imgAreaW / imgAreaH;
      let renderW = imgAreaW;
      let renderH = imgAreaH;
      let renderX = 0;
      let renderY = 0;

      if (imgAspect > areaAspect) {
        renderW = imgAreaH * imgAspect;
        renderX = (imgAreaW - renderW) / 2;
      } else {
        renderH = imgAreaW / imgAspect;
        renderY = (imgAreaH - renderH) / 2;
      }

      offCtx.drawImage(img, renderX, renderY, renderW, renderH);

      // Apply Filter
      if (stamp.filterStyle) {
        applyFilterToCanvas(offCtx, imgAreaW, imgAreaH, stamp.filterStyle);
      }

      ctx.drawImage(offCanvas, imgAreaX, imgAreaY, imgAreaW, imgAreaH);
    } catch (e) {
      console.warn('Could not draw photo on stamp canvas:', e);
    }
  }

  // 6. Denomination Value & Title Bar
  const footerY = imgAreaY + imgAreaH + Math.round(stampBoxH * 0.03);
  
  // Denomination (e.g. €0,80) on bottom left (Optional - only render if provided)
  if (stamp.denomination && stamp.denomination.trim() !== '') {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#b43c28'; // Vermilion red
    ctx.font = `bold ${Math.round(exportWidth * 0.065)}px "Cormorant Garamond", "Playfair Display", serif`;
    ctx.fillText(stamp.denomination, imgAreaX, footerY + Math.round(exportHeight * 0.04));
  }

  // Stamp Title on bottom right
  ctx.textAlign = 'right';
  ctx.fillStyle = '#2b2825';
  ctx.font = `600 ${Math.round(exportWidth * 0.035)}px sans-serif`;
  ctx.fillText(stamp.title || 'Recuerdo', imgAreaX + imgAreaW, footerY + Math.round(exportHeight * 0.025));

  ctx.fillStyle = '#666666';
  ctx.font = `400 ${Math.round(exportWidth * 0.026)}px sans-serif`;
  ctx.fillText(stamp.date || '2026', imgAreaX + imgAreaW, footerY + Math.round(exportHeight * 0.055));

  // 7. Rubber Postal Cancellation Ink Stamp Seal
  const sealRadius = Math.round(exportWidth * 0.14);
  const sealCenterX = imgAreaX + imgAreaW * 0.82;
  const sealCenterY = imgAreaY + imgAreaH * 0.85;

  ctx.save();
  ctx.globalAlpha = 0.78;
  ctx.strokeStyle = '#1e293b'; // Postal indigo ink
  ctx.fillStyle = '#1e293b';
  ctx.lineWidth = Math.round(exportWidth * 0.005);

  // Outer ring
  ctx.beginPath();
  ctx.arc(sealCenterX, sealCenterY, sealRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Inner ring
  ctx.beginPath();
  ctx.arc(sealCenterX, sealCenterY, sealRadius * 0.88, 0, Math.PI * 2);
  ctx.stroke();

  // Seal Text (City & Date)
  ctx.textAlign = 'center';
  ctx.font = `bold ${Math.round(exportWidth * 0.024)}px sans-serif`;
  ctx.fillText((stamp.postmarkCity || 'ROMA').toUpperCase(), sealCenterX, sealCenterY - sealRadius * 0.3);

  ctx.font = `500 ${Math.round(exportWidth * 0.022)}px monospace`;
  ctx.fillText(stamp.date ? stamp.date.replace(/-/g, '.') : '2026.07.29', sealCenterX, sealCenterY + sealRadius * 0.1);

  ctx.font = `bold ${Math.round(exportWidth * 0.020)}px sans-serif`;
  ctx.fillText('• POSTE •', sealCenterX, sealCenterY + sealRadius * 0.45);

  // Postal Wave Lines
  ctx.lineWidth = Math.round(exportWidth * 0.003);
  for (let waveIndex = -2; waveIndex <= 2; waveIndex++) {
    ctx.beginPath();
    const waveY = sealCenterY + waveIndex * (sealRadius * 0.22);
    ctx.moveTo(sealCenterX - sealRadius * 1.8, waveY);
    ctx.bezierCurveTo(
      sealCenterX - sealRadius * 1.2, waveY - 8,
      sealCenterX - sealRadius * 0.6, waveY + 8,
      sealCenterX - sealRadius * 0.1, waveY
    );
    ctx.stroke();
  }
  ctx.restore();

  return canvas;
}

/**
 * Triggers high-res PNG download of a stamp
 */
export async function downloadStampPNG(stamp: StampItem) {
  const canvas = await renderStampToCanvas(stamp, 1200, 1500);
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  const fileName = `stamp-${stamp.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${stamp.date}.png`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
