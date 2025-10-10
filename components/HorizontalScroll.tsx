'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function HorizontalScroll() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const scrollContainer = scrollContainerRef.current
    const svg = svgRef.current

    if (!section || !scrollContainer || !svg) return

    const setupAnimations = () => {
      // Kill existing ScrollTriggers before creating new ones
      ScrollTrigger.getAll().forEach(st => st.kill())

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
        },
      })

      // Animate the line drawing with horizontal scroll
      const pathElements = svg.querySelectorAll('path')
      pathElements.forEach((pathElement) => {
        const pathLength = pathElement.getTotalLength()

        // Set up the initial state
        pathElement.style.strokeDasharray = `${pathLength}`
        pathElement.style.strokeDashoffset = `${pathLength}`

        // Animate the line in sync with horizontal scroll
        gsap.to(pathElement, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${scrollWidth}`,
            scrub: 1,
          },
        })
      })

      // Animate "Who am I" content
      gsap.fromTo('.who-am-i-content',
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
            trigger: '.who-am-i-panel',
            containerAnimation: scrollTween,
            start: 'left right',
            end: 'center center',
            scrub: 1,
          },
        }
      )

      // Animate "What I do" content
      gsap.fromTo('.what-i-do-content',
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
            trigger: '.what-i-do-panel',
            containerAnimation: scrollTween,
            start: 'left right',
            end: 'center center',
            scrub: 1,
          },
        }
      )
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
      ScrollTrigger.getAll().forEach(st => st.kill())
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

        {/* Panel 1: Who am I */}
        <div className="who-am-i-panel h-screen flex items-center justify-center px-8 md:px-16 lg:px-24 relative z-20" style={{ minWidth: window.innerWidth < 1024 ? '150vw' : '100vw' }}>
          <div className="who-am-i-content" style={{ width: window.innerWidth < 1024 ? '100vw' : '100%', maxWidth: '1280px', paddingLeft: window.innerWidth < 1024 ? '2rem' : '0', paddingRight: window.innerWidth < 1024 ? '2rem' : '0' }}>
            <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-32">
              {/* Title on the left */}
              <h2
                className="text-6xl md:text-8xl lg:text-9xl font-light text-white lg:min-w-[400px] xl:min-w-[500px] shrink-0"
                style={{ fontFamily: 'var(--font-space-grotesk)', lineHeight: 0.9 }}
              >
                Who am I
              </h2>

              {/* Text on the right */}
              <div className="lg:pt-32">
                <p
                  className="text-lg md:text-xl lg:text-2xl text-gray-300 leading-relaxed"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Hello! I'm a 30-years-old eager Web Developer with about five years of active coding experience. While I've always been intrigued by programming, I officially embarked on my learning journey only six years ago. During this time, I learned many different skills and made some digital ideas real! I've logged tens of thousands of hours playing video games. The passion and commitment I once dedicated to gaming have now transitioned into coding. My aim is to accumulate atleast an equal number of hours in coding and continue expanding my knowledge.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: What I do */}
        <div className="what-i-do-panel h-screen flex items-center justify-center px-8 md:px-16 lg:px-24 relative z-20" style={{ minWidth: window.innerWidth < 1024 ? '180vw' : '150vw' }}>
          <div className="what-i-do-content" style={{ width: window.innerWidth < 1024 ? '100vw' : '100%', maxWidth: '1280px', paddingLeft: window.innerWidth < 1024 ? '2rem' : '0', paddingRight: window.innerWidth < 1024 ? '2rem' : '0' }}>
            <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-32">
              {/* Title on the left */}
              <h2
                className="text-6xl md:text-8xl lg:text-9xl font-light text-white lg:min-w-[400px] xl:min-w-[500px] shrink-0"
                style={{ fontFamily: 'var(--font-space-grotesk)', lineHeight: 0.9 }}
              >
                What I do
              </h2>

              {/* Text on the right */}
              <div className="lg:pt-32">
                <p
                  className="text-lg md:text-xl lg:text-2xl text-gray-300 leading-relaxed mb-6"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  After an intensive two-year Software Developer training, I had the privilege of working at one of Finland's most influential marketing agencies. There, I've been involved in creating various websites tailored to meet the specific needs of clients. Most of these projects involved building custom WordPress themes. In addition to coding, this role has provided me with invaluable experience in teamwork and interacting effectively with clients.
                </p>
                <p
                  className="text-lg md:text-xl lg:text-2xl text-gray-300 leading-relaxed"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  During my studies, my brother and I co-founded a company. Through this venture, we had the chance to work on several exciting projects! If you're interested, check out{' '}
                  <a
                    href="https://hiisi.digital"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors underline decoration-blue-400/30 hover:decoration-blue-300/50"
                  >
                    hiisi.digital
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* End spacer */}
        <div className="h-screen" style={{ minWidth: window.innerWidth < 1024 ? '50vw' : '30vw' }} />
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
