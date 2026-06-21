import React, { useState, useEffect } from 'react'
import BloomingRose from './BloomingRose'

const FlowerCard = ({ emoji, title, note, onClick }) => (
  <div className="flower-card" onClick={onClick} role="button" tabIndex={0}>
    <div className="flower-emoji">{emoji}</div>
    <h3>{title}</h3>
    <p>{note}</p>
  </div>
)

export default function App() {
  const [started, setStarted] = useState(false)
  const [windowWidth, setWindowWidth] = useState(620)

  useEffect(() => {
    const updateWidth = () => setWindowWidth(window.innerWidth)
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const flowerSize = Math.min(620, Math.max(320, windowWidth - 80))

  const flowers = [
    {
      emoji: '💜',
      title: 'Mawar Ungu',
    }
  ]

  const [selected, setSelected] = useState(null)

  const handleStart = () => {
    setStarted(true)
    setSelected(flowers[0])
  }

  return (
    <div className={`app ${started ? 'show-flowers' : ''}`}>
      {!started && (
        <div className="intro">
          <h1>kamu siap sayangku Kaiyla nur Alifia?</h1>
          <button className="start-btn" onClick={handleStart}>
            Ya, tunjukkan bunga
          </button>
        </div>
      )}

      {started && (
        <main className="flowers-page">
          <header className="hero">
            <h1>Untukmu, Sayang</h1>
            <p>Semua bunga ini untuk hatimu.</p>
          </header>

          <div className="flower-showcase">
            <BloomingRose
              seed={4}
              palette={['#ff4d6d', '#c11a36', '#7b001d']}
              duration={4.5}
              size={flowerSize}
            />
            <p>{selected?.note}</p>
          </div>

          <footer className="footer-note">
            <p>Dengan cinta ❤️</p>
          </footer>
        </main>
      )}
    </div>
  )
}
