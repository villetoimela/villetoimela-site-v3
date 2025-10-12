'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { projects, Project } from '@/data/projects'
import Image from 'next/image'

export default function ProjectMarquee() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const marqueeRefs = useRef<(HTMLDivElement | null)[]>([])
  const sectionRef = useRef<HTMLDivElement>(null)
  const isVisibleRef = useRef(false)
  const targetSpeed = useRef(0.3)
  const currentSpeed = useRef(0.3)
  const lastScrollY = useRef(0)
  const lastScrollTime = useRef(Date.now())
  const animationFrameId = useRef<number | null>(null)
  const hoverStates = useRef<Map<number, { target: number, current: number }>>(new Map())
  const scrollResetTimeout = useRef<NodeJS.Timeout | null>(null)
  const animationsRef = useRef<(Animation | null)[]>([])

  // Floating background particles
  const [floatingParticles, setFloatingParticles] = useState<Array<{
    initialX: number
    initialY: number
    moveX: number
    duration: number
    delay: number
    size: number
  }>>([])

  // Only mount on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Intersection Observer to track visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting)
          isVisibleRef.current = entry.isIntersecting
          console.log(`[ProjectMarquee] Visibility: ${entry.isIntersecting ? 'VISIBLE - animations active' : 'HIDDEN - animations paused'}`)

          // Pause/resume Web Animations API
          if (entry.isIntersecting) {
            animationsRef.current.forEach(anim => {
              if (anim) anim.play()
            })
          } else {
            animationsRef.current.forEach(anim => {
              if (anim) anim.pause()
            })
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  // Initialize floating particles - reduce on mobile
  useEffect(() => {
    const isMobileDevice = window.innerWidth < 768
    const particleCount = isMobileDevice ? 10 : 30

    setFloatingParticles(
      [...Array(particleCount)].map(() => ({
        initialX: Math.random() * 100,
        initialY: Math.random() * 100,
        moveX: Math.random() * 50 - 25,
        duration: 10 + Math.random() * 10,
        delay: Math.random() * 5,
        size: Math.random() > 0.5 ? 1 : 0.5,
      }))
    )
  }, [])

  // Split projects into rows with smart distribution
  const rows = useMemo(() => {
    const featuredProjects = projects.filter(p => p.featured)
    
    // Shuffle projects for variety
    const shuffledProjects = [...featuredProjects].sort(() => Math.random() - 0.5)
    
    const minProjectsPerRow = 5
    const totalProjects = shuffledProjects.length
    
    // Calculate how many full rows we can make with min 5 projects each
    const fullRows = Math.floor(totalProjects / minProjectsPerRow)
    const remainingProjects = totalProjects % minProjectsPerRow
    
    // Determine actual number of rows
    let actualRows = fullRows
    if (remainingProjects >= 5) {
      // If we have 5+ leftover projects, create an additional row
      actualRows = fullRows + 1
    }
    
    const rowsData = []
    let projectsToDistribute = [...shuffledProjects]
    
    if (remainingProjects >= 5) {
      // Create rows with equal distribution
      const projectsPerRow = Math.floor(totalProjects / actualRows)
      
      for (let i = 0; i < actualRows; i++) {
        const isLastRow = i === actualRows - 1
        const projectsForThisRow = isLastRow 
          ? projectsToDistribute // Last row gets all remaining projects
          : projectsToDistribute.splice(0, projectsPerRow)
        
        rowsData.push(projectsForThisRow)
      }
    } else {
      // Distribute leftover projects among existing rows
      const projectsPerRow = minProjectsPerRow
      
      for (let i = 0; i < actualRows; i++) {
        const isLastRow = i === actualRows - 1
        const projectsForThisRow = isLastRow 
          ? projectsToDistribute // Last row gets all remaining projects
          : projectsToDistribute.splice(0, projectsPerRow)
        
        rowsData.push(projectsForThisRow)
      }
    }

    // Duplicate projects for infinite scroll effect
    const createInfiniteArray = (arr: Project[]) => [...arr, ...arr, ...arr, ...arr]

    // Generate speeds and directions dynamically
    const speeds = [35, 40, 37, 42, 38, 36, 33, 39, 41, 34]
    const directions: ('left' | 'right')[] = ['left', 'right', 'left', 'right', 'left', 'right', 'left', 'right', 'left', 'right']

    return rowsData.map((rowProjects, index) => ({
      projects: createInfiniteArray(rowProjects),
      speed: speeds[index] || 35, // Fallback speed
      direction: directions[index] || 'left', // Fallback direction
    }))
  }, [])

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !isMounted) return

    const animations = marqueeRefs.current.map((ref, index) => {
      if (!ref) return null

      const row = rows[index]
      const keyframes = row.direction === 'left'
        ? [
            { transform: 'translateX(0%)' },
            { transform: 'translateX(-25%)' }, // Move left by 1/4 since we duplicated 4 times
          ]
        : [
            { transform: 'translateX(-25%)' },
            { transform: 'translateX(0%)' }, // Move right by starting from -25%
          ]

      const animation = ref.animate(keyframes, {
        duration: row.speed * 1000,
        iterations: Infinity,
        easing: 'linear',
      })

      // Set initial slow playback rate
      animation.playbackRate = 0.3

      return animation
    })

    // Store animations for pause/resume
    animationsRef.current = animations

    // Initialize hover states for each row
    animations.forEach((_, index) => {
      hoverStates.current.set(index, { target: 1, current: 1 })
    })

    // Smooth speed interpolation loop - only when visible
    const updateSpeed = () => {
      // Skip updating if not visible
      if (!isVisibleRef.current) {
        animationFrameId.current = requestAnimationFrame(updateSpeed)
        return
      }

      // Lerp towards target speed for smooth transition
      const lerpFactor = 0.08 // Slower lerp for smoother transition
      currentSpeed.current += (targetSpeed.current - currentSpeed.current) * lerpFactor

      // Apply speed to all animations with per-row hover multiplier
      animations.forEach((anim, index) => {
        if (anim) {
          const hoverState = hoverStates.current.get(index)
          if (hoverState) {
            // Lerp the hover state too
            hoverState.current += (hoverState.target - hoverState.current) * 0.08
            anim.playbackRate = currentSpeed.current * hoverState.current
          } else {
            anim.playbackRate = currentSpeed.current
          }
        }
      })

      animationFrameId.current = requestAnimationFrame(updateSpeed)
    }
    updateSpeed()

    // Handle scroll speed boost
    const handleScroll = () => {
      const now = Date.now()
      const currentScrollY = window.scrollY
      const scrollDelta = Math.abs(currentScrollY - lastScrollY.current)
      const timeDelta = Math.max(now - lastScrollTime.current, 16) // Min 16ms to avoid huge spikes

      lastScrollY.current = currentScrollY
      lastScrollTime.current = now

      // Calculate scroll velocity (pixels per millisecond)
      const velocity = scrollDelta / timeDelta

      // Boost speed based on velocity, with smoother curve and lower cap
      const boost = Math.min(velocity * 1.5, 1.5) // Lower cap for smoother feel
      targetSpeed.current = 0.3 + boost

      // Clear existing timeout
      if (scrollResetTimeout.current) {
        clearTimeout(scrollResetTimeout.current)
      }

      // Gradually return to base speed
      scrollResetTimeout.current = setTimeout(() => {
        targetSpeed.current = 0.3
      }, 200)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
      if (scrollResetTimeout.current) {
        clearTimeout(scrollResetTimeout.current)
      }
      animations.forEach(anim => anim?.cancel())
    }
  }, [isMounted, rows])

  const handleMouseEnter = (id: string, index: number) => {
    if (typeof window === 'undefined') return
    setHoveredId(id)
    const hoverState = hoverStates.current.get(index)
    if (hoverState) {
      hoverState.target = 0.15 // Slow down to 15% when hovering
    }
  }

  const handleMouseLeave = (index: number) => {
    if (typeof window === 'undefined') return
    setHoveredId(null)
    const hoverState = hoverStates.current.get(index)
    if (hoverState) {
      hoverState.target = 1 // Return to normal multiplier
    }
  }

  // Don't render until mounted on client
  if (!isMounted) {
    return (
      <section className="relative bg-black py-20 overflow-hidden">
        <div className="container mx-auto px-8 md:px-16">
          <h2
            className="text-6xl md:text-8xl lg:text-9xl font-light text-white mb-6"
            style={{ fontFamily: 'var(--font-space-grotesk)', lineHeight: 0.9 }}
          >
            Featured<br />Work
          </h2>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="relative bg-black pt-0 pb-20 overflow-x-hidden overflow-y-visible">
      {/* Mobile-only title */}
      <div className="md:hidden container mx-auto px-8 pb-8">
        <h2
          className="text-6xl font-light text-white"
          style={{ fontFamily: 'var(--font-space-grotesk)', lineHeight: 0.9 }}
        >
          Check out<br />my work
        </h2>
        <div className="mt-6 flex items-center gap-4">
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
          <p
            className="text-sm text-gray-400 tracking-widest"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            FEATURED PROJECTS
          </p>
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
        </div>
        <div className="h-20" />
      </div>
      {/* Animated gradient orbs in background - only animate when visible */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(100, 180, 255, 0.3) 0%, rgba(80, 150, 255, 0.15) 50%, transparent 70%)',
        }}
        animate={isVisible ? {
          x: ['-10%', '10%', '-10%'],
          y: ['-5%', '5%', '-5%'],
          scale: [1, 1.1, 1],
        } : {}}
        transition={{
          x: { duration: 20, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 20, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 20, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      <motion.div
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(120, 200, 255, 0.25) 0%, rgba(100, 180, 255, 0.12) 50%, transparent 70%)',
        }}
        animate={isVisible ? {
          x: ['10%', '-10%', '10%'],
          y: ['5%', '-5%', '5%'],
          scale: [1, 1.15, 1],
        } : {}}
        transition={{
          x: { duration: 25, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 25, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 25, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      <motion.div
        className="absolute top-1/2 right-1/3 w-[350px] h-[350px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(150, 220, 255, 0.3) 0%, rgba(120, 200, 255, 0.15) 50%, transparent 70%)',
        }}
        animate={isVisible ? {
          x: ['-15%', '15%', '-15%'],
          y: ['10%', '-10%', '10%'],
          scale: [1, 1.2, 1],
        } : {}}
        transition={{
          x: { duration: 18, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 18, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 18, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Floating particles - only animate when visible */}
      {floatingParticles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute bg-blue-400 rounded-full opacity-30 pointer-events-none"
          style={{
            left: `${particle.initialX}%`,
            top: `${particle.initialY}%`,
            width: `${particle.size * 3}px`,
            height: `${particle.size * 3}px`,
            boxShadow: '0 0 8px rgba(100, 180, 255, 0.5)',
          }}
          animate={isVisible ? {
            y: [0, -100, 0],
            x: [0, particle.moveX, 0],
            opacity: [0.15, 0.4, 0.15],
            scale: [1, 1.5, 1],
          } : {}}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay,
          }}
        />
      ))}

      {/* Marquee Rows */}
      <div className="space-y-8 overflow-visible">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="relative overflow-visible"
            style={{
              maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
            }}
          >
            <div
              ref={(el) => {
                marqueeRefs.current[rowIndex] = el
              }}
              className="flex gap-3 md:gap-4 lg:gap-6 overflow-visible"
              style={{ width: 'fit-content', willChange: 'transform' }}
            >
              {row.projects.map((project, index) => (
                <a
                  key={`${project.id}-${index}`}
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block flex-shrink-0 transition-all duration-300 w-[240px] h-[135px] md:w-[450px] md:h-[255px] lg:w-[600px] lg:h-[340px]"
                  onMouseEnter={() => handleMouseEnter(project.id, rowIndex)}
                  onMouseLeave={() => handleMouseLeave(rowIndex)}
                >
                  {/* Image */}
                  <div className="relative w-full h-full overflow-hidden rounded-lg">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover transition-all duration-500 brightness-50 grayscale-[30%] group-hover:brightness-100 group-hover:grayscale-0"
                      sizes="(max-width: 768px) 300px, (max-width: 1024px) 450px, 600px"
                      quality={70}
                      loading="lazy"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80 opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

                    {/* Content */}
                    <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-between">
                      {/* Title */}
                      <h3
                        className="text-base md:text-2xl font-light text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                        style={{ fontFamily: 'var(--font-space-grotesk)' }}
                      >
                        {project.title}
                      </h3>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 md:gap-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs text-blue-300 border border-blue-400/30 rounded-full backdrop-blur-sm bg-blue-950/30"
                            style={{ fontFamily: 'var(--font-space-grotesk)' }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Hover glow effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="absolute inset-0 border-2 border-blue-400/50 rounded-lg" />
                      <div className="absolute inset-0 shadow-[0_0_30px_rgba(96,165,250,0.3)] rounded-lg" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Additional text */}
      <div className="container mx-auto px-8 md:px-16 mt-16">
        <p
          className="text-lg md:text-xl text-white/70 font-light"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Plus a bunch of other projects — client sites, ongoing development work, maintenance, and random experiments.
        </p>
      </div>

    </section>
  )
}
