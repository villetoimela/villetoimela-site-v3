'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ZoomDive() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const centerTextRef = useRef<HTMLDivElement>(null)
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null)

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
    }> = []

    const starCount = 800

    // Initialize stars
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * 2000,
        initialZ: 0,
      })
      stars[i].initialZ = stars[i].z
    }

    let animationProgress = 0
    let lastProgress = 0

    // Render function - only updates visual representation
    const render = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Calculate speed based on scroll progress change (exponential curve for acceleration)
      const progressDelta = animationProgress - lastProgress
      const speed = Math.abs(progressDelta) * 100 * (1 + animationProgress * 2) // Speed increases as you scroll

      stars.forEach((star) => {
        // Only update Z position based on scroll direction
        if (progressDelta !== 0) {
          star.z -= progressDelta * 2000 * (1 + animationProgress * 2)

          // Reset star if it goes behind camera or too far
          if (star.z <= 0) {
            star.z = 2000
            star.x = Math.random() * canvas.width - canvas.width / 2
            star.y = Math.random() * canvas.height - canvas.height / 2
          } else if (star.z > 2000) {
            star.z = 1
            star.x = Math.random() * canvas.width - canvas.width / 2
            star.y = Math.random() * canvas.height - canvas.height / 2
          }
        }

        // Project 3D position to 2D
        const scale = 1000 / star.z
        const x2d = star.x * scale + centerX
        const y2d = star.y * scale + centerY

        // Calculate star size based on depth
        const size = (1 - star.z / 2000) * 3

        // Calculate brightness based on depth and progress
        const brightness = Math.min(1, (1 - star.z / 2000) * (1 + animationProgress))

        // Draw star with trail effect
        const gradient = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, size * 2)
        gradient.addColorStop(0, `rgba(255, 255, 255, ${brightness})`)
        gradient.addColorStop(0.4, `rgba(160, 230, 255, ${brightness * 0.6})`)
        gradient.addColorStop(1, 'rgba(140, 210, 255, 0)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x2d, y2d, size, 0, Math.PI * 2)
        ctx.fill()

        // Draw motion trail when moving fast
        if (speed > 0.5 && progressDelta !== 0) {
          const trailDistance = progressDelta * 2000 * (1 + animationProgress * 2)
          const prevZ = star.z + trailDistance
          if (prevZ > 0 && prevZ < 2000) {
            const prevScale = 1000 / prevZ
            const prevX = star.x * prevScale + centerX
            const prevY = star.y * prevScale + centerY

            const trailGradient = ctx.createLinearGradient(prevX, prevY, x2d, y2d)
            trailGradient.addColorStop(0, 'rgba(160, 230, 255, 0)')
            trailGradient.addColorStop(1, `rgba(160, 230, 255, ${brightness * 0.3})`)

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
      requestAnimationFrame(render)
    }

    render()

    // GSAP ScrollTrigger animation - creates virtual scroll height
    const scrollDistance = window.innerHeight * 2 // 2x viewport height of scroll

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: `+=${scrollDistance}`,
        scrub: 1,
        pin: true,
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

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      scrollTriggerRef.current?.kill()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative bg-black overflow-hidden h-screen"
    >
      {/* Canvas for star field */}
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
            My Work
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
