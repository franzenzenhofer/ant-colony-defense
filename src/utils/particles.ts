export interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
  type: 'death' | 'hit' | 'explosion'
}

export class ParticleSystem {
  private particles: Map<string, Particle> = new Map()
  
  public addDeathParticles(x: number, y: number, color: string): void {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8
      const speed = 2 + Math.random() * 2
      
      const particle: Particle = {
        id: `particle-${Date.now()}-${i}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30,
        maxLife: 30,
        color,
        size: 3 + Math.random() * 3,
        type: 'death'
      }
      
      this.particles.set(particle.id, particle)
    }
  }
  
  public addHitParticles(x: number, y: number): void {
    for (let i = 0; i < 4; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 1 + Math.random() * 2
      
      const particle: Particle = {
        id: `particle-${Date.now()}-${i}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 20,
        maxLife: 20,
        color: '#FFD700',
        size: 2 + Math.random() * 2,
        type: 'hit'
      }
      
      this.particles.set(particle.id, particle)
    }
  }
  
  public update(): void {
    this.particles.forEach((particle, id) => {
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy += 0.3 // Gravity
      particle.life--
      
      if (particle.life <= 0) {
        this.particles.delete(id)
      }
    })
  }
  
  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    
    this.particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife
      ctx.globalAlpha = alpha
      
      if (particle.type === 'death') {
        // Death particles - small circles
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()
      } else if (particle.type === 'hit') {
        // Hit particles - sparks
        ctx.beginPath()
        ctx.moveTo(particle.x, particle.y)
        ctx.lineTo(particle.x - particle.vx * 2, particle.y - particle.vy * 2)
        ctx.strokeStyle = particle.color
        ctx.lineWidth = particle.size
        ctx.stroke()
      }
    })
    
    ctx.restore()
  }
  
  public clear(): void {
    this.particles.clear()
  }
}