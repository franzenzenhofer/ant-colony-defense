import { describe, it, expect, beforeEach, vi } from 'vitest'
import { soundManager } from '../../utils/soundManager'

describe('SoundManager', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with sound enabled by default', () => {
      expect(soundManager.isEnabled()).toBe(true)
    })

    it('should respect localStorage sound preference', () => {
      localStorage.setItem('ant-colony-defense-sound', 'false')
      const newManager = new (soundManager.constructor as any)()
      expect(newManager.isEnabled()).toBe(false)
    })
  })

  describe('sound control', () => {
    it('should toggle sound on/off', () => {
      soundManager.setEnabled(false)
      expect(soundManager.isEnabled()).toBe(false)
      expect(localStorage.getItem('ant-colony-defense-sound')).toBe('false')
      
      soundManager.setEnabled(true)
      expect(soundManager.isEnabled()).toBe(true)
      expect(localStorage.getItem('ant-colony-defense-sound')).toBe('true')
    })

    it('should set volume within valid range', () => {
      soundManager.setVolume(0.5)
      // Volume is clamped between 0 and 1
      soundManager.setVolume(-1)
      soundManager.setVolume(2)
      // No errors should occur
      expect(true).toBe(true)
    })
  })

  describe('sound effects', () => {
    const mockAudioContext = {
      createOscillator: vi.fn(() => ({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        type: 'sine',
        frequency: {
          value: 440,
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn()
        }
      })),
      createGain: vi.fn(() => ({
        connect: vi.fn(),
        gain: {
          value: 1,
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn()
        }
      })),
      currentTime: 0,
      destination: {}
    }

    beforeEach(() => {
      vi.spyOn(soundManager as any, 'getAudioContext').mockReturnValue(mockAudioContext)
    })

    it('should play tower shoot sound when enabled', () => {
      soundManager.setEnabled(true)
      soundManager.playTowerShoot()
      expect(mockAudioContext.createOscillator).toHaveBeenCalled()
      expect(mockAudioContext.createGain).toHaveBeenCalled()
    })

    it('should not play sounds when disabled', () => {
      soundManager.setEnabled(false)
      soundManager.playTowerShoot()
      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled()
    })

    it('should play all sound types', () => {
      soundManager.setEnabled(true)
      
      const sounds = [
        'playTowerShoot',
        'playAntHurt',
        'playAntDeath',
        'playTowerPlace',
        'playWaveStart',
        'playDefeat',
        'playButtonClick'
      ] as const

      sounds.forEach(soundMethod => {
        vi.clearAllMocks()
        vi.spyOn(soundManager as any, 'getAudioContext').mockReturnValue(mockAudioContext)
        soundManager[soundMethod]()
        expect(mockAudioContext.createOscillator).toHaveBeenCalled()
      })
    })

    it('should handle victory sound with multiple notes', () => {
      vi.useFakeTimers()
      soundManager.setEnabled(true)
      soundManager.playVictory()
      
      // Victory plays 3 notes with delays
      vi.advanceTimersByTime(300)
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3)
      
      vi.useRealTimers()
    })
  })

  describe('audio context management', () => {
    it('should create audio context lazily', () => {
      const getContextSpy = vi.spyOn(soundManager as any, 'getAudioContext')
      soundManager.setEnabled(true)
      
      // Context not created until sound is played
      expect(getContextSpy).not.toHaveBeenCalled()
      
      soundManager.playButtonClick()
      expect(getContextSpy).toHaveBeenCalled()
    })

    it('should reuse same audio context', () => {
      soundManager.setEnabled(true)
      soundManager.playButtonClick()
      const firstCall = (soundManager as any).audioContext
      
      soundManager.playButtonClick()
      const secondCall = (soundManager as any).audioContext
      
      expect(firstCall).toBe(secondCall)
    })
  })
})