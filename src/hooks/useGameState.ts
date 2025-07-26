import { useReducer, useCallback, useEffect } from 'react'
import { GameState, GamePhase, TowerType, HexCoordinate, Ant, Tower, Pheromone } from '../types'
import { GAME_CONFIG } from '../core/constants'

type GameAction = 
  | { type: 'SET_PHASE'; payload: GamePhase }
  | { type: 'SET_RESOURCES'; payload: number }
  | { type: 'SET_CORE_HEALTH'; payload: number }
  | { type: 'SET_WAVE'; payload: number }
  | { type: 'ADD_ANT'; payload: Ant }
  | { type: 'REMOVE_ANT'; payload: string }
  | { type: 'UPDATE_ANT'; payload: { id: string; updates: Partial<Ant> } }
  | { type: 'ADD_TOWER'; payload: Tower }
  | { type: 'REMOVE_TOWER'; payload: string }
  | { type: 'UPDATE_TOWER'; payload: { id: string; updates: Partial<Tower> } }
  | { type: 'ADD_PHEROMONE'; payload: Pheromone }
  | { type: 'UPDATE_PHEROMONE'; payload: { position: HexCoordinate; updates: Partial<Pheromone> } }
  | { type: 'DECAY_PHEROMONES' }
  | { type: 'SET_SELECTED_TOWER'; payload: TowerType | null }
  | { type: 'SET_SELECTED_HEX'; payload: HexCoordinate | null }
  | { type: 'SET_PAUSED'; payload: boolean }
  | { type: 'SET_GAME_SPEED'; payload: number }
  | { type: 'UPDATE_SCORE'; payload: number }
  | { type: 'RESET_GAME' }

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.payload }
      
    case 'SET_RESOURCES':
      return { ...state, resources: Math.max(0, action.payload) }
      
    case 'SET_CORE_HEALTH':
      return { ...state, coreHealth: Math.max(0, Math.min(state.maxCoreHealth, action.payload)) }
      
    case 'SET_WAVE':
      return { ...state, currentWave: action.payload }
      
    case 'ADD_ANT': {
      const newAnts = new Map(state.ants)
      newAnts.set(action.payload.id, action.payload)
      return { ...state, ants: newAnts }
    }
    
    case 'REMOVE_ANT': {
      const newAnts = new Map(state.ants)
      newAnts.delete(action.payload)
      return { ...state, ants: newAnts }
    }
    
    case 'UPDATE_ANT': {
      const newAnts = new Map(state.ants)
      const ant = newAnts.get(action.payload.id)
      if (ant) {
        newAnts.set(action.payload.id, { ...ant, ...action.payload.updates })
      }
      return { ...state, ants: newAnts }
    }
    
    case 'ADD_TOWER': {
      const newTowers = new Map(state.towers)
      newTowers.set(action.payload.id, action.payload)
      return { ...state, towers: newTowers }
    }
    
    case 'REMOVE_TOWER': {
      const newTowers = new Map(state.towers)
      newTowers.delete(action.payload)
      return { ...state, towers: newTowers }
    }
    
    case 'UPDATE_TOWER': {
      const newTowers = new Map(state.towers)
      const tower = newTowers.get(action.payload.id)
      if (tower) {
        newTowers.set(action.payload.id, { ...tower, ...action.payload.updates })
      }
      return { ...state, towers: newTowers }
    }
    
    case 'ADD_PHEROMONE': {
      const newPheromones = new Map(state.pheromones)
      const key = `${action.payload.position.q},${action.payload.position.r}`
      newPheromones.set(key, action.payload)
      return { ...state, pheromones: newPheromones }
    }
    
    case 'UPDATE_PHEROMONE': {
      const newPheromones = new Map(state.pheromones)
      const key = `${action.payload.position.q},${action.payload.position.r}`
      const pheromone = newPheromones.get(key)
      if (pheromone) {
        newPheromones.set(key, { ...pheromone, ...action.payload.updates })
      }
      return { ...state, pheromones: newPheromones }
    }
    
    case 'DECAY_PHEROMONES': {
      const newPheromones = new Map<string, Pheromone>()
      state.pheromones.forEach((pheromone, key) => {
        const decayedStrength = pheromone.strength * (1 - pheromone.decayRate)
        if (decayedStrength > 0.01) {
          newPheromones.set(key, { ...pheromone, strength: decayedStrength })
        }
      })
      return { ...state, pheromones: newPheromones }
    }
    
    case 'SET_SELECTED_TOWER':
      return { ...state, selectedTowerType: action.payload }
      
    case 'SET_SELECTED_HEX':
      return { ...state, selectedHex: action.payload }
      
    case 'SET_PAUSED':
      return { ...state, isPaused: action.payload }
      
    case 'SET_GAME_SPEED':
      return { ...state, gameSpeed: action.payload }
      
    case 'UPDATE_SCORE':
      return { 
        ...state, 
        score: action.payload,
        bestScore: Math.max(state.bestScore, action.payload)
      }
      
    case 'RESET_GAME':
      return createInitialState()
      
    default:
      return state
  }
}

function createInitialState(): GameState {
  return {
    phase: GamePhase.MENU,
    resources: GAME_CONFIG.INITIAL_RESOURCES,
    coreHealth: GAME_CONFIG.CORE_HEALTH,
    maxCoreHealth: GAME_CONFIG.CORE_HEALTH,
    currentWave: 0,
    totalWaves: 0,
    ants: new Map(),
    towers: new Map(),
    pheromones: new Map(),
    selectedTowerType: null,
    selectedHex: null,
    isPaused: false,
    gameSpeed: 1,
    score: 0,
    bestScore: 0
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, createInitialState())
  
  const setPhase = useCallback((phase: GamePhase) => {
    dispatch({ type: 'SET_PHASE', payload: phase })
  }, [])
  
  const setResources = useCallback((resources: number) => {
    dispatch({ type: 'SET_RESOURCES', payload: resources })
  }, [])
  
  const setCoreHealth = useCallback((health: number) => {
    dispatch({ type: 'SET_CORE_HEALTH', payload: health })
  }, [])
  
  const setWave = useCallback((wave: number) => {
    dispatch({ type: 'SET_WAVE', payload: wave })
  }, [])
  
  const addAnt = useCallback((ant: Ant) => {
    dispatch({ type: 'ADD_ANT', payload: ant })
  }, [])
  
  const removeAnt = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ANT', payload: id })
  }, [])
  
  const updateAnt = useCallback((id: string, updates: Partial<Ant>) => {
    dispatch({ type: 'UPDATE_ANT', payload: { id, updates } })
  }, [])
  
  const addTower = useCallback((tower: Tower) => {
    dispatch({ type: 'ADD_TOWER', payload: tower })
  }, [])
  
  const removeTower = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOWER', payload: id })
  }, [])
  
  const updateTower = useCallback((id: string, updates: Partial<Tower>) => {
    dispatch({ type: 'UPDATE_TOWER', payload: { id, updates } })
  }, [])
  
  const addPheromone = useCallback((pheromone: Pheromone) => {
    dispatch({ type: 'ADD_PHEROMONE', payload: pheromone })
  }, [])
  
  const updatePheromone = useCallback((position: HexCoordinate, updates: Partial<Pheromone>) => {
    dispatch({ type: 'UPDATE_PHEROMONE', payload: { position, updates } })
  }, [])
  
  const decayPheromones = useCallback(() => {
    dispatch({ type: 'DECAY_PHEROMONES' })
  }, [])
  
  const setSelectedTowerType = useCallback((type: TowerType | null) => {
    dispatch({ type: 'SET_SELECTED_TOWER', payload: type })
  }, [])
  
  const setSelectedHex = useCallback((hex: HexCoordinate | null) => {
    dispatch({ type: 'SET_SELECTED_HEX', payload: hex })
  }, [])
  
  const setPaused = useCallback((paused: boolean) => {
    dispatch({ type: 'SET_PAUSED', payload: paused })
  }, [])
  
  const setGameSpeed = useCallback((speed: number) => {
    dispatch({ type: 'SET_GAME_SPEED', payload: speed })
  }, [])
  
  const updateScore = useCallback((score: number) => {
    dispatch({ type: 'UPDATE_SCORE', payload: score })
  }, [])
  
  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' })
  }, [])
  
  // Passive resource generation
  useEffect(() => {
    if (state.phase === GamePhase.BUILD && !state.isPaused) {
      const interval = setInterval(() => {
        setResources(state.resources + GAME_CONFIG.RESOURCE_PER_SECOND)
      }, 1000 / state.gameSpeed)
      
      return () => clearInterval(interval)
    }
  }, [state.phase, state.isPaused, state.gameSpeed, state.resources, setResources])
  
  return {
    state,
    actions: {
      setPhase,
      setResources,
      setCoreHealth,
      setWave,
      addAnt,
      removeAnt,
      updateAnt,
      addTower,
      removeTower,
      updateTower,
      addPheromone,
      updatePheromone,
      decayPheromones,
      setSelectedTowerType,
      setSelectedHex,
      setPaused,
      setGameSpeed,
      updateScore,
      resetGame
    }
  }
}