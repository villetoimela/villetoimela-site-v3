'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import FloatingCanvasParticles from './FloatingCanvasParticles'

gsap.registerPlugin(ScrollTrigger)

const TechStack = () => {
  const sectionRef = useRef<HTMLDivElement>(null)

  const technologies = [
    { name: 'HTML', color: '#E34F26' },
    { name: 'CSS', color: '#1572B6' },
    { name: 'JavaScript', color: '#F7DF1E' },
    { name: 'Tailwind', color: '#06B6D4' },
    { name: 'React', color: '#61DAFB' },
    { name: 'PHP', color: '#777BB4' },
    { name: 'SCSS', color: '#CC6699' },
    { name: 'Next.js', color: '#FFFFFF' },
    { name: 'Git', color: '#F05032' },
    { name: 'WordPress', color: '#21759B' },
    { name: 'jQuery', color: '#0769AD' },
    { name: 'TypeScript', color: '#3178C6' },
    { name: 'SQL', color: '#4479A1' },
    { name: 'PostgreSQL', color: '#4169E1' },
    { name: 'Bootstrap', color: '#7952B3' },
    { name: 'GSAP', color: '#88CE02' },
    { name: 'NPM', color: '#CB3837' },
    { name: 'Yarn', color: '#2C8EBB' },
    { name: 'ACF', color: '#00D3AE' },
    { name: 'Gutenberg', color: '#00669B' },
    { name: 'HubSpot', color: '#FF7A59' },
    { name: 'REST API', color: '#00C7B7' },
    { name: 'AI', color: '#FF6B9D' },
    { name: 'UI/UX', color: '#9333EA' },
    { name: 'Web Design', color: '#8B5CF6' },
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
      {/* Animated gradient orbs in background */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl pointer-events-none hidden md:block"
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
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl pointer-events-none hidden md:block"
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
        className="absolute top-1/2 right-1/3 w-[350px] h-[350px] rounded-full opacity-10 blur-3xl pointer-events-none hidden md:block"
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

      {/* Floating particles - Canvas based for better performance */}
      {typeof window !== 'undefined' && window.innerWidth >= 768 && (
        <FloatingCanvasParticles particleCount={15} />
      )}

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
        <div className="tech-list max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12">
          {technologies.map((tech, index) => (
            <div
              key={tech.name}
              className="tech-item group relative"
            >
              {/* Line separator */}
              <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />

              {/* Tech row */}
              <div className="relative py-6 cursor-pointer overflow-hidden">
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
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-light text-white group-hover:translate-x-4 transition-transform duration-[400ms]">
                    {tech.name}
                  </h3>

                  {/* Number */}
                  <div className="text-white/20 font-mono text-xs group-hover:text-white/40 transition-colors duration-[400ms]">
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
