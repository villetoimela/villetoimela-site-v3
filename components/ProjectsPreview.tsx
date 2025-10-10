'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const ProjectsPreview = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !titleRef.current || !gridRef.current) return

    const ctx = gsap.context(() => {
      // Create timeline for background color transitions
      gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          markers: false,
          onUpdate: (self) => {
            const progress = self.progress
            if (progress < 0.15) {
              // Before section - keep dark
              gsap.to('html', {
                backgroundColor: '#000000',
                duration: 0,
              })
              gsap.to(titleRef.current, {
                color: '#ffffff',
                duration: 0,
              })
            } else if (progress < 0.25) {
              // Entering section - transition to light (faster transition)
              const lightProgress = (progress - 0.15) / 0.1
              gsap.to('html', {
                backgroundColor: gsap.utils.interpolate('#000000', '#fafafa', lightProgress),
                duration: 0,
              })
              gsap.to(titleRef.current, {
                color: gsap.utils.interpolate('#ffffff', '#000000', lightProgress),
                duration: 0,
              })
            } else if (progress > 0.85) {
              // Leaving section - transition to dark (faster transition)
              const darkProgress = (progress - 0.85) / 0.15
              gsap.to('html', {
                backgroundColor: gsap.utils.interpolate('#fafafa', '#000000', darkProgress),
                duration: 0,
              })
              gsap.to(titleRef.current, {
                color: gsap.utils.interpolate('#000000', '#ffffff', darkProgress),
                duration: 0,
              })
            } else {
              // Middle of section - keep light
              gsap.to('html', {
                backgroundColor: '#fafafa',
                duration: 0,
              })
              gsap.to(titleRef.current, {
                color: '#000000',
                duration: 0,
              })
            }
          },
        },
      })

      // Animate title with more dramatic effect
      const titleLines = titleRef.current!.querySelectorAll('.title-line')
      gsap.from(titleLines, {
        y: 150,
        opacity: 0,
        rotationX: -90,
        duration: 1.4,
        stagger: 0.2,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top 80%',
        },
      })

      // Animate project items with enhanced movement
      const items = gridRef.current!.querySelectorAll('.project-item')

      items.forEach((item, index) => {
        // More dramatic entrance animations
        const direction = index % 3 === 0 ? -150 : index % 3 === 1 ? 150 : 0
        const yOffset = index % 2 === 0 ? 120 : 180
        const rotation = index % 3 === 0 ? -8 : index % 3 === 1 ? 8 : 0

        gsap.from(item, {
          x: direction,
          y: yOffset,
          opacity: 0,
          scale: 0.7,
          rotation: rotation,
          duration: 1.6,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
          },
        })

        // Enhanced parallax effect on scroll
        gsap.to(item, {
          y: index % 2 === 0 ? -80 : -120,
          ease: 'none',
          scrollTrigger: {
            trigger: item,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        })

        // Inner image parallax with rotation
        const img = item.querySelector('.project-image')
        if (img) {
          gsap.to(img, {
            scale: 1.2,
            rotation: index % 2 === 0 ? 2 : -2,
            ease: 'none',
            scrollTrigger: {
              trigger: item,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5,
            },
          })
        }

        // Add subtle rotation on scroll
        gsap.to(item, {
          rotation: index % 2 === 0 ? 2 : -2,
          ease: 'none',
          scrollTrigger: {
            trigger: item,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2,
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Placeholder projects - later replace with real data
  const projects = [
    { id: 1, title: 'E-commerce Platform', color: 'from-purple-500/30 to-pink-500/30', row: 1 },
    { id: 2, title: 'SaaS Dashboard', color: 'from-blue-500/30 to-cyan-500/30', row: 1 },
    { id: 3, title: 'Mobile App Design', color: 'from-orange-500/30 to-red-500/30', row: 2 },
    { id: 4, title: 'Brand Identity', color: 'from-green-500/30 to-emerald-500/30', row: 2 },
    { id: 5, title: 'Portfolio Website', color: 'from-indigo-500/30 to-purple-500/30', row: 2 },
    { id: 6, title: 'Marketing Platform', color: 'from-yellow-500/30 to-orange-500/30', row: 3 },
    { id: 7, title: 'Creative Agency Site', color: 'from-teal-500/30 to-cyan-500/30', row: 3 },
    { id: 8, title: 'Tech Startup Landing', color: 'from-rose-500/30 to-pink-500/30', row: 4 },
  ]

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen py-32 overflow-hidden"
    >
      {/* Background gradient effects - now subtle on light bg */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-[150px]" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Title */}
        <h2
          ref={titleRef}
          className="text-5xl md:text-7xl font-light mb-20 text-center perspective-[1000px]"
        >
          <span className="title-line block">
            Sneak peek to some of
          </span>
          <span className="title-line block mt-2">
            my projects
          </span>
        </h2>

        {/* Projects Grid */}
        <div ref={gridRef} className="space-y-8 md:space-y-12">
          {/* Row 1: 2 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {projects.filter(p => p.row === 1).map((project) => (
              <div key={project.id} className="project-item group">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-white to-zinc-100 border border-black/10 shadow-lg">
                {/* Image placeholder with gradient */}
                <div
                  className={`project-image absolute inset-0 bg-gradient-to-br ${project.color} opacity-60 transition-opacity duration-500 group-hover:opacity-80`}
                />

                {/* Overlay with project title */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-white/95 via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <h3 className="text-2xl font-bold text-zinc-900 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    {project.title}
                  </h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mt-3 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>

                {/* Corner accent */}
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Index number */}
              <div className="mt-4 text-zinc-400 font-mono text-sm">
                {String(project.id).padStart(2, '0')}
              </div>
            </div>
            ))}
          </div>

          {/* Row 2: 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {projects.filter(p => p.row === 2).map((project) => (
              <div key={project.id} className="project-item group">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-white to-zinc-100 border border-black/10 shadow-lg">
                {/* Image placeholder with gradient */}
                <div
                  className={`project-image absolute inset-0 bg-gradient-to-br ${project.color} opacity-60 transition-opacity duration-500 group-hover:opacity-80`}
                />

                {/* Overlay with project title */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-white/95 via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <h3 className="text-2xl font-bold text-zinc-900 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    {project.title}
                  </h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mt-3 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>

                {/* Corner accent */}
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Index number */}
              <div className="mt-4 text-zinc-400 font-mono text-sm">
                {String(project.id).padStart(2, '0')}
              </div>
            </div>
            ))}
          </div>

          {/* Row 3: 2 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {projects.filter(p => p.row === 3).map((project) => (
              <div key={project.id} className="project-item group">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-white to-zinc-100 border border-black/10 shadow-lg">
                {/* Image placeholder with gradient */}
                <div
                  className={`project-image absolute inset-0 bg-gradient-to-br ${project.color} opacity-60 transition-opacity duration-500 group-hover:opacity-80`}
                />

                {/* Overlay with project title */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-white/95 via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <h3 className="text-2xl font-bold text-zinc-900 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    {project.title}
                  </h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mt-3 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>

                {/* Corner accent */}
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Index number */}
              <div className="mt-4 text-zinc-400 font-mono text-sm">
                {String(project.id).padStart(2, '0')}
              </div>
            </div>
            ))}
          </div>

          {/* Row 4: 1 card centered */}
          <div className="flex justify-center">
            <div className="w-full md:w-1/2">
              {projects.filter(p => p.row === 4).map((project) => (
                <div key={project.id} className="project-item group">
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-white to-zinc-100 border border-black/10 shadow-lg">
                  {/* Image placeholder with gradient */}
                  <div
                    className={`project-image absolute inset-0 bg-gradient-to-br ${project.color} opacity-60 transition-opacity duration-500 group-hover:opacity-80`}
                  />

                  {/* Overlay with project title */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-white/95 via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <h3 className="text-2xl font-bold text-zinc-900 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      {project.title}
                    </h3>
                    <div className="w-12 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mt-3 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </div>

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>

                  {/* Corner accent */}
                  <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Index number */}
                <div className="mt-4 text-zinc-400 font-mono text-sm">
                  {String(project.id).padStart(2, '0')}
                </div>
              </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom decorative element */}
        <div className="mt-32 flex justify-center">
          <div className="w-px h-24 bg-gradient-to-b from-black/20 to-transparent" />
        </div>
      </div>
    </section>
  )
}

export default ProjectsPreview
