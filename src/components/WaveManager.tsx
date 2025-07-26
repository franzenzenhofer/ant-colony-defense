import { useEffect, useRef, useState, useCallback } from 'react'
import { LevelConfig, GameState, GamePhase, AntType, Ant, Tower, Pheromone, HexCoordinate, TowerType } from '../types'
import { ANT_STATS, GAME_CONFIG, TOWER_STATS } from '../core/constants'
import { AntColonyOptimization } from '../algorithms/antColonyOptimization'
import { hexToKey } from '../utils/hexGrid'

interface GameActions {
  setPhase: (phase: GamePhase) => void
  setResources: (resources: number) => void
  setCoreHealth: (health: number) => void
  setWave: (wave: number) => void
  addAnt: (ant: Ant) => void
  removeAnt: (id: string) => void
  updateAnt: (id: string, updates: Partial<Ant>) => void
  addTower: (tower: Tower) => void
  removeTower: (id: string) => void
  updateTower: (id: string, updates: Partial<Tower>) => void
  addPheromone: (pheromone: Pheromone) => void
  updatePheromone: (position: HexCoordinate, updates: Partial<Pheromone>) => void
  decayPheromones: () => void
  setSelectedTowerType: (type: TowerType | null) => void
  setSelectedHex: (hex: HexCoordinate | null) => void
  setPaused: (paused: boolean) => void
  setGameSpeed: (speed: number) => void
  updateScore: (score: number) => void
  resetGame: () => void
}

interface WaveManagerProps {
  level: LevelConfig
  gameState: GameState
  actions: GameActions
  onLevelComplete: () => void
}

export default function WaveManager({
  level,
  gameState,
  actions,
  onLevelComplete
}: WaveManagerProps): JSX.Element {
  const [, setWaveStartTime] = useState(0)
  const [antsToSpawn, setAntsToSpawn] = useState<Array<{ type: AntType; gate: number }>>([])
  const acoRef = useRef(new AntColonyOptimization({
    alpha: 1.0,
    beta: 2.0,
    evaporationRate: 0.1,
    Q: 100,
    maxIterations: 10
  }))
  
  // Start wave when build phase ends
  useEffect(() => {
    if (gameState.phase === GamePhase.BUILD && gameState.currentWave === 0) {
      // Auto-start first wave after delay
      const timer = setTimeout(() => {
        startWave()
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [gameState.phase, gameState.currentWave, startWave])
  
  // Spawn ants during wave
  useEffect(() => {
    if (gameState.phase !== GamePhase.WAVE || antsToSpawn.length === 0 || gameState.isPaused) {
      return
    }
    
    const spawnInterval = setInterval(() => {
      if (antsToSpawn.length > 0) {
        const nextAnt = antsToSpawn[0]
        setAntsToSpawn(prev => prev.slice(1))
        
        const wave = level.waves[gameState.currentWave]
        const spawnGate = wave.spawnGates[nextAnt.gate] || level.spawnGates[nextAnt.gate]
        
        const ant = {
          id: `ant-${Date.now()}-${Math.random()}`,
          type: nextAnt.type,
          position: { ...spawnGate },
          targetPosition: level.corePosition,
          hp: ANT_STATS[nextAnt.type].hp,
          maxHp: ANT_STATS[nextAnt.type].maxHp,
          speed: ANT_STATS[nextAnt.type].speed,
          damage: ANT_STATS[nextAnt.type].damage,
          armor: ANT_STATS[nextAnt.type].armor,
          pheromoneStrength: 10,
          carryingFood: false,
          path: [],
          animationProgress: 0
        }
        
        actions.addAnt(ant)
      }
    }, GAME_CONFIG.ANT_SPAWN_INTERVAL / gameState.gameSpeed)
    
    return () => clearInterval(spawnInterval)
  }, [gameState.phase, antsToSpawn, gameState.isPaused, gameState.gameSpeed, gameState.currentWave, level, actions])
  
  // Update ant paths and movement
  useEffect(() => {
    if (gameState.phase !== GamePhase.WAVE || gameState.isPaused) {
      return
    }
    
    const moveInterval = setInterval(() => {
      // Build obstacle set from towers
      const obstacles = new Set<string>()
      gameState.towers.forEach(tower => {
        obstacles.add(hexToKey(tower.position))
      })
      
      // Update each ant
      gameState.ants.forEach(ant => {
        // Calculate path if needed
        if (ant.path.length === 0) {
          const path = acoRef.current.findPath(
            ant.position,
            level.corePosition,
            obstacles,
            level.gridRadius
          )
          
          if (path.length > 0) {
            actions.updateAnt(ant.id, { path })
          }
        }
        
        // Move ant along path
        if (ant.path.length > 0 && ant.animationProgress >= 1) {
          const nextPosition = ant.path[0]
          actions.updateAnt(ant.id, {
            position: nextPosition,
            path: ant.path.slice(1),
            animationProgress: 0
          })
          
          // Add pheromone
          actions.addPheromone({
            position: ant.position,
            strength: ant.pheromoneStrength,
            type: 'PATH',
            decayRate: 0.05
          })
          
          // Check if reached core
          if (nextPosition.q === level.corePosition.q && 
              nextPosition.r === level.corePosition.r) {
            actions.setCoreHealth(gameState.coreHealth - ant.damage)
            actions.removeAnt(ant.id)
          }
        } else if (ant.path.length > 0) {
          // Update animation progress
          actions.updateAnt(ant.id, {
            animationProgress: Math.min(1, ant.animationProgress + 0.1 * ant.speed * gameState.gameSpeed)
          })
        }
      })
      
      // Decay pheromones
      actions.decayPheromones()
      
      // Check wave completion
      if (antsToSpawn.length === 0 && gameState.ants.size === 0) {
        endWave()
      }
    }, 100 / gameState.gameSpeed)
    
    return () => clearInterval(moveInterval)
  }, [gameState, level, actions, antsToSpawn.length, endWave])
  
  // Tower attacks
  useEffect(() => {
    if (gameState.phase !== GamePhase.WAVE || gameState.isPaused) {
      return
    }
    
    const attackInterval = setInterval(() => {
      gameState.towers.forEach(tower => {
        const towerStats = TOWER_STATS[tower.type]
        const now = Date.now()
        
        if (now - tower.lastAttackTime < (1000 / towerStats.attackSpeed) / gameState.gameSpeed) {
          return
        }
        
        // Find targets in range
        const targetsInRange: string[] = []
        gameState.ants.forEach(ant => {
          const distance = Math.sqrt(
            Math.pow(ant.position.q - tower.position.q, 2) +
            Math.pow(ant.position.r - tower.position.r, 2)
          )
          
          if (distance <= towerStats.range) {
            targetsInRange.push(ant.id)
          }
        })
        
        if (targetsInRange.length > 0) {
          // Attack first target (or all for AOE)
          if (towerStats.special.aoe) {
            // AOE damage
            targetsInRange.forEach(antId => {
              const ant = gameState.ants.get(antId)
              if (ant) {
                const damage = Math.max(0, towerStats.damage - ant.armor)
                actions.updateAnt(antId, { hp: ant.hp - damage })
                
                if (ant.hp - damage <= 0) {
                  actions.removeAnt(antId)
                  actions.setResources(gameState.resources + ANT_STATS[ant.type].reward)
                  actions.updateScore(gameState.score + ANT_STATS[ant.type].reward * 10)
                }
              }
            })
          } else {
            // Single target
            const targetAnt = gameState.ants.get(targetsInRange[0])
            if (targetAnt) {
              const damage = Math.max(0, towerStats.damage - targetAnt.armor)
              actions.updateAnt(targetsInRange[0], { hp: targetAnt.hp - damage })
              
              // Apply special effects
              if (towerStats.special.slow && targetAnt.speed > 0.5) {
                actions.updateAnt(targetsInRange[0], { 
                  speed: targetAnt.speed * towerStats.special.slow 
                })
              }
              
              if (targetAnt.hp - damage <= 0) {
                actions.removeAnt(targetsInRange[0])
                actions.setResources(gameState.resources + ANT_STATS[targetAnt.type].reward)
                actions.updateScore(gameState.score + ANT_STATS[targetAnt.type].reward * 10)
              }
            }
          }
          
          actions.updateTower(tower.id, { lastAttackTime: now })
        }
      })
    }, 100 / gameState.gameSpeed)
    
    return () => clearInterval(attackInterval)
  }, [gameState, actions])
  
  const startWave = useCallback((): void => {
    if (gameState.currentWave >= level.waves.length) {
      return
    }
    
    const wave = level.waves[gameState.currentWave]
    const antsArray: Array<{ type: AntType; gate: number }> = []
    
    // Build spawn queue
    Object.entries(wave.antCounts).forEach(([type, count]) => {
      for (let i = 0; i < count; i++) {
        const gateIndex = Math.floor(Math.random() * wave.spawnGates.length)
        antsArray.push({ type: type as AntType, gate: gateIndex })
      }
    })
    
    // Shuffle for variety
    for (let i = antsArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [antsArray[i], antsArray[j]] = [antsArray[j], antsArray[i]]
    }
    
    setAntsToSpawn(antsArray)
    setWaveStartTime(Date.now())
    actions.setPhase(GamePhase.WAVE)
  }, [gameState.currentWave, level.waves, actions])
  
  const endWave = useCallback((): void => {
    if (gameState.currentWave >= level.waves.length - 1) {
      // Level complete!
      actions.setPhase(GamePhase.VICTORY)
      onLevelComplete()
    } else {
      // Next wave
      actions.setWave(gameState.currentWave + 1)
      actions.setPhase(GamePhase.BUILD)
    }
  }, [gameState.currentWave, level.waves.length, actions, onLevelComplete])
  
  const skipBuildPhase = useCallback((): void => {
    if (gameState.phase === GamePhase.BUILD) {
      startWave()
    }
  }, [gameState.phase, startWave])
  
  return (
    <div style={{ 
      position: 'absolute', 
      bottom: '4rem', 
      left: '50%', 
      transform: 'translateX(-50%)',
      background: 'var(--color-earth)',
      padding: '1rem 2rem',
      borderRadius: '0.5rem',
      border: '2px solid var(--color-earth-light)',
      textAlign: 'center'
    }}>
      {gameState.phase === GamePhase.BUILD ? (
        <>
          <p style={{ marginBottom: '0.5rem' }}>Build Phase</p>
          <button className="primary" onClick={skipBuildPhase}>
            Start Wave {gameState.currentWave + 1}
          </button>
        </>
      ) : (
        <>
          <p>Wave {gameState.currentWave + 1} in Progress</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-dim)' }}>
            Ants remaining: {antsToSpawn.length + gameState.ants.size}
          </p>
        </>
      )}
    </div>
  )
}