'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { useLoader } from './LoaderWrapper'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const isLoaded = useLoader()
  const heroRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })
  const [isVisible, setIsVisible] = useState(true) // Track if hero is in viewport
  const isVisibleRef = useRef(true) // Ref for animate function to check visibility
  const targetRotationRef = useRef({ x: 0, y: 0 })
  const currentRotationRef = useRef({ x: 0, y: 0 })
  const autoRotationRef = useRef(0)
  const [particles, setParticles] = useState<Array<{
    initialX: number
    initialY: number
    moveX: number
    duration: number
    delay: number
    size: number
  }>>([])

  // Initialize particles on client side only to avoid hydration mismatch
  useEffect(() => {
    setParticles(
      [...Array(50)].map(() => ({
        initialX: Math.random() * 100,
        initialY: Math.random() * 100,
        moveX: Math.random() * 50 - 25,
        duration: 10 + Math.random() * 10,
        delay: Math.random() * 5,
        size: Math.random() > 0.5 ? 1 : 0.5,
      }))
    )
  }, [])

  // Intersection Observer to track visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting)
          isVisibleRef.current = entry.isIntersecting
          console.log(`[Hero] Visibility changed: ${entry.isIntersecting ? 'VISIBLE - tracking active' : 'HIDDEN - tracking paused'}`)
        })
      },
      {
        threshold: 0.1, // Trigger when at least 10% is visible
        rootMargin: '0px',
      }
    )

    if (heroRef.current) {
      observer.observe(heroRef.current)
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current)
      }
    }
  }, [])

  // Smooth 3D Sphere that follows cursor
  useEffect(() => {
    if (!isLoaded) return // Don't start canvas animation until loaded

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true
    })
    if (!ctx) return

    let animationFrameId: number
    let isAnimating = true

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
      if (!ctx || !canvas || !isAnimating) return

      // Skip rendering if hero is not visible, but keep animation loop running
      if (!isVisibleRef.current) {
        animationFrameId = requestAnimationFrame(animate)
        return
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      const isMobileDevice = window.innerWidth < 768

      if (isMobileDevice) {
        // On mobile: slow auto-rotation
        autoRotationRef.current += 0.002
        currentRotationRef.current.x = Math.sin(autoRotationRef.current * 0.5) * 0.3
        currentRotationRef.current.y = autoRotationRef.current
      } else {
        // On desktop: follow mouse
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
            const lineOpacity = 0.08 * (1 - distance / 70) * p.scale
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

        const baseOpacity = Math.max(0.1, Math.min(0.4, p.scale * 0.4))
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
      isAnimating = false
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [mousePosition, isLoaded])

  // Smooth mouse tracking - only when visible
  useEffect(() => {
    if (!isVisible) {
      console.log('[Hero] Mouse tracking: OFF')
      return // Don't track mouse when hero is not visible
    }

    console.log('[Hero] Mouse tracking: ON')

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
  }, [isVisible])

  // GSAP Animations - only start when loader is complete
  useEffect(() => {
    if (!isLoaded) return

    const ctx = gsap.context(() => {
      // I AM intro text (comes first)
      gsap.fromTo('.hero-intro',
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: 'power3.out',
          delay: 0.2,
        }
      )

      // Large title animation (comes after I AM)
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
          duration: 1.6,
          stagger: 0.2,
          ease: 'power4.out',
          delay: 0.7,
        }
      )

      // Subtitle description
      gsap.fromTo('.hero-subtitle',
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: 'power3.out',
          delay: 1.8,
        }
      )

      // Info items (faster)
      gsap.fromTo('.hero-info',
        {
          opacity: 0,
          x: -20,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.06,
          ease: 'power3.out',
          delay: 1.6,
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

      // Bottom info parallax effect
      gsap.to('.hero-bottom-info', {
        y: -100,
        opacity: 0.3,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      })

      // Canvas stays visible - no scroll effect
      // Removed canvas ScrollTrigger to keep it visible
    }, heroRef)

    return () => {
      ctx.revert()
      ScrollTrigger.getAll().forEach(st => st.kill())
    }
  }, [isLoaded])

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
      suppressHydrationWarning
      style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s ease-out' }}
    >
      {/* Animated gradient orbs in background */}
      <motion.div
        className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(100, 180, 255, 0.4) 0%, rgba(80, 150, 255, 0.2) 50%, transparent 70%)',
        }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: isLoaded ? 0.2 : 0,
          x: isLoaded ? ['-10%', '10%', '-10%'] : 0,
          y: isLoaded ? ['-5%', '5%', '-5%'] : 0,
          scale: isLoaded ? [1, 1.1, 1] : 1,
        }}
        transition={{
          opacity: { duration: 1 },
          x: { duration: 20, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 20, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 20, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      <motion.div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(120, 200, 255, 0.3) 0%, rgba(100, 180, 255, 0.15) 50%, transparent 70%)',
        }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: isLoaded ? 0.2 : 0,
          x: isLoaded ? ['10%', '-10%', '10%'] : 0,
          y: isLoaded ? ['5%', '-5%', '5%'] : 0,
          scale: isLoaded ? [1, 1.15, 1] : 1,
        }}
        transition={{
          opacity: { duration: 1, delay: 0.2 },
          x: { duration: 25, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 25, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 25, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      <motion.div
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(150, 220, 255, 0.35) 0%, rgba(120, 200, 255, 0.18) 50%, transparent 70%)',
        }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: isLoaded ? 0.15 : 0,
          x: isLoaded ? ['-15%', '15%', '-15%'] : 0,
          y: isLoaded ? ['10%', '-10%', '10%'] : 0,
          scale: isLoaded ? [1, 1.2, 1] : 1,
        }}
        transition={{
          opacity: { duration: 1, delay: 0.4 },
          x: { duration: 18, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 18, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 18, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Floating particles */}
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute bg-blue-400 rounded-full opacity-40"
          style={{
            left: `${particle.initialX}%`,
            top: `${particle.initialY}%`,
            width: `${particle.size * 4}px`,
            height: `${particle.size * 4}px`,
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
      <motion.canvas
        ref={canvasRef}
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 1.5, delay: 0.2 }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/10 to-black/60 pointer-events-none" />

      {/* Mobile Top Info - Fixed at top */}
      <div className="absolute top-4 left-4 right-4 z-30 md:hidden">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {/* Languages */}
          <div className="hero-info">
            <div className="text-[9px] text-gray-500 tracking-[0.25em] font-mono mb-1 uppercase" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
              Languages
            </div>
            <div className="text-[11px] text-gray-400 font-mono space-y-0.5">
              <div style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>Finnish</div>
              <div style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>English</div>
            </div>
          </div>

          {/* Based in */}
          <div className="hero-info text-right">
            <div className="text-[9px] text-gray-500 tracking-[0.25em] font-mono mb-1 uppercase" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
              Based in
            </div>
            <div className="text-[11px] text-gray-400 font-mono" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
              Finland
            </div>
          </div>

          {/* Contact */}
          <div className="hero-info">
            <div className="text-[9px] text-gray-500 tracking-[0.25em] font-mono mb-1 uppercase" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
              Contact
            </div>
            <div className="text-[11px] text-gray-400 font-mono space-y-0.5">
              <a href="mailto:ville.toimela@gmail.com" className="block hover:text-gray-300 transition-colors cursor-pointer" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>Email</a>
              <a href="tel:+358405137883" className="block hover:text-gray-300 transition-colors cursor-pointer" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>Phone</a>
            </div>
          </div>

          {/* Links */}
          <div className="hero-info text-right">
            <div className="text-[9px] text-gray-500 tracking-[0.25em] font-mono mb-1 uppercase" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
              Links
            </div>
            <div className="text-[11px] text-gray-400 font-mono space-y-0.5">
              <a href="https://github.com/villetoimela" target="_blank" rel="noopener noreferrer" className="block hover:text-gray-300 transition-colors cursor-pointer" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>GitHub</a>
              <a href="https://fi.linkedin.com/in/villetoimela" target="_blank" rel="noopener noreferrer" className="block hover:text-gray-300 transition-colors cursor-pointer" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>LinkedIn</a>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="hero-content relative z-10 w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-20">

        {/* Desktop: Top Info Bar in corners */}
        <div className="absolute top-10 left-12 lg:left-20 right-12 lg:right-20 hidden md:flex justify-between items-start z-30">
          {/* Top Left - Languages & Contact */}
          <div className="flex flex-col gap-6">
            <div className="hero-info">
              <div className="text-[10px] text-gray-500 tracking-[0.25em] font-mono mb-2 uppercase" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
                Languages
              </div>
              <div className="text-xs text-gray-400 font-mono space-y-1">
                <div style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>Finnish</div>
                <div style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>English</div>
              </div>
            </div>

            <div className="hero-info">
              <div className="text-[10px] text-gray-500 tracking-[0.25em] font-mono mb-2 uppercase" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
                Contact
              </div>
              <div className="text-xs text-gray-400 font-mono space-y-1">
                <a href="mailto:ville.toimela@gmail.com" className="block hover:text-gray-300 transition-colors cursor-pointer" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>Email</a>
                <a href="tel:+358405137883" className="block hover:text-gray-300 transition-colors cursor-pointer" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>Phone</a>
              </div>
            </div>
          </div>

          {/* Top Right - Based in & Links */}
          <div className="flex flex-col gap-6 text-right">
            <div className="hero-info">
              <div className="text-[10px] text-gray-500 tracking-[0.25em] font-mono mb-1 uppercase" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
                Based in
              </div>
              <div className="text-xs text-gray-400 font-mono" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
                Finland
              </div>
            </div>

            <div className="hero-info">
              <div className="text-[10px] text-gray-500 tracking-[0.25em] font-mono mb-2 uppercase" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
                Links
              </div>
              <div className="text-xs text-gray-400 font-mono space-y-1">
                <a href="https://github.com/villetoimela" target="_blank" rel="noopener noreferrer" className="block hover:text-gray-300 transition-colors cursor-pointer" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>GitHub</a>
                <a href="https://fi.linkedin.com/in/villetoimela" target="_blank" rel="noopener noreferrer" className="block hover:text-gray-300 transition-colors cursor-pointer" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>LinkedIn</a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Title */}
        <div className="text-center" style={{ perspective: '2000px' }}>
          <h1 className="leading-[0.85] mb-8 md:mb-10 lg:mb-14">
            <div
              className="hero-intro block text-[4vw] md:text-[3vw] lg:text-[2.5vw] font-light tracking-wide text-gray-400 mb-3 md:mb-4"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
              }}
            >
              I AM
            </div>
            <div
              className="hero-name-line block text-[16vw] md:text-[14vw] lg:text-[12vw] font-bold tracking-[-0.02em] text-gray-50 mb-1 md:mb-2"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                transformStyle: 'preserve-3d',
              }}
            >
              VILLE
            </div>
            <div
              className="hero-name-line block text-[16vw] md:text-[14vw] lg:text-[12vw] font-bold tracking-[-0.02em] text-gray-50"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                transformStyle: 'preserve-3d',
              }}
            >
              TOIMELA
            </div>
          </h1>

          {/* Subtitle */}
          <div className="hero-subtitle w-full flex justify-center">
            <p
              className="text-base md:text-lg lg:text-xl text-gray-300 font-light leading-relaxed text-center max-w-3xl px-4"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5)',
              }}
            >
              Creative Web Developer specializing in building<br className="hidden sm:block" />
              exceptional digital experiences with modern technologies
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Info - 3 sections centered at bottom */}
      <div className="hero-bottom-info absolute bottom-6 md:bottom-10 left-0 right-0 z-30 flex justify-center">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            {/* Role */}
            <div className="hero-info text-center">
              <div className="text-[9px] md:text-[10px] text-gray-500 tracking-[0.25em] font-mono mb-2 uppercase" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
                Role
              </div>
              <div className="text-[11px] md:text-xs text-gray-400 font-mono" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
                Web Developer
              </div>
            </div>

            {/* Availability */}
            <div className="hero-info text-center">
              <div className="text-[9px] md:text-[10px] text-gray-500 tracking-[0.25em] font-mono mb-2 uppercase" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
                Availability
              </div>
              <div className="text-[11px] md:text-xs text-gray-400 font-mono flex items-center justify-center gap-2">
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
                <span style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>Open to work</span>
              </div>
            </div>

            {/* Interest */}
            <div className="hero-info text-center">
              <div className="text-[9px] md:text-[10px] text-gray-500 tracking-[0.25em] font-mono mb-2 uppercase" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
                Interest
              </div>
              <div className="text-[11px] md:text-xs text-gray-400 font-mono" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
                Modern Web Development
              </div>
            </div>
          </div>
      </div>
    </section>
  )
}
