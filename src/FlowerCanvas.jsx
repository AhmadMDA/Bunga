import React, { useRef, useEffect } from 'react'

// simple seeded PRNG
function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function drawFlower(ctx, w, h, seed, palette) {
  const rand = mulberry32(seed)
  ctx.clearRect(0, 0, w, h)
  const cx = w / 2
  const cy = h / 2

  // background subtle radial
  const bg = ctx.createRadialGradient(cx, cy, w * 0.1, cx, cy, w * 0.9)
  bg.addColorStop(0, palette[2] || '#fff4fb')
  bg.addColorStop(1, '#fff')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  const petals = Math.floor(8 + rand() * 12) // 8-20 petals
  const petalLength = Math.min(w, h) * (0.22 + rand() * 0.18)
  const petalWidth = petalLength * (0.6 + rand() * 0.6)
  const innerRadius = Math.min(w, h) * (0.08 + rand() * 0.06)

  // petal color gradient
  const color1 = palette[0] || '#ffb3d9'
  const color2 = palette[1] || '#ff6f9b'

  for (let i = 0; i < petals; i++) {
    const angle = (i / petals) * Math.PI * 2
    const px = cx + Math.cos(angle) * innerRadius
    const py = cy + Math.sin(angle) * innerRadius

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle)

    const grad = ctx.createLinearGradient(0, -innerRadius, 0, -petalLength)
    grad.addColorStop(0, color1)
    grad.addColorStop(1, color2)

    ctx.fillStyle = grad
    ctx.beginPath()
    // smooth petal using bezier curves
    ctx.moveTo(0, -innerRadius)
    ctx.bezierCurveTo(petalWidth * 0.2, -innerRadius - petalLength * 0.18, petalWidth * 0.8, -petalLength * 0.6, 0, -petalLength)
    ctx.bezierCurveTo(-petalWidth * 0.8, -petalLength * 0.6, -petalWidth * 0.2, -innerRadius - petalLength * 0.18, 0, -innerRadius)
    ctx.closePath()
    ctx.fill()

    // subtle edge shading
    ctx.lineWidth = Math.max(1, petalWidth * 0.03)
    ctx.strokeStyle = 'rgba(120,30,60,0.06)'
    ctx.stroke()

    ctx.restore()
  }

  // center
  const centerGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, innerRadius * 1.6)
  centerGrad.addColorStop(0, '#fff7f9')
  centerGrad.addColorStop(0.5, '#ffd9e6')
  centerGrad.addColorStop(1, '#ff9fbf')
  ctx.beginPath()
  ctx.fillStyle = centerGrad
  ctx.arc(cx, cy, innerRadius * 1.2, 0, Math.PI * 2)
  ctx.fill()

  // tiny speckles
  const speckles = 30 + Math.floor(rand() * 40)
  for (let i = 0; i < speckles; i++) {
    const r = innerRadius * (0.1 + rand() * 0.9)
    const a = rand() * Math.PI * 2
    const sx = cx + Math.cos(a) * r
    const sy = cy + Math.sin(a) * r
    ctx.fillStyle = `rgba(124,12,60,${0.06 + rand() * 0.12})`
    ctx.beginPath()
    ctx.arc(sx, sy, 1 + rand() * 2, 0, Math.PI * 2)
    ctx.fill()
  }
}

export default function FlowerCanvas({ seed = 1, palette = ['#ffb3d9', '#ff6f9b', '#fff4fb'], size = 600 }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function resizeAndDraw() {
      const dpr = window.devicePixelRatio || 1
      const w = size
      const h = size
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawFlower(ctx, w, h, seed, palette)
    }

    resizeAndDraw()
    // redraw on resize for responsiveness
    window.addEventListener('resize', resizeAndDraw)
    return () => window.removeEventListener('resize', resizeAndDraw)
  }, [seed, palette, size])

  return <canvas ref={ref} aria-hidden="true" />
}
