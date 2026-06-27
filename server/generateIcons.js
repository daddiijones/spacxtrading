import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync } from 'fs'

const crcTable = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
  crcTable[i] = c >>> 0
}
function crc32(buf) {
  let c = 0xFFFFFFFF
  for (const b of buf) c = (crcTable[(c ^ b) & 0xFF] ^ (c >>> 8)) >>> 0
  return (c ^ 0xFFFFFFFF) >>> 0
}
function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  const d = Buffer.isBuffer(data) ? data : Buffer.from(data)
  const len = Buffer.alloc(4); len.writeUInt32BE(d.length)
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(Buffer.concat([t, d])))
  return Buffer.concat([len, t, d, crcBuf])
}

function makePNG(size) {
  // SpaceX Trading icon: dark bg (#07090e) with a blue (#0ea5e9) rocket silhouette
  const BG     = [7, 9, 14]       // #07090e
  const ACCENT = [14, 165, 233]    // #0ea5e9
  const WHT    = [255, 255, 255]  // white accent (window + flame)

  const pixels = []
  const pad = Math.round(size * 0.15)
  const inner = size - pad * 2

  for (let y = 0; y < size; y++) {
    pixels.push(0) // filter byte: None
    for (let x = 0; x < size; x++) {
      const lx = x - pad, ly = y - pad
      let color = BG

      if (lx >= 0 && lx < inner && ly >= 0 && ly < inner) {
        const nx = lx / inner, ny = ly / inner
        const dx = Math.abs(nx - 0.5)

        if (ny <= 0.34) {
          // Nose cone tapering to a point at the top
          const halfWidth = 0.16 * (ny / 0.34)
          if (dx <= halfWidth) color = ACCENT
        } else if (ny <= 0.66) {
          // Body
          if (dx <= 0.16) color = ACCENT
        } else if (ny <= 0.84) {
          // Flared fin skirt
          const t = (ny - 0.66) / 0.18
          const finHalf = 0.16 + 0.14 * t
          if (dx <= finHalf) color = ACCENT
        } else if (ny <= 0.95) {
          // Engine flame
          const t = (ny - 0.84) / 0.11
          const flameHalf = 0.30 * (1 - t)
          if (dx <= flameHalf) color = WHT
        }

        // Small porthole window near the nose
        const wx = nx - 0.5, wy = ny - 0.46
        if (wx * wx + wy * wy < 0.0036) color = WHT
      }

      pixels.push(...color)
    }
  }

  const rawData = Buffer.from(pixels)
  const idat = deflateSync(rawData, { level: 9 })

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 2  // color type: RGB
  // compression=0, filter=0, interlace=0 already zero

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0))
  ])
}

mkdirSync('public/icons', { recursive: true })
for (const size of [192, 512]) {
  writeFileSync(`public/icons/icon-${size}.png`, makePNG(size))
  console.log(`✅ Created public/icons/icon-${size}.png (${size}x${size})`)
}
console.log('🎉 Icons generated!')
