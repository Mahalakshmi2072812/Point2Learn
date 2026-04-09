import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  const ref = useRef(null)

  useEffect(() => {
    const c = ref.current
    const ctx = c.getContext('2d')
    let raf, W, H, t = 0

    const resize = () => {
      W = c.width  = window.innerWidth
      H = c.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Aurora wave bands — flowing silk ribbons like northern lights
    const bands = [
      { color: [30, 120, 255],   speed: 0.0008, amp: 0.12, freq: 1.8, phase: 0.0,  thick: 0.22, yBase: 0.25, alpha: 0.18 },
      { color: [80, 40,  230],   speed: 0.0006, amp: 0.10, freq: 2.2, phase: 1.2,  thick: 0.18, yBase: 0.38, alpha: 0.15 },
      { color: [0,  200, 210],   speed: 0.0007, amp: 0.14, freq: 1.5, phase: 2.5,  thick: 0.20, yBase: 0.55, alpha: 0.14 },
      { color: [120, 60, 255],   speed: 0.0009, amp: 0.09, freq: 2.6, phase: 0.7,  thick: 0.16, yBase: 0.68, alpha: 0.13 },
      { color: [0,  160, 255],   speed: 0.0005, amp: 0.13, freq: 1.3, phase: 3.8,  thick: 0.24, yBase: 0.80, alpha: 0.12 },
      { color: [60, 220, 180],   speed: 0.0007, amp: 0.11, freq: 2.0, phase: 1.9,  thick: 0.17, yBase: 0.15, alpha: 0.11 },
    ]

    // Draw a single aurora wave band
    const drawBand = (band) => {
      const [r, g, b] = band.color
      const yCenter = band.yBase * H + Math.sin(t * band.speed * 0.4) * H * 0.05
      const thickness = band.thick * H

      ctx.beginPath()

      // Top edge of band (sine wave)
      for (let x = 0; x <= W; x += 4) {
        const y = yCenter - thickness / 2
          + Math.sin(x / W * Math.PI * band.freq + t * band.speed + band.phase) * band.amp * H
          + Math.sin(x / W * Math.PI * band.freq * 1.7 + t * band.speed * 1.3) * band.amp * H * 0.4
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }

      // Bottom edge (reverse, slightly different wave)
      for (let x = W; x >= 0; x -= 4) {
        const y = yCenter + thickness / 2
          + Math.sin(x / W * Math.PI * band.freq + t * band.speed + band.phase + 0.8) * band.amp * H
          + Math.sin(x / W * Math.PI * band.freq * 1.4 + t * band.speed * 0.9) * band.amp * H * 0.3
        ctx.lineTo(x, y)
      }

      ctx.closePath()

      // Gradient fill — bright center, fade to edges
      const grad = ctx.createLinearGradient(0, yCenter - thickness, 0, yCenter + thickness)
      grad.addColorStop(0,   `rgba(${r},${g},${b},0)`)
      grad.addColorStop(0.3, `rgba(${r},${g},${b},${band.alpha * 0.5})`)
      grad.addColorStop(0.5, `rgba(${r},${g},${b},${band.alpha})`)
      grad.addColorStop(0.7, `rgba(${r},${g},${b},${band.alpha * 0.5})`)
      grad.addColorStop(1,   `rgba(${r},${g},${b},0)`)

      ctx.fillStyle = grad
      ctx.fill()
    }

    // Subtle vignette — keep edges darker
    const drawVignette = () => {
      const g1 = ctx.createRadialGradient(W/2, H/2, H * 0.1, W/2, H/2, H * 0.9)
      g1.addColorStop(0, 'rgba(4,8,26,0)')
      g1.addColorStop(1, 'rgba(4,8,26,0.55)')
      ctx.fillStyle = g1
      ctx.fillRect(0, 0, W, H)
    }

    // Moving glow spotlight that drifts slowly
    const drawSpotlight = () => {
      const sx = W * 0.5 + Math.sin(t * 0.00035) * W * 0.3
      const sy = H * 0.4 + Math.cos(t * 0.00028) * H * 0.25
      const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, W * 0.55)
      sg.addColorStop(0,   'rgba(30,80,255,0.06)')
      sg.addColorStop(0.5, 'rgba(60,40,200,0.03)')
      sg.addColorStop(1,   'rgba(0,0,0,0)')
      ctx.fillStyle = sg
      ctx.fillRect(0, 0, W, H)
    }

    const loop = () => {
      t++
      ctx.clearRect(0, 0, W, H)

      // Base deep navy fill
      ctx.fillStyle = '#04081a'
      ctx.fillRect(0, 0, W, H)

      drawSpotlight()

      // Draw all aurora bands
      bands.forEach(band => drawBand(band))

      drawVignette()

      raf = requestAnimationFrame(loop)
    }

    loop()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  )
}
