'use client'

import { useEffect, useRef, useState, useId } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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
  const explosionTriggeredRef = useRef(false)
  const animationFrameRef = useRef<number>()

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
          pin: true,
          scrub: 1,
          end: () => `+=${scrollWidth}`,
          invalidateOnRefresh: true,
          onRefresh: (self) => scrollTriggersRef.current.push(self),
        },
      })

      if (scrollTween.scrollTrigger) {
        scrollTriggersRef.current.push(scrollTween.scrollTrigger)
      }

      // Animate the line drawing with horizontal scroll
      const pathElements = svg.querySelectorAll('path')
      pathElements.forEach((pathElement) => {
        const pathLength = pathElement.getTotalLength()

        // Set up the initial state
        pathElement.style.strokeDasharray = `${pathLength}`
        pathElement.style.strokeDashoffset = `${pathLength}`

        // Animate the line in sync with horizontal scroll - slower on mobile, normal on desktop
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

              // Trigger explosion at midpoint
              if (currentProgress >= 0.5 && !explosionTriggeredRef.current) {
                explosionTriggeredRef.current = true
                const pos = getLinePosition()
                if (pos) {
                  createParticles(pos.x, pos.y, 20, true)
                }
              }

              // Reset explosion trigger when scrolling back
              if (currentProgress < 0.5) {
                explosionTriggeredRef.current = false
              }
            },
          },
        })

        if (lineTween.scrollTrigger) {
          scrollTriggersRef.current.push(lineTween.scrollTrigger)
        }
      })

      // Animate each panel's content dynamically
      panels.forEach((_, index) => {
        const panelTween = gsap.fromTo(section.querySelector(`.panel-content-${uniqueId}-${index}`),
          {
            opacity: 0,
            y: 100,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section.querySelector(`.panel-${uniqueId}-${index}`),
              containerAnimation: scrollTween,
              start: 'left right',
              end: 'center center',
              scrub: 1,
            },
          }
        )

        if (panelTween.scrollTrigger) {
          scrollTriggersRef.current.push(panelTween.scrollTrigger)
        }
      })
    }

    // Initial setup
    setupAnimations()

    // Re-setup on window resize
    const handleResize = () => {
      setupAnimations()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      scrollTriggersRef.current.forEach(st => st.kill())
      scrollTriggersRef.current = []
    }
  }, [panels])

  // Particle animation loop - only updates particle positions/life
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
    <section
      ref={sectionRef}
      className="relative bg-[#000000] overflow-hidden"
    >

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
            <div className={`panel-content-${uniqueId}-${index}`} style={{ width: isMobile ? '100vw' : '100%', maxWidth: '1280px', paddingLeft: isMobile ? '2rem' : '0', paddingRight: isMobile ? '2rem' : '0' }}>
              <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-32">
                {/* Title on the left */}
                <h2
                  className="text-6xl md:text-8xl lg:text-9xl font-light text-white lg:min-w-[400px] xl:min-w-[500px] shrink-0"
                  style={{ fontFamily: 'var(--font-space-grotesk)', lineHeight: 0.9 }}
                >
                  {panel.title}
                </h2>

                {/* Text on the right */}
                <div className="lg:pt-32 pr-4 md:pr-0">
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
      <div className="fixed bottom-10 right-10 z-50 text-gray-400 text-sm font-mono hidden md:block pointer-events-none">
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
