import { HexCoordinate, PixelCoordinate } from '../types'

export const HEX_SIZE = 30

export function hexToPixel(hex: HexCoordinate, center: PixelCoordinate): PixelCoordinate {
  const x = HEX_SIZE * (Math.sqrt(3) * hex.q + Math.sqrt(3) / 2 * hex.r) + center.x
  const y = HEX_SIZE * (3 / 2 * hex.r) + center.y
  return { x, y }
}

export function pixelToHex(pixel: PixelCoordinate, center: PixelCoordinate): HexCoordinate {
  const x = pixel.x - center.x
  const y = pixel.y - center.y
  const q = (Math.sqrt(3) / 3 * x - 1 / 3 * y) / HEX_SIZE
  const r = (2 / 3 * y) / HEX_SIZE
  return hexRound({ q, r })
}

export function hexRound(hex: HexCoordinate): HexCoordinate {
  let q = Math.round(hex.q)
  let r = Math.round(hex.r)
  const s = Math.round(-hex.q - hex.r)
  
  const qDiff = Math.abs(q - hex.q)
  const rDiff = Math.abs(r - hex.r)
  const sDiff = Math.abs(s - (-hex.q - hex.r))
  
  if (qDiff > rDiff && qDiff > sDiff) {
    q = -r - s
  } else if (rDiff > sDiff) {
    r = -q - s
  }
  
  return { q, r }
}

export function getHexDistance(a: HexCoordinate, b: HexCoordinate): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2
}

export function getNeighbors(hex: HexCoordinate): HexCoordinate[] {
  const directions = [
    { q: 1, r: 0 },
    { q: 1, r: -1 },
    { q: 0, r: -1 },
    { q: -1, r: 0 },
    { q: -1, r: 1 },
    { q: 0, r: 1 }
  ]
  
  return directions.map(dir => ({
    q: hex.q + dir.q,
    r: hex.r + dir.r
  }))
}

export function isValidHex(hex: HexCoordinate, gridRadius: number): boolean {
  const s = -hex.q - hex.r
  return Math.abs(hex.q) <= gridRadius && 
         Math.abs(hex.r) <= gridRadius && 
         Math.abs(s) <= gridRadius
}

export function getHexesInRange(center: HexCoordinate, range: number): HexCoordinate[] {
  const hexes: HexCoordinate[] = []
  
  for (let q = -range; q <= range; q++) {
    for (let r = Math.max(-range, -q - range); r <= Math.min(range, -q + range); r++) {
      const hex = { q: center.q + q, r: center.r + r }
      hexes.push(hex)
    }
  }
  
  return hexes
}

export function hexToKey(hex: HexCoordinate): string {
  return `${hex.q},${hex.r}`
}

export function keyToHex(key: string): HexCoordinate {
  const [q, r] = key.split(',').map(Number)
  return { q, r }
}

export function drawHex(
  ctx: CanvasRenderingContext2D,
  center: PixelCoordinate,
  size: number = HEX_SIZE
): void {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = 2 * Math.PI / 6 * i
    const x = center.x + size * Math.cos(angle)
    const y = center.y + size * Math.sin(angle)
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.closePath()
}

export function isPointInHex(point: PixelCoordinate, hexCenter: PixelCoordinate, size: number = HEX_SIZE): boolean {
  const dx = Math.abs(point.x - hexCenter.x)
  const dy = Math.abs(point.y - hexCenter.y)
  
  if (dx > size * Math.sqrt(3) / 2 || dy > size) {
    return false
  }
  
  return dx / (Math.sqrt(3) / 2) + dy / 1 <= size
}

export function interpolateHex(a: HexCoordinate, b: HexCoordinate, t: number): HexCoordinate {
  return {
    q: a.q + (b.q - a.q) * t,
    r: a.r + (b.r - a.r) * t
  }
}

export function getLineBetweenHexes(a: HexCoordinate, b: HexCoordinate): HexCoordinate[] {
  const distance = getHexDistance(a, b)
  const hexes: HexCoordinate[] = []
  
  for (let i = 0; i <= distance; i++) {
    const t = distance === 0 ? 0 : i / distance
    const interpolated = interpolateHex(a, b, t)
    hexes.push(hexRound(interpolated))
  }
  
  return hexes
}