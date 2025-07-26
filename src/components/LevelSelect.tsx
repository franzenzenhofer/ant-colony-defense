import { Lock, Check, ChevronLeft } from 'lucide-react'
import { CAMPAIGN_LEVELS } from '../core/levels'
import { soundManager } from '../utils/soundManager'

interface LevelSelectProps {
  unlockedLevels: number[]
  onSelectLevel: (levelId: number) => void
  onBack: () => void
}

export default function LevelSelect({ 
  unlockedLevels, 
  onSelectLevel, 
  onBack 
}: LevelSelectProps): JSX.Element {
  return (
    <div className="menu-container">
      <button 
        onClick={() => {
          soundManager.playButtonClick()
          onBack()
        }} 
        style={{ 
          position: 'absolute', 
          top: '1rem', 
          left: '1rem',
          padding: '0.5rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <ChevronLeft size={20} />
        Back
      </button>
      
      <h1 className="menu-title">Select Level</h1>
      <p className="menu-subtitle">Choose your battlefield</p>
      
      <div className="level-grid">
        {CAMPAIGN_LEVELS.map((level) => {
          const isUnlocked = unlockedLevels.includes(level.id)
          const isCompleted = level.id < Math.max(...unlockedLevels)
          
          return (
            <div
              key={level.id}
              className={`level-card ${!isUnlocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => {
                if (isUnlocked) {
                  soundManager.playButtonClick()
                  onSelectLevel(level.id)
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3>Level {level.id}</h3>
                {!isUnlocked && <Lock size={20} />}
                {isCompleted && <Check size={20} color="var(--color-success)" />}
              </div>
              
              <h4 style={{ marginBottom: '0.5rem' }}>{level.name}</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-dim)', marginBottom: '1rem' }}>
                {level.description}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span>Waves: {level.waves.length}</span>
                <span>💰 {level.startResources}</span>
              </div>
              
              {isUnlocked && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                    {level.spawnGates.map((_, index) => (
                      <span key={index} style={{ fontSize: '0.8rem' }}>🚪</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}