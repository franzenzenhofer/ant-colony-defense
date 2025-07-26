import { useEffect, useRef, useState, useCallback } from 'react'
import { LevelConfig, GameState, GamePhase, TowerType, HexCoordinate } from '../types'
import { Pause, Play, FastForward, Home, Heart, Coins, Shield } from 'lucide-react'
import GameCanvas from './GameCanvas'
import TowerSelector from './TowerSelector'
import WaveManager from './WaveManager'
import { TOWER_STATS, GAME_CONFIG } from '../core/constants'
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

interface GameScreenProps {
  level: LevelConfig
  gameState: GameState
  actions: GameActions
  onLevelComplete: () => void
  onReturnToMenu: () => void
}

export default function GameScreen({
  level,
  gameState,
  actions,
  onLevelComplete,
  onReturnToMenu
}: GameScreenProps): JSX.Element {
  const [showPauseMenu, setShowPauseMenu] = useState(false)
  const [selectedHex, setSelectedHex] = useState<HexCoordinate | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent): void => {
      if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault()
        actions.setPaused(!gameState.isPaused)
        setShowPauseMenu(!gameState.isPaused)
      }
      
      // Number keys for tower selection
      const num = parseInt(e.key)
      if (num >= 1 && num <= 4) {
        const towers = Object.values(TowerType)
        if (towers[num - 1]) {
          actions.setSelectedTowerType(towers[num - 1])
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState.isPaused, actions])
  
  // Check win/lose conditions
  useEffect(() => {
    if (gameState.coreHealth <= 0 && gameState.phase !== GamePhase.DEFEAT) {
      actions.setPhase(GamePhase.DEFEAT)
      soundManager.playDefeat()
    }
  }, [gameState.coreHealth, gameState.phase, actions])
  
  const handlePlaceTower = useCallback((hex: HexCoordinate): void => {
    if (!gameState.selectedTowerType || gameState.phase !== GamePhase.BUILD) {
      return
    }
    
    const towerStats = TOWER_STATS[gameState.selectedTowerType]
    if (gameState.resources < towerStats.cost) {
      // Show insufficient resources message
      return
    }
    
    // Check if hex is valid for placement
    const hexKey = hexToKey(hex)
    const isOccupied = Array.from(gameState.towers.values()).some(
      tower => hexToKey(tower.position) === hexKey
    )
    
    const isCore = hex.q === level.corePosition.q && hex.r === level.corePosition.r
    const isSpawnGate = level.spawnGates.some(
      gate => gate.q === hex.q && gate.r === hex.r
    )
    const isObstacle = level.obstacles.some(
      obs => obs.q === hex.q && obs.r === hex.r
    )
    
    if (isOccupied || isCore || isSpawnGate || isObstacle) {
      return
    }
    
    // Place tower
    const tower = {
      id: `tower-${Date.now()}`,
      type: gameState.selectedTowerType,
      position: hex,
      level: 1,
      lastAttackTime: 0,
      targetsInRange: []
    }
    
    actions.addTower(tower)
    actions.setResources(gameState.resources - towerStats.cost)
    setSelectedHex(hex)
    soundManager.playTowerPlace()
  }, [gameState, actions, level])
  
  const handleSellTower = useCallback((hex: HexCoordinate): void => {
    const hexKey = hexToKey(hex)
    const tower = Array.from(gameState.towers.values()).find(
      t => hexToKey(t.position) === hexKey
    )
    
    if (tower) {
      const sellPrice = Math.floor(TOWER_STATS[tower.type].cost * 0.7)
      actions.removeTower(tower.id)
      actions.setResources(gameState.resources + sellPrice)
      soundManager.playButtonClick()
    }
  }, [gameState, actions])
  
  const toggleSpeed = (): void => {
    const speeds = GAME_CONFIG.SPEED_MULTIPLIERS
    const currentIndex = speeds.indexOf(gameState.gameSpeed)
    const nextIndex = (currentIndex + 1) % speeds.length
    actions.setGameSpeed(speeds[nextIndex])
    soundManager.playButtonClick()
  }
  
  return (
    <div className="game-container">
      {/* Game Header */}
      <div className="game-header">
        <div className="resource-display">
          <div className="resource-item">
            <Heart size={20} color="var(--color-danger)" />
            <span>{gameState.coreHealth}/{gameState.maxCoreHealth}</span>
          </div>
          
          <div className="resource-item">
            <Coins size={20} color="var(--color-accent)" />
            <span>{gameState.resources}</span>
          </div>
          
          <div className="resource-item">
            <Shield size={20} color="var(--color-success)" />
            <span>Wave {gameState.currentWave + 1}/{level.waves.length}</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => {
              soundManager.playButtonClick()
              actions.setPaused(!gameState.isPaused)
              setShowPauseMenu(!gameState.isPaused)
            }}
            style={{ padding: '0.5rem' }}
            aria-label={gameState.isPaused ? 'Play' : 'Pause'}
          >
            {gameState.isPaused ? <Play size={20} /> : <Pause size={20} />}
          </button>
          
          <button 
            onClick={toggleSpeed}
            style={{ padding: '0.5rem' }}
            className={gameState.gameSpeed > 1 ? 'primary' : ''}
          >
            <FastForward size={20} />
            {gameState.gameSpeed}x
          </button>
          
          <button 
            onClick={() => {
              soundManager.playButtonClick()
              onReturnToMenu()
            }}
            style={{ padding: '0.5rem' }}
            aria-label="Home"
          >
            <Home size={20} />
          </button>
        </div>
      </div>
      
      {/* Game Canvas */}
      <div className="game-canvas">
        <GameCanvas
          ref={canvasRef}
          level={level}
          gameState={gameState}
          onHexClick={handlePlaceTower}
          onHexRightClick={handleSellTower}
          selectedHex={selectedHex}
        />
      </div>
      
      {/* Tower Selector */}
      {gameState.phase === GamePhase.BUILD && (
        <TowerSelector
          selectedType={gameState.selectedTowerType}
          resources={gameState.resources}
          onSelectType={actions.setSelectedTowerType}
        />
      )}
      
      {/* Wave Manager */}
      <WaveManager
        level={level}
        gameState={gameState}
        actions={actions}
        onLevelComplete={onLevelComplete}
      />
      
      {/* Pause Menu */}
      {showPauseMenu && (
        <div className="modal-overlay" onClick={() => setShowPauseMenu(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Game Paused</h2>
            
            <div className="menu-buttons">
              <button 
                className="primary"
                onClick={() => {
                  soundManager.playButtonClick()
                  actions.setPaused(false)
                  setShowPauseMenu(false)
                }}
              >
                Resume Game
              </button>
              
              <button onClick={() => {
                soundManager.playButtonClick()
                window.location.reload()
              }}>
                Restart Level
              </button>
              
              <button onClick={() => {
                soundManager.playButtonClick()
                onReturnToMenu()
              }}>
                Main Menu
              </button>
            </div>
            
            <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--color-text-dim)' }}>
              <h3>Keyboard Shortcuts</h3>
              <p>Space/Esc - Pause</p>
              <p>1-4 - Select Tower</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}