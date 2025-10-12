'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ZoomDive() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const centerTextRef = useRef<HTMLDivElement>(null)
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const isVisibleRef = useRef(false)
  const animationFrameRef = useRef<number | null>(null)

  // Intersection Observer to track visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting)
          isVisibleRef.current = entry.isIntersecting
          console.log(`[ZoomDive] Visibility: ${entry.isIntersecting ? 'VISIBLE - rendering active' : 'HIDDEN - rendering paused'}`)
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

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    const centerText = centerTextRef.current
    if (!section || !canvas || !centerText) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Star field particles
    const stars: Array<{
      x: number
      y: number
      z: number
      initialZ: number
      offsetX: number
      offsetY: number
      speed: number
    }> = []

    // Significantly reduce stars on mobile for better performance
    const isMobileDevice = window.innerWidth < 768
    const starCount = isMobileDevice ? 200 : 600 // 800 -> 600 desktop, 200 mobile

    // Initialize stars
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * 2000,
        initialZ: 0,
        offsetX: Math.random() * Math.PI * 2,
        offsetY: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 0.5,
      })
      stars[i].initialZ = stars[i].z
    }

    let animationProgress = 0
    let lastProgress = 0
    let time = 0

    // Render function - only updates visual representation when visible
    const render = () => {
      // Skip rendering if not visible
      if (!isVisibleRef.current) {
        animationFrameRef.current = requestAnimationFrame(render)
        return
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Calculate speed based on scroll progress change (exponential curve for acceleration)
      const progressDelta = animationProgress - lastProgress
      const speed = Math.abs(progressDelta) * 100 * (1 + animationProgress * 2) // Speed increases as you scroll

      // Increment time for continuous movement
      time += 0.016 // ~60fps

      stars.forEach((star) => {
        // Continuous slow movement even when not scrolling
        const idleSpeed = 0.3 // Very slow continuous movement

        // Combine scroll movement with idle movement
        if (progressDelta !== 0) {
          // Fast scroll-based movement
          star.z -= progressDelta * 2000 * (1 + animationProgress * 2)
        } else {
          // Slow continuous movement when idle
          star.z -= idleSpeed
        }

        // Reset star if it goes behind camera or too far
        if (star.z <= 0) {
          star.z = 2000
          star.x = Math.random() * canvas.width - canvas.width / 2
          star.y = Math.random() * canvas.height - canvas.height / 2
          star.offsetX = Math.random() * Math.PI * 2
          star.offsetY = Math.random() * Math.PI * 2
        } else if (star.z > 2000) {
          star.z = 1
          star.x = Math.random() * canvas.width - canvas.width / 2
          star.y = Math.random() * canvas.height - canvas.height / 2
          star.offsetX = Math.random() * Math.PI * 2
          star.offsetY = Math.random() * Math.PI * 2
        }

        // Add subtle floating motion when idle
        const floatX = progressDelta === 0 ? Math.sin(time * star.speed + star.offsetX) * 2 : 0
        const floatY = progressDelta === 0 ? Math.cos(time * star.speed + star.offsetY) * 2 : 0

        // Project 3D position to 2D
        const scale = 1000 / star.z
        const x2d = (star.x + floatX) * scale + centerX
        const y2d = (star.y + floatY) * scale + centerY

        // Calculate star size based on depth
        const size = (1 - star.z / 2000) * 3

        // Calculate brightness based on depth and progress
        const brightness = Math.min(1, (1 - star.z / 2000) * (1 + animationProgress))

        // Draw star with trail effect
        const gradient = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, size * 2)
        gradient.addColorStop(0, `rgba(160, 230, 255, ${brightness})`)
        gradient.addColorStop(0.4, `rgba(120, 200, 255, ${brightness * 0.6})`)
        gradient.addColorStop(1, 'rgba(100, 180, 255, 0)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x2d, y2d, size, 0, Math.PI * 2)
        ctx.fill()

        // Draw motion trail when moving fast (disabled on mobile for performance)
        if (!isMobileDevice && speed > 0.5 && progressDelta !== 0) {
          const trailDistance = progressDelta * 2000 * (1 + animationProgress * 2)
          const prevZ = star.z + trailDistance
          if (prevZ > 0 && prevZ < 2000) {
            const prevScale = 1000 / prevZ
            const prevX = star.x * prevScale + centerX
            const prevY = star.y * prevScale + centerY

            const trailGradient = ctx.createLinearGradient(prevX, prevY, x2d, y2d)
            trailGradient.addColorStop(0, 'rgba(120, 200, 255, 0)')
            trailGradient.addColorStop(1, `rgba(120, 200, 255, ${brightness * 0.3})`)

            ctx.strokeStyle = trailGradient
            ctx.lineWidth = size * 0.5
            ctx.beginPath()
            ctx.moveTo(prevX, prevY)
            ctx.lineTo(x2d, y2d)
            ctx.stroke()
          }
        }
      })

      lastProgress = animationProgress
      animationFrameRef.current = requestAnimationFrame(render)
    }

    render()

    // GSAP ScrollTrigger animation - creates virtual scroll height
    const scrollDistance = isMobileDevice
      ? window.innerHeight * 1.5  // Shorter on mobile
      : window.innerHeight * 2

    const tl = gsap.timeline({
      scrollTrigger: {
        id: 'zoom-dive', // Unique ID to prevent conflicts
        trigger: section,
        start: 'top top',
        end: `+=${scrollDistance}`,
        scrub: 1,
        pin: true,
        pinSpacing: true,
        anticipatePin: 0, // Disable anticipatePin to prevent conflicts with other pinned sections
        invalidateOnRefresh: true,
        fastScrollEnd: true, // Prevent snapping issues
        preventOverlaps: true, // KEY FIX: Prevent this from overlapping with previous ScrollTriggers
        markers: isMobileDevice, // Show markers on mobile for debugging
        onUpdate: (self) => {
          animationProgress = self.progress
        },
      },
    })

    scrollTriggerRef.current = tl.scrollTrigger as ScrollTrigger

    // Animate center text
    tl.fromTo(
      centerText,
      {
        scale: 1,
        opacity: 1,
      },
      {
        scale: 5,
        opacity: 0,
        duration: 1,
        ease: 'power2.in',
      }
    )

    // Handle resize to refresh ScrollTrigger (important for mobile viewport changes)
    const handleResize = () => {
      resizeCanvas()
      ScrollTrigger.refresh()
    }

    // IMPORTANT: Listen to visualViewport changes (mobile URL bar hide/show)
    const handleVisualViewportResize = () => {
      console.log('[ZoomDive] visualViewport changed, refreshing ScrollTrigger')
      ScrollTrigger.refresh()
    }

    // Remove the initial resize listener that was added above
    window.removeEventListener('resize', resizeCanvas)
    // Add the new comprehensive resize handler
    window.addEventListener('resize', handleResize)

    // Add visualViewport listener for mobile URL bar changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportResize)
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportResize)
      }
      scrollTriggerRef.current?.kill()
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative bg-black overflow-hidden h-screen"
    >
      {/* Canvas for star field - keeps original zoom effect */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Center text that zooms away */}
      <div
        ref={centerTextRef}
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

      {/* Vignette effect for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, transparent 0%, rgba(0,0,0,0.8) 100%)',
        }}
      />
    </section>
  )
}
