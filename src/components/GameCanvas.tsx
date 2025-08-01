import { forwardRef, useEffect, useRef, useImperativeHandle } from 'react'
import { LevelConfig, GameState, HexCoordinate } from '../types'
import { hexToPixel, pixelToHex, drawHex, isValidHex } from '../utils/hexGrid'
import { COLORS, ANT_STATS, TOWER_STATS } from '../core/constants'
import { ParticleSystem } from '../utils/particles'

interface GameCanvasProps {
  level: LevelConfig
  gameState: GameState
  onHexClick: (hex: HexCoordinate) => void
  onHexRightClick: (hex: HexCoordinate) => void
  selectedHex: HexCoordinate | null
}

const GameCanvas = forwardRef<HTMLCanvasElement, GameCanvasProps>(
  ({ level, gameState, onHexClick, onHexRightClick, selectedHex }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animationFrameRef = useRef<number>()
    const particleSystemRef = useRef(new ParticleSystem())
    const lastAntCountRef = useRef(gameState.ants.size)
    const zoomRef = useRef(1)
    const panRef = useRef({ x: 0, y: 0 })
    const lastTouchDistanceRef = useRef<number | null>(null)
    
    useImperativeHandle(ref, () => canvasRef.current!)
    
    // Handle canvas clicks and touch events
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      
      let longPressTimer: ReturnType<typeof setTimeout> | null = null
      let touchStartPos = { x: 0, y: 0 }
      
      const getCoordinates = (e: MouseEvent | Touch, rect: DOMRect) => {
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        }
      }
      
      const handleInteraction = (x: number, y: number, isRightClick: boolean = false): void => {
        const center = { x: canvas.width / 2, y: canvas.height / 2 }
        
        // Adjust coordinates for zoom and pan
        const adjustedX = (x - center.x - panRef.current.x) / zoomRef.current + center.x
        const adjustedY = (y - center.y - panRef.current.y) / zoomRef.current + center.y
        
        const hex = pixelToHex({ x: adjustedX, y: adjustedY }, center)
        
        if (isValidHex(hex, level.gridRadius)) {
          if (isRightClick) {
            onHexRightClick(hex)
          } else {
            onHexClick(hex)
          }
        }
      }
      
      const handleClick = (e: MouseEvent): void => {
        const rect = canvas.getBoundingClientRect()
        const coords = getCoordinates(e, rect)
        handleInteraction(coords.x, coords.y, e.button === 2)
      }
      
      const handleTouchStart = (e: TouchEvent): void => {
        if (e.touches.length === 1) {
          const touch = e.touches[0]
          const rect = canvas.getBoundingClientRect()
          const coords = getCoordinates(touch, rect)
          touchStartPos = coords
          
          // Start long press timer for right-click simulation
          longPressTimer = setTimeout(() => {
            // Vibrate if available
            if ('vibrate' in navigator) {
              navigator.vibrate(50)
            }
            handleInteraction(coords.x, coords.y, true)
            longPressTimer = null
          }, 500)
        } else if (e.touches.length === 2) {
          // Handle pinch-to-zoom
          const touch1 = e.touches[0]
          const touch2 = e.touches[1]
          const distance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
          )
          lastTouchDistanceRef.current = distance
        }
      }
      
      const handleTouchEnd = (e: TouchEvent): void => {
        if (longPressTimer) {
          clearTimeout(longPressTimer)
          longPressTimer = null
          
          // If it was a quick tap, treat as normal click
          if (e.changedTouches.length === 1) {
            const touch = e.changedTouches[0]
            const rect = canvas.getBoundingClientRect()
            const coords = getCoordinates(touch, rect)
            
            // Check if finger didn't move much (tap vs drag)
            const distance = Math.sqrt(
              Math.pow(coords.x - touchStartPos.x, 2) + 
              Math.pow(coords.y - touchStartPos.y, 2)
            )
            
            if (distance < 10) {
              handleInteraction(coords.x, coords.y, false)
            }
          }
        }
      }
      
      const handleTouchMove = (e: TouchEvent): void => {
        if (longPressTimer) {
          clearTimeout(longPressTimer)
          longPressTimer = null
        }
        
        // Handle pinch-to-zoom
        if (e.touches.length === 2 && lastTouchDistanceRef.current) {
          const touch1 = e.touches[0]
          const touch2 = e.touches[1]
          const distance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
          )
          
          const scaleDelta = distance / lastTouchDistanceRef.current
          zoomRef.current = Math.max(0.5, Math.min(2, zoomRef.current * scaleDelta))
          lastTouchDistanceRef.current = distance
          
          e.preventDefault()
        }
      }
      
      const handleContextMenu = (e: MouseEvent | TouchEvent): void => {
        e.preventDefault()
      }
      
      // Mouse events
      canvas.addEventListener('click', handleClick)
      canvas.addEventListener('contextmenu', handleContextMenu)
      canvas.addEventListener('mousedown', (e) => {
        if (e.button === 2) handleClick(e)
      })
      
      // Touch events
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
      canvas.addEventListener('touchend', handleTouchEnd, { passive: false })
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
      
      return () => {
        canvas.removeEventListener('click', handleClick)
        canvas.removeEventListener('contextmenu', handleContextMenu)
        canvas.removeEventListener('touchstart', handleTouchStart)
        canvas.removeEventListener('touchend', handleTouchEnd)
        canvas.removeEventListener('touchmove', handleTouchMove)
        
        if (longPressTimer) {
          clearTimeout(longPressTimer)
        }
      }
    }, [level, onHexClick, onHexRightClick])
    
    // Resize canvas
    useEffect(() => {
      const handleResize = (): void => {
        const canvas = canvasRef.current
        if (!canvas?.parentElement) return
        
        const parent = canvas.parentElement
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
      }
      
      handleResize()
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }, [])
    
    // Detect ant deaths for particle effects
    useEffect(() => {
      if (gameState.ants.size < lastAntCountRef.current) {
        // An ant died - we should add particles
        // Since we don't track which ant died, we'll handle this in the render loop
      }
      lastAntCountRef.current = gameState.ants.size
    }, [gameState.ants.size])
    
    // Main render loop
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      
      const render = (): void => {
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        
        // Clear canvas
        ctx.fillStyle = COLORS.BACKGROUND
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Apply zoom and pan transforms
        ctx.save()
        const center = { x: canvas.width / 2, y: canvas.height / 2 }
        ctx.translate(center.x + panRef.current.x, center.y + panRef.current.y)
        ctx.scale(zoomRef.current, zoomRef.current)
        ctx.translate(-center.x, -center.y)
        
        // Draw grid
        for (let q = -level.gridRadius; q <= level.gridRadius; q++) {
          for (let r = Math.max(-level.gridRadius, -q - level.gridRadius); 
               r <= Math.min(level.gridRadius, -q + level.gridRadius); r++) {
            const hex = { q, r }
            const pixel = hexToPixel(hex, center)
            
            // Determine hex color
            let fillColor = COLORS.GRID
            let strokeColor = COLORS.GRID_HOVER
            
            // Check if core
            if (hex.q === level.corePosition.q && hex.r === level.corePosition.r) {
              fillColor = COLORS.CORE
              strokeColor = COLORS.CORE
            }
            // Check if spawn gate
            else if (level.spawnGates.some(g => g.q === hex.q && g.r === hex.r)) {
              fillColor = COLORS.SPAWN_GATE
              strokeColor = COLORS.SPAWN_GATE
            }
            // Check if obstacle
            else if (level.obstacles.some(o => o.q === hex.q && o.r === hex.r)) {
              fillColor = COLORS.OBSTACLE
              strokeColor = COLORS.OBSTACLE
            }
            // Check if selected
            else if (selectedHex && selectedHex.q === hex.q && selectedHex.r === hex.r) {
              fillColor = COLORS.GRID_HOVER
            }
            
            // Draw hex
            ctx.fillStyle = fillColor
            ctx.strokeStyle = strokeColor
            ctx.lineWidth = 2
            drawHex(ctx, pixel)
            ctx.fill()
            ctx.stroke()
            
            // Draw special markers
            if (hex.q === level.corePosition.q && hex.r === level.corePosition.r) {
              ctx.fillStyle = COLORS.UI.TEXT
              ctx.font = 'bold 24px Arial'
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              ctx.fillText('🏠', pixel.x, pixel.y)
            } else if (level.spawnGates.some(g => g.q === hex.q && g.r === hex.r)) {
              ctx.fillStyle = COLORS.UI.TEXT
              ctx.font = '20px Arial'
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              ctx.fillText('🚪', pixel.x, pixel.y)
            }
          }
        }
        
        // Draw pheromones
        gameState.pheromones.forEach(pheromone => {
          const pixel = hexToPixel(pheromone.position, center)
          const alpha = Math.min(pheromone.strength / 100, 0.5)
          
          ctx.beginPath()
          ctx.arc(pixel.x, pixel.y, 10, 0, Math.PI * 2)
          ctx.fillStyle = `${COLORS.PHEROMONE[pheromone.type]}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`
          ctx.fill()
        })
        
        // Draw towers
        gameState.towers.forEach(tower => {
          const pixel = hexToPixel(tower.position, center)
          const stats = TOWER_STATS[tower.type]
          
          // Tower base
          ctx.beginPath()
          ctx.arc(pixel.x, pixel.y, 20, 0, Math.PI * 2)
          ctx.fillStyle = stats.color
          ctx.fill()
          ctx.strokeStyle = COLORS.UI.TEXT
          ctx.lineWidth = 2
          ctx.stroke()
          
          // Tower icon
          ctx.fillStyle = COLORS.UI.TEXT
          ctx.font = '20px Arial'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(stats.icon, pixel.x, pixel.y)
          
          // Range indicator (when selected)
          if (selectedHex && 
              selectedHex.q === tower.position.q && 
              selectedHex.r === tower.position.r) {
            ctx.beginPath()
            ctx.arc(pixel.x, pixel.y, stats.range * 30, 0, Math.PI * 2)
            ctx.strokeStyle = `${stats.color}40`
            ctx.lineWidth = 3
            ctx.stroke()
          }
        })
        
        // Draw ants
        gameState.ants.forEach(ant => {
          const pixel = hexToPixel(ant.position, center)
          const stats = ANT_STATS[ant.type]
          
          // Add hit particles when ant is damaged
          if (ant.hp < ant.maxHp * 0.3) {
            // Ant is badly damaged - add occasional particles
            if (Math.random() < 0.1) {
              particleSystemRef.current.addHitParticles(pixel.x, pixel.y)
            }
          }
          
          // Ant body with damage effect
          const healthPercent = ant.hp / ant.maxHp
          ctx.save()
          
          // Flash red when hit
          if (healthPercent < 0.5) {
            ctx.globalAlpha = 0.8 + Math.sin(Date.now() * 0.01) * 0.2
          }
          
          ctx.beginPath()
          ctx.arc(pixel.x, pixel.y, stats.size, 0, Math.PI * 2)
          ctx.fillStyle = healthPercent < 0.3 ? COLORS.UI.ERROR : stats.color
          ctx.fill()
          ctx.strokeStyle = COLORS.UI.TEXT_DARK
          ctx.lineWidth = 1
          ctx.stroke()
          
          ctx.restore()
          
          // Health bar
          if (ant.hp < ant.maxHp) {
            const barWidth = stats.size * 2
            const barHeight = 4
            
            ctx.fillStyle = COLORS.UI.ERROR
            ctx.fillRect(pixel.x - barWidth / 2, pixel.y - stats.size - 8, barWidth, barHeight)
            
            ctx.fillStyle = COLORS.UI.SUCCESS
            ctx.fillRect(pixel.x - barWidth / 2, pixel.y - stats.size - 8, barWidth * healthPercent, barHeight)
          }
          
          // Draw ant emoji - change based on health
          ctx.font = `${stats.size}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          
          // Different emoji based on health
          let emoji = '🐜'
          if (healthPercent < 0.3) {
            emoji = '😵'
          } else if (healthPercent < 0.6) {
            emoji = '😰'
          }
          
          ctx.fillText(emoji, pixel.x, pixel.y)
        })
        
        // Restore context before particles (they should render in screen space)
        ctx.restore()
        
        // Update and render particles
        particleSystemRef.current.update()
        particleSystemRef.current.render(ctx)
        
        // Request next frame
        animationFrameRef.current = requestAnimationFrame(render)
      }
      
      render()
      
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    }, [level, gameState, selectedHex])
    
    return (
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          cursor: gameState.selectedTowerType ? 'crosshair' : 'pointer'
        }}
      />
    )
  }
)

GameCanvas.displayName = 'GameCanvas'

export default GameCanvas