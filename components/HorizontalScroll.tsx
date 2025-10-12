'use client'

import { useEffect, useRef, useState, useId } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import FloatingCanvasParticles from './FloatingCanvasParticles'

gsap.registerPlugin(ScrollTrigger)

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

interface Panel {
  title: string | React.ReactNode
  content: string | React.ReactNode
}

interface HorizontalScrollProps {
  panels: Panel[]
}

export default function HorizontalScroll({ panels }: HorizontalScrollProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const scrollTriggersRef = useRef<ScrollTrigger[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const uniqueId = useId().replace(/:/g, '-')

  // Particle system state
  const [particles, setParticles] = useState<Particle[]>([])
  const particleIdRef = useRef(0)
  const lineProgressRef = useRef(0)
  const lastLineProgressRef = useRef(0)
  const explosionsTriggeredRef = useRef<{ 20: boolean; 40: boolean; 80: boolean }>({ 20: false, 40: false, 80: false })
  const animationFrameRef = useRef<number | undefined>(undefined)

  // Helper to create particles
  const createParticles = (x: number, y: number, count: number, isExplosion = false) => {
    const newParticles: Particle[] = []

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const speed = isExplosion ? 3 + Math.random() * 4 : 1 + Math.random() * 2

      newParticles.push({
        id: particleIdRef.current++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: isExplosion ? 60 : 30,
        size: isExplosion ? 3 + Math.random() * 3 : 2 + Math.random() * 2,
      })
    }

    setParticles(prev => [...prev, ...newParticles])
  }

  // Get position along the line based on current drawn length
  const getLinePosition = (): { x: number; y: number } | null => {
    const svg = svgRef.current
    const path = svg?.querySelector('path') as SVGPathElement
    if (!svg || !path) return null

    const pathLength = path.getTotalLength()

    // Read the ACTUAL current dashoffset from the DOM (not from progress)
    const computedStyle = window.getComputedStyle(path)
    const currentDashOffset = parseFloat(computedStyle.strokeDashoffset || '0')

    // Calculate how much of the line has been drawn
    const drawnLength = pathLength - currentDashOffset

    // Get point at the current drawn length (the line tip)
    const point = path.getPointAtLength(Math.max(0, Math.min(drawnLength, pathLength)))

    // Transform SVG coordinates to screen coordinates
    const svgRect = svg.getBoundingClientRect()
    const viewBox = svg.viewBox.baseVal

    const scaleX = svgRect.width / viewBox.width
    const scaleY = svgRect.height / viewBox.height

    return {
      x: svgRect.left + point.x * scaleX,
      y: svgRect.top + point.y * scaleY,
    }
  }

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const scrollContainer = scrollContainerRef.current
    const svg = svgRef.current

    if (!section || !scrollContainer || !svg) return

    const setupAnimations = () => {
      // Kill only this component's ScrollTriggers
      scrollTriggersRef.current.forEach(st => st.kill())
      scrollTriggersRef.current = []

      // Calculate total scroll width
      const scrollWidth = scrollContainer.scrollWidth - window.innerWidth

      // Create horizontal scroll animation
      const scrollTween = gsap.to(scrollContainer, {
        x: -scrollWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 1,
          end: () => `+=${scrollWidth}`,
          invalidateOnRefresh: true,
          onRefresh: (self) => scrollTriggersRef.current.push(self),
        },
      })

      if (scrollTween.scrollTrigger) {
        scrollTriggersRef.current.push(scrollTween.scrollTrigger)
      }

      // Animate the line drawing with horizontal scroll - DISABLED ON MOBILE for performance
      const isMobileDevice = window.innerWidth < 768

      if (!isMobileDevice) {
        const pathElements = svg.querySelectorAll('path')
        pathElements.forEach((pathElement) => {
          const pathLength = pathElement.getTotalLength()

          // Set up the initial state
          pathElement.style.strokeDasharray = `${pathLength}`
          pathElement.style.strokeDashoffset = `${pathLength}`

          // Animate the line in sync with horizontal scroll
          const lineScrollMultiplier = window.innerWidth < 1024 ? 1.5 : 1
          const lineTween = gsap.to(pathElement, {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: () => `+=${scrollWidth * lineScrollMultiplier}`,
              scrub: 1,
              onUpdate: (self) => {
                const currentProgress = self.progress
                const progressDelta = Math.abs(currentProgress - lastLineProgressRef.current)

                lineProgressRef.current = currentProgress

                // Spawn particles based on progress change
                // More progress change = more particles (for smooth trail during fast scrolling)
                if (currentProgress > 0 && currentProgress < 1 && progressDelta > 0.0005) {
                  const pos = getLinePosition()
                  if (pos) {
                    // Create 1-2 particles per update
                    const particleCount = Math.min(2, Math.ceil(progressDelta * 200))
                    createParticles(pos.x, pos.y, particleCount, false)
                  }
                }

                lastLineProgressRef.current = currentProgress

                // Trigger explosions at 20%, 40%, and 80%
                const explosionPoints = [
                  { threshold: 0.20, key: 20 as const },
                  { threshold: 0.40, key: 40 as const },
                  { threshold: 0.80, key: 80 as const },
                ]

                explosionPoints.forEach(({ threshold, key }) => {
                  if (currentProgress >= threshold && !explosionsTriggeredRef.current[key]) {
                    explosionsTriggeredRef.current[key] = true
                    const pos = getLinePosition()
                    if (pos) {
                      createParticles(pos.x, pos.y, 20, true)
                    }
                  }

                  // Reset explosion trigger when scrolling back past the point
                  if (currentProgress < threshold) {
                    explosionsTriggeredRef.current[key] = false
                  }
                })
              },
            },
          })

          if (lineTween.scrollTrigger) {
            scrollTriggersRef.current.push(lineTween.scrollTrigger)
          }
        })
      } else {
        // On mobile: hide the SVG line completely
        const pathElements = svg.querySelectorAll('path')
        pathElements.forEach((pathElement) => {
          ;(pathElement as SVGPathElement).style.display = 'none'
        })
      }

      // Set initial state for all panels - hide them first with slight offset
      panels.forEach((_, index) => {
        gsap.set(section.querySelector(`.panel-title-${uniqueId}-${index}`), {
          opacity: 0,
          y: 50,
        })

        gsap.set(section.querySelector(`.panel-text-${uniqueId}-${index}`), {
          opacity: 0,
          y: 30,
        })
      })

      // Fade in with subtle rise animations
      panels.forEach((_, index) => {
        const isFirstPanel = index === 0

        if (isFirstPanel) {
          // First panel: animate when section comes into view (normal vertical scroll)
          const titleTween = gsap.to(section.querySelector(`.panel-title-${uniqueId}-${index}`), {
            opacity: 1,
            y: 0,
            ease: 'power2.out',
            duration: 1,
            scrollTrigger: {
              trigger: section,
              start: 'top 30%',
              end: 'top top',
              scrub: 1,
            },
          })

          if (titleTween.scrollTrigger) {
            scrollTriggersRef.current.push(titleTween.scrollTrigger)
          }

          const contentTween = gsap.to(section.querySelector(`.panel-text-${uniqueId}-${index}`), {
            opacity: 1,
            y: 0,
            ease: 'power2.out',
            duration: 1,
            scrollTrigger: {
              trigger: section,
              start: 'top 25%',
              end: 'top top',
              scrub: 1,
            },
          })

          if (contentTween.scrollTrigger) {
            scrollTriggersRef.current.push(contentTween.scrollTrigger)
          }
        } else {
          // Other panels: animate during horizontal scroll - start when more visible
          const titleStart = 'left 30%'
          const titleEnd = 'left left'
          const contentStart = 'left 25%'
          const contentEnd = 'left left'

          // Fade in title with rise
          const titleTween = gsap.to(section.querySelector(`.panel-title-${uniqueId}-${index}`), {
            opacity: 1,
            y: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section.querySelector(`.panel-${uniqueId}-${index}`),
              containerAnimation: scrollTween,
              start: titleStart,
              end: titleEnd,
              scrub: true,
            },
          })

          if (titleTween.scrollTrigger) {
            scrollTriggersRef.current.push(titleTween.scrollTrigger)
          }

          // Fade in content text with rise
          const contentTween = gsap.to(section.querySelector(`.panel-text-${uniqueId}-${index}`), {
            opacity: 1,
            y: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section.querySelector(`.panel-${uniqueId}-${index}`),
              containerAnimation: scrollTween,
              start: contentStart,
              end: contentEnd,
              scrub: true,
            },
          })

          if (contentTween.scrollTrigger) {
            scrollTriggersRef.current.push(contentTween.scrollTrigger)
          }
        }
      })

      // Animate scroll indicator to show during entire horizontal scroll section
      const scrollIndicator = section.querySelector('.scroll-indicator')
      if (scrollIndicator) {
        gsap.set(scrollIndicator, { opacity: 0 })

        const indicatorTween = gsap.to(scrollIndicator, {
          opacity: 1,
          duration: 0.4,
          scrollTrigger: {
            trigger: section,
            start: 'top bottom-=100',
            end: () => `+=${scrollWidth}`,
            toggleActions: 'play none none reverse',
            onLeave: () => gsap.to(scrollIndicator, { opacity: 0, duration: 0.3 }),
            onEnterBack: () => gsap.to(scrollIndicator, { opacity: 1, duration: 0.3 }),
          },
        })

        if (indicatorTween.scrollTrigger) {
          scrollTriggersRef.current.push(indicatorTween.scrollTrigger)
        }
      }
    }

    // Initial setup
    setupAnimations()

    // Re-setup on window resize
    const handleResize = () => {
      setupAnimations()
      ScrollTrigger.refresh()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      scrollTriggersRef.current.forEach(st => st.kill())
      scrollTriggersRef.current = []
    }
  }, [panels])

  // Particle animation loop - DISABLED ON MOBILE for performance
  useEffect(() => {
    const isMobileDevice = window.innerWidth < 768

    // Skip particle animation entirely on mobile
    if (isMobileDevice) return

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
    <section
      ref={sectionRef}
      className="relative bg-[#000000] overflow-hidden"
    >
      {/* Animated gradient orbs in background */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl pointer-events-none hidden md:block"
        style={{
          background: 'radial-gradient(circle, rgba(100, 180, 255, 0.3) 0%, rgba(80, 150, 255, 0.15) 50%, transparent 70%)',
        }}
        animate={{
          x: ['-10%', '10%', '-10%'],
          y: ['-5%', '5%', '-5%'],
          scale: [1, 1.1, 1],
        }}
        transition={{
          x: { duration: 20, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 20, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 20, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      <motion.div
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl pointer-events-none hidden md:block"
        style={{
          background: 'radial-gradient(circle, rgba(120, 200, 255, 0.25) 0%, rgba(100, 180, 255, 0.12) 50%, transparent 70%)',
        }}
        animate={{
          x: ['10%', '-10%', '10%'],
          y: ['5%', '-5%', '5%'],
          scale: [1, 1.15, 1],
        }}
        transition={{
          x: { duration: 25, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 25, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 25, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      <motion.div
        className="absolute top-1/2 right-1/3 w-[350px] h-[350px] rounded-full opacity-10 blur-3xl pointer-events-none hidden md:block"
        style={{
          background: 'radial-gradient(circle, rgba(150, 220, 255, 0.3) 0%, rgba(120, 200, 255, 0.15) 50%, transparent 70%)',
        }}
        animate={{
          x: ['-15%', '15%', '-15%'],
          y: ['10%', '-10%', '10%'],
          scale: [1, 1.2, 1],
        }}
        transition={{
          x: { duration: 18, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 18, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 18, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Floating particles - Canvas based for better performance */}
      {typeof window !== 'undefined' && window.innerWidth >= 768 && (
        <FloatingCanvasParticles particleCount={15} />
      )}

      {/* Horizontal scroll container */}
      <div
        ref={scrollContainerRef}
        className="flex relative"
        style={{ width: 'fit-content' }}
      >
        {/* SVG for animated line - spans across entire horizontal scroll */}
        <svg
          ref={svgRef}
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: '100%',
            height: '100vh',
            zIndex: 5
          }}
          viewBox="0 0 250 100"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Subtle gradient for the line */}
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(140, 210, 255, 0.5)" />
              <stop offset="50%" stopColor="rgba(160, 230, 255, 0.8)" />
              <stop offset="100%" stopColor="rgba(140, 210, 255, 0.5)" />
            </linearGradient>

            {/* Very subtle glow filter */}
            <filter id="subtleGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Single thin line - smooth horizontal wave */}
          <path
            d="M 0 50 Q 25 35, 50 50 T 100 50 T 150 50 T 200 50 T 250 50"
            stroke="url(#lineGradient)"
            strokeWidth="0.4"
            fill="none"
            strokeLinecap="round"
            filter="url(#subtleGlow)"
            opacity="1"
          />
        </svg>

        {/* Dynamic Panels */}
        {panels.map((panel, index) => (
          <div
            key={index}
            className={`panel-${uniqueId}-${index} h-screen flex items-center justify-center px-8 md:px-16 lg:px-24 relative z-20`}
            style={{ minWidth: index === 0 ? (isMobile ? '150vw' : '100vw') : (isMobile ? '180vw' : '150vw') }}
          >
            <div className={`panel-content-${uniqueId}-${index}`} style={{ width: isMobile ? '100vw' : '100%', maxWidth: '1280px', paddingLeft: isMobile ? '2rem' : '0', paddingRight: isMobile ? '2rem' : '0', perspective: '2000px' }}>
              <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-32">
                {/* Title on the left */}
                <h2
                  className={`panel-title-${uniqueId}-${index} text-6xl md:text-8xl lg:text-8xl font-light text-white lg:min-w-[400px] xl:min-w-[500px] shrink-0`}
                  style={{ fontFamily: 'var(--font-space-grotesk)', lineHeight: 0.9, transformStyle: 'preserve-3d' }}
                >
                  {panel.title}
                </h2>

                {/* Text on the right */}
                <div className={`panel-text-${uniqueId}-${index} lg:pt-32 pr-4 md:pr-0`}>
                  {typeof panel.content === 'string' ? (
                    <p
                      className="text-lg md:text-xl lg:text-2xl text-gray-300 leading-relaxed"
                      style={{ fontFamily: 'var(--font-space-grotesk)' }}
                    >
                      {panel.content}
                    </p>
                  ) : (
                    panel.content
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* End spacer */}
        <div className="h-screen" style={{ minWidth: isMobile ? '50vw' : '30vw' }} />
      </div>

      {/* Particles - rendered as fixed positioned elements */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="fixed pointer-events-none z-30"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: `rgba(160, 230, 255, ${particle.life})`,
            borderRadius: '50%',
            boxShadow: `0 0 ${particle.size * 2}px rgba(160, 230, 255, ${particle.life * 0.8})`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Scroll indicator - appears on the right */}
      <div className="scroll-indicator fixed bottom-10 right-10 z-50 text-gray-400 text-sm font-mono hidden md:block pointer-events-none opacity-0">
        <div className="flex items-center gap-3">
          <span className="text-xs tracking-wider">SCROLL →</span>
          <div className="w-16 h-px bg-gray-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-400 animate-slide-right" />
          </div>
        </div>
      </div>
    </section>
  )
}
