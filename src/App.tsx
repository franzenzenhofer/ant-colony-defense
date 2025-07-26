import { useState, useEffect, useCallback } from 'react'
import { GamePhase } from './types'
import { useGameState } from './hooks/useGameState'
import { SaveManager } from './utils/saveManager'
import MainMenu from './components/MainMenu'
import LevelSelect from './components/LevelSelect'
import GameScreen from './components/GameScreen'
import { CAMPAIGN_LEVELS } from './core/levels'

function App(): JSX.Element {
  const { state, actions } = useGameState()
  const [currentLevel, setCurrentLevel] = useState(0)
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1])
  const [achievements, setAchievements] = useState<string[]>([])
  
  // Load saved game on mount
  useEffect(() => {
    const savedGame = SaveManager.load()
    if (savedGame) {
      setUnlockedLevels(savedGame.unlockedLevels)
      setAchievements(savedGame.achievements)
      if (savedGame.gameState.bestScore) {
        actions.updateScore(savedGame.gameState.bestScore)
      }
    }
  }, [actions])
  
  // Save game periodically
  useEffect(() => {
    if (state.phase === GamePhase.BUILD || state.phase === GamePhase.WAVE) {
      const saveInterval = setInterval(() => {
        SaveManager.save(
          { bestScore: state.bestScore },
          currentLevel,
          unlockedLevels,
          achievements
        )
      }, 10000) // Save every 10 seconds
      
      return () => clearInterval(saveInterval)
    }
  }, [state.phase, state.bestScore, currentLevel, unlockedLevels, achievements])
  
  const handleStartGame = useCallback((levelId: number) => {
    setCurrentLevel(levelId)
    actions.resetGame()
    actions.setPhase(GamePhase.BUILD)
    
    const level = CAMPAIGN_LEVELS.find(l => l.id === levelId)
    if (level) {
      actions.setResources(level.startResources)
      actions.setWave(0)
    }
  }, [actions])
  
  const handleLevelComplete = useCallback((levelId: number) => {
    const nextLevelId = levelId + 1
    if (!unlockedLevels.includes(nextLevelId) && nextLevelId <= CAMPAIGN_LEVELS.length) {
      setUnlockedLevels([...unlockedLevels, nextLevelId])
    }
    
    // Save progress
    SaveManager.save(
      { bestScore: state.bestScore },
      currentLevel,
      [...unlockedLevels, nextLevelId],
      achievements
    )
    
    actions.setPhase(GamePhase.MENU)
  }, [unlockedLevels, achievements, state.bestScore, currentLevel, actions])
  
  const handleReturnToMenu = useCallback(() => {
    actions.setPhase(GamePhase.MENU)
  }, [actions])
  
  const handleContinueGame = useCallback(() => {
    const savedGame = SaveManager.load()
    if (savedGame?.currentLevel && savedGame.currentLevel > 0) {
      handleStartGame(savedGame.currentLevel)
    } else {
      // If no valid saved game, go to level select
      actions.setPhase(GamePhase.BUILD)
    }
  }, [handleStartGame, actions])

  switch (state.phase) {
    case GamePhase.MENU:
      return (
        <MainMenu
          onStartGame={() => actions.setPhase(GamePhase.BUILD)}
          onContinueGame={handleContinueGame}
          onSelectLevel={() => actions.setPhase(GamePhase.BUILD)}
          hasSavedGame={SaveManager.exists()}
          bestScore={state.bestScore}
        />
      )
      
    case GamePhase.BUILD:
    case GamePhase.WAVE:
      if (currentLevel === 0) {
        return (
          <LevelSelect
            unlockedLevels={unlockedLevels}
            onSelectLevel={handleStartGame}
            onBack={handleReturnToMenu}
          />
        )
      }
      
      const level = CAMPAIGN_LEVELS.find(l => l.id === currentLevel)
      if (!level) {
        return <div>Level not found!</div>
      }
      
      return (
        <GameScreen
          level={level}
          gameState={state}
          actions={actions}
          onLevelComplete={() => handleLevelComplete(currentLevel)}
          onReturnToMenu={handleReturnToMenu}
        />
      )
      
    case GamePhase.VICTORY:
      return (
        <div className="menu-container">
          <h1 className="menu-title">Victory!</h1>
          <p className="menu-subtitle">You defended against the ant colony!</p>
          <div className="menu-buttons">
            <button className="primary" onClick={() => handleLevelComplete(currentLevel)}>
              Continue
            </button>
            <button onClick={handleReturnToMenu}>
              Main Menu
            </button>
          </div>
        </div>
      )
      
    case GamePhase.DEFEAT:
      return (
        <div className="menu-container">
          <h1 className="menu-title" style={{ color: 'var(--color-danger)' }}>Defeat!</h1>
          <p className="menu-subtitle">The ants overwhelmed your defenses!</p>
          <div className="menu-buttons">
            <button className="primary" onClick={() => handleStartGame(currentLevel)}>
              Try Again
            </button>
            <button onClick={handleReturnToMenu}>
              Main Menu
            </button>
          </div>
        </div>
      )
      
    default:
      return <div>Loading...</div>
  }
}

export default App