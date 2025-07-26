import { describe, it, expect, beforeEach } from 'vitest'
import { AntColonyOptimization } from '../../algorithms/antColonyOptimization'
import { hexToKey } from '../../utils/hexGrid'

describe('AntColonyOptimization', () => {
  let aco: AntColonyOptimization
  
  beforeEach(() => {
    aco = new AntColonyOptimization({
      alpha: 1.0,
      beta: 2.0,
      evaporationRate: 0.1,
      Q: 100,
      maxIterations: 10
    })
  })

  describe('initialization', () => {
    it('should initialize with given config', () => {
      expect(aco).toBeDefined()
      expect((aco as any).config.alpha).toBe(1.0)
      expect((aco as any).config.beta).toBe(2.0)
      expect((aco as any).config.evaporationRate).toBe(0.1)
      expect((aco as any).config.Q).toBe(100)
    })

    it('should initialize empty pheromone map', () => {
      expect((aco as any).pheromoneMap.size).toBe(0)
    })
  })

  describe('findPath', () => {
    it('should find direct path when no obstacles', () => {
      const start = { q: 0, r: 0 }
      const goal = { q: 2, r: 0 }
      const obstacles = new Set<string>()
      
      const path = aco.findPath(start, goal, obstacles, 5)
      
      expect(path).toBeDefined()
      expect(path.length).toBeGreaterThan(0)
      expect(path[path.length - 1]).toEqual(goal)
    })

    it('should return empty path when goal is obstacle', () => {
      const start = { q: 0, r: 0 }
      const goal = { q: 2, r: 0 }
      const obstacles = new Set([hexToKey(goal)])
      
      const path = aco.findPath(start, goal, obstacles, 5)
      
      expect(path).toEqual([])
    })

    it('should return start when start equals goal', () => {
      const start = { q: 0, r: 0 }
      const goal = { q: 0, r: 0 }
      const obstacles = new Set<string>()
      
      const path = aco.findPath(start, goal, obstacles, 5)
      
      // When start equals goal, the path contains just the start position
      expect(path).toEqual([start])
    })

    it('should find path around obstacles', () => {
      const start = { q: 0, r: 0 }
      const goal = { q: 3, r: 0 }
      const obstacles = new Set([
        hexToKey({ q: 1, r: 0 }),
        hexToKey({ q: 2, r: 0 })
      ])
      
      const path = aco.findPath(start, goal, obstacles, 5)
      
      expect(path.length).toBeGreaterThan(2) // Should go around
      expect(path[path.length - 1]).toEqual(goal)
      
      // Should not contain obstacles
      path.forEach(hex => {
        expect(obstacles.has(hexToKey(hex))).toBe(false)
      })
    })

    it('should return empty path when no valid path exists', () => {
      const start = { q: 0, r: 0 }
      const goal = { q: 3, r: 0 }
      
      // Surround goal with obstacles
      const obstacles = new Set([
        hexToKey({ q: 2, r: 0 }),
        hexToKey({ q: 3, r: -1 }),
        hexToKey({ q: 4, r: -1 }),
        hexToKey({ q: 4, r: 0 }),
        hexToKey({ q: 3, r: 1 }),
        hexToKey({ q: 2, r: 1 })
      ])
      
      const path = aco.findPath(start, goal, obstacles, 5)
      
      expect(path).toEqual([])
    })

    it('should respect grid radius', () => {
      const start = { q: 0, r: 0 }
      const goal = { q: 10, r: 0 } // Outside radius
      const obstacles = new Set<string>()
      
      const path = aco.findPath(start, goal, obstacles, 5)
      
      // Should not find path to hex outside radius
      expect(path).toEqual([])
    })
  })

  describe('updatePheromone', () => {
    it('should update pheromone at position', () => {
      const hex = { q: 0, r: 0 }
      
      aco.updatePheromone(hex, 0.5)
      
      const pheromone = aco.getPheromoneStrength(hex)
      expect(pheromone).toBe(0.5)
    })

    it('should accumulate pheromone', () => {
      const hex = { q: 1, r: 1 }
      
      aco.updatePheromone(hex, 0.3)
      aco.updatePheromone(hex, 0.2)
      
      const pheromone = aco.getPheromoneStrength(hex)
      expect(pheromone).toBe(0.5)
    })

    it('should work with getPheromoneMap', () => {
      const hex = { q: 2, r: -1 }
      
      aco.updatePheromone(hex, 0.7)
      
      const map = aco.getPheromoneMap()
      const key = `${hex.q},${hex.r}`
      expect(map.has(key)).toBe(true)
      
      const pheromoneData = map.get(key)
      expect(pheromoneData?.strength).toBe(0.7)
      expect(pheromoneData?.type).toBe('PATH')
    })
  })

  describe('evaporatePheromones', () => {
    it('should reduce pheromone levels', () => {
      const hex = { q: 0, r: 0 }
      const key = hexToKey(hex)
      
      // Set initial pheromone
      ;(aco as any).pheromoneMap.set(key, 1.0)
      
      aco.evaporatePheromones()
      
      const afterEvaporation = (aco as any).pheromoneMap.get(key)
      expect(afterEvaporation).toBeLessThan(1.0)
      expect(afterEvaporation).toBe(0.9) // 1.0 * (1 - 0.1)
    })

    it('should remove pheromones below threshold', () => {
      const hex = { q: 0, r: 0 }
      const key = hexToKey(hex)
      
      // Set very low pheromone
      ;(aco as any).pheromoneMap.set(key, 0.001)
      
      aco.evaporatePheromones()
      
      expect((aco as any).pheromoneMap.has(key)).toBe(false)
    })

    it('should affect all pheromones', () => {
      const hexes = [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        { q: 2, r: 0 }
      ]
      
      // Set pheromones
      hexes.forEach(hex => {
        ;(aco as any).pheromoneMap.set(hexToKey(hex), 1.0)
      })
      
      aco.evaporatePheromones()
      
      // All should be reduced
      hexes.forEach(hex => {
        const pheromone = (aco as any).pheromoneMap.get(hexToKey(hex))
        expect(pheromone).toBe(0.9)
      })
    })
  })

  describe('getPheromoneStrength', () => {
    it('should return pheromone value for hex', () => {
      const hex = { q: 1, r: 1 }
      aco.updatePheromone(hex, 0.5)
      
      const pheromone = aco.getPheromoneStrength(hex)
      expect(pheromone).toBe(0.5)
    })

    it('should return 0 for hex without pheromone', () => {
      const hex = { q: 5, r: 5 }
      const pheromone = aco.getPheromoneStrength(hex)
      expect(pheromone).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle multiple findPath calls', () => {
      const start = { q: 0, r: 0 }
      const goal = { q: 3, r: 0 }
      const obstacles = new Set<string>()
      
      const path1 = aco.findPath(start, goal, obstacles, 5)
      const path2 = aco.findPath(start, goal, obstacles, 5)
      
      expect(path1).toBeDefined()
      expect(path2).toBeDefined()
      
      // Second path might be better due to pheromone accumulation
      expect(path1.length).toBeGreaterThanOrEqual(3)
      expect(path2.length).toBeGreaterThanOrEqual(3)
    })

    it('should handle very large grid radius', () => {
      const start = { q: 0, r: 0 }
      const goal = { q: 10, r: 0 }
      const obstacles = new Set<string>()
      
      const path = aco.findPath(start, goal, obstacles, 20)
      
      expect(path).toBeDefined()
      
      // Path might be empty if too far
      if (path.length > 0) {
        expect(path[path.length - 1]).toEqual(goal)
      }
    })

    it('should handle negative coordinates', () => {
      const start = { q: -5, r: 5 }
      const goal = { q: -2, r: 2 }
      const obstacles = new Set<string>()
      
      const path = aco.findPath(start, goal, obstacles, 10)
      
      expect(path).toBeDefined()
      if (path.length > 0) {
        expect(path[path.length - 1]).toEqual(goal)
      }
    })
  })
})