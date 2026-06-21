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

function drawBloomingFlower(ctx, w, h, seed, palette, bloomProgress) {
  const rand = mulberry32(seed)
  ctx.clearRect(0, 0, w, h)

  const cx = w / 2
  const cy = h / 2

  // background
  const bg = ctx.createRadialGradient(cx, cy, w * 0.1, cx, cy, w * 0.9)
  bg.addColorStop(0, palette[2] || '#fff4fb')
  bg.addColorStop(1, '#fff')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  // stem (tangkai)
  const stemStartY = cy + h * 0.35
  const stemEndY = cy - h * 0.15
  const stemWidth = 3
  ctx.strokeStyle = '#2d5016'
  ctx.lineWidth = stemWidth
  ctx.beginPath()
  ctx.moveTo(cx, stemStartY)
  ctx.quadraticCurveTo(cx + 8, stemEndY + 20, cx, stemEndY)
  ctx.stroke()

  // === DAUN YANG LEBIH TAJAM DAN REALISTIS ===
  // Left leaf (daun kiri)
  ctx.save()
  const leftLeafPath = new Path2D()
  leftLeafPath.moveTo(cx, stemStartY - 20)
  leftLeafPath.bezierCurveTo(cx - 45, stemStartY - 60, cx - 55, stemStartY - 120, cx - 48, stemStartY - 140)
  leftLeafPath.bezierCurveTo(cx - 30, stemStartY - 145, cx - 10, stemStartY - 95, cx, stemStartY - 20)
  leftLeafPath.closePath()
  
  const leftLeafGrad = ctx.createLinearGradient(cx, stemStartY - 20, cx - 55, stemStartY - 120)
  leftLeafGrad.addColorStop(0, '#5a9847')
  leftLeafGrad.addColorStop(0.5, '#4a8836')
  leftLeafGrad.addColorStop(1, '#3d6e2b')
  ctx.fillStyle = leftLeafGrad
  ctx.fill(leftLeafPath)
  
  // Vein detail pada daun kiri
  ctx.strokeStyle = '#2d5016'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx, stemStartY - 20)
  ctx.quadraticCurveTo(cx - 35, stemStartY - 90, cx - 48, stemStartY - 140)
  ctx.stroke()
  ctx.restore()

  // Right leaf (daun kanan)
  ctx.save()
  const rightLeafPath = new Path2D()
  rightLeafPath.moveTo(cx, stemStartY - 10)
  rightLeafPath.bezierCurveTo(cx + 42, stemStartY - 50, cx + 52, stemStartY - 110, cx + 46, stemStartY - 135)
  rightLeafPath.bezierCurveTo(cx + 28, stemStartY - 140, cx + 8, stemStartY - 85, cx, stemStartY - 10)
  rightLeafPath.closePath()
  
  const rightLeafGrad = ctx.createLinearGradient(cx, stemStartY - 10, cx + 52, stemStartY - 110)
  rightLeafGrad.addColorStop(0, '#5a9847')
  rightLeafGrad.addColorStop(0.5, '#4a8836')
  rightLeafGrad.addColorStop(1, '#3d6e2b')
  ctx.fillStyle = rightLeafGrad
  ctx.fill(rightLeafPath)
  
  // Vein detail pada daun kanan
  ctx.strokeStyle = '#2d5016'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx, stemStartY - 10)
  ctx.quadraticCurveTo(cx + 35, stemStartY - 80, cx + 46, stemStartY - 135)
  ctx.stroke()
  ctx.restore()

  // === KELOPAK BUNGA YANG LEBIH TAJAM DAN REALISTIS ===
  const petalHeight = h * 0.26 * bloomProgress
  const petalWidth = h * 0.12 * bloomProgress
  const petalCount = 6 + Math.floor(rand() * 2)
  const angleStep = (Math.PI * 2) / petalCount

  const color1 = palette[0] || '#ffb3d9'
  const color2 = palette[1] || '#ff6f9b'
  const edgeColor = '#c41e54'
  const darkColor = '#a01542'

  // Outer petals (kelopak luar) - lebih tajam
  for (let i = 0; i < petalCount; i++) {
    const angle = angleStep * i
    const offsetX = Math.cos(angle) * petalWidth * 0.2
    const offsetY = Math.sin(angle) * petalWidth * 0.2

    ctx.save()
    ctx.translate(cx + offsetX, stemEndY + offsetY)
    ctx.rotate(angle)

    const grad = ctx.createLinearGradient(0, 0, 0, -petalHeight)
    grad.addColorStop(0, color1)
    grad.addColorStop(0.35, color2)
    grad.addColorStop(0.8, edgeColor)
    grad.addColorStop(1, darkColor)

    ctx.fillStyle = grad
    ctx.beginPath()
    // Petals with sharper point at tip
    ctx.moveTo(0, 0)
    ctx.bezierCurveTo(petalWidth * 0.35, -petalHeight * 0.15, petalWidth * 0.42, -petalHeight * 0.6, petalWidth * 0.15, -petalHeight * 0.95)
    ctx.lineTo(0, -petalHeight) // Sharp tip
    ctx.lineTo(-petalWidth * 0.15, -petalHeight * 0.95)
    ctx.bezierCurveTo(-petalWidth * 0.42, -petalHeight * 0.6, -petalWidth * 0.35, -petalHeight * 0.15, 0, 0)
    ctx.closePath()
    ctx.fill()

    // Highlight pada kelopak
    ctx.globalAlpha = 0.25
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = Math.max(1, petalWidth * 0.08)
    ctx.beginPath()
    ctx.moveTo(petalWidth * 0.15, -petalHeight * 0.3)
    ctx.quadraticCurveTo(petalWidth * 0.2, -petalHeight * 0.65, petalWidth * 0.1, -petalHeight * 0.92)
    ctx.stroke()
    ctx.globalAlpha = 1

    // Dark edge pada kelopak
    ctx.globalAlpha = 0.3
    ctx.strokeStyle = darkColor
    ctx.lineWidth = Math.max(0.5, petalWidth * 0.06)
    ctx.beginPath()
    ctx.moveTo(-petalWidth * 0.15, -petalHeight * 0.95)
    ctx.quadraticCurveTo(-petalWidth * 0.2, -petalHeight * 0.6, -petalWidth * 0.35, -petalHeight * 0.25)
    ctx.stroke()
    ctx.globalAlpha = 1

    ctx.restore()
  }

  // Middle petals (kelopak tengah) - slightly smaller
  const middlePetalHeight = petalHeight * 0.8
  const middlePetalWidth = petalWidth * 0.8
  for (let i = 0; i < petalCount; i++) {
    const angle = angleStep * (i + 0.5)
    const offsetX = Math.cos(angle) * petalWidth * 0.1
    const offsetY = Math.sin(angle) * petalWidth * 0.1

    ctx.save()
    ctx.translate(cx + offsetX, stemEndY + offsetY)
    ctx.rotate(angle)

    const grad = ctx.createLinearGradient(0, 0, 0, -middlePetalHeight)
    grad.addColorStop(0, '#ffccdd')
    grad.addColorStop(0.4, color2)
    grad.addColorStop(0.85, edgeColor)
    grad.addColorStop(1, '#b8134f')

    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.bezierCurveTo(middlePetalWidth * 0.3, -middlePetalHeight * 0.18, middlePetalWidth * 0.35, -middlePetalHeight * 0.65, middlePetalWidth * 0.12, -middlePetalHeight * 0.93)
    ctx.lineTo(0, -middlePetalHeight)
    ctx.lineTo(-middlePetalWidth * 0.12, -middlePetalHeight * 0.93)
    ctx.bezierCurveTo(-middlePetalWidth * 0.35, -middlePetalHeight * 0.65, -middlePetalWidth * 0.3, -middlePetalHeight * 0.18, 0, 0)
    ctx.closePath()
    ctx.fill()

    ctx.globalAlpha = 0.2
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = Math.max(0.5, petalWidth * 0.05)
    ctx.beginPath()
    ctx.moveTo(middlePetalWidth * 0.12, -middlePetalHeight * 0.35)
    ctx.quadraticCurveTo(middlePetalWidth * 0.15, -middlePetalHeight * 0.68, middlePetalWidth * 0.08, -middlePetalHeight * 0.9)
    ctx.stroke()
    ctx.globalAlpha = 1

    ctx.restore()
  }

  // Inner petals (kelopak dalam) - smallest layer
  const innerPetalHeight = petalHeight * 0.6
  const innerPetalWidth = petalWidth * 0.65
  for (let i = 0; i < Math.floor(petalCount * 0.7); i++) {
    const angle = angleStep * (i + 0.25)
    const offsetX = Math.cos(angle) * petalWidth * 0.05
    const offsetY = Math.sin(angle) * petalWidth * 0.05

    ctx.save()
    ctx.translate(cx + offsetX, stemEndY + offsetY)
    ctx.rotate(angle)

    const grad = ctx.createLinearGradient(0, 0, 0, -innerPetalHeight)
    grad.addColorStop(0, '#fff0f5')
    grad.addColorStop(0.5, '#ffc2d1')
    grad.addColorStop(1, '#ff7f95')

    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.bezierCurveTo(innerPetalWidth * 0.25, -innerPetalHeight * 0.2, innerPetalWidth * 0.3, -innerPetalHeight * 0.68, innerPetalWidth * 0.1, -innerPetalHeight * 0.92)
    ctx.lineTo(0, -innerPetalHeight)
    ctx.lineTo(-innerPetalWidth * 0.1, -innerPetalHeight * 0.92)
    ctx.bezierCurveTo(-innerPetalWidth * 0.3, -innerPetalHeight * 0.68, -innerPetalWidth * 0.25, -innerPetalHeight * 0.2, 0, 0)
    ctx.closePath()
    ctx.fill()

    ctx.restore()
  }

  // === PUSAT BUNGA YANG DETAIL ===
  const centerSize = petalWidth * 0.5 * bloomProgress
  
  // Inner center glow
  const centerGrad = ctx.createRadialGradient(cx, stemEndY, 1, cx, stemEndY, centerSize * 1.5)
  centerGrad.addColorStop(0, '#fff9fa')
  centerGrad.addColorStop(0.3, '#ffd9e6')
  centerGrad.addColorStop(0.7, '#ffc2d1')
  centerGrad.addColorStop(1, 'rgba(255, 200, 220, 0.5)')
  ctx.beginPath()
  ctx.fillStyle = centerGrad
  ctx.arc(cx, stemEndY, centerSize * 1.5, 0, Math.PI * 2)
  ctx.fill()

  // Center core yang lebih solid
  const corePath = new Path2D()
  corePath.arc(cx, stemEndY, centerSize * 0.75, 0, Math.PI * 2)
  
  const coreGrad = ctx.createRadialGradient(cx, stemEndY - centerSize * 0.3, 0.5, cx, stemEndY, centerSize * 0.75)
  coreGrad.addColorStop(0, '#fff5f8')
  coreGrad.addColorStop(0.4, '#ffc2d1')
  coreGrad.addColorStop(1, '#ff8fa3')
  ctx.fillStyle = coreGrad
  ctx.fill(corePath)

  // Stamens untuk detail lebih detail
  const stamenCount = 8 + Math.floor(rand() * 6)
  for (let i = 0; i < stamenCount; i++) {
    const angle = (i / stamenCount) * Math.PI * 2
    const stamenDist = centerSize * 0.4
    const sx = cx + Math.cos(angle) * stamenDist
    const sy = stemEndY + Math.sin(angle) * stamenDist
    
    ctx.fillStyle = `rgba(100, 30, 60, ${0.25 + rand() * 0.3})`
    ctx.beginPath()
    ctx.arc(sx, sy, 1.2 + rand() * 1.2, 0, Math.PI * 2)
    ctx.fill()
  }

  // Center outline
  ctx.strokeStyle = 'rgba(255, 180, 200, 0.4)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(cx, stemEndY, centerSize * 0.75, 0, Math.PI * 2)
  ctx.stroke()
}

export default function BloomingFlower({ seed = 1, palette = ['#ffb3d9', '#ff6f9b', '#fff4fb'], size = 220, duration = 2 }) {
  const ref = useRef(null)
  const [bloomProgress, setBloomProgress] = useState(0)

  useEffect(() => {
    // Animate bloom progress from 0 to 1
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
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawBloomingFlower(ctx, w, h, seed, palette, bloomProgress)
    }

    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [seed, palette, size, bloomProgress])

  return <canvas ref={ref} aria-hidden="true" />
}
