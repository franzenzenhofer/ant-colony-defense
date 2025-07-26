import { SaveGameData, GameState } from '../types'

const SAVE_KEY = 'ant-colony-defense-save'
const VERSION = '1.0.0'

export class SaveManager {
  public static save(gameState: Partial<GameState>, currentLevel: number, unlockedLevels: number[], achievements: string[]): void {
    try {
      const saveData: SaveGameData = {
        version: VERSION,
        timestamp: Date.now(),
        gameState,
        currentLevel,
        unlockedLevels,
        achievements,
        statistics: {
          totalAntsKilled: 0,
          totalResourcesEarned: 0,
          totalTowersBuilt: 0,
          totalWavesCompleted: 0,
          bestStreak: 0,
          playTime: 0
        }
      }
      
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData))
    } catch {
      // Silently fail if localStorage is full or unavailable
    }
  }
  
  public static load(): SaveGameData | null {
    try {
      const savedData = localStorage.getItem(SAVE_KEY)
      if (!savedData) {
        return null
      }
      
      const parsed = JSON.parse(savedData) as SaveGameData
      
      // Version check
      if (parsed.version !== VERSION) {
        // Handle version migration here if needed
        return null
      }
      
      return parsed
    } catch {
      return null
    }
  }
  
  public static delete(): void {
    try {
      localStorage.removeItem(SAVE_KEY)
    } catch {
      // Silently fail
    }
  }
  
  public static exists(): boolean {
    try {
      return localStorage.getItem(SAVE_KEY) !== null
    } catch {
      return false
    }
  }
}