// Grid and positioning types
export interface HexCoordinate {
  q: number
  r: number
}

export interface PixelCoordinate {
  x: number
  y: number
}

// Ant types and behaviors
export enum AntType {
  WORKER = 'WORKER',
  SOLDIER = 'SOLDIER',
  SCOUT = 'SCOUT',
  QUEEN = 'QUEEN'
}

export interface AntStats {
  hp: number
  maxHp: number
  speed: number
  damage: number
  armor: number
  reward: number
  size: number
  color: string
}

export interface Ant {
  id: string
  type: AntType
  position: HexCoordinate
  targetPosition: HexCoordinate | null
  hp: number
  maxHp: number
  speed: number
  damage: number
  armor: number
  pheromoneStrength: number
  carryingFood: boolean
  path: HexCoordinate[]
  animationProgress: number
}

// Tower types and stats
export enum TowerType {
  ANTEATER = 'ANTEATER',
  PESTICIDE = 'PESTICIDE',
  SUGAR_TRAP = 'SUGAR_TRAP',
  FIRE = 'FIRE'
}

export interface TowerStats {
  cost: number
  damage: number
  range: number
  attackSpeed: number
  special: {
    slow?: number
    aoe?: number
    lure?: number
    dot?: number
  }
  icon: string
  color: string
  name: string
  description: string
}

export interface Tower {
  id: string
  type: TowerType
  position: HexCoordinate
  level: number
  lastAttackTime: number
  targetsInRange: string[]
}

// Pheromone system
export interface Pheromone {
  position: HexCoordinate
  strength: number
  type: 'FOOD' | 'DANGER' | 'PATH'
  decayRate: number
}

// Game state
export enum GamePhase {
  MENU = 'MENU',
  BUILD = 'BUILD',
  WAVE = 'WAVE',
  VICTORY = 'VICTORY',
  DEFEAT = 'DEFEAT'
}

export interface GameState {
  phase: GamePhase
  resources: number
  coreHealth: number
  maxCoreHealth: number
  currentWave: number
  totalWaves: number
  ants: Map<string, Ant>
  towers: Map<string, Tower>
  pheromones: Map<string, Pheromone>
  selectedTowerType: TowerType | null
  selectedHex: HexCoordinate | null
  isPaused: boolean
  gameSpeed: number
  score: number
  bestScore: number
}

// Level configuration
export interface WaveConfig {
  antCounts: Record<AntType, number>
  spawnDelay: number
  spawnGates: HexCoordinate[]
}

export interface LevelConfig {
  id: number
  name: string
  description: string
  gridRadius: number
  startResources: number
  corePosition: HexCoordinate
  spawnGates: HexCoordinate[]
  waves: WaveConfig[]
  obstacles: HexCoordinate[]
}

// Ant Colony Optimization types
export interface ACOConfig {
  alpha: number // pheromone importance
  beta: number // heuristic importance
  evaporationRate: number
  Q: number // pheromone deposit strength
  maxIterations: number
}

export interface PathNode {
  position: HexCoordinate
  g: number // cost from start
  h: number // heuristic to goal
  f: number // total cost
  parent: PathNode | null
}

// Save game data
export interface SaveGameData {
  version: string
  timestamp: number
  gameState: Partial<GameState>
  currentLevel: number
  unlockedLevels: number[]
  achievements: string[]
  statistics: GameStatistics
}

export interface GameStatistics {
  totalAntsKilled: number
  totalResourcesEarned: number
  totalTowersBuilt: number
  totalWavesCompleted: number
  bestStreak: number
  playTime: number
}