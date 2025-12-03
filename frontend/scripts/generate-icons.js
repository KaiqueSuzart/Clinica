// Script para gerar ícones PWA válidos usando sharp
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');

// Cor azul do tema: #2563eb = rgb(37, 99, 235)
const themeColor = { r: 37, g: 99, b: 235 };

async function generateIcon(size, filename) {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="rgb(${themeColor.r}, ${themeColor.g}, ${themeColor.b})"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" 
            fill="white" text-anchor="middle" dominant-baseline="middle">🦷</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(path.join(publicDir, filename));

  console.log(`✅ Gerado: ${filename} (${size}x${size})`);
}

async function generateAllIcons() {
  console.log('🎨 Gerando ícones PWA...\n');

  try {
    // Gerar ícones PWA
    await generateIcon(192, 'pwa-192x192.png');
    await generateIcon(512, 'pwa-512x512.png');
    await generateIcon(180, 'apple-touch-icon.png');

    console.log('\n✅ Todos os ícones foram gerados com sucesso!');
    console.log('📁 Localização: public/');
  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error);
    process.exit(1);
  }
}

generateAllIcons();
