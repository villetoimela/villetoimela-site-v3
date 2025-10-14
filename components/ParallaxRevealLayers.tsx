'use client'

import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { projects as allProjects, Project } from '@/data/projects'
import FloatingCanvasParticles from './FloatingCanvasParticles'

gsap.registerPlugin(ScrollTrigger)

interface ParallaxRevealLayersProps {
  projectIds?: string[]
}

export default function ParallaxRevealLayers({ projectIds }: ParallaxRevealLayersProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const imagesRef = useRef<HTMLDivElement[]>([])
  const textRef = useRef<HTMLDivElement>(null)

  const selectedProjects: Project[] = useMemo(() => {
    let projects: Project[]
    
    if (projectIds && projectIds.length > 0) {
      const set = new Set(projectIds)
      projects = allProjects.filter(p => set.has(p.id))
    } else {
      // Use all projects, but filter out any that might have invalid image paths
      projects = allProjects.filter(project => {
        const imageName = project.image.split('/').pop()
        return imageName && 
               imageName !== 'README.md' && 
               imageName !== '.gitkeep' &&
               (imageName.endsWith('.png') || imageName.endsWith('.jpg') || imageName.endsWith('.jpeg') || imageName.endsWith('.webp'))
      })
    }
    
    // Shuffle the projects array using Fisher-Yates algorithm
    const shuffled = [...projects]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    
    return shuffled
  }, [projectIds])

  useEffect(() => {
    const section = sectionRef.current
    if (!section || imagesRef.current.length === 0) return

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${window.innerHeight * 3.5}`,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
        },
      })

      // Animate text first
      if (textRef.current) {
        const startY = window.innerHeight * 1.2
        const endY = -window.innerHeight * 0.8

        gsap.set(textRef.current, {
          y: startY,
          opacity: 0,
        })

        tl.to(textRef.current, {
          opacity: 1,
          duration: 0.3,
        }, 0)

        tl.to(textRef.current, {
          y: endY,
          duration: 1.8,
          ease: 'none',
        }, 0)

        tl.to(textRef.current, {
          opacity: 0,
          duration: 0.3,
        }, '>-0.4')
      }

      // Each image slides from bottom to top at different speeds
      imagesRef.current.forEach((img, index) => {
        if (!img) return

        // Define different speed groups - more moderate speeds, removed fastest ones
        const speedVariations = [1.8, 1.4, 2.0, 1.6, 1.9, 1.5, 2.1, 1.7, 1.8, 1.5, 1.9, 1.6]
        const speedMultiplier = speedVariations[index % speedVariations.length]
        
        // Start below screen - more distance for better spacing, less on mobile
        const startY = isMobile ? window.innerHeight * 1.2 : window.innerHeight * 1.5
        
        // End above screen - varying distances based on speed, less on mobile
        const endY = isMobile ? 
          -window.innerHeight * (0.7 + speedMultiplier * 0.2) : 
          -window.innerHeight * (1.0 + speedMultiplier * 0.3)

        // Set initial position
        gsap.set(img, {
          y: startY,
          opacity: 0,
        })

        // Stagger start times - more spacing between images, less on mobile
        const staggerDelay = isMobile ? 0.08 : 0.15
        const startTime = 0.6 + index * staggerDelay
        
        // Calculate duration based on speed - fast ones have shorter duration
        const duration = 2.5 / speedMultiplier
        
        // Fade in
        tl.to(img, {
          opacity: 1,
          duration: 0.3,
        }, startTime)
        
        // Slide up
        tl.to(img, {
          y: endY,
          duration: duration,
          ease: 'none',
        }, startTime)
        
        // Fade out near the end - delay more on mobile to fill the timeline better
        const fadeOutTiming = isMobile ? `>-0.2` : `>-0.5`
        tl.to(img, {
          opacity: 0,
          duration: 0.3,
        }, fadeOutTiming)
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [selectedProjects.length])

  // Define image positions and sizes
  const imageConfigs = selectedProjects.map((_, index) => {
    const positions = [
      { left: '5%', size: 'large' },
      { left: '35%', size: 'small' },
      { left: '15%', size: 'medium' },
      { left: '45%', size: 'medium' },
      { left: '5%', size: 'small' },
      { left: '30%', size: 'medium' },
      { left: '25%', size: 'small' },
      { left: '10%', size: 'medium' },
      { left: '45%', size: 'small' },
      { left: '20%', size: 'large' },
      { left: '45%', size: 'medium' },
      { left: '15%', size: 'small' },
    ]
    return positions[index % positions.length]
  })

  // Mobile-specific position adjustment
  const getMobileAdjustedPosition = (originalLeft: string) => {
    const numericValue = parseFloat(originalLeft)
    // Shift positions left by 20% on mobile (but keep them within bounds)
    const adjustedValue = Math.max(2, numericValue - 20)
    return `${adjustedValue}%`
  }

  return (
    <>
      <style jsx>{`
        @media (max-width: 767px) {
          .img-small, .img-medium, .img-large {
            left: var(--mobile-left) !important;
          }
        }
      `}</style>
      <section 
        ref={sectionRef} 
        className="relative bg-black h-screen overflow-hidden"
      >
      {/* Animated gradient blobs in background */}
      <motion.div
        className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl hidden md:block"
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
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl hidden md:block"
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
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl hidden md:block"
        style={{
          background: 'radial-gradient(circle, rgba(150, 220, 255, 0.25) 0%, rgba(120, 200, 255, 0.12) 50%, transparent 70%)',
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
      {typeof window !== 'undefined' && (
        <FloatingCanvasParticles particleCount={25} />
      )}

      {/* Sliding Text */}
      <div 
        ref={textRef}
        className="absolute left-0 right-0 top-0 flex items-center justify-center pointer-events-none z-20"
      >
        <h2 
          className="text-4xl md:text-6xl lg:text-8xl font-light text-white text-center px-6 max-w-5xl leading-tight"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          A sneak peek at some of my projects
        </h2>
      </div>

      {/* Sliding Images */}
      <div className="absolute inset-0">
        {selectedProjects.map((project, idx) => {
          const config = imageConfigs[idx]
          const sizeClasses = {
            small: 'w-[60vw] md:w-[40vw] lg:w-[30vw] aspect-[16/9]',
            medium: 'w-[80vw] md:w-[56vw] lg:w-[44vw] aspect-[16/9]',
            large: 'w-[100vw] md:w-[70vw] lg:w-[56vw] aspect-[16/9]',
          }

          return (
            <div
              key={project.id}
              ref={(el) => { if (el) imagesRef.current[idx] = el }}
              className={`absolute ${sizeClasses[config.size as keyof typeof sizeClasses]} img-${config.size}`}
              style={{ 
                left: config.left,
                top: 0,
                '--mobile-left': getMobileAdjustedPosition(config.left),
              } as React.CSSProperties & { '--mobile-left': string }}
            >
              <div className="relative w-full h-full rounded-xl md:rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-white/10">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover"
                  sizes="40vw"
                  quality={70}
                />
                
                {/* Dark overlay to reduce brightness */}
                <div className="absolute inset-0 bg-black/40" />
                
                {/* Electric blue tint overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-cyan-400/10 to-blue-600/20 mix-blend-overlay" />
                
                {/* Bottom gradient for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/10 to-black/60 pointer-events-none" />

      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black to-transparent pointer-events-none z-10" />
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />
      </section>
    </>
  )
}

