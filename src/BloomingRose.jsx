import React, { useRef, useEffect, useState } from 'react'

// seeded PRNG
function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function drawRealisticRose(ctx, w, h, seed, palette, bloomProgress) {
  const rand = mulberry32(seed)
  ctx.clearRect(0, 0, w, h)

  const cx = w / 2
  const cy = h / 2

  // background in warm red tones
  const bg = ctx.createRadialGradient(cx, cy, w * 0.08, cx, cy, w * 0.9)
  bg.addColorStop(0, '#ffccaa')
  bg.addColorStop(0.35, '#8b121d')
  bg.addColorStop(0.75, '#30070d')
  bg.addColorStop(1, '#090307')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  const color1 = palette[0] || '#d7263d'
  const color2 = palette[1] || '#a11a2f'
  const darkRed = '#6e101f'

  const potHeight = h * 0.22
  const potWidth = w * 0.38
  const potX = cx - potWidth * 0.5
  const potY = h - potHeight - 12
  const potRimHeight = 10

  ctx.save()
  const potGrad = ctx.createLinearGradient(0, potY, 0, potY + potHeight)
  potGrad.addColorStop(0, '#a32a2a')
  potGrad.addColorStop(0.35, '#701a1b')
  potGrad.addColorStop(0.7, '#400a10')
  potGrad.addColorStop(1, '#1d0408')
  ctx.fillStyle = potGrad
  ctx.beginPath()
  ctx.moveTo(potX, potY)
  ctx.lineTo(potX + potWidth, potY)
  ctx.lineTo(potX + potWidth - 18, potY + potHeight)
  ctx.lineTo(potX + 18, potY + potHeight)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,215,215,0.25)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = '#7b171c'
  ctx.fillRect(potX + 8, potY + 2, potWidth - 16, 12)
  ctx.fillStyle = '#e5b8b8'
  ctx.fillRect(potX + 8, potY - 6, potWidth - 16, 8)
  ctx.restore()

  const stemStartY = potY + 8
  const stemTopY = cy - h * 0.20
  const stemProgress = Math.min(Math.max(bloomProgress / 0.4, 0), 1)
  const stemCurrentY = stemStartY - (stemStartY - stemTopY) * stemProgress
  const bloomPhase = Math.min(Math.max(bloomProgress / 0.45, 0), 1)

  const stemGrad = ctx.createLinearGradient(cx, stemStartY, cx, stemTopY)
  stemGrad.addColorStop(0, '#2f5e26')
  stemGrad.addColorStop(1, '#6fc176')

  ctx.save()
  ctx.lineWidth = 14
  ctx.strokeStyle = stemGrad
  ctx.beginPath()
  ctx.moveTo(cx, stemStartY)
  ctx.quadraticCurveTo(cx + 12, stemStartY - (stemStartY - stemCurrentY) * 0.5, cx, stemCurrentY)
  ctx.stroke()
  ctx.restore()

  const stemLeafColors = ['#5fa45f', '#245821']
  const stemHeight = stemStartY - stemCurrentY
  const leafOffsets = [0.18, 0.31, 0.44, 0.56, 0.68, 0.80]
  leafOffsets.forEach((t, index) => {
    const y = stemStartY - stemHeight * t
    const side = index % 2 === 0 ? -1 : 1
    ctx.save()
    ctx.translate(cx, y)
    ctx.rotate(side * 0.55)
    const leaf = new Path2D()
    leaf.moveTo(0, 0)
    leaf.bezierCurveTo(side * 18, -6, side * 36, -28, side * 32, -50)
    leaf.bezierCurveTo(side * 28, -58, side * 10, -30, 0, 0)
    leaf.closePath()
    const leafGrad = ctx.createLinearGradient(0, 0, side * 32, -50)
    leafGrad.addColorStop(0, stemLeafColors[0])
    leafGrad.addColorStop(1, stemLeafColors[1])
    ctx.fillStyle = leafGrad
    ctx.fill(leaf)
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'
    ctx.lineWidth = 1.2
    ctx.stroke(leaf)
    ctx.restore()
  })

  if (bloomProgress > 0) {
    const budRadius = 8 * Math.min(Math.max(bloomPhase, 0.4) * 1.2, 1)
    ctx.save()
    ctx.fillStyle = color2
    ctx.beginPath()
    ctx.arc(cx, stemCurrentY, budRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // sparkle atmosphere
  for (let i = 0; i < 18; i++) {
    const sx = rand() * w
    const sy = rand() * h * 0.7 + h * 0.05
    const radius = rand() * 3 + 1
    const alpha = rand() * 0.3 + 0.12
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
    ctx.beginPath()
    ctx.arc(sx, sy, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  // === KELOPAK MAWAR - SPIRAL LAYERS ===
  const baseRadius = h * 0.08 * Math.max(bloomPhase, 0.25)
  const maxRadius = h * 0.18 * Math.max(bloomPhase, 0.45)

  // Total petal layers (3-5 layers)
  const layerCount = Math.max(1, Math.floor(3 + bloomPhase * 3))
  
  for (let layer = layerCount - 1; layer >= 0; layer--) {
    const layerProgress = layer / Math.max(layerCount - 1, 1)
    const layerRadius = baseRadius + (maxRadius - baseRadius) * layerProgress
    
    // Petals per layer (more petals in outer layers)
    const petalsInLayer = Math.floor(5 + layer * 2)
    
    for (let i = 0; i < petalsInLayer; i++) {
      const baseAngle = (i / petalsInLayer) * Math.PI * 2 + (layer * 0.3)
      const angle = baseAngle
      
      // Petal position - offset outward
      const petalOffsetX = Math.cos(angle) * layerRadius * 0.7
      const petalOffsetY = Math.sin(angle) * layerRadius * 0.7

      ctx.save()
      ctx.translate(cx + petalOffsetX, stemCurrentY + petalOffsetY)
      ctx.rotate(angle)

      // Color gradient - darker for inner petals, brighter for outer
      const colorProgress = layer / Math.max(layerCount - 1, 1)
      const petalColor1 = colorProgress < 0.5 ? color2 : color1
      const petalColor2 = colorProgress < 0.5 ? darkRed : color2

      const grad = ctx.createLinearGradient(0, 0, layerRadius * 0.4, -layerRadius * 0.6)
      grad.addColorStop(0, 'rgba(255, 200, 220, ' + (0.7 + colorProgress * 0.3) + ')')
      grad.addColorStop(0.5, petalColor1)
      grad.addColorStop(1, petalColor2)

      ctx.fillStyle = grad
      ctx.globalAlpha = 0.85 - colorProgress * 0.15

      // Rose petal shape - curved and layered
      const petalWidth = layerRadius * (0.3 + colorProgress * 0.3)
      const petalHeight = layerRadius * (0.5 + colorProgress * 0.4)
      
      ctx.beginPath()
      ctx.moveTo(0, 0)
      
      // Petal curve - rounded and organic
      ctx.bezierCurveTo(
        petalWidth * 0.6, -petalHeight * 0.2,
        petalWidth * 0.7, -petalHeight * 0.7,
        petalWidth * 0.3, -petalHeight * 0.95
      )
      
      // Petal tip - rounded
      ctx.quadraticCurveTo(0, -petalHeight * 1.0, -petalWidth * 0.3, -petalHeight * 0.95)
      
      // Back side of petal
      ctx.bezierCurveTo(
        -petalWidth * 0.7, -petalHeight * 0.7,
        -petalWidth * 0.6, -petalHeight * 0.2,
        0, 0
      )
      
      ctx.closePath()
      ctx.fill()

      // Petal edge highlight
      if (layer > layerCount - 2) {
        ctx.globalAlpha = 0.25
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(petalWidth * 0.15, -petalHeight * 0.3)
        ctx.quadraticCurveTo(petalWidth * 0.25, -petalHeight * 0.65, petalWidth * 0.2, -petalHeight * 0.9)
        ctx.stroke()
      }

      // Petal edge shadow
      ctx.globalAlpha = 0.3
      ctx.strokeStyle = darkRed
      ctx.lineWidth = 0.8
      ctx.beginPath()
      ctx.moveTo(-petalWidth * 0.3, -petalHeight * 0.95)
      ctx.quadraticCurveTo(-petalWidth * 0.4, -petalHeight * 0.6, -petalWidth * 0.6, -petalHeight * 0.15)
      ctx.stroke()

      ctx.globalAlpha = 1
      ctx.restore()
    }
  }

  // === PUSAT MAWAR ===
  const centerSize = baseRadius * 0.8
  
  // Inner glow
  const centerGlowGrad = ctx.createRadialGradient(cx, stemCurrentY, 0, cx, stemCurrentY, centerSize * 1.8)
  centerGlowGrad.addColorStop(0, '#fff9fa')
  centerGlowGrad.addColorStop(0.5, '#ffd9e6')
  centerGlowGrad.addColorStop(1, 'rgba(255, 200, 220, 0.3)')
  ctx.beginPath()
  ctx.fillStyle = centerGlowGrad
  ctx.arc(cx, stemCurrentY, centerSize * 1.8, 0, Math.PI * 2)
  ctx.fill()

  // Center core - tight spiral
  const coreGrad = ctx.createRadialGradient(cx, stemCurrentY - centerSize * 0.3, 0.3, cx, stemCurrentY, centerSize * 1.2)
  coreGrad.addColorStop(0, '#fffbfd')
  coreGrad.addColorStop(0.3, '#ffc2d1')
  coreGrad.addColorStop(0.7, '#ff99b3')
  coreGrad.addColorStop(1, '#e8556a')
  ctx.beginPath()
  ctx.fillStyle = coreGrad
  ctx.arc(cx, stemCurrentY, centerSize * 1.2, 0, Math.PI * 2)
  ctx.fill()

  // Stamen details
  const stamenCount = 8
  for (let i = 0; i < stamenCount; i++) {
    const angle = (i / stamenCount) * Math.PI * 2
    const stamenDist = centerSize * 0.5
    const sx = cx + Math.cos(angle) * stamenDist
    const sy = stemCurrentY + Math.sin(angle) * stamenDist
    ctx.fillStyle = `rgba(100, 30, 60, ${0.35 + rand() * 0.25})`
    ctx.beginPath()
    ctx.arc(sx, sy, 1.2 + rand() * 0.8, 0, Math.PI * 2)
    ctx.fill()
  }
}

export default function BloomingRose({ seed = 1, palette = ['#ff4d6d', '#c11a36', '#7b001d'], size = 220, duration = 4.5 }) {
  const ref = useRef(null)
  const [bloomProgress, setBloomProgress] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)
      setBloomProgress(progress)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    animate()
  }, [duration])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function draw() {
      const dpr = window.devicePixelRatio || 1
      const w = size
      const h = size
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawRealisticRose(ctx, w, h, seed, palette, bloomProgress)
    }

    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [seed, palette, size, bloomProgress])

  return <canvas ref={ref} aria-hidden="true" />
}
