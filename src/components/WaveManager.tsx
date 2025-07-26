import { useEffect, useRef, useState, useCallback } from 'react'
import { LevelConfig, GameState, GamePhase, AntType, Ant, Tower, Pheromone, HexCoordinate, TowerType } from '../types'
import { ANT_STATS, GAME_CONFIG, TOWER_STATS } from '../core/constants'
import { AntColonyOptimization } from '../algorithms/antColonyOptimization'
import { hexToKey } from '../utils/hexGrid'
import { soundManager } from '../utils/soundManager'

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
  
  // Define startWave BEFORE using it in effects
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
    soundManager.playWaveStart()
    console.log('Starting wave', gameState.currentWave + 1, 'with', antsArray.length, 'ants to spawn')
  }, [gameState.currentWave, level.waves, actions])
  
  // Start first wave immediately when game begins
  useEffect(() => {
    if (gameState.phase === GamePhase.BUILD && gameState.currentWave === 0) {
      // Start immediately
      startWave()
    }
  }, [gameState.phase, gameState.currentWave, startWave])
  
  // Spawn ants during wave
  useEffect(() => {
    if (gameState.phase !== GamePhase.WAVE || antsToSpawn.length === 0 || gameState.isPaused) {
      if (gameState.phase === GamePhase.WAVE && antsToSpawn.length === 0) {
        console.log('No ants to spawn in wave phase')
      }
      return
    }
    
    console.log('Setting up spawn interval, ants to spawn:', antsToSpawn.length)
    
    const spawnInterval = setInterval(() => {
      setAntsToSpawn(prev => {
        console.log('Spawn interval tick, remaining:', prev.length)
        if (prev.length > 0) {
          const nextAnt = prev[0]
        
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
          console.log('Spawned ant:', ant.id, 'at position:', ant.position, 'total ants:', gameState.ants.size + 1)
          
          return prev.slice(1) // Return the updated array
        }
        return prev // Return unchanged if no ants to spawn
      })
    }, GAME_CONFIG.ANT_SPAWN_INTERVAL / gameState.gameSpeed)
    
    return () => clearInterval(spawnInterval)
  }, [gameState.phase, antsToSpawn, gameState.isPaused, gameState.gameSpeed, gameState.currentWave, level, actions, gameState.ants.size])
  
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
            ant.targetPosition ?? level.corePosition,
            obstacles,
            level.gridRadius
          )
          
          if (path.length > 0) {
            actions.updateAnt(ant.id, { path })
          } else {
            // If no path found, try direct path to core
            console.warn('No path found for ant', ant.id, 'at', ant.position, 'to', ant.targetPosition)
            // Move ant directly towards core (fallback)
            const fallbackPath = [ant.targetPosition ?? level.corePosition]
            actions.updateAnt(ant.id, { path: fallbackPath })
          }
        }
        
        // Move along path
        if (ant.path.length > 0) {
          const progress = ant.animationProgress + (ant.speed * GAME_CONFIG.ANT_SPEED_MULTIPLIER * gameState.gameSpeed)
          
          if (progress >= 1) {
            // Reached next hex
            const nextPosition = ant.path[0]
            const remainingPath = ant.path.slice(1)
            
            // Deposit pheromone
            const pheromoneKey = hexToKey(ant.position)
            const existingPheromone = gameState.pheromones.get(pheromoneKey)
            
            if (existingPheromone) {
              actions.updatePheromone(ant.position, {
                strength: Math.min(100, existingPheromone.strength + ant.pheromoneStrength)
              })
            } else {
              actions.addPheromone({
                position: ant.position,
                strength: ant.pheromoneStrength,
                type: 'PATH',
                decayRate: GAME_CONFIG.PHEROMONE_DECAY_RATE
              })
            }
            
            // Check if reached core
            if (nextPosition.q === level.corePosition.q && nextPosition.r === level.corePosition.r) {
              // Damage core
              actions.setCoreHealth(Math.max(0, gameState.coreHealth - ant.damage))
              actions.removeAnt(ant.id)
              soundManager.playCoreDamage()
            } else {
              // Continue to next position
              actions.updateAnt(ant.id, {
                position: nextPosition,
                path: remainingPath,
                animationProgress: progress - 1
              })
            }
          } else {
            // Still moving
            actions.updateAnt(ant.id, { animationProgress: progress })
          }
        }
      })
    }, GAME_CONFIG.GAME_UPDATE_INTERVAL / gameState.gameSpeed)
    
    return () => clearInterval(moveInterval)
  }, [gameState, level.corePosition, level.gridRadius, actions])
  
  // Tower attacks
  useEffect(() => {
    if (gameState.phase !== GamePhase.WAVE || gameState.isPaused) {
      return
    }
    
    const attackInterval = setInterval(() => {
      gameState.towers.forEach(tower => {
        const towerStats = TOWER_STATS[tower.type]
        const currentTime = Date.now()
        
        // Check if tower can attack
        if (currentTime - tower.lastAttackTime < towerStats.attackSpeed * 1000 / gameState.gameSpeed) {
          return
        }
        
        // Find targets in range
        const targetsInRange: string[] = []
        gameState.ants.forEach(ant => {
          const dx = ant.position.q - tower.position.q
          const dy = ant.position.r - tower.position.r
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance <= towerStats.range) {
            targetsInRange.push(ant.id)
          }
        })
        
        // Attack first target
        if (targetsInRange.length > 0) {
          const targetId = targetsInRange[0]
          const target = gameState.ants.get(targetId)
          
          if (target) {
            const damage = towerStats.damage - target.armor
            const newHp = target.hp - damage
            
            if (newHp <= 0) {
              // Ant defeated
              actions.removeAnt(targetId)
              actions.setResources(gameState.resources + ANT_STATS[target.type].reward)
              actions.updateScore(gameState.score + ANT_STATS[target.type].reward * 10)
              soundManager.playAntDefeat()
            } else {
              // Damage ant
              actions.updateAnt(targetId, { hp: newHp })
              
              // Apply special effects
              if (towerStats.special.slow && target.speed > 0.5) {
                actions.updateAnt(targetId, { speed: target.speed * (1 - towerStats.special.slow) })
              }
            }
            
            actions.updateTower(tower.id, { lastAttackTime: currentTime })
            soundManager.playTowerAttack(tower.type)
          }
        }
      })
    }, GAME_CONFIG.ATTACK_CHECK_INTERVAL / gameState.gameSpeed)
    
    return () => clearInterval(attackInterval)
  }, [gameState, actions])
  
  const endWave = useCallback((): void => {
    if (gameState.currentWave >= level.waves.length - 1) {
      // Level complete!
      actions.setPhase(GamePhase.VICTORY)
      onLevelComplete()
      soundManager.playVictory()
    } else {
      // Next wave - auto-start after 2 seconds
      actions.setWave(gameState.currentWave + 1)
      actions.setPhase(GamePhase.BUILD)
      
      // Auto-start next wave
      setTimeout(() => {
        startWave()
      }, 2000)
    }
  }, [gameState.currentWave, level.waves.length, actions, onLevelComplete, startWave])
  
  
  // Auto-start subsequent waves
  useEffect(() => {
    if (gameState.phase === GamePhase.BUILD && gameState.currentWave > 0) {
      const timer = setTimeout(() => {
        startWave()
      }, 2000) // 2s between waves
      
      return () => clearTimeout(timer)
    }
  }, [gameState.phase, gameState.currentWave, startWave])
  
  // Check wave completion
  useEffect(() => {
    if (gameState.phase === GamePhase.WAVE && 
        gameState.ants.size === 0 && 
        antsToSpawn.length === 0) {
      // Wave complete
      endWave()
    }
  }, [gameState.phase, gameState.ants.size, antsToSpawn.length, endWave])
  
  // Pheromone decay
  useEffect(() => {
    if (gameState.isPaused) {
      return
    }
    
    const decayInterval = setInterval(() => {
      actions.decayPheromones()
    }, GAME_CONFIG.PHEROMONE_UPDATE_INTERVAL)
    
    return () => clearInterval(decayInterval)
  }, [gameState.isPaused, actions])
  
  return (
    <div className="wave-controls">
      {/* Removed wave start button - game starts automatically */}
      
      {gameState.phase === GamePhase.WAVE && (
        <div style={{
          position: 'absolute',
          bottom: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--color-bg-secondary)',
          padding: '1rem',
          borderRadius: '8px',
          border: '2px solid var(--color-border)'
        }}>
          <p>Wave {gameState.currentWave + 1} in progress...</p>
          <p>Ants remaining: {gameState.ants.size + antsToSpawn.length}</p>
        </div>
      )}
      
      {gameState.phase === GamePhase.VICTORY && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h1>Victory!</h1>
            <p>You have successfully defended your colony!</p>
            <p>Score: {gameState.score}</p>
            <button className="primary" onClick={onLevelComplete}>
              Continue
            </button>
          </div>
        </div>
      )}
      
      {gameState.phase === GamePhase.DEFEAT && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h1>Defeat</h1>
            <p>The ants have overwhelmed your defenses!</p>
            <p>Score: {gameState.score}</p>
            <button onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  )
}