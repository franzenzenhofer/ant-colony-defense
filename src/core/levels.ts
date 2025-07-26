import { LevelConfig, AntType } from '../types'

export const CAMPAIGN_LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'The First Scouts',
    description: 'Scout ants have discovered your picnic! Defend against the initial wave.',
    gridRadius: 5,
    startResources: 100,
    corePosition: { q: 0, r: 0 },
    spawnGates: [{ q: -5, r: 0 }],
    waves: [
      {
        antCounts: { [AntType.SCOUT]: 5, [AntType.WORKER]: 0, [AntType.SOLDIER]: 0, [AntType.QUEEN]: 0 },
        spawnDelay: 2000,
        spawnGates: [{ q: -5, r: 0 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 3, [AntType.WORKER]: 3, [AntType.SOLDIER]: 0, [AntType.QUEEN]: 0 },
        spawnDelay: 3000,
        spawnGates: [{ q: -5, r: 0 }]
      }
    ],
    obstacles: []
  },
  {
    id: 2,
    name: 'Worker Invasion',
    description: 'Worker ants are coming for your food! They\'re tougher than scouts.',
    gridRadius: 5,
    startResources: 120,
    corePosition: { q: 0, r: 0 },
    spawnGates: [{ q: -5, r: 0 }, { q: 3, r: -5 }],
    waves: [
      {
        antCounts: { [AntType.SCOUT]: 2, [AntType.WORKER]: 5, [AntType.SOLDIER]: 0, [AntType.QUEEN]: 0 },
        spawnDelay: 2000,
        spawnGates: [{ q: -5, r: 0 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 0, [AntType.WORKER]: 8, [AntType.SOLDIER]: 0, [AntType.QUEEN]: 0 },
        spawnDelay: 2500,
        spawnGates: [{ q: 3, r: -5 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 3, [AntType.WORKER]: 5, [AntType.SOLDIER]: 1, [AntType.QUEEN]: 0 },
        spawnDelay: 3000,
        spawnGates: [{ q: -5, r: 0 }, { q: 3, r: -5 }]
      }
    ],
    obstacles: [{ q: -2, r: 1 }, { q: -1, r: 2 }, { q: 1, r: -2 }, { q: 2, r: -1 }]
  },
  {
    id: 3,
    name: 'Soldier Ants March',
    description: 'The colony sends its soldiers! Use area damage wisely.',
    gridRadius: 6,
    startResources: 150,
    corePosition: { q: 0, r: 0 },
    spawnGates: [{ q: -6, r: 3 }, { q: 6, r: -3 }],
    waves: [
      {
        antCounts: { [AntType.SCOUT]: 5, [AntType.WORKER]: 3, [AntType.SOLDIER]: 2, [AntType.QUEEN]: 0 },
        spawnDelay: 2000,
        spawnGates: [{ q: -6, r: 3 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 0, [AntType.WORKER]: 5, [AntType.SOLDIER]: 3, [AntType.QUEEN]: 0 },
        spawnDelay: 2500,
        spawnGates: [{ q: 6, r: -3 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 3, [AntType.WORKER]: 5, [AntType.SOLDIER]: 5, [AntType.QUEEN]: 0 },
        spawnDelay: 3000,
        spawnGates: [{ q: -6, r: 3 }, { q: 6, r: -3 }]
      }
    ],
    obstacles: [
      { q: -3, r: 0 }, { q: -3, r: 1 }, { q: -2, r: 2 },
      { q: 3, r: 0 }, { q: 3, r: -1 }, { q: 2, r: -2 }
    ]
  },
  {
    id: 4,
    name: 'Three-Way Assault',
    description: 'Ants attack from three directions! Strategic tower placement is key.',
    gridRadius: 6,
    startResources: 180,
    corePosition: { q: 0, r: 0 },
    spawnGates: [{ q: -6, r: 0 }, { q: 3, r: -6 }, { q: 3, r: 6 }],
    waves: [
      {
        antCounts: { [AntType.SCOUT]: 4, [AntType.WORKER]: 4, [AntType.SOLDIER]: 2, [AntType.QUEEN]: 0 },
        spawnDelay: 2000,
        spawnGates: [{ q: -6, r: 0 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 4, [AntType.WORKER]: 4, [AntType.SOLDIER]: 2, [AntType.QUEEN]: 0 },
        spawnDelay: 2000,
        spawnGates: [{ q: 3, r: -6 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 4, [AntType.WORKER]: 4, [AntType.SOLDIER]: 2, [AntType.QUEEN]: 0 },
        spawnDelay: 2000,
        spawnGates: [{ q: 3, r: 6 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 5, [AntType.WORKER]: 8, [AntType.SOLDIER]: 5, [AntType.QUEEN]: 0 },
        spawnDelay: 3000,
        spawnGates: [{ q: -6, r: 0 }, { q: 3, r: -6 }, { q: 3, r: 6 }]
      }
    ],
    obstacles: []
  },
  {
    id: 5,
    name: 'Queen\'s Guard',
    description: 'A queen ant approaches with her royal guard! This is a tough battle.',
    gridRadius: 7,
    startResources: 200,
    corePosition: { q: 0, r: 0 },
    spawnGates: [{ q: -7, r: 0 }, { q: 7, r: 0 }],
    waves: [
      {
        antCounts: { [AntType.SCOUT]: 5, [AntType.WORKER]: 5, [AntType.SOLDIER]: 3, [AntType.QUEEN]: 0 },
        spawnDelay: 2000,
        spawnGates: [{ q: -7, r: 0 }, { q: 7, r: 0 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 0, [AntType.WORKER]: 8, [AntType.SOLDIER]: 5, [AntType.QUEEN]: 0 },
        spawnDelay: 2500,
        spawnGates: [{ q: -7, r: 0 }, { q: 7, r: 0 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 5, [AntType.WORKER]: 5, [AntType.SOLDIER]: 8, [AntType.QUEEN]: 1 },
        spawnDelay: 3000,
        spawnGates: [{ q: -7, r: 0 }]
      }
    ],
    obstacles: [
      { q: -4, r: 0 }, { q: -3, r: -1 }, { q: -3, r: 1 },
      { q: 4, r: 0 }, { q: 3, r: -1 }, { q: 3, r: 1 },
      { q: 0, r: -3 }, { q: 0, r: 3 }
    ]
  },
  {
    id: 6,
    name: 'Maze of Tunnels',
    description: 'Navigate the ant tunnels! Use walls to create kill zones.',
    gridRadius: 7,
    startResources: 220,
    corePosition: { q: 0, r: 0 },
    spawnGates: [{ q: -7, r: 3 }, { q: -7, r: -3 }, { q: 7, r: 0 }],
    waves: [
      {
        antCounts: { [AntType.SCOUT]: 8, [AntType.WORKER]: 5, [AntType.SOLDIER]: 2, [AntType.QUEEN]: 0 },
        spawnDelay: 1500,
        spawnGates: [{ q: -7, r: 3 }, { q: -7, r: -3 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 5, [AntType.WORKER]: 10, [AntType.SOLDIER]: 5, [AntType.QUEEN]: 0 },
        spawnDelay: 2000,
        spawnGates: [{ q: 7, r: 0 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 10, [AntType.WORKER]: 10, [AntType.SOLDIER]: 8, [AntType.QUEEN]: 0 },
        spawnDelay: 2500,
        spawnGates: [{ q: -7, r: 3 }, { q: -7, r: -3 }, { q: 7, r: 0 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 5, [AntType.WORKER]: 15, [AntType.SOLDIER]: 10, [AntType.QUEEN]: 1 },
        spawnDelay: 3000,
        spawnGates: [{ q: -7, r: 3 }, { q: -7, r: -3 }, { q: 7, r: 0 }]
      }
    ],
    obstacles: [
      // Create maze-like structure
      { q: -5, r: 2 }, { q: -4, r: 2 }, { q: -3, r: 2 }, { q: -2, r: 2 },
      { q: -5, r: -2 }, { q: -4, r: -2 }, { q: -3, r: -2 }, { q: -2, r: -2 },
      { q: 5, r: -2 }, { q: 4, r: -2 }, { q: 3, r: -2 }, { q: 2, r: -2 },
      { q: 5, r: 2 }, { q: 4, r: 2 }, { q: 3, r: 2 }, { q: 2, r: 2 },
      { q: -2, r: 0 }, { q: 2, r: 0 }
    ]
  },
  {
    id: 7,
    name: 'Swarm Tactics',
    description: 'Massive swarms of scout ants! Area damage is essential.',
    gridRadius: 7,
    startResources: 250,
    corePosition: { q: 0, r: 0 },
    spawnGates: [{ q: -7, r: 0 }, { q: 0, r: -7 }, { q: 7, r: 0 }, { q: 0, r: 7 }],
    waves: [
      {
        antCounts: { [AntType.SCOUT]: 20, [AntType.WORKER]: 0, [AntType.SOLDIER]: 0, [AntType.QUEEN]: 0 },
        spawnDelay: 1000,
        spawnGates: [{ q: -7, r: 0 }, { q: 0, r: -7 }, { q: 7, r: 0 }, { q: 0, r: 7 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 15, [AntType.WORKER]: 10, [AntType.SOLDIER]: 0, [AntType.QUEEN]: 0 },
        spawnDelay: 1500,
        spawnGates: [{ q: -7, r: 0 }, { q: 0, r: -7 }, { q: 7, r: 0 }, { q: 0, r: 7 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 25, [AntType.WORKER]: 5, [AntType.SOLDIER]: 5, [AntType.QUEEN]: 0 },
        spawnDelay: 2000,
        spawnGates: [{ q: -7, r: 0 }, { q: 0, r: -7 }, { q: 7, r: 0 }, { q: 0, r: 7 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 30, [AntType.WORKER]: 10, [AntType.SOLDIER]: 10, [AntType.QUEEN]: 0 },
        spawnDelay: 2500,
        spawnGates: [{ q: -7, r: 0 }, { q: 0, r: -7 }, { q: 7, r: 0 }, { q: 0, r: 7 }]
      }
    ],
    obstacles: []
  },
  {
    id: 8,
    name: 'Royal Procession',
    description: 'Multiple queens approach! Each with their own guard.',
    gridRadius: 7,
    startResources: 300,
    corePosition: { q: 0, r: 0 },
    spawnGates: [{ q: -7, r: 0 }, { q: 7, r: 0 }],
    waves: [
      {
        antCounts: { [AntType.SCOUT]: 5, [AntType.WORKER]: 5, [AntType.SOLDIER]: 10, [AntType.QUEEN]: 1 },
        spawnDelay: 3000,
        spawnGates: [{ q: -7, r: 0 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 5, [AntType.WORKER]: 5, [AntType.SOLDIER]: 10, [AntType.QUEEN]: 1 },
        spawnDelay: 3000,
        spawnGates: [{ q: 7, r: 0 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 10, [AntType.WORKER]: 10, [AntType.SOLDIER]: 15, [AntType.QUEEN]: 1 },
        spawnDelay: 4000,
        spawnGates: [{ q: -7, r: 0 }, { q: 7, r: 0 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 10, [AntType.WORKER]: 15, [AntType.SOLDIER]: 20, [AntType.QUEEN]: 2 },
        spawnDelay: 5000,
        spawnGates: [{ q: -7, r: 0 }, { q: 7, r: 0 }]
      }
    ],
    obstacles: [
      { q: -3, r: -3 }, { q: -3, r: 3 }, { q: 3, r: -3 }, { q: 3, r: 3 },
      { q: 0, r: -4 }, { q: 0, r: 4 }, { q: -4, r: 0 }, { q: 4, r: 0 }
    ]
  },
  {
    id: 9,
    name: 'The Gauntlet',
    description: 'Continuous waves with no breaks! Resource management is crucial.',
    gridRadius: 7,
    startResources: 250,
    corePosition: { q: 0, r: 0 },
    spawnGates: [{ q: -7, r: -3 }, { q: -7, r: 3 }],
    waves: [
      {
        antCounts: { [AntType.SCOUT]: 5, [AntType.WORKER]: 5, [AntType.SOLDIER]: 5, [AntType.QUEEN]: 0 },
        spawnDelay: 500,
        spawnGates: [{ q: -7, r: -3 }, { q: -7, r: 3 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 8, [AntType.WORKER]: 8, [AntType.SOLDIER]: 5, [AntType.QUEEN]: 0 },
        spawnDelay: 500,
        spawnGates: [{ q: -7, r: -3 }, { q: -7, r: 3 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 10, [AntType.WORKER]: 10, [AntType.SOLDIER]: 8, [AntType.QUEEN]: 0 },
        spawnDelay: 500,
        spawnGates: [{ q: -7, r: -3 }, { q: -7, r: 3 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 12, [AntType.WORKER]: 12, [AntType.SOLDIER]: 10, [AntType.QUEEN]: 1 },
        spawnDelay: 500,
        spawnGates: [{ q: -7, r: -3 }, { q: -7, r: 3 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 15, [AntType.WORKER]: 15, [AntType.SOLDIER]: 15, [AntType.QUEEN]: 1 },
        spawnDelay: 500,
        spawnGates: [{ q: -7, r: -3 }, { q: -7, r: 3 }]
      }
    ],
    obstacles: []
  },
  {
    id: 10,
    name: 'Colony Finale',
    description: 'The entire ant colony attacks! Survive the ultimate challenge.',
    gridRadius: 7,
    startResources: 400,
    corePosition: { q: 0, r: 0 },
    spawnGates: [
      { q: -7, r: 0 }, { q: 7, r: 0 },
      { q: 0, r: -7 }, { q: 0, r: 7 },
      { q: -5, r: -5 }, { q: 5, r: 5 }
    ],
    waves: [
      {
        antCounts: { [AntType.SCOUT]: 10, [AntType.WORKER]: 10, [AntType.SOLDIER]: 10, [AntType.QUEEN]: 0 },
        spawnDelay: 2000,
        spawnGates: [{ q: -7, r: 0 }, { q: 7, r: 0 }, { q: 0, r: -7 }, { q: 0, r: 7 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 15, [AntType.WORKER]: 15, [AntType.SOLDIER]: 15, [AntType.QUEEN]: 1 },
        spawnDelay: 3000,
        spawnGates: [{ q: -5, r: -5 }, { q: 5, r: 5 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 20, [AntType.WORKER]: 20, [AntType.SOLDIER]: 20, [AntType.QUEEN]: 2 },
        spawnDelay: 4000,
        spawnGates: [{ q: -7, r: 0 }, { q: 7, r: 0 }, { q: 0, r: -7 }, { q: 0, r: 7 }]
      },
      {
        antCounts: { [AntType.SCOUT]: 25, [AntType.WORKER]: 25, [AntType.SOLDIER]: 25, [AntType.QUEEN]: 3 },
        spawnDelay: 5000,
        spawnGates: [
          { q: -7, r: 0 }, { q: 7, r: 0 },
          { q: 0, r: -7 }, { q: 0, r: 7 },
          { q: -5, r: -5 }, { q: 5, r: 5 }
        ]
      },
      {
        antCounts: { [AntType.SCOUT]: 30, [AntType.WORKER]: 30, [AntType.SOLDIER]: 30, [AntType.QUEEN]: 5 },
        spawnDelay: 6000,
        spawnGates: [
          { q: -7, r: 0 }, { q: 7, r: 0 },
          { q: 0, r: -7 }, { q: 0, r: 7 },
          { q: -5, r: -5 }, { q: 5, r: 5 }
        ]
      }
    ],
    obstacles: []
  }
]