import { HexCoordinate, ACOConfig, Pheromone } from '../types'
import { getHexDistance, getNeighbors, isValidHex } from '../utils/hexGrid'

export class AntColonyOptimization {
  private pheromoneMap: Map<string, number> = new Map()
  private readonly config: ACOConfig
  
  constructor(config: ACOConfig) {
    this.config = config
  }
  
  private hexToKey(hex: HexCoordinate): string {
    return `${hex.q},${hex.r}`
  }
  
  private keyToHex(key: string): HexCoordinate {
    const [q, r] = key.split(',').map(Number)
    return { q, r }
  }
  
  public updatePheromone(position: HexCoordinate, amount: number): void {
    const key = this.hexToKey(position)
    const current = this.pheromoneMap.get(key) ?? 0
    this.pheromoneMap.set(key, current + amount)
  }
  
  public evaporatePheromones(): void {
    for (const [key, strength] of this.pheromoneMap.entries()) {
      const newStrength = strength * (1 - this.config.evaporationRate)
      if (newStrength < 0.01) {
        this.pheromoneMap.delete(key)
      } else {
        this.pheromoneMap.set(key, newStrength)
      }
    }
  }
  
  public findPath(
    start: HexCoordinate,
    goal: HexCoordinate,
    obstacles: Set<string>,
    gridRadius: number
  ): HexCoordinate[] {
    const paths: HexCoordinate[][] = []
    
    // Run multiple ant iterations
    for (let iteration = 0; iteration < this.config.maxIterations; iteration++) {
      const path = this.constructPath(start, goal, obstacles, gridRadius)
      if (path.length > 0) {
        paths.push(path)
        this.depositPheromones(path)
      }
      this.evaporatePheromones()
    }
    
    // Return the best path found
    return this.selectBestPath(paths, goal) ?? []
  }
  
  private constructPath(
    start: HexCoordinate,
    goal: HexCoordinate,
    obstacles: Set<string>,
    gridRadius: number
  ): HexCoordinate[] {
    const path: HexCoordinate[] = [start]
    const visited = new Set<string>([this.hexToKey(start)])
    let current = start
    
    while (getHexDistance(current, goal) > 0 && path.length < gridRadius * 4) {
      const neighbors = getNeighbors(current).filter(neighbor => {
        const key = this.hexToKey(neighbor)
        return isValidHex(neighbor, gridRadius) &&
               !obstacles.has(key) &&
               !visited.has(key)
      })
      
      if (neighbors.length === 0) {
        break // Dead end
      }
      
      const next = this.selectNextHex(neighbors, goal, current)
      path.push(next)
      visited.add(this.hexToKey(next))
      current = next
    }
    
    return getHexDistance(current, goal) === 0 ? path : []
  }
  
  private selectNextHex(
    candidates: HexCoordinate[],
    goal: HexCoordinate,
    _current: HexCoordinate
  ): HexCoordinate {
    const probabilities = candidates.map(candidate => {
      const pheromone = this.pheromoneMap.get(this.hexToKey(candidate)) ?? 0.1
      const heuristic = 1 / (getHexDistance(candidate, goal) + 1)
      return Math.pow(pheromone, this.config.alpha) * Math.pow(heuristic, this.config.beta)
    })
    
    const sum = probabilities.reduce((a, b) => a + b, 0)
    const normalized = probabilities.map(p => p / sum)
    
    // Roulette wheel selection
    const random = Math.random()
    let accumulated = 0
    
    for (let i = 0; i < candidates.length; i++) {
      accumulated += normalized[i]
      if (random <= accumulated) {
        return candidates[i]
      }
    }
    
    return candidates[candidates.length - 1]
  }
  
  private depositPheromones(path: HexCoordinate[]): void {
    const amount = this.config.Q / path.length
    for (const hex of path) {
      this.updatePheromone(hex, amount)
    }
  }
  
  private selectBestPath(paths: HexCoordinate[][], goal: HexCoordinate): HexCoordinate[] | undefined {
    let bestPath: HexCoordinate[] | undefined
    let bestScore = Infinity
    
    for (const path of paths) {
      if (path.length === 0) continue
      
      const lastHex = path[path.length - 1]
      const distanceToGoal = getHexDistance(lastHex, goal)
      const score = path.length + distanceToGoal * 10
      
      if (score < bestScore) {
        bestScore = score
        bestPath = path
      }
    }
    
    return bestPath
  }
  
  public getPheromoneStrength(position: HexCoordinate): number {
    return this.pheromoneMap.get(this.hexToKey(position)) ?? 0
  }
  
  public getPheromoneMap(): Map<string, Pheromone> {
    const pheromoneData = new Map<string, Pheromone>()
    
    for (const [key, strength] of this.pheromoneMap.entries()) {
      pheromoneData.set(key, {
        position: this.keyToHex(key),
        strength,
        type: 'PATH',
        decayRate: this.config.evaporationRate
      })
    }
    
    return pheromoneData
  }
}