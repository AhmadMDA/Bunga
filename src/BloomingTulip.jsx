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

function drawRealisticTulip(ctx, w, h, seed, palette, bloomProgress) {
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

  // stem (tangkai) - tersembunyi di belakang bunga
  const stemStartY = cy + h * 0.35
  const stemEndY = cy - h * 0.08

  // === KELOPAK TULIP - CUP SHAPED ===
  const petalHeight = h * 0.28 * bloomProgress
  const petalWidth = h * 0.11 * bloomProgress
  
  const color1 = palette[0] || '#ff8c3a'
  const color2 = palette[1] || '#ff5c2b'
  const edgeColor = '#e84c1a'

  // Back petals (3) - lebih transparan
  for (let i = 0; i < 3; i++) {
    const angle = (i - 1) * (Math.PI / 6)
    const offsetX = Math.sin(angle) * petalWidth * 0.15
    const offsetY = Math.cos(angle) * petalHeight * 0.05

    ctx.save()
    ctx.translate(cx + offsetX, stemEndY + offsetY)
    ctx.rotate(angle)

    const grad = ctx.createLinearGradient(0, 0, 0, -petalHeight)
    grad.addColorStop(0, color1)
    grad.addColorStop(0.5, color2)
    grad.addColorStop(1, edgeColor)

    ctx.fillStyle = grad
    ctx.globalAlpha = 0.55
    ctx.beginPath()
    // Tulip petal shape - rounded at tip
    ctx.moveTo(0, 0)
    ctx.bezierCurveTo(petalWidth * 0.4, -petalHeight * 0.1, petalWidth * 0.45, -petalHeight * 0.7, petalWidth * 0.2, -petalHeight * 0.95)
    ctx.quadraticCurveTo(0, -petalHeight * 1.0, -petalWidth * 0.2, -petalHeight * 0.95)
    ctx.bezierCurveTo(-petalWidth * 0.45, -petalHeight * 0.7, -petalWidth * 0.4, -petalHeight * 0.1, 0, 0)
    ctx.closePath()
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.restore()
  }

  // Front petals (3) - lebih opak
  for (let i = 0; i < 3; i++) {
    const angle = (i) * (Math.PI / 3)
    const offsetX = Math.sin(angle) * petalWidth * 0.2
    const offsetY = Math.cos(angle) * petalHeight * 0.08

    ctx.save()
    ctx.translate(cx + offsetX, stemEndY + offsetY)
    ctx.rotate(angle)

    const grad = ctx.createLinearGradient(0, 0, 0, -petalHeight)
    grad.addColorStop(0, '#ffb3d9')
    grad.addColorStop(0.4, color2)
    grad.addColorStop(0.8, edgeColor)
    grad.addColorStop(1, '#a8102f')

    ctx.fillStyle = grad
    ctx.globalAlpha = 0.9
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.bezierCurveTo(petalWidth * 0.42, -petalHeight * 0.12, petalWidth * 0.48, -petalHeight * 0.72, petalWidth * 0.22, -petalHeight * 0.97)
    ctx.quadraticCurveTo(0, -petalHeight * 1.02, -petalWidth * 0.22, -petalHeight * 0.97)
    ctx.bezierCurveTo(-petalWidth * 0.48, -petalHeight * 0.72, -petalWidth * 0.42, -petalHeight * 0.12, 0, 0)
    ctx.closePath()
    ctx.fill()

    // Highlight
    ctx.globalAlpha = 0.3
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(petalWidth * 0.12, -petalHeight * 0.25)
    ctx.quadraticCurveTo(petalWidth * 0.18, -petalHeight * 0.65, petalWidth * 0.15, -petalHeight * 0.92)
    ctx.stroke()

    // Dark edge
    ctx.globalAlpha = 0.4
    ctx.strokeStyle = '#6f0621'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(-petalWidth * 0.22, -petalHeight * 0.97)
    ctx.quadraticCurveTo(-petalWidth * 0.35, -petalHeight * 0.65, -petalWidth * 0.42, -petalHeight * 0.2)
    ctx.stroke()

    ctx.globalAlpha = 1
    ctx.restore()
  }

  // === PUSAT TULIP ===
  const centerSize = petalWidth * 0.4 * bloomProgress
  const innerGrad = ctx.createRadialGradient(cx, stemEndY, 1, cx, stemEndY, centerSize * 2)
  innerGrad.addColorStop(0, '#fff9fb')
  innerGrad.addColorStop(0.4, '#ffd9e6')
  innerGrad.addColorStop(0.9, '#ffb3cc')
  innerGrad.addColorStop(1, 'rgba(255, 200, 220, 0.3)')
  ctx.beginPath()
  ctx.fillStyle = innerGrad
  ctx.arc(cx, stemEndY, centerSize * 2, 0, Math.PI * 2)
  ctx.fill()

  // Center core
  const coreGrad = ctx.createRadialGradient(cx, stemEndY - centerSize * 0.4, 0.5, cx, stemEndY, centerSize)
  coreGrad.addColorStop(0, '#fffbfd')
  coreGrad.addColorStop(0.5, '#ffc2d1')
  coreGrad.addColorStop(1, '#ff99b3')
  ctx.beginPath()
  ctx.fillStyle = coreGrad
  ctx.arc(cx, stemEndY, centerSize, 0, Math.PI * 2)
  ctx.fill()

  // Stamens
  const stamenCount = 6
  for (let i = 0; i < stamenCount; i++) {
    const angle = (i / stamenCount) * Math.PI * 2
    const stamenDist = centerSize * 0.6
    const sx = cx + Math.cos(angle) * stamenDist
    const sy = stemEndY + Math.sin(angle) * stamenDist
    ctx.fillStyle = `rgba(120, 30, 60, ${0.3 + rand() * 0.2})`
    ctx.beginPath()
    ctx.arc(sx, sy, 1.3 + rand() * 1.0, 0, Math.PI * 2)
    ctx.fill()
  }
}

export default function BloomingTulip({ seed = 1, palette = ['#ff8c3a', '#ff5c2b', '#fff4fb'], size = 220, duration = 2 }) {
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
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawRealisticTulip(ctx, w, h, seed, palette, bloomProgress)
    }

    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [seed, palette, size, bloomProgress])

  return <canvas ref={ref} aria-hidden="true" />
}
