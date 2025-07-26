import { TowerType } from '../types'
import { TOWER_STATS } from '../core/constants'

interface TowerSelectorProps {
  selectedType: TowerType | null
  resources: number
  onSelectType: (type: TowerType | null) => void
}

export default function TowerSelector({
  selectedType,
  resources,
  onSelectType
}: TowerSelectorProps): JSX.Element {
  return (
    <div className="game-controls">
      {Object.entries(TOWER_STATS).map(([type, stats], index) => {
        const towerType = type as TowerType
        const canAfford = resources >= stats.cost
        const isSelected = selectedType === towerType
        
        return (
          <button
            key={type}
            className={`tower-button ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelectType(isSelected ? null : towerType)}
            disabled={!canAfford}
            title={`${stats.name} - ${stats.description} (Hotkey: ${index + 1})`}
          >
            <span style={{ fontSize: '1.5rem' }}>{stats.icon}</span>
            <span style={{ fontWeight: 'bold' }}>{stats.name}</span>
            <span style={{ 
              fontSize: '0.8rem', 
              color: canAfford ? 'var(--color-text-dim)' : 'var(--color-danger)',
              fontWeight: canAfford ? 'normal' : 'bold'
            }}>
              💰 {stats.cost}
            </span>
            {!canAfford && (
              <>
                <span style={{ 
                  position: 'absolute', 
                  top: 0, 
                  right: 0, 
                  bottom: 0, 
                  left: 0, 
                  background: 'rgba(0,0,0,0.6)',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{
                    color: 'var(--color-danger)',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                  }}>
                    Need {stats.cost - resources} more
                  </span>
                </span>
              </>
            )}
          </button>
        )
      })}
      
      <div style={{ 
        padding: '0.5rem 1rem', 
        display: 'flex', 
        alignItems: 'center',
        fontSize: '0.9rem',
        color: 'var(--color-text-dim)'
      }}>
        {selectedType ? (
          <span>Click hex to place • Right-click to sell (70% refund)</span>
        ) : (
          <span>Select a tower to place</span>
        )}
      </div>
    </div>
  )
}