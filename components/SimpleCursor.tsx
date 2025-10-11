'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
}

function SimpleCursorInner() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isPointer, setIsPointer] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const particleIdRef = useRef(0)
  const lastPositionRef = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number | undefined>(undefined)

  // Helper to create particles
  const createParticles = (x: number, y: number, count: number) => {
    const newParticles: Particle[] = []

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 0.5 + Math.random() * 1.5

      newParticles.push({
        id: particleIdRef.current++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 30,
        size: 1 + Math.random() * 2,
      })
    }

    setParticles(prev => [...prev, ...newParticles])
  }

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      const newX = e.clientX
      const newY = e.clientY

      // Calculate distance moved
      const dx = newX - lastPositionRef.current.x
      const dy = newY - lastPositionRef.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      setPosition({ x: newX, y: newY })

      // Create particles based on movement speed
      if (distance > 2) {
        const particleCount = Math.min(3, Math.ceil(distance / 10))
        createParticles(newX, newY, particleCount)
      }

      lastPositionRef.current = { x: newX, y: newY }
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      setIsPointer(
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.classList.contains('cursor-pointer')
      )
    }

    window.addEventListener('mousemove', updatePosition)
    window.addEventListener('mouseover', handleMouseOver)

    return () => {
      window.removeEventListener('mousemove', updatePosition)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [])

  // Particle animation loop
  useEffect(() => {
    let lastTime = Date.now()

    const animate = () => {
      const now = Date.now()
      const deltaTime = (now - lastTime) / 16.67 // Normalize to 60fps
      lastTime = now

      // Update existing particles
      setParticles(prev => {
        return prev
          .map(p => ({
            ...p,
            x: p.x + p.vx * deltaTime,
            y: p.y + p.vy * deltaTime,
            life: p.life - (1 / p.maxLife) * deltaTime,
          }))
          .filter(p => p.life > 0)
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <>
      {/* Particles trail */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="fixed pointer-events-none z-[9998] hidden md:block"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: `rgba(160, 230, 255, ${particle.life * 0.8})`,
            borderRadius: '50%',
            boxShadow: `0 0 ${particle.size * 3}px rgba(160, 230, 255, ${particle.life * 0.6})`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Main cursor ring */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block"
        style={{
          transform: `translate(${position.x - 12}px, ${position.y - 12}px)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        <div
          className={`w-6 h-6 border border-blue-400/60 rounded-full transition-all duration-300 ${
            isPointer ? 'scale-150 border-blue-300 bg-blue-400/10' : ''
          }`}
          style={{
            boxShadow: isPointer ? '0 0 20px rgba(100, 180, 255, 0.3)' : 'none',
          }}
        />
      </div>

      {/* Center dot */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block"
        style={{
          transform: `translate(${position.x - 2}px, ${position.y - 2}px)`,
          transition: 'transform 0.05s ease-out',
        }}
      >
        <div
          className={`w-1 h-1 rounded-full transition-all duration-200 ${
            isPointer ? 'bg-blue-300 scale-150' : 'bg-blue-400'
          }`}
          style={{
            boxShadow: '0 0 8px rgba(100, 180, 255, 0.6)',
          }}
        />
      </div>
    </>
  )
}

// Export with dynamic import to prevent hydration mismatch
const SimpleCursor = dynamic(() => Promise.resolve(SimpleCursorInner), {
  ssr: false,
})

export default SimpleCursor
