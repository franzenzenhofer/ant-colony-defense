import { Trophy, Play, BookOpen, Volume2, VolumeX } from 'lucide-react'
import { useState, useEffect } from 'react'

interface MainMenuProps {
  onStartGame: () => void
  onContinueGame: () => void
  onSelectLevel: () => void
  hasSavedGame: boolean
  bestScore: number
}

export default function MainMenu({ 
  onContinueGame, 
  onSelectLevel, 
  hasSavedGame,
  bestScore 
}: MainMenuProps): JSX.Element {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)
  
  useEffect(() => {
    const saved = localStorage.getItem('ant-colony-defense-sound')
    if (saved !== null) {
      setSoundEnabled(saved === 'true')
    }
  }, [])
  
  const toggleSound = (): void => {
    const newValue = !soundEnabled
    setSoundEnabled(newValue)
    localStorage.setItem('ant-colony-defense-sound', String(newValue))
  }
  
  if (showTutorial) {
    return (
      <div className="menu-container">
        <h2 className="menu-title">How to Play</h2>
        <div className="modal-content" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3>🎯 Objective</h3>
          <p>Defend your picnic from waves of intelligent ants using strategic tower placement!</p>
          
          <h3>🐜 Ant Types</h3>
          <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0 }}>
            <li>🟫 <strong>Worker Ants</strong> - Basic ants, moderate health</li>
            <li>🔴 <strong>Soldier Ants</strong> - Tanky ants with armor</li>
            <li>🟡 <strong>Scout Ants</strong> - Fast but fragile</li>
            <li>🟣 <strong>Queen Ants</strong> - Boss ants with massive health</li>
          </ul>
          
          <h3>🗼 Tower Types</h3>
          <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0 }}>
            <li>🦣 <strong>Anteater</strong> - Slows ants with sticky tongue</li>
            <li>💨 <strong>Pesticide</strong> - Area of effect damage</li>
            <li>🍯 <strong>Sugar Trap</strong> - Lures ants and damages them</li>
            <li>🔥 <strong>Fire Tower</strong> - High damage with burn effect</li>
          </ul>
          
          <h3>🎮 Gameplay</h3>
          <p>1. Place towers during build phase</p>
          <p>2. Ants follow pheromone trails using real colony AI</p>
          <p>3. Earn resources by defeating ants</p>
          <p>4. Survive all waves to win!</p>
          
          <h3>💡 Tips</h3>
          <p>• Create mazes to maximize tower coverage</p>
          <p>• Use sugar traps to control ant movement</p>
          <p>• Save fire towers for tough enemies</p>
          <p>• Watch the pheromone trails to predict paths</p>
          
          <button className="primary" onClick={() => setShowTutorial(false)}>
            Back to Menu
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="menu-container">
      <h1 className="menu-title">🐜 Ant Colony Defense 🐜</h1>
      <p className="menu-subtitle">Strategic Tower Defense with Real Colony AI</p>
      
      {bestScore > 0 && (
        <div className="resource-display" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
          <Trophy size={24} color="var(--color-accent)" />
          <span>Best Score: {bestScore.toLocaleString()}</span>
        </div>
      )}
      
      <div className="menu-buttons">
        {hasSavedGame ? (
          <button className="primary" onClick={onContinueGame}>
            <Play size={20} />
            Continue Game
          </button>
        ) : (
          <button className="primary" onClick={onSelectLevel}>
            <Play size={20} />
            New Game
          </button>
        )}
        
        <button onClick={onSelectLevel}>
          <Trophy size={20} />
          Select Level
        </button>
        
        <button onClick={() => setShowTutorial(true)}>
          <BookOpen size={20} />
          How to Play
        </button>
        
        <button onClick={toggleSound}>
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          Sound: {soundEnabled ? 'On' : 'Off'}
        </button>
      </div>
      
      <p style={{ 
        position: 'absolute', 
        bottom: '1rem', 
        left: '50%', 
        transform: 'translateX(-50%)',
        fontSize: '0.8rem',
        color: 'var(--color-text-dim)'
      }}>
        v1.0.0 • Made with 🐜 by Franz AI
      </p>
    </div>
  )
}