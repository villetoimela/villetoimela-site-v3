'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { projects } from '@/data/projects'

const ProjectsPreview = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const track1Ref = useRef<HTMLDivElement>(null)
  const track2Ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const animationsRef = useRef<(Animation | null)[]>([])
  const isVisibleRef = useRef(false)

  // Split featured projects into two tracks
  const allFeatured = projects.filter(p => p.featured)
  const track1Featured = allFeatured.slice(0, 6)
  const track2Featured = allFeatured.slice(6, 12)

  // Duplicate projects for seamless loop
  const track1Projects = [...track1Featured, ...track1Featured]
  const track2Projects = [...track2Featured, ...track2Featured]

  // Floating background particles
  const [floatingParticles, setFloatingParticles] = useState<Array<{
    initialX: number
    initialY: number
    moveX: number
    duration: number
    delay: number
    size: number
  }>>([])

  // Mount check
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
          console.log(`[ProjectsPreview] Visibility: ${entry.isIntersecting ? 'VISIBLE - animations active' : 'HIDDEN - animations paused'}`)

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

  // Initialize floating particles - significantly reduce on mobile
  useEffect(() => {
    const isMobileDevice = window.innerWidth < 768
    const particleCount = isMobileDevice ? 0 : 20 // No particles on mobile!

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

  // Auto-scrolling animations with Web Animations API (much lighter than GSAP ScrollTrigger!)
  useEffect(() => {
    if (!isMounted || !track1Ref.current || !track2Ref.current) return

    const track1 = track1Ref.current
    const track2 = track2Ref.current

    // Track 1 - scrolls left
    const anim1 = track1.animate(
      [
        { transform: 'translateX(0%)' },
        { transform: 'translateX(-50%)' }
      ],
      {
        duration: 40000, // 40 seconds for smooth scroll
        iterations: Infinity,
        easing: 'linear'
      }
    )

    // Track 2 - scrolls right
    const anim2 = track2.animate(
      [
        { transform: 'translateX(-50%)' },
        { transform: 'translateX(0%)' }
      ],
      {
        duration: 35000, // Slightly different speed for variety
        iterations: Infinity,
        easing: 'linear'
      }
    )

    animationsRef.current = [anim1, anim2]

    return () => {
      anim1.cancel()
      anim2.cancel()
    }
  }, [isMounted])

  return (
    <section
      ref={sectionRef}
      className="relative bg-black py-32 overflow-hidden"
    >
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

      <div className="container mx-auto px-6 relative z-10">
        {/* Title */}
        <div className="text-center mb-32">
          <p className="text-white/40 text-xs uppercase tracking-[0.3em] mb-4 font-light">
            Recent Work
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-4">
            A sneak peek at some of my projects
          </h2>
        </div>

        {/* Diagonal scrolling tracks */}
        <div className="relative h-[600px]">
          {/* Track 1 - Top-left to bottom-right, scrolls left */}
          <div className="absolute top-0 left-0 w-full origin-top-left rotate-[8deg] translate-x-[5%] translate-y-[5%]">
            <div className="relative overflow-hidden">
              {/* Fade gradient mask */}
              <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-r from-black via-transparent to-black" />
              <div
                ref={track1Ref}
                className="flex gap-6"
                style={{ width: 'fit-content', willChange: 'transform' }}
              >
                {track1Projects.map((project, index) => (
                  <a
                    key={`track1-${index}`}
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 w-[400px] h-[225px] rounded-2xl overflow-hidden border border-white/10 cursor-pointer group hover:scale-105 transition-transform duration-300"
                  >
                    <div className="relative w-full h-full">
                      {/* Project Image */}
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transition-all duration-500 brightness-50 group-hover:brightness-100"
                        sizes="(max-width: 768px) 300px, 400px"
                        quality={70}
                        loading="lazy"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                      {/* Content */}
                      <div className="relative h-full p-8 flex flex-col justify-between">
                        <div className="flex flex-wrap gap-2">
                          {project.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs text-blue-300 border border-blue-400/30 rounded-full backdrop-blur-sm bg-blue-950/30"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div>
                          <h3 className="text-2xl font-light text-white mb-2 group-hover:translate-x-2 transition-transform duration-300">
                            {project.title}
                          </h3>
                        </div>
                      </div>

                      {/* Hover glow effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="absolute inset-0 border-2 border-blue-400/50 rounded-2xl" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Track 2 - Top-right to bottom-left, scrolls right */}
          <div className="absolute top-0 right-0 w-full origin-top-right -rotate-[8deg] translate-x-[-5%] translate-y-[35%]">
            <div className="relative overflow-hidden">
              {/* Fade gradient mask */}
              <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-r from-black via-transparent to-black" />
              <div
                ref={track2Ref}
                className="flex gap-6"
                style={{ width: 'fit-content', willChange: 'transform' }}
              >
                {track2Projects.map((project, index) => (
                  <a
                    key={`track2-${index}`}
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 w-[400px] h-[225px] rounded-2xl overflow-hidden border border-white/10 cursor-pointer group hover:scale-105 transition-transform duration-300"
                  >
                    <div className="relative w-full h-full">
                      {/* Project Image */}
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transition-all duration-500 brightness-50 group-hover:brightness-100"
                        sizes="(max-width: 768px) 300px, 400px"
                        quality={70}
                        loading="lazy"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                      {/* Content */}
                      <div className="relative h-full p-8 flex flex-col justify-between">
                        <div className="flex flex-wrap gap-2">
                          {project.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs text-blue-300 border border-blue-400/30 rounded-full backdrop-blur-sm bg-blue-950/30"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div>
                          <h3 className="text-2xl font-light text-white mb-2 group-hover:translate-x-2 transition-transform duration-300">
                            {project.title}
                          </h3>
                        </div>
                      </div>

                      {/* Hover glow effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="absolute inset-0 border-2 border-blue-400/50 rounded-2xl" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProjectsPreview
