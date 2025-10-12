'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ZoomDiveNew() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const text = textRef.current
    const background = backgroundRef.current
    
    if (!section || !text || !background) return

    // Simple approach: just animate text scale and background
    // No complex canvas or pinning conflicts
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        pin: true,
        pinSpacing: true,
      }
    })

    // Zoom and fade text
    tl.to(text, {
      scale: 5,
      opacity: 0,
      ease: 'power2.in'
    })

    // Animate background stars
    tl.to(background, {
      scale: 2,
      opacity: 0.5,
      ease: 'power2.in'
    }, 0) // Start at same time as text

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === section) {
          trigger.kill()
        }
      })
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative bg-black overflow-hidden h-screen"
    >
      {/* Animated starfield background using CSS only */}
      <div 
        ref={backgroundRef}
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(2px 2px at 20% 30%, white, transparent),
            radial-gradient(2px 2px at 60% 70%, white, transparent),
            radial-gradient(1px 1px at 50% 50%, white, transparent),
            radial-gradient(1px 1px at 80% 10%, white, transparent),
            radial-gradient(2px 2px at 90% 60%, white, transparent),
            radial-gradient(1px 1px at 33% 80%, white, transparent),
            radial-gradient(1px 1px at 70% 90%, white, transparent),
            radial-gradient(2px 2px at 15% 60%, white, transparent),
            radial-gradient(1px 1px at 45% 20%, white, transparent),
            radial-gradient(1px 1px at 85% 85%, white, transparent)
          `,
          backgroundSize: '200% 200%, 200% 200%, 300% 300%, 250% 250%, 200% 200%, 300% 300%, 250% 250%, 200% 200%, 300% 300%, 200% 200%',
          backgroundPosition: '0 0, 40% 60%, 10% 30%, 70% 20%, 80% 70%, 20% 90%, 60% 10%, 10% 50%, 50% 80%, 90% 30%',
        }}
      />

      {/* Vignette effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, transparent 0%, rgba(0,0,0,0.8) 100%)',
        }}
      />

      {/* Center text */}
      <div
        ref={textRef}
        className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
      >
        <div className="text-center">
          <h2
            className="text-7xl md:text-9xl lg:text-[12rem] font-light text-white"
            style={{ fontFamily: 'var(--font-space-grotesk)', lineHeight: 0.9 }}
          >
            Check out<br /> my work
          </h2>
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
            <p
              className="text-lg md:text-xl text-gray-400 tracking-widest"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              DIVE IN
            </p>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  )
}

