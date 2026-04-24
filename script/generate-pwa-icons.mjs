/**
 * Generates PNG icons for PWA / apple-touch-icon from inline SVG.
 * Run: node script/generate-pwa-icons.mjs
 */
import { mkdir } from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const outDir = path.join(root, "public", "icons")

function svgMarkup(size) {
  const r = Math.round(size * 0.2)
  const fs = Math.round(size * 0.32)
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#134e4a"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#bg)"/>
  <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-weight="700" font-size="${fs}" fill="#f8fafc">AL</text>
</svg>`
}

async function main() {
  await mkdir(outDir, { recursive: true })
  const sizes = [
    ["icon-192.png", 192],
    ["icon-512.png", 512],
    ["apple-touch-icon.png", 180],
  ]
  for (const [name, size] of sizes) {
    const buf = Buffer.from(svgMarkup(size))
    await sharp(buf).png().toFile(path.join(outDir, name))
  }
  console.log("Wrote:", sizes.map(([n]) => `public/icons/${n}`).join(", "))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
