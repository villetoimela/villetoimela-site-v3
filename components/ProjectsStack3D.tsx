'use client'

import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { projects as allProjects, Project } from '@/data/projects'

gsap.registerPlugin(ScrollTrigger)

interface ProjectsStack3DProps {
  projectIds?: string[]
}

export default function ProjectsStack3D({ projectIds }: ProjectsStack3DProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLAnchorElement[]>([])

  const selectedProjects: Project[] = useMemo(() => {
    if (projectIds && projectIds.length > 0) {
      const set = new Set(projectIds)
      return allProjects.filter(p => set.has(p.id)).slice(0, 5)
    }
    // Fallback: first 6 featured
    return allProjects.filter(p => p.featured).slice(0, 5)
  }, [projectIds])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      // Pin the section and drive the whole stacking with scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${window.innerHeight * 8}`,
          scrub: 1.2,
          pin: true,
          anticipatePin: 1,
        },
        defaults: { ease: 'power2.out' },
      })

      // Intro fade
      tl.from('.stack-title', { opacity: 0, y: 60, duration: 0.6 })
        // Allow extra scroll so the title reaches the very top before cards start
        .to({}, { duration: 1.0 })

      // For each card, bring it from above towards the ground and stack
      const depthPerCard = 80 // translateZ units
      const riseDistance = 400 // initial Y offset

      cardsRef.current.forEach((card, index) => {
        if (!card) return
        const zTarget = index * depthPerCard
        const yTarget = index * 4 - 60 // raise stack even higher overall
        const rotation = index % 2 === 0 ? -2.5 : 2.5

        gsap.set(card, {
          transformOrigin: '50% 50%',
          rotateX: 8,
          rotateZ: rotation,
          y: riseDistance,
          z: -200,
          opacity: 0,
        })

        tl.to(card, {
          opacity: 1,
          y: yTarget,
          z: zTarget,
          rotateX: 0,
          duration: 1.3,
        }, `>-${index === 0 ? 0 : 0.1}`) // slight overlap for flow

        // Add a small dwell so each card stays visible longer before next starts
        tl.to({}, { duration: 0.4 })
      })

      // Subtle camera push-in towards the end
      tl.to('.stack-scene', { perspective: 900 }, '>-0.2')
    }, sectionRef)

    return () => ctx.revert()
  }, [selectedProjects.length])

  return (
    <section ref={sectionRef} className="relative bg-black py-24 md:py-32 overflow-hidden">
      {/* Scene wrapper provides perspective */}
      <div className="stack-scene container mx-auto px-6" style={{ perspective: 1200 }}>
        {/* Title */}
        <div className="text-center mb-16">
          <p className="text-white/40 text-xs uppercase tracking-[0.3em] mb-3">Recent Work</p>
          <h2 className="stack-title text-4xl md:text-6xl lg:text-7xl font-light text-white">Featured Stack</h2>
        </div>

        {/* Ground plane */}
        <div className="relative mt-2 md:mt-4 lg:mt-6 h-[66vh] md:h-[70vh] lg:h-[72vh]" style={{ transformStyle: 'preserve-3d' }}>
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />

          {/* Cards */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
            {selectedProjects.map((project, idx) => (
              <a
                key={project.id}
                ref={(el) => { if (el) cardsRef.current[idx] = el }}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group absolute w-[74vw] md:w-[58vw] lg:w-[45vw] max-w-[760px] aspect-[16/9] rounded-3xl overflow-hidden border border-white/10 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.7)]"
                style={{ transformStyle: 'preserve-3d', willChange: 'transform, opacity' }}
              >
                <div className="absolute inset-0">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover brightness-[0.5] group-hover:brightness-[0.75] transition-all duration-500"
                    sizes="(max-width: 768px) 90vw, (max-width: 1280px) 70vw, 900px"
                    quality={70}
                    priority={idx === 0}
                  />
                </div>

                {/* Overlay gradient and content */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute left-0 right-0 bottom-0 p-5 md:p-7 flex items-end justify-between gap-4">
                  <h3 className="text-white text-xl md:text-2xl font-light">{project.title}</h3>
                  <div className="hidden md:flex flex-wrap gap-2">
                    {project.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-0.5 text-xs text-blue-300 border border-blue-400/20 rounded-full bg-blue-950/20">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Subtle rim light on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute inset-0 rounded-3xl ring-2 ring-blue-400/25" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


