'use client'

import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { projects as allProjects, Project } from '@/data/projects'

gsap.registerPlugin(ScrollTrigger)

interface ParallaxRevealLayersProps {
  projectIds?: string[]
}

export default function ParallaxRevealLayers({ projectIds }: ParallaxRevealLayersProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const imagesRef = useRef<HTMLDivElement[]>([])
  const textRef = useRef<HTMLDivElement>(null)

  const selectedProjects: Project[] = useMemo(() => {
    if (projectIds && projectIds.length > 0) {
      const set = new Set(projectIds)
      return allProjects.filter(p => set.has(p.id))
    }
    // Use all projects, but filter out any that might have invalid image paths
    return allProjects.filter(project => {
      const imageName = project.image.split('/').pop()
      return imageName && 
             imageName !== 'README.md' && 
             imageName !== '.gitkeep' &&
             (imageName.endsWith('.png') || imageName.endsWith('.jpg') || imageName.endsWith('.jpeg') || imageName.endsWith('.webp'))
    })
  }, [projectIds])

  useEffect(() => {
    const section = sectionRef.current
    if (!section || imagesRef.current.length === 0) return

    const ctx = gsap.context(() => {
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
        
        // Start below screen
        const startY = window.innerHeight * 1.3
        
        // End above screen - varying distances based on speed
        const endY = -window.innerHeight * (0.8 + speedMultiplier * 0.2)

        // Set initial position
        gsap.set(img, {
          y: startY,
          opacity: 0,
        })

        // Stagger start times - tighter spacing, start after text begins
        const startTime = 0.3 + index * 0.10
        
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
        
        // Fade out near the end
        tl.to(img, {
          opacity: 0,
          duration: 0.3,
        }, `>-0.5`)
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [selectedProjects.length])

  // Define image positions and sizes
  const imageConfigs = selectedProjects.map((_, index) => {
    const positions = [
      { left: '5%', size: 'large' },
      { left: '75%', size: 'small' },
      { left: '25%', size: 'medium' },
      { left: '65%', size: 'medium' },
      { left: '10%', size: 'small' },
      { left: '55%', size: 'large' },
      { left: '35%', size: 'small' },
      { left: '15%', size: 'medium' },
      { left: '70%', size: 'small' },
      { left: '40%', size: 'large' },
      { left: '60%', size: 'medium' },
      { left: '20%', size: 'small' },
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
                
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black to-transparent pointer-events-none z-10" />
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />
      </section>
    </>
  )
}

