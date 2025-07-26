import { forwardRef, useEffect, useRef, useImperativeHandle } from 'react'
import { LevelConfig, GameState, HexCoordinate } from '../types'
import { hexToPixel, pixelToHex, drawHex, isValidHex } from '../utils/hexGrid'
import { COLORS, ANT_STATS, TOWER_STATS } from '../core/constants'

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
    
    useImperativeHandle(ref, () => canvasRef.current!)
    
    // Handle canvas clicks
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      
      const handleClick = (e: MouseEvent): void => {
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const center = { x: canvas.width / 2, y: canvas.height / 2 }
        const hex = pixelToHex({ x, y }, center)
        
        if (isValidHex(hex, level.gridRadius)) {
          if (e.button === 2) {
            onHexRightClick(hex)
          } else {
            onHexClick(hex)
          }
        }
      }
      
      const handleContextMenu = (e: MouseEvent): void => {
        e.preventDefault()
      }
      
      canvas.addEventListener('click', handleClick)
      canvas.addEventListener('contextmenu', handleContextMenu)
      canvas.addEventListener('mousedown', (e) => {
        if (e.button === 2) handleClick(e)
      })
      
      return () => {
        canvas.removeEventListener('click', handleClick)
        canvas.removeEventListener('contextmenu', handleContextMenu)
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
        
        const center = { x: canvas.width / 2, y: canvas.height / 2 }
        
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
          
          // Ant body
          ctx.beginPath()
          ctx.arc(pixel.x, pixel.y, stats.size, 0, Math.PI * 2)
          ctx.fillStyle = stats.color
          ctx.fill()
          ctx.strokeStyle = COLORS.UI.TEXT_DARK
          ctx.lineWidth = 1
          ctx.stroke()
          
          // Health bar
          if (ant.hp < ant.maxHp) {
            const barWidth = stats.size * 2
            const barHeight = 4
            const healthPercent = ant.hp / ant.maxHp
            
            ctx.fillStyle = COLORS.UI.ERROR
            ctx.fillRect(pixel.x - barWidth / 2, pixel.y - stats.size - 8, barWidth, barHeight)
            
            ctx.fillStyle = COLORS.UI.SUCCESS
            ctx.fillRect(pixel.x - barWidth / 2, pixel.y - stats.size - 8, barWidth * healthPercent, barHeight)
          }
          
          // Draw ant emoji
          ctx.font = `${stats.size}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('🐜', pixel.x, pixel.y)
        })
        
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