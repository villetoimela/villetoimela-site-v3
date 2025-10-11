'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { projects, Project } from '@/data/projects'
import Image from 'next/image'

export default function ProjectMarquee() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const marqueeRefs = useRef<(HTMLDivElement | null)[]>([])
  const sectionRef = useRef<HTMLDivElement>(null)
  const targetSpeed = useRef(0.3)
  const currentSpeed = useRef(0.3)
  const lastScrollY = useRef(0)
  const lastScrollTime = useRef(Date.now())
  const animationFrameId = useRef<number | null>(null)
  const hoverStates = useRef<Map<number, { target: number, current: number }>>(new Map())
  const scrollResetTimeout = useRef<NodeJS.Timeout | null>(null)

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

  // Initialize floating particles
  useEffect(() => {
    setFloatingParticles(
      [...Array(30)].map(() => ({
        initialX: Math.random() * 100,
        initialY: Math.random() * 100,
        moveX: Math.random() * 50 - 25,
        duration: 10 + Math.random() * 10,
        delay: Math.random() * 5,
        size: Math.random() > 0.5 ? 1 : 0.5,
      }))
    )
  }, [])

  // Split projects into 6 rows
  const rows = useMemo(() => {
    const featuredProjects = projects.filter(p => p.featured)
    const row1 = featuredProjects.slice(0, 5)
    const row2 = featuredProjects.slice(5, 10)
    const row3 = featuredProjects.slice(10, 15)
    const row4 = featuredProjects.slice(15, 20)
    const row5 = featuredProjects.slice(20, 25)
    const row6 = featuredProjects.slice(25, 29)

    // Duplicate projects for infinite scroll effect
    const createInfiniteArray = (arr: Project[]) => [...arr, ...arr, ...arr, ...arr]

    return [
      { projects: createInfiniteArray(row1), speed: 35, direction: 'left' as const },
      { projects: createInfiniteArray(row2), speed: 40, direction: 'right' as const },
      { projects: createInfiniteArray(row3), speed: 37, direction: 'left' as const },
      { projects: createInfiniteArray(row4), speed: 42, direction: 'right' as const },
      { projects: createInfiniteArray(row5), speed: 38, direction: 'left' as const },
      { projects: createInfiniteArray(row6), speed: 36, direction: 'right' as const },
    ]
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

    // Initialize hover states for each row
    animations.forEach((_, index) => {
      hoverStates.current.set(index, { target: 1, current: 1 })
    })

    // Smooth speed interpolation loop
    const updateSpeed = () => {
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
      {/* Animated gradient orbs in background */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl pointer-events-none"
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
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl pointer-events-none"
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
        className="absolute top-1/2 right-1/3 w-[350px] h-[350px] rounded-full opacity-10 blur-3xl pointer-events-none"
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

      {/* Floating particles */}
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
          animate={{
            y: [0, -100, 0],
            x: [0, particle.moveX, 0],
            opacity: [0.15, 0.4, 0.15],
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
                  className="group relative block flex-shrink-0 transition-all duration-300 w-[300px] h-[170px] md:w-[450px] md:h-[255px] lg:w-[600px] lg:h-[340px]"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

                    {/* Content */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      {/* Title */}
                      <h3
                        className="text-2xl font-light text-white mb-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                        style={{ fontFamily: 'var(--font-space-grotesk)' }}
                      >
                        {project.title}
                      </h3>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 text-xs text-blue-300 border border-blue-400/30 rounded-full backdrop-blur-sm bg-blue-950/30"
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
