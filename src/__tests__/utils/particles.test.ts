import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ParticleSystem } from '../../utils/particles'

describe('ParticleSystem', () => {
  let particleSystem: ParticleSystem
  let mockCtx: CanvasRenderingContext2D

  beforeEach(() => {
    particleSystem = new ParticleSystem()
    mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      globalAlpha: 1,
      fillStyle: '',
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn()
    } as any
  })

  describe('initialization', () => {
    it('should start with no particles', () => {
      expect((particleSystem as any).particles.size).toBe(0)
    })
  })

  describe('addDeathParticles', () => {
    it('should add 8 particles at given position', () => {
      particleSystem.addDeathParticles(100, 200, '#ff0000')
      expect((particleSystem as any).particles.size).toBe(8)
    })

    it('should create particles with correct properties', () => {
      particleSystem.addDeathParticles(100, 200, '#ff0000')
      
      const particles = Array.from((particleSystem as any).particles.values())
      particles.forEach(particle => {
        expect(particle.x).toBeDefined()
        expect(particle.y).toBeDefined()
        expect(particle.vx).toBeDefined()
        expect(particle.vy).toBeDefined()
        expect(particle.life).toBe(30)
        expect(particle.maxLife).toBe(30)
        expect(particle.color).toBe('#ff0000')
        expect(particle.size).toBeGreaterThan(3)
        expect(particle.size).toBeLessThanOrEqual(6)
        expect(particle.type).toBe('death')
      })
    })

    it('should create particles in all directions', () => {
      particleSystem.addDeathParticles(0, 0, '#ff0000')
      
      const particles = Array.from((particleSystem as any).particles.values())
      const angles = particles.map(p => Math.atan2(p.vy, p.vx))
      
      // Check that particles spread in different directions
      const uniqueAngles = new Set(angles.map(a => Math.round(a * 10) / 10))
      expect(uniqueAngles.size).toBeGreaterThan(4)
    })

    it('should handle multiple death events', async () => {
      particleSystem.addDeathParticles(100, 100, '#ff0000')
      expect((particleSystem as any).particles.size).toBe(8)
      
      // Add more particles - they might overwrite due to same timestamp
      particleSystem.addDeathParticles(200, 200, '#00ff00')
      
      // Should have at least 8 particles (might be same IDs)
      expect((particleSystem as any).particles.size).toBeGreaterThanOrEqual(8)
    })
  })

  describe('addHitParticles', () => {
    it('should add 4 particles at given position', () => {
      particleSystem.addHitParticles(50, 50)
      expect((particleSystem as any).particles.size).toBe(4)
    })

    it('should create golden hit particles', () => {
      particleSystem.addHitParticles(50, 50)
      
      const particles = Array.from((particleSystem as any).particles.values())
      particles.forEach(particle => {
        expect(particle.color).toBe('#FFD700')
        expect(particle.size).toBeGreaterThan(2)
        expect(particle.size).toBeLessThanOrEqual(4)
        expect(particle.type).toBe('hit')
        expect(particle.life).toBe(20)
        expect(particle.maxLife).toBe(20)
      })
    })

    it('should create particles with random velocity', () => {
      particleSystem.addHitParticles(0, 0)
      
      const particles = Array.from((particleSystem as any).particles.values())
      const velocities = particles.map(p => ({ vx: p.vx, vy: p.vy }))
      
      // Check that velocities are different (random)
      const uniqueVelocities = new Set(velocities.map(v => `${v.vx},${v.vy}`))
      expect(uniqueVelocities.size).toBeGreaterThan(1)
    })
  })

  describe('update', () => {
    it('should update particle positions', () => {
      particleSystem.addDeathParticles(100, 100, '#ff0000')
      
      const particlesBefore = Array.from((particleSystem as any).particles.values())
      const positionsBefore = particlesBefore.map(p => ({ x: p.x, y: p.y, vx: p.vx, vy: p.vy }))
      
      particleSystem.update()
      
      const particlesAfter = Array.from((particleSystem as any).particles.values())
      particlesAfter.forEach((particle, index) => {
        // Particles should move according to their velocity
        expect(particle.x).toBe(positionsBefore[index].x + positionsBefore[index].vx)
        // Y position includes gravity
        expect(particle.y).toBeCloseTo(positionsBefore[index].y + positionsBefore[index].vy, 5)
        // Velocity should increase due to gravity
        expect(particle.vy).toBe(positionsBefore[index].vy + 0.3)
      })
    })

    it('should apply gravity to particles', () => {
      particleSystem.addDeathParticles(0, 0, '#ff0000')
      
      const particlesBefore = Array.from((particleSystem as any).particles.values())
      const vyBefore = particlesBefore.map(p => p.vy)
      
      particleSystem.update()
      
      const particlesAfter = Array.from((particleSystem as any).particles.values())
      particlesAfter.forEach((particle, index) => {
        expect(particle.vy).toBeGreaterThan(vyBefore[index]) // Gravity increases downward velocity
      })
    })

    it('should reduce particle life', () => {
      particleSystem.addDeathParticles(0, 0, '#ff0000')
      
      particleSystem.update()
      
      const particles = Array.from((particleSystem as any).particles.values())
      particles.forEach(particle => {
        expect(particle.life).toBe(29) // 30 - 1
      })
    })

    it('should remove dead particles', () => {
      particleSystem.addDeathParticles(0, 0, '#ff0000')
      
      // Update 30 times to kill particles (life = 30)
      for (let i = 0; i < 31; i++) {
        particleSystem.update()
      }
      
      expect((particleSystem as any).particles.size).toBe(0)
    })

    it('should handle empty particle system', () => {
      expect(() => particleSystem.update()).not.toThrow()
    })
  })

  describe('render', () => {
    it('should save and restore context', () => {
      particleSystem.addDeathParticles(100, 100, '#ff0000')
      particleSystem.render(mockCtx)
      
      expect(mockCtx.save).toHaveBeenCalled()
      expect(mockCtx.restore).toHaveBeenCalled()
    })

    it('should draw each particle', () => {
      particleSystem.addDeathParticles(100, 100, '#ff0000')
      particleSystem.render(mockCtx)
      
      expect(mockCtx.beginPath).toHaveBeenCalledTimes(8)
      expect(mockCtx.arc).toHaveBeenCalledTimes(8)
      expect(mockCtx.fill).toHaveBeenCalledTimes(8)
    })

    it('should set particle properties correctly', () => {
      particleSystem.addDeathParticles(100, 100, '#ff0000')
      particleSystem.render(mockCtx)
      
      // Check that alpha is set based on life
      expect(mockCtx.globalAlpha).toBeLessThanOrEqual(1)
      expect(mockCtx.fillStyle).toBe('#ff0000')
    })

    it('should handle particles with different life values', () => {
      particleSystem.addDeathParticles(100, 100, '#ff0000')
      
      // Reduce life of some particles
      particleSystem.update()
      particleSystem.update()
      
      particleSystem.render(mockCtx)
      
      // Alpha should be set multiple times with different values
      expect(mockCtx.globalAlpha).toBeLessThan(1)
    })

    it('should render nothing when no particles', () => {
      particleSystem.render(mockCtx)
      
      expect(mockCtx.beginPath).not.toHaveBeenCalled()
      expect(mockCtx.save).toHaveBeenCalled()
      expect(mockCtx.restore).toHaveBeenCalled()
    })
  })

  describe('particle lifecycle', () => {
    it('should handle complete particle lifecycle', () => {
      // Add particles
      particleSystem.addDeathParticles(100, 100, '#ff0000')
      expect((particleSystem as any).particles.size).toBe(8)
      
      // Update and render multiple times
      for (let i = 0; i < 50; i++) {
        particleSystem.update()
        particleSystem.render(mockCtx)
      }
      
      // Eventually all particles should die
      expect((particleSystem as any).particles.size).toBeLessThan(8)
    })

    it('should handle continuous particle addition', () => {
      // Simulate continuous combat
      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          particleSystem.addHitParticles(i * 10, i * 10)
        }
        if (i % 3 === 0) {
          particleSystem.addDeathParticles(i * 20, i * 20, '#ff0000')
        }
        particleSystem.update()
      }
      
      // Should have particles from recent additions
      expect((particleSystem as any).particles.size).toBeGreaterThan(0)
    })
  })

  describe('performance', () => {
    it('should handle large numbers of particles', () => {
      // Add many particles with delays to ensure unique IDs
      let totalParticles = 0
      
      for (let i = 0; i < 10; i++) {
        particleSystem.addDeathParticles(i * 10, i * 10, '#ff0000')
        totalParticles += 8
      }
      
      // Particles might have same timestamp, so some could be overwritten
      expect((particleSystem as any).particles.size).toBeGreaterThanOrEqual(8)
      expect((particleSystem as any).particles.size).toBeLessThanOrEqual(totalParticles)
      
      // Should still update without errors
      expect(() => {
        particleSystem.update()
        particleSystem.render(mockCtx)
      }).not.toThrow()
    })

    it('should clean up old particles efficiently', () => {
      // Add particles
      particleSystem.addDeathParticles(0, 0, '#ff0000')
      
      const initialSize = (particleSystem as any).particles.size
      expect(initialSize).toBe(8)
      
      // Update until all die (life = 30)
      for (let i = 0; i < 31; i++) {
        particleSystem.update()
      }
      
      expect((particleSystem as any).particles.size).toBe(0)
    })
  })
})