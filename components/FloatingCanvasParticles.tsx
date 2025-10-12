'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  baseY: number
  size: number
  speed: number
  offsetX: number
  offsetY: number
  opacity: number
}

interface FloatingCanvasParticlesProps {
  particleCount?: number
  className?: string
}

export default function FloatingCanvasParticles({
  particleCount = 20,
  className = ''
}: FloatingCanvasParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isVisibleRef = useRef(true)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true
    })
    if (!ctx) return

    let isAnimating = true
    const particles: Particle[] = []
    let time = 0

    // Set canvas size
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.scale(dpr, dpr)
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * canvas.offsetWidth
      const y = Math.random() * canvas.offsetHeight
      particles.push({
        x,
        y,
        baseY: y,
        size: Math.random() > 0.5 ? 1.5 : 1,
        speed: 0.3 + Math.random() * 0.3,
        offsetX: Math.random() * Math.PI * 2,
        offsetY: Math.random() * Math.PI * 2,
        opacity: 0.2 + Math.random() * 0.3,
      })
    }

    // Intersection Observer for visibility tracking
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting
        })
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    )
    observer.observe(canvas)

    // Animation loop
    const animate = () => {
      if (!isAnimating) return

      // Skip rendering if not visible, but keep loop running
      if (!isVisibleRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate)
        return
      }

      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      time += 0.016 // ~60fps

      particles.forEach((particle) => {
        // Floating motion
        const floatY = Math.sin(time * particle.speed + particle.offsetY) * 30
        const floatX = Math.sin(time * particle.speed * 0.5 + particle.offsetX) * 15

        const currentX = particle.x + floatX
        const currentY = particle.baseY + floatY

        // Wrap around edges
        if (currentX < -10) particle.x = canvas.offsetWidth + 10
        if (currentX > canvas.offsetWidth + 10) particle.x = -10
        if (currentY < -10) particle.baseY = canvas.offsetHeight + 10
        if (currentY > canvas.offsetHeight + 10) particle.baseY = -10

        // Pulsing opacity
        const pulseOpacity = particle.opacity * (0.8 + Math.sin(time * particle.speed * 2) * 0.2)

        // Draw glow
        const glowGradient = ctx.createRadialGradient(
          currentX, currentY, 0,
          currentX, currentY, particle.size * 4
        )
        glowGradient.addColorStop(0, `rgba(100, 180, 255, ${pulseOpacity * 0.4})`)
        glowGradient.addColorStop(0.5, `rgba(100, 180, 255, ${pulseOpacity * 0.2})`)
        glowGradient.addColorStop(1, 'rgba(100, 180, 255, 0)')

        ctx.beginPath()
        ctx.arc(currentX, currentY, particle.size * 4, 0, Math.PI * 2)
        ctx.fillStyle = glowGradient
        ctx.fill()

        // Draw particle core
        const coreGradient = ctx.createRadialGradient(
          currentX, currentY, 0,
          currentX, currentY, particle.size * 1.5
        )
        coreGradient.addColorStop(0, `rgba(160, 210, 255, ${pulseOpacity})`)
        coreGradient.addColorStop(0.6, `rgba(100, 180, 255, ${pulseOpacity * 0.8})`)
        coreGradient.addColorStop(1, `rgba(80, 150, 255, ${pulseOpacity * 0.3})`)

        ctx.beginPath()
        ctx.arc(currentX, currentY, particle.size * 1.5, 0, Math.PI * 2)
        ctx.fillStyle = coreGradient
        ctx.fill()
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      isAnimating = false
      window.removeEventListener('resize', resizeCanvas)
      observer.disconnect()
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [particleCount])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity: 0.6 }}
    />
  )
}
