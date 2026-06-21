import React from 'react'
import FlowerCanvas from './FlowerCanvas'

function stringToSeed(s) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h >>> 0
}

function paletteFor(title) {
  const palettes = [
    ['#ffd1e8', '#ff8fb1', '#fff4fb'],
    ['#ffe5f0', '#ffb3d9', '#fff6fb'],
    ['#fff0f3', '#ffccd9', '#fff6f9'],
    ['#ffe6ea', '#ffb6d1', '#fff4fb']
  ]
  const seed = stringToSeed(title)
  return palettes[seed % palettes.length]
}

export default function FlowerBouquet({ title, flowerCount = 7 }) {
  const baseSeed = stringToSeed(title)
  const palette = paletteFor(title)

  // Generate varied seeds for each flower in bouquet
  const flowers = Array.from({ length: flowerCount }, (_, i) => ({
    seed: (baseSeed + i * 1237) >>> 0,
    delay: i * 0.15 // 150ms stagger
  }))

  return (
    <div className="flower-bouquet">
      {flowers.map((flower, idx) => (
        <div
          key={idx}
          className="bouquet-item"
          style={{ '--delay': `${flower.delay}s` }}
        >
          <FlowerCanvas
            seed={flower.seed}
            size={140}
            palette={palette}
          />
        </div>
      ))}
    </div>
  )
}
