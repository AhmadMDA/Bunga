import React from 'react'
import BloomingFlower from './BloomingFlower'

function stringToSeed(s) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h >>> 0
}

function paletteFor(title) {
  const palettes = {
    'Tulip': ['#ffe5f0', '#ffb3d9', '#fff6fb'],
    'Mawar Merah': ['#ff6b6b', '#d63031', '#fff0f0']
  }
  return palettes[title] || ['#ffd1e8', '#ff8fb1', '#fff4fb']
}

export default function BloomingBouquet({ title, flowerCount = 1 }) {
  const baseSeed = stringToSeed(title)
  const palette = paletteFor(title)

  const flowers = Array.from({ length: flowerCount }, (_, i) => ({
    seed: (baseSeed + i * 1237) >>> 0,
    delay: i * 0.2 // 200ms stagger
  }))

  return (
    <div className="blooming-bouquet">
      {flowers.map((flower, idx) => (
        <div
          key={idx}
          className="bloom-item"
          style={{ '--bloom-delay': `${flower.delay}s` }}
        >
          <BloomingFlower
            seed={flower.seed}
            size={420}
            palette={palette}
            duration={2.5}
          />
        </div>
      ))}
    </div>
  )
}
