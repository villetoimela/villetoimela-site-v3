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

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function ParallaxRevealLayers({ projectIds }: ParallaxRevealLayersProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const imagesRef = useRef<HTMLDivElement[]>([])
  const textRef = useRef<HTMLDivElement>(null)

  const selectedProjects: Project[] = useMemo(() => {
    if (projectIds && projectIds.length > 0) {
      const set = new Set(projectIds)
      return allProjects.filter(p => set.has(p.id)).slice(0, 24)
    }
    // Get all projects that have valid images and shuffle them randomly
    const projectsWithImages = allProjects.filter(project => {
      // Check if the image file exists by checking the filename pattern
      const imageName = project.image.split('/').pop()
      return imageName && imageName !== 'README.md'
    })
    return shuffleArray(projectsWithImages).slice(0, 24)
  }, [projectIds])

  useEffect(() => {
    const section = sectionRef.current
    if (!section || imagesRef.current.length === 0) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${window.innerHeight * 3.2}`,
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

        // Define different speed groups - more moderate speeds, less extreme
        const speedVariations = [1.8, 1.4, 2.0, 1.6, 1.9, 1.5, 2.1, 1.7, 1.8, 1.5, 1.9, 1.6, 2.0, 1.7, 1.8, 1.6, 1.9, 1.5, 2.0, 1.6, 1.8, 1.7, 1.9, 1.4]
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

        // Stagger start times - tighter for more images, start after text begins
        const startTime = 0.3 + index * 0.08
        
        // Calculate duration based on speed - fast ones have shorter duration
        const duration = 2.5 / speedMultiplier
        
        // Fade in
        tl.to(img, {
          opacity: 1,
          duration: 0.25,
        }, startTime)
        
        // Slide up
        tl.to(img, {
          y: endY,
          duration: duration,
          ease: 'none',
        }, startTime)
        
        // Fade out near the end of its journey
        tl.to(img, {
          opacity: 0,
          duration: 0.3,
        }, `>-0.5`)
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [selectedProjects.length])

  // Define image positions and sizes - mobile-optimized balance
  const imageConfigs = selectedProjects.map((_, index) => {
    const positions = [
      { left: '2%', size: 'large' },    // vasen
      { left: '35%', size: 'small' },    // oikea
      { left: '8%', size: 'medium' },   // vasen
      { left: '42%', size: 'medium' },   // oikea
      { left: '5%', size: 'small' },    // vasen
      { left: '38%', size: 'large' },   // oikea
      { left: '12%', size: 'small' },   // vasen
      { left: '45%', size: 'medium' },   // oikea
      { left: '6%', size: 'medium' },   // vasen
      { left: '32%', size: 'small' },   // oikea
      { left: '18%', size: 'large' },   // vasen
      { left: '48%', size: 'medium' },   // oikea
      { left: '3%', size: 'small' },    // vasen
      { left: '40%', size: 'small' },   // oikea
      { left: '10%', size: 'medium' },   // vasen
      { left: '35%', size: 'large' },   // oikea
      { left: '1%', size: 'small' },   // vasen
      { left: '42%', size: 'small' },   // oikea
      { left: '15%', size: 'large' },   // vasen
      { left: '38%', size: 'medium' },   // oikea
      { left: '7%', size: 'medium' },   // vasen
      { left: '32%', size: 'small' },   // oikea
      { left: '4%', size: 'large' },   // vasen
      { left: '45%', size: 'medium' },   // oikea
    ]
    return positions[index % positions.length]
  })

  return (
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
            small: 'w-[50vw] md:w-[32vw] lg:w-[24vw] aspect-[16/9]',
            medium: 'w-[65vw] md:w-[42vw] lg:w-[34vw] aspect-[16/9]',
            large: 'w-[75vw] md:w-[52vw] lg:w-[42vw] aspect-[16/9]',
          }

          return (
            <div
              key={project.id}
              ref={(el) => { if (el) imagesRef.current[idx] = el }}
              className={`absolute ${sizeClasses[config.size as keyof typeof sizeClasses]} img-${config.size}`}
              style={{ 
                left: config.left,
                top: 0,
              }}
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
  )
}

