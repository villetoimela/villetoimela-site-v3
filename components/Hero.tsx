'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { useLoader } from './LoaderWrapper'
import FloatingCanvasParticles from './FloatingCanvasParticles'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const isLoaded = useLoader()
  const heroRef = useRef<HTMLDivElement>(null)

  // GSAP Animations - only start when loader is complete
  useEffect(() => {
    if (!isLoaded) return

    const ctx = gsap.context(() => {
      // All name lines animation (I Am, Ville, Toimela)
      gsap.fromTo('.hero-name-line',
        {
          opacity: 0,
          y: 120,
          rotateX: 45,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: 'power4.out',
          delay: 0.15,
        }
      )

      // Subtitle description
      gsap.fromTo('.hero-subtitle',
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          delay: 1.0,
        }
      )

      // Info items (faster)
      gsap.fromTo('.hero-info',
        {
          opacity: 0,
          x: -20,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power3.out',
          delay: 0.9,
        }
      )


      // Parallax on scroll
      gsap.to('.hero-content', {
        y: -100,
        opacity: 0.3,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      })

      // Bottom info parallax effect
      gsap.to('.hero-bottom-info', {
        y: -100,
        opacity: 0.3,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      })

      // Canvas stays visible - no scroll effect
      // Removed canvas ScrollTrigger to keep it visible
    }, heroRef)

    return () => {
      ctx.revert()
      ScrollTrigger.getAll().forEach(st => st.kill())
    }
  }, [isLoaded])

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
      suppressHydrationWarning
      style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s ease-out' }}
    >
      {/* Animated gradient orbs in background - More visible in hero */}
      <motion.div
        className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-25 blur-3xl hidden md:block"
        style={{
          background: 'radial-gradient(circle, rgba(100, 180, 255, 0.6) 0%, rgba(80, 150, 255, 0.3) 50%, transparent 70%)',
        }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: isLoaded ? 0.35 : 0,
          x: isLoaded ? ['-10%', '10%', '-10%'] : 0,
          y: isLoaded ? ['-5%', '5%', '-5%'] : 0,
          scale: isLoaded ? [1, 1.1, 1] : 1,
        }}
        transition={{
          opacity: { duration: 1 },
          x: { duration: 20, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 20, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 20, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      <motion.div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl hidden md:block"
        style={{
          background: 'radial-gradient(circle, rgba(120, 200, 255, 0.5) 0%, rgba(100, 180, 255, 0.25) 50%, transparent 70%)',
        }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: isLoaded ? 0.3 : 0,
          x: isLoaded ? ['10%', '-10%', '10%'] : 0,
          y: isLoaded ? ['5%', '-5%', '5%'] : 0,
          scale: isLoaded ? [1, 1.15, 1] : 1,
        }}
        transition={{
          opacity: { duration: 1, delay: 0.2 },
          x: { duration: 25, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 25, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 25, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      <motion.div
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full opacity-23 blur-3xl hidden md:block"
        style={{
          background: 'radial-gradient(circle, rgba(150, 220, 255, 0.5) 0%, rgba(120, 200, 255, 0.28) 50%, transparent 70%)',
        }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: isLoaded ? 0.28 : 0,
          x: isLoaded ? ['-15%', '15%', '-15%'] : 0,
          y: isLoaded ? ['10%', '-10%', '10%'] : 0,
          scale: isLoaded ? [1, 1.2, 1] : 1,
        }}
        transition={{
          opacity: { duration: 1, delay: 0.4 },
          x: { duration: 18, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 18, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 18, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Floating particles - Canvas based for better performance */}
      {typeof window !== 'undefined' && (
        <FloatingCanvasParticles particleCount={25} />
      )}

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/10 to-black/60 pointer-events-none" />

      {/* Mobile Top Info - Fixed at top */}
      <div className="absolute top-4 left-4 right-4 z-30 md:hidden">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {/* Languages */}
          <div className="hero-info">
            <div className="text-[9px] text-gray-500 tracking-[0.25em] font-mono mb-1 uppercase" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
              Languages
            </div>
            <div className="text-[11px] text-gray-400 font-mono space-y-0.5">
              <div style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>Finnish</div>
              <div style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>English</div>
            </div>
          </div>

          {/* Based in */}
          <div className="hero-info text-right">
            <div className="text-[9px] text-gray-500 tracking-[0.25em] font-mono mb-1 uppercase" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
              Based in
            </div>
            <div className="text-[11px] text-gray-400 font-mono" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
              Finland
            </div>
          </div>

          {/* Contact */}
          <div className="hero-info">
            <div className="text-[9px] text-gray-500 tracking-[0.25em] font-mono mb-1 uppercase" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
              Contact
            </div>
            <div className="text-[11px] text-gray-400 font-mono space-y-0.5">
              <a href="mailto:ville.toimela@gmail.com" className="block hover:text-gray-300 transition-colors cursor-pointer" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>Email</a>
              <a href="tel:+358405137883" className="block hover:text-gray-300 transition-colors cursor-pointer" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>Phone</a>
            </div>
          </div>

          {/* Links */}
          <div className="hero-info text-right">
            <div className="text-[9px] text-gray-500 tracking-[0.25em] font-mono mb-1 uppercase" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
              Links
            </div>
            <div className="text-[11px] text-gray-400 font-mono space-y-0.5">
              <a href="https://github.com/villetoimela" target="_blank" rel="noopener noreferrer" className="block hover:text-gray-300 transition-colors cursor-pointer" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>GitHub</a>
              <a href="https://fi.linkedin.com/in/villetoimela" target="_blank" rel="noopener noreferrer" className="block hover:text-gray-300 transition-colors cursor-pointer" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>LinkedIn</a>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="hero-content relative z-10 w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-20">

        {/* Desktop: Top Info Bar in corners */}
        <div className="absolute top-10 left-12 lg:left-20 right-12 lg:right-20 hidden md:flex justify-between items-start z-30">
          {/* Top Left - Languages & Contact */}
          <div className="flex flex-col gap-6">
            <div className="hero-info">
              <div className="text-[10px] text-gray-500 tracking-[0.25em] font-mono mb-2 uppercase" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
                Languages
              </div>
              <div className="text-xs text-gray-400 font-mono space-y-1">
                <div style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>Finnish</div>
                <div style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>English</div>
              </div>
            </div>

            <div className="hero-info">
              <div className="text-[10px] text-gray-500 tracking-[0.25em] font-mono mb-2 uppercase" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
                Contact
              </div>
              <div className="text-xs text-gray-400 font-mono space-y-1">
                <a href="mailto:ville.toimela@gmail.com" className="block hover:text-gray-300 transition-colors cursor-pointer" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>Email</a>
                <a href="tel:+358405137883" className="block hover:text-gray-300 transition-colors cursor-pointer" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>Phone</a>
              </div>
            </div>
          </div>

          {/* Top Right - Based in & Links */}
          <div className="flex flex-col gap-6 text-right">
            <div className="hero-info">
              <div className="text-[10px] text-gray-500 tracking-[0.25em] font-mono mb-1 uppercase" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
                Based in
              </div>
              <div className="text-xs text-gray-400 font-mono" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
                Finland
              </div>
            </div>

            <div className="hero-info">
              <div className="text-[10px] text-gray-500 tracking-[0.25em] font-mono mb-2 uppercase" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
                Links
              </div>
              <div className="text-xs text-gray-400 font-mono space-y-1">
                <a href="https://github.com/villetoimela" target="_blank" rel="noopener noreferrer" className="block hover:text-gray-300 transition-colors cursor-pointer" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>GitHub</a>
                <a href="https://fi.linkedin.com/in/villetoimela" target="_blank" rel="noopener noreferrer" className="block hover:text-gray-300 transition-colors cursor-pointer" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>LinkedIn</a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Title */}
        <div className="text-center" style={{ perspective: '2000px' }}>
          <h1 className="leading-[0.85] mb-8 md:mb-10 lg:mb-14">
            <div
              className="hero-name-line block text-[6vw] md:text-[5vw] lg:text-[4vw] font-light tracking-wide text-gray-400 mb-3 md:mb-4"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                transformStyle: 'preserve-3d',
              }}
            >
              I am
            </div>
            <div
              className="hero-name-line block text-[16vw] md:text-[14vw] lg:text-[12vw] font-bold tracking-[-0.02em] text-gray-50 mb-1 md:mb-2"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                transformStyle: 'preserve-3d',
              }}
            >
              VILLE
            </div>
            <div
              className="hero-name-line block text-[16vw] md:text-[14vw] lg:text-[12vw] font-bold tracking-[-0.02em] text-gray-50"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                transformStyle: 'preserve-3d',
              }}
            >
              TOIMELA
            </div>
          </h1>

          {/* Subtitle */}
          <div className="hero-subtitle w-full flex justify-center">
            <p
              className="text-base md:text-lg lg:text-xl text-gray-300 font-light leading-relaxed text-center max-w-3xl px-4"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5)',
              }}
            >
              Creative Web Developer specializing in building<br className="hidden sm:block" />
              exceptional digital experiences with modern technologies
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Info - 3 sections centered at bottom */}
      <div className="hero-bottom-info absolute bottom-6 md:bottom-10 left-0 right-0 z-30 flex justify-center">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            {/* Role */}
            <div className="hero-info text-center">
              <div className="text-[9px] md:text-[10px] text-gray-500 tracking-[0.25em] font-mono mb-2 uppercase" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
                Role
              </div>
              <div className="text-[11px] md:text-xs text-gray-400 font-mono" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
                Web Developer
              </div>
            </div>

            {/* Availability */}
            <div className="hero-info text-center">
              <div className="text-[9px] md:text-[10px] text-gray-500 tracking-[0.25em] font-mono mb-2 uppercase" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
                Availability
              </div>
              <div className="text-[11px] md:text-xs text-gray-400 font-mono flex items-center justify-center gap-2">
                <motion.div
                  className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                  animate={{
                    opacity: [1, 0.3, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
                <span style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>Open to work</span>
              </div>
            </div>

            {/* Interest */}
            <div className="hero-info text-center">
              <div className="text-[9px] md:text-[10px] text-gray-500 tracking-[0.25em] font-mono mb-2 uppercase" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
                Interest
              </div>
              <div className="text-[11px] md:text-xs text-gray-400 font-mono" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
                Modern Web Development
              </div>
            </div>
          </div>
      </div>
    </section>
  )
}
