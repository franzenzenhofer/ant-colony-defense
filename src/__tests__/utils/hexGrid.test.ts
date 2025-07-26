import { describe, it, expect } from 'vitest'
import { hexToPixel, pixelToHex, isValidHex, getHexDistance, drawHex, getNeighbors, hexToKey } from '../../utils/hexGrid'

describe('hexGrid utilities', () => {
  const center = { x: 100, y: 100 }
  
  describe('hexToPixel', () => {
    it('should convert hex coordinates to pixel coordinates', () => {
      const hex = { q: 0, r: 0 }
      const pixel = hexToPixel(hex, center)
      expect(pixel.x).toBe(100)
      expect(pixel.y).toBe(100)
    })

    it('should handle non-zero hex coordinates', () => {
      const hex = { q: 1, r: 0 }
      const pixel = hexToPixel(hex, center)
      expect(pixel.x).toBeGreaterThan(100)
      expect(pixel.y).toBe(100)
    })

    it('should handle negative coordinates', () => {
      const hex = { q: -1, r: -1 }
      const pixel = hexToPixel(hex, center)
      expect(pixel.x).toBeLessThan(100)
      expect(pixel.y).toBeLessThan(100)
    })
  })

  describe('pixelToHex', () => {
    it('should convert pixel coordinates to hex coordinates', () => {
      const pixel = { x: 100, y: 100 }
      const hex = pixelToHex(pixel, center)
      expect(hex.q).toBe(0)
      expect(hex.r).toBe(0)
    })

    it('should round to nearest hex', () => {
      const pixel = { x: 125, y: 100 }
      const hex = pixelToHex(pixel, center)
      expect(Number.isInteger(hex.q)).toBe(true)
      expect(Number.isInteger(hex.r)).toBe(true)
    })
  })

  describe('isValidHex', () => {
    it('should return true for hex within radius', () => {
      expect(isValidHex({ q: 0, r: 0 }, 5)).toBe(true)
      expect(isValidHex({ q: 2, r: 2 }, 5)).toBe(true)
      expect(isValidHex({ q: -3, r: 3 }, 5)).toBe(true)
    })

    it('should return false for hex outside radius', () => {
      expect(isValidHex({ q: 6, r: 0 }, 5)).toBe(false)
      expect(isValidHex({ q: -6, r: 6 }, 5)).toBe(false)
      expect(isValidHex({ q: 4, r: 4 }, 5)).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isValidHex({ q: 5, r: 0 }, 5)).toBe(true)
      expect(isValidHex({ q: 0, r: 5 }, 5)).toBe(true)
      expect(isValidHex({ q: -5, r: 5 }, 5)).toBe(true)
    })
  })

  describe('getHexDistance', () => {
    it('should return 0 for same hex', () => {
      const hex = { q: 1, r: 1 }
      expect(getHexDistance(hex, hex)).toBe(0)
    })

    it('should calculate distance correctly', () => {
      const hex1 = { q: 0, r: 0 }
      const hex2 = { q: 2, r: -2 }
      expect(getHexDistance(hex1, hex2)).toBe(2)
    })

    it('should handle negative coordinates', () => {
      const hex1 = { q: -2, r: 2 }
      const hex2 = { q: 2, r: -2 }
      expect(getHexDistance(hex1, hex2)).toBe(4)
    })

    it('should be commutative', () => {
      const hex1 = { q: 1, r: 2 }
      const hex2 = { q: 3, r: -1 }
      expect(getHexDistance(hex1, hex2)).toBe(getHexDistance(hex2, hex1))
    })
  })

  describe('drawHex', () => {
    it('should draw hexagon path on context', () => {
      const mockCtx = {
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn()
      } as any

      drawHex(mockCtx, center)
      
      expect(mockCtx.beginPath).toHaveBeenCalledOnce()
      expect(mockCtx.moveTo).toHaveBeenCalledOnce()
      expect(mockCtx.lineTo).toHaveBeenCalledTimes(5) // 5 more sides
      expect(mockCtx.closePath).toHaveBeenCalledOnce()
    })

    it('should draw at correct position', () => {
      const mockCtx = {
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn()
      } as any

      const customCenter = { x: 200, y: 300 }
      drawHex(mockCtx, customCenter)
      
      // First call should be moveTo with first vertex
      expect(mockCtx.moveTo).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number)
      )
    })
  })

  describe('getNeighbors', () => {
    it('should return 6 neighbors', () => {
      const hex = { q: 0, r: 0 }
      const neighbors = getNeighbors(hex)
      expect(neighbors).toHaveLength(6)
    })

    it('should return correct neighbor positions', () => {
      const hex = { q: 0, r: 0 }
      const neighbors = getNeighbors(hex)
      
      // Check that all neighbors are distance 1 away
      neighbors.forEach(neighbor => {
        expect(getHexDistance(hex, neighbor)).toBe(1)
      })
    })

    it('should handle non-zero coordinates', () => {
      const hex = { q: 2, r: 3 }
      const neighbors = getNeighbors(hex)
      
      expect(neighbors).toHaveLength(6)
      neighbors.forEach(neighbor => {
        expect(getHexDistance(hex, neighbor)).toBe(1)
      })
    })

    it('should return unique neighbors', () => {
      const hex = { q: 1, r: 1 }
      const neighbors = getNeighbors(hex)
      
      const uniqueKeys = new Set(neighbors.map(n => hexToKey(n)))
      expect(uniqueKeys.size).toBe(6)
    })
  })

  describe('hexToKey', () => {
    it('should create consistent keys', () => {
      const hex = { q: 3, r: -2 }
      const key1 = hexToKey(hex)
      const key2 = hexToKey(hex)
      expect(key1).toBe(key2)
    })

    it('should create unique keys for different hexes', () => {
      const hex1 = { q: 1, r: 1 }
      const hex2 = { q: 2, r: 1 }
      expect(hexToKey(hex1)).not.toBe(hexToKey(hex2))
    })

    it('should handle negative coordinates', () => {
      const hex = { q: -5, r: -3 }
      const key = hexToKey(hex)
      expect(key).toBe('-5,-3')
    })

    it('should handle zero coordinates', () => {
      const hex = { q: 0, r: 0 }
      const key = hexToKey(hex)
      expect(key).toBe('0,0')
    })
  })

  describe('round trip conversions', () => {
    it('should convert hex -> pixel -> hex accurately', () => {
      const originalHex = { q: 3, r: -1 }
      const pixel = hexToPixel(originalHex, center)
      const convertedHex = pixelToHex(pixel, center)
      
      expect(convertedHex.q).toBe(originalHex.q)
      expect(convertedHex.r).toBe(originalHex.r)
    })

    it('should handle multiple round trips', () => {
      const hexes = [
        { q: 0, r: 0 },
        { q: 5, r: -5 },
        { q: -3, r: 3 },
        { q: 2, r: 1 }
      ]

      hexes.forEach(hex => {
        const pixel = hexToPixel(hex, center)
        const converted = pixelToHex(pixel, center)
        expect(converted).toEqual(hex)
      })
    })
  })
})