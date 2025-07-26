import { AntType, TowerType, AntStats, TowerStats, ACOConfig } from '../types'

export const ANT_STATS: Record<AntType, AntStats> = {
  [AntType.WORKER]: {
    hp: 20,
    maxHp: 20,
    speed: 2,
    damage: 5,
    armor: 0,
    reward: 5,
    size: 8,
    color: '#FF6B35' // Bright Orange
  },
  [AntType.SOLDIER]: {
    hp: 50,
    maxHp: 50,
    speed: 1,
    damage: 10,
    armor: 2,
    reward: 10,
    size: 12,
    color: '#DC143C' // Crimson
  },
  [AntType.SCOUT]: {
    hp: 15,
    maxHp: 15,
    speed: 3,
    damage: 3,
    armor: 0,
    reward: 7,
    size: 6,
    color: '#FFD700' // Gold
  },
  [AntType.QUEEN]: {
    hp: 200,
    maxHp: 200,
    speed: 0.5,
    damage: 20,
    armor: 5,
    reward: 50,
    size: 20,
    color: '#800080' // Purple
  }
}

export const TOWER_STATS: Record<TowerType, TowerStats> = {
  [TowerType.ANTEATER]: {
    cost: 20,
    damage: 15,
    range: 2,
    attackSpeed: 1,
    special: {
      slow: 0.5
    },
    icon: '🦣',
    color: '#8B7355',
    name: 'Anteater',
    description: 'Slows ants with sticky tongue'
  },
  [TowerType.PESTICIDE]: {
    cost: 30,
    damage: 10,
    range: 1.5,
    attackSpeed: 0.8,
    special: {
      aoe: 1
    },
    icon: '💨',
    color: '#32CD32',
    name: 'Pesticide Spray',
    description: 'Area damage to groups'
  },
  [TowerType.SUGAR_TRAP]: {
    cost: 15,
    damage: 5,
    range: 3,
    attackSpeed: 2,
    special: {
      lure: 2
    },
    icon: '🍯',
    color: '#FFA500',
    name: 'Sugar Trap',
    description: 'Lures and damages ants'
  },
  [TowerType.FIRE]: {
    cost: 40,
    damage: 25,
    range: 1,
    attackSpeed: 0.5,
    special: {
      dot: 5
    },
    icon: '🔥',
    color: '#FF4500',
    name: 'Fire Tower',
    description: 'Burns with damage over time'
  }
}

export const ACO_DEFAULT_CONFIG: ACOConfig = {
  alpha: 1.0, // pheromone importance
  beta: 2.0, // heuristic importance
  evaporationRate: 0.1,
  Q: 100, // pheromone deposit strength
  maxIterations: 10
}

export const GAME_CONFIG = {
  INITIAL_RESOURCES: 100,
  CORE_HEALTH: 100,
  GRID_RADIUS: 7,
  WAVE_SPAWN_DELAY: 2000,
  ANT_SPAWN_INTERVAL: 500,
  PHEROMONE_DECAY_RATE: 0.95,
  PHEROMONE_MAX_STRENGTH: 100,
  ATTACK_ANIMATION_DURATION: 200,
  RESOURCE_PER_SECOND: 2,
  PAUSE_HOTKEY: ' ', // Spacebar
  SPEED_MULTIPLIERS: [1, 2, 3],
  MAX_SAVE_SLOTS: 3
}

export const COLORS = {
  BACKGROUND: '#0F1419',
  GRID: '#1A1F2E',
  GRID_HOVER: '#232937',
  CORE: '#FF5722',
  SPAWN_GATE: '#9C27B0',
  OBSTACLE: '#424242',
  PHEROMONE: {
    FOOD: '#4CAF50',
    DANGER: '#F44336',
    PATH: '#2196F3'
  },
  UI: {
    PRIMARY: '#4A9EFF',
    SECONDARY: '#6BB6FF',
    ACCENT: '#FFD700',
    TEXT: '#FFFFFF',
    TEXT_DARK: '#000000',
    SUCCESS: '#4CAF50',
    ERROR: '#F44336',
    WARNING: '#FF9800'
  }
}

export const SPRITES = {
  ANT_WORKER: '/sprites/ant-worker.png',
  ANT_SOLDIER: '/sprites/ant-soldier.png',
  ANT_SCOUT: '/sprites/ant-scout.png',
  ANT_QUEEN: '/sprites/ant-queen.png',
  TOWER_ANTEATER: '/sprites/tower-anteater.png',
  TOWER_PESTICIDE: '/sprites/tower-pesticide.png',
  TOWER_SUGAR: '/sprites/tower-sugar.png',
  TOWER_FIRE: '/sprites/tower-fire.png'
}

export const ACHIEVEMENTS = [
  { id: 'first_blood', name: 'First Blood', description: 'Kill your first ant', icon: '🏆' },
  { id: 'tower_master', name: 'Tower Master', description: 'Build 10 towers', icon: '🏗️' },
  { id: 'ant_slayer', name: 'Ant Slayer', description: 'Kill 100 ants', icon: '⚔️' },
  { id: 'perfect_defense', name: 'Perfect Defense', description: 'Complete a level without losing health', icon: '🛡️' },
  { id: 'resource_hoarder', name: 'Resource Hoarder', description: 'Save 500 resources', icon: '💰' },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a level in under 2 minutes', icon: '⚡' },
  { id: 'queen_slayer', name: 'Queen Slayer', description: 'Defeat an ant queen', icon: '👑' },
  { id: 'strategy_master', name: 'Strategy Master', description: 'Complete level 10', icon: '🧠' },
  { id: 'no_towers', name: 'Minimalist', description: 'Complete a level with only 3 towers', icon: '🎯' },
  { id: 'ant_whisperer', name: 'Ant Whisperer', description: 'Use sugar traps to kill 50 ants', icon: '🍯' }
]