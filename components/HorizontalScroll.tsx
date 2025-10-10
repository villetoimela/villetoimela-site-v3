'use client'

import { useEffect, useRef, useState, useId } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

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

        // Animate the line in sync with horizontal scroll
        const lineTween = gsap.to(pathElement, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${scrollWidth}`,
            scrub: 1,
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
                <div className="lg:pt-32">
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
