export interface SoundConfig {
  volume: number
  enabled: boolean
}

export class SoundManager {
  private audioContext: AudioContext | null = null
  private config: SoundConfig = {
    volume: 0.5,
    enabled: true
  }
  
  constructor() {
    // Load sound preference from localStorage
    const savedSound = localStorage.getItem('ant-colony-defense-sound')
    if (savedSound !== null) {
      this.config.enabled = savedSound === 'true'
    }
  }
  
  private getAudioContext(): AudioContext {
    this.audioContext ??= new AudioContext()
    return this.audioContext
  }
  
  public playTowerShoot(): void {
    if (!this.config.enabled) return
    
    const ctx = this.getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.type = 'square'
    oscillator.frequency.value = 440
    gainNode.gain.setValueAtTime(0.3 * this.config.volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.1)
  }
  
  public playAntHurt(): void {
    if (!this.config.enabled) return
    
    const ctx = this.getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.type = 'sawtooth'
    oscillator.frequency.value = 220
    gainNode.gain.setValueAtTime(0.2 * this.config.volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.05)
  }
  
  public playAntDeath(): void {
    if (!this.config.enabled) return
    
    const ctx = this.getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    // Create white noise by using a low-frequency oscillator with high frequency modulation
    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(50, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.2)
    
    gainNode.gain.setValueAtTime(0.3 * this.config.volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.2)
  }
  
  public playTowerPlace(): void {
    if (!this.config.enabled) return
    
    const ctx = this.getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.type = 'sine'
    oscillator.frequency.value = 880
    gainNode.gain.setValueAtTime(0.4 * this.config.volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.2)
  }
  
  public playWaveStart(): void {
    if (!this.config.enabled) return
    
    const ctx = this.getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(200, ctx.currentTime)
    oscillator.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.5)
    
    gainNode.gain.setValueAtTime(0.5 * this.config.volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.5)
  }
  
  public playVictory(): void {
    if (!this.config.enabled) return
    
    const ctx = this.getAudioContext()
    const frequencies = [523.25, 659.25, 783.99] // C major chord
    
    frequencies.forEach((freq, i) => {
      setTimeout(() => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        
        oscillator.type = 'sine'
        oscillator.frequency.value = freq
        gainNode.gain.setValueAtTime(0.3 * this.config.volume, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
        
        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)
        
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.5)
      }, i * 100)
    })
  }
  
  public playDefeat(): void {
    if (!this.config.enabled) return
    
    const ctx = this.getAudioContext()
    const frequencies = [220, 233.08, 261.63] // A minor chord
    
    frequencies.forEach(freq => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.type = 'sine'
      oscillator.frequency.value = freq
      gainNode.gain.setValueAtTime(0.2 * this.config.volume, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1)
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 1)
    })
  }
  
  public playButtonClick(): void {
    if (!this.config.enabled) return
    
    const ctx = this.getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.type = 'sine'
    oscillator.frequency.value = 600
    gainNode.gain.setValueAtTime(0.1 * this.config.volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.05)
  }
  
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled
    localStorage.setItem('ant-colony-defense-sound', String(enabled))
  }
  
  public setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume))
  }
  
  public isEnabled(): boolean {
    return this.config.enabled
  }
  
  public playCoreDamage(): void {
    if (!this.config.enabled) return
    
    const ctx = this.getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(100, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2)
    gainNode.gain.setValueAtTime(0.5 * this.config.volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.2)
  }
  
  public playAntDefeat(): void {
    if (!this.config.enabled) return
    
    const ctx = this.getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(800, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1)
    gainNode.gain.setValueAtTime(0.2 * this.config.volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.1)
  }
  
  public playTowerAttack(towerType: string): void {
    if (!this.config.enabled) return
    
    const ctx = this.getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    // Different sounds for different tower types
    switch (towerType) {
      case 'ANTEATER':
        oscillator.type = 'square'
        oscillator.frequency.value = 300
        break
      case 'PESTICIDE':
        oscillator.type = 'sawtooth'
        oscillator.frequency.value = 500
        break
      case 'SUGAR_TRAP':
        oscillator.type = 'sine'
        oscillator.frequency.value = 600
        break
      case 'FIRE':
        oscillator.type = 'triangle'
        oscillator.frequency.value = 200
        break
      default:
        oscillator.type = 'square'
        oscillator.frequency.value = 440
    }
    
    gainNode.gain.setValueAtTime(0.15 * this.config.volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.05)
  }
}

// Global sound manager instance
export const soundManager = new SoundManager()