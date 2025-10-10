'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const TechStack = () => {
  const sectionRef = useRef<HTMLDivElement>(null)

  const technologies = [
    { name: 'TypeScript', color: '#3178C6' },
    { name: 'React', color: '#61DAFB' },
    { name: 'Next.js', color: '#FFFFFF' },
    { name: 'Node.js', color: '#339933' },
    { name: 'Tailwind CSS', color: '#06B6D4' },
    { name: 'GSAP', color: '#88CE02' },
    { name: 'Framer Motion', color: '#FF0055' },
    { name: 'Three.js', color: '#000000' },
    { name: 'PostgreSQL', color: '#4169E1' },
    { name: 'MongoDB', color: '#47A248' },
    { name: 'Git', color: '#F05032' },
    { name: 'Figma', color: '#F24E1E' },
  ]

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Animate title
      gsap.fromTo(
        '.tech-title',
        {
          y: 80,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      )

      // Animate tech items with stagger
      gsap.fromTo(
        '.tech-item',
        {
          opacity: 0,
          x: -50,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.05,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.tech-list',
            start: 'top 80%',
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative bg-black py-32 overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-green-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Title */}
        <div className="tech-title text-center mb-20">
          <p className="text-white/40 text-xs uppercase tracking-[0.3em] mb-4 font-light">
            Tech Stack
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-4">
            Technologies
          </h2>
          <p className="text-white/60 text-lg font-light">
            Tools and frameworks I work with
          </p>
        </div>

        {/* Tech List */}
        <div className="tech-list max-w-4xl mx-auto">
          {technologies.map((tech, index) => (
            <div
              key={tech.name}
              className="tech-item group relative"
            >
              {/* Line separator */}
              <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />

              {/* Tech row */}
              <div className="relative py-8 cursor-pointer overflow-hidden">
                {/* Background gradient on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms]"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${tech.color}15 50%, transparent 100%)`,
                  }}
                />

                {/* Animated background bar */}
                <div
                  className="absolute inset-y-0 left-0 w-0 group-hover:w-full transition-all duration-500 ease-out"
                  style={{
                    background: `linear-gradient(90deg, ${tech.color}08 0%, ${tech.color}12 100%)`,
                  }}
                />

                {/* Content */}
                <div className="relative flex items-center justify-between">
                  {/* Tech name */}
                  <h3 className="text-3xl md:text-5xl lg:text-6xl font-light text-white group-hover:translate-x-4 transition-transform duration-[400ms]">
                    {tech.name}
                  </h3>

                  {/* Number */}
                  <div className="text-white/20 font-mono text-sm group-hover:text-white/40 transition-colors duration-[400ms]">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>

                {/* Color accent line */}
                <div
                  className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 ease-out"
                  style={{ backgroundColor: tech.color }}
                />

                {/* Glow effect on hover */}
                <div
                  className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms] blur-sm"
                  style={{
                    backgroundColor: tech.color,
                    boxShadow: `0 0 20px ${tech.color}`,
                  }}
                />
              </div>

              {/* Last item bottom line */}
              {index === technologies.length - 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
              )}
            </div>
          ))}
        </div>

        {/* Bottom decorative element */}
        <div className="mt-32 flex justify-center">
          <div className="w-px h-24 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </div>
    </section>
  )
}

export default TechStack
