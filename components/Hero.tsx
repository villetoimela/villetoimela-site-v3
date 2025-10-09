'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })
  const targetRotationRef = useRef({ x: 0, y: 0 })
  const currentRotationRef = useRef({ x: 0, y: 0 })
  const [particles] = useState(() =>
    [...Array(15)].map(() => ({
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      moveX: Math.random() * 50 - 25,
      duration: 10 + Math.random() * 10,
      delay: Math.random() * 5,
    }))
  )

  // Smooth 3D Sphere that follows cursor
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true
    })
    if (!ctx) return

    let animationFrameId: number

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: Array<{
      x: number
      y: number
      z: number
      size: number
    }> = []

    // Create sphere - smaller on mobile
    const isMobile = window.innerWidth < 768
    const radius = isMobile ? 150 : 200
    const segments = 50

    for (let i = 0; i < segments; i++) {
      const theta = (i / segments) * Math.PI * 2
      for (let j = 0; j < segments / 2; j++) {
        const phi = (j / (segments / 2)) * Math.PI
        const x = radius * Math.sin(phi) * Math.cos(theta)
        const y = radius * Math.sin(phi) * Math.sin(theta)
        const z = radius * Math.cos(phi)
        particles.push({ x, y, z, size: 2.5 })
      }
    }

    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2

    function animate() {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      // Update target rotation from mouse position
      targetRotationRef.current.x = (mousePosition.y - 0.5) * Math.PI * 0.6  // Vertical follows mouse
      targetRotationRef.current.y = -(mousePosition.x - 0.5) * Math.PI * 0.6 // Horizontal inverted

      // Smooth interpolation with easing
      const ease = 0.08
      const dx = targetRotationRef.current.x - currentRotationRef.current.x
      const dy = targetRotationRef.current.y - currentRotationRef.current.y

      // Only update if there's a meaningful difference (prevents micro-movements)
      if (Math.abs(dx) > 0.0001 || Math.abs(dy) > 0.0001) {
        currentRotationRef.current.x += dx * ease
        currentRotationRef.current.y += dy * ease
      }

      // Project all particles
      const projected = particles.map((p) => {
        const cosY = Math.cos(currentRotationRef.current.y)
        const sinY = Math.sin(currentRotationRef.current.y)
        const cosX = Math.cos(currentRotationRef.current.x)
        const sinX = Math.sin(currentRotationRef.current.x)

        let x = p.x
        let y = p.y
        let z = p.z

        // Rotate Y axis (horizontal mouse movement)
        let tempZ = z * cosY - x * sinY
        let tempX = z * sinY + x * cosY
        x = tempX
        z = tempZ

        // Rotate X axis (vertical mouse movement)
        let tempY = y * cosX - z * sinX
        tempZ = y * sinX + z * cosX
        y = tempY
        z = tempZ

        const scale = 400 / (400 + z)
        return {
          x: x * scale + centerX,
          y: y * scale + centerY,
          scale: scale,
          z: z,
          size: p.size
        }
      })

      // Sort by Z for proper depth
      projected.sort((a, b) => a.z - b.z)

      // Draw connections
      let connectionCount = 0
      const maxConnections = 150

      for (let i = 0; i < projected.length && connectionCount < maxConnections; i++) {
        const p = projected[i]
        if (p.scale < 0.5) continue

        for (let j = i + 1; j < projected.length && connectionCount < maxConnections; j++) {
          const p2 = projected[j]
          if (p2.scale < 0.5) continue

          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 70) {
            const lineOpacity = 0.18 * (1 - distance / 70) * p.scale
            ctx.beginPath()
            ctx.strokeStyle = `rgba(100, 180, 255, ${lineOpacity})`
            ctx.lineWidth = 0.8
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
            connectionCount++
          }
        }
      }

      // Draw particles with glow (reduced opacity)
      projected.forEach((p) => {
        if (p.scale < 0.3) return

        const baseOpacity = Math.max(0.2, Math.min(0.7, p.scale * 0.7))
        const size = p.size * p.scale

        // Outer glow
        const glowGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 3)
        glowGradient.addColorStop(0, `rgba(100, 180, 255, ${baseOpacity * 0.3})`)
        glowGradient.addColorStop(0.5, `rgba(80, 150, 255, ${baseOpacity * 0.15})`)
        glowGradient.addColorStop(1, 'rgba(80, 150, 255, 0)')

        ctx.beginPath()
        ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2)
        ctx.fillStyle = glowGradient
        ctx.fill()

        // Main particle
        const particleGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size)
        particleGradient.addColorStop(0, `rgba(200, 230, 255, ${baseOpacity * 0.8})`)
        particleGradient.addColorStop(0.6, `rgba(120, 180, 255, ${baseOpacity * 0.7})`)
        particleGradient.addColorStop(1, `rgba(80, 150, 255, ${baseOpacity * 0.4})`)

        ctx.beginPath()
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
        ctx.fillStyle = particleGradient
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [mousePosition])

  // Smooth mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Large title animation
      gsap.fromTo('.hero-name-line',
        {
          opacity: 0,
          y: 120,
          rotateX: 45,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1.8,
          stagger: 0.2,
          ease: 'power4.out',
          delay: 0.5,
        }
      )

      // Subtitle
      gsap.fromTo('.hero-subtitle',
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          delay: 1.5,
        }
      )

      // Info items
      gsap.fromTo('.hero-info',
        {
          opacity: 0,
          x: -20,
        },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 2,
        }
      )

      // Scroll indicator
      gsap.fromTo('.scroll-indicator',
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          delay: 2.5,
        }
      )

      // Parallax on scroll
      gsap.to('.hero-content', {
        y: -100,
        opacity: 0.3,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      })

      gsap.to(canvasRef.current, {
        scale: 1.5,
        opacity: 0.2,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      })
    }, heroRef)

    return () => {
      ctx.revert()
      ScrollTrigger.getAll().forEach(st => st.kill())
    }
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]"
    >
      {/* Animated gradient orbs in background */}
      <motion.div
        className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(100, 180, 255, 0.4) 0%, rgba(80, 150, 255, 0.2) 50%, transparent 70%)',
        }}
        animate={{
          x: ['-10%', '10%', '-10%'],
          y: ['-5%', '5%', '-5%'],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(120, 200, 255, 0.3) 0%, rgba(100, 180, 255, 0.15) 50%, transparent 70%)',
        }}
        animate={{
          x: ['10%', '-10%', '10%'],
          y: ['5%', '-5%', '5%'],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      <motion.div
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(150, 220, 255, 0.35) 0%, rgba(120, 200, 255, 0.18) 50%, transparent 70%)',
        }}
        animate={{
          x: ['-15%', '15%', '-15%'],
          y: ['10%', '-10%', '10%'],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5
        }}
      />

      {/* Floating particles */}
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-40"
          style={{
            left: `${particle.initialX}%`,
            top: `${particle.initialY}%`,
            boxShadow: '0 0 10px rgba(100, 180, 255, 0.6)',
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, particle.moveX, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay,
          }}
        />
      ))}

      {/* 3D Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/10 to-black/60 pointer-events-none" />

      {/* Content */}
      <div className="hero-content relative z-10 w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-20">

        {/* Top Info Bar */}
        <div className="absolute top-6 md:top-10 left-6 md:left-12 lg:left-20 right-6 md:right-12 lg:right-20 flex justify-between items-start">
          <motion.div
            className="hero-info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-[9px] md:text-[10px] text-gray-600 tracking-[0.25em] font-mono mb-1 uppercase">
              Portfolio
            </div>
            <div className="text-[11px] md:text-xs text-gray-500 font-mono">
              2025
            </div>
          </motion.div>

          <motion.div
            className="hero-info text-right"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-[9px] md:text-[10px] text-gray-600 tracking-[0.25em] font-mono mb-1 uppercase">
              Based in
            </div>
            <div className="text-[11px] md:text-xs text-gray-500 font-mono">
              Finland
            </div>
          </motion.div>
        </div>

        {/* Main Title */}
        <div className="text-center" style={{ perspective: '2000px' }}>
          <h1 className="leading-[0.85] mb-8 md:mb-10 lg:mb-14">
            <div
              className="hero-name-line block text-[20vw] md:text-[18vw] lg:text-[15vw] font-bold tracking-[-0.02em] text-gray-50 mb-1 md:mb-2"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                transformStyle: 'preserve-3d',
              }}
            >
              VILLE
            </div>
            <div
              className="hero-name-line block text-[20vw] md:text-[18vw] lg:text-[15vw] font-bold tracking-[-0.02em] text-gray-50"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                transformStyle: 'preserve-3d',
              }}
            >
              TOIMELA
            </div>
          </h1>

          {/* Subtitle */}
          <div className="hero-subtitle w-full flex justify-center mb-16 md:mb-20 lg:mb-24">
            <p className="text-base md:text-lg lg:text-xl text-gray-500 font-light leading-relaxed text-center max-w-3xl px-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Creative Web Developer specializing in building<br className="hidden sm:block" />
              exceptional digital experiences with modern technologies
            </p>
          </div>

          {/* Info Grid */}
          <div className="hero-subtitle w-full flex justify-center mb-16 px-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 max-w-5xl w-full">
            <div className="hero-info flex flex-col items-center text-center">
              <div className="text-[9px] md:text-[10px] text-gray-600 tracking-[0.25em] font-mono mb-2 uppercase">
                Role
              </div>
              <div className="text-sm md:text-base text-gray-400 font-light" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Front End Developer
              </div>
            </div>

            <div className="hero-info flex flex-col items-center text-center">
              <div className="text-[9px] md:text-[10px] text-gray-600 tracking-[0.25em] font-mono mb-2 uppercase">
                Availability
              </div>
              <div className="text-sm md:text-base text-gray-400 font-light flex items-center justify-center gap-2">
                <motion.div
                  className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                  animate={{
                    opacity: [1, 0.3, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
                <span style={{ fontFamily: 'var(--font-space-grotesk)' }}>Open to work</span>
              </div>
            </div>

            <div className="hero-info flex flex-col items-center text-center">
              <div className="text-[9px] md:text-[10px] text-gray-600 tracking-[0.25em] font-mono mb-2 uppercase">
                Specialization
              </div>
              <div className="text-sm md:text-base text-gray-400 font-light" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                React · Next.js · GSAP
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-6 md:bottom-10 left-6 md:left-12 lg:left-20 right-6 md:right-12 lg:right-20 flex justify-between items-end">
          <motion.div
            className="hero-info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-[9px] md:text-[10px] text-gray-600 tracking-[0.25em] font-mono mb-2 uppercase">
              Contact
            </div>
            <div className="text-[11px] md:text-xs text-gray-500 font-mono space-y-1">
              <div className="hover:text-gray-300 transition-colors cursor-pointer">Email</div>
              <div className="hover:text-gray-300 transition-colors cursor-pointer">LinkedIn</div>
            </div>
          </motion.div>

          <motion.div
            className="scroll-indicator text-center hidden md:block"
            animate={{
              y: [0, 8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="text-[9px] text-gray-600 tracking-[0.25em] font-mono mb-2 uppercase">
              Scroll
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              className="mx-auto"
            >
              <path
                d="M10 4V16M10 16L6 12M10 16L14 12"
                stroke="currentColor"
                strokeWidth="1"
                className="text-gray-600"
              />
            </svg>
          </motion.div>

          <motion.div
            className="hero-info text-right"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-[9px] md:text-[10px] text-gray-600 tracking-[0.25em] font-mono mb-2 uppercase">
              Stack
            </div>
            <div className="text-[11px] md:text-xs text-gray-500 font-mono space-y-1">
              <div>TypeScript</div>
              <div>React</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
