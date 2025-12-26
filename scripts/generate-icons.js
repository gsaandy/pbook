import sharp from 'sharp'
import { join } from 'path'

// PSBook branded icon - indigo background with white "PS" text
// Using SVG to create the base image

const createIconSVG = (size) => {
  const fontSize = Math.round(size * 0.45)
  const textY = Math.round(size * 0.62)

  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#4f46e5" rx="${Math.round(size * 0.15)}"/>
      <text
        x="50%"
        y="${textY}"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="${fontSize}"
        font-weight="700"
        fill="white"
        text-anchor="middle"
      >PS</text>
    </svg>
  `
}

const sizes = [180, 192, 512] // 180 is for apple-touch-icon
const publicDir = join(import.meta.dirname, '..', 'public')

for (const size of sizes) {
  const svg = createIconSVG(size)
  const outputPath = join(publicDir, `logo${size}.png`)

  await sharp(Buffer.from(svg)).png().toFile(outputPath)

  console.log(`Generated: logo${size}.png`)
}

console.log('Icon generation complete!')
