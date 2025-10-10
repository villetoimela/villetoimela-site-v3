'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const ProjectsPreview = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const track1Ref = useRef<HTMLDivElement>(null)
  const track2Ref = useRef<HTMLDivElement>(null)

  const projects = [
    {
      id: 1,
      title: 'E-commerce Platform',
      year: '2024',
      color: '#8B5CF6',
    },
    {
      id: 2,
      title: 'SaaS Dashboard',
      year: '2024',
      color: '#3B82F6',
    },
    {
      id: 3,
      title: 'Mobile App Design',
      year: '2023',
      color: '#EF4444',
    },
    {
      id: 4,
      title: 'Brand Identity',
      year: '2023',
      color: '#10B981',
    },
    {
      id: 5,
      title: 'Portfolio Website',
      year: '2024',
      color: '#6366F1',
    },
    {
      id: 6,
      title: 'Marketing Platform',
      year: '2023',
      color: '#F59E0B',
    },
  ]

  // Duplicate projects for seamless loop
  const track1Projects = [...projects, ...projects]
  const track2Projects = [...projects, ...projects]

  useEffect(() => {
    if (!sectionRef.current || !track1Ref.current || !track2Ref.current) return

    const ctx = gsap.context(() => {
      // Animate title
      gsap.fromTo(
        '.showcase-title',
        {
          y: 100,
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

      // First track - scroll left (top-left to bottom-right)
      gsap.to(track1Ref.current, {
        x: '-50%',
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      })

      // Second track - scroll right (top-right to bottom-left)
      gsap.fromTo(
        track2Ref.current,
        {
          x: '-50%',
        },
        {
          x: '0%',
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      )

      // Animate individual cards on hover
      const cards = sectionRef.current?.querySelectorAll('.project-card')
      cards?.forEach((card) => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            scale: 1.05,
            duration: 0.4,
            ease: 'power2.out',
          })
        })

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            scale: 1,
            duration: 0.4,
            ease: 'power2.out',
          })
        })
      })
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
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Title */}
        <div className="showcase-title text-center mb-32">
          <p className="text-white/40 text-xs uppercase tracking-[0.3em] mb-4 font-light">
            Recent Work
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-4">
            Quick Showcase
          </h2>
          <p className="text-white/60 text-lg font-light">
            A glimpse of my recent projects
          </p>
        </div>

        {/* Diagonal scrolling tracks */}
        <div className="relative h-[600px]">
          {/* Track 1 - Top-left to bottom-right, scrolls left */}
          <div className="absolute top-0 left-0 w-full origin-top-left rotate-[8deg] translate-x-[5%] translate-y-[5%]">
            <div className="relative overflow-hidden">
              {/* Fade gradient mask */}
              <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-r from-black via-transparent to-black" />
              <div
                ref={track1Ref}
                className="flex gap-6"
                style={{ width: 'fit-content' }}
              >
                {track1Projects.map((project, index) => (
                  <div
                    key={`track1-${index}`}
                    className="project-card flex-shrink-0 w-[400px] h-[280px] rounded-2xl overflow-hidden border border-white/10 cursor-pointer group"
                  >
                    <div className="relative w-full h-full">
                      {/* Background gradient */}
                      <div
                        className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                        style={{
                          background: `linear-gradient(135deg, ${project.color}33 0%, ${project.color}11 100%)`,
                        }}
                      />

                      {/* Grid overlay */}
                      <div
                        className="absolute inset-0 opacity-[0.05]"
                        style={{
                          backgroundImage: `linear-gradient(${project.color} 1px, transparent 1px), linear-gradient(90deg, ${project.color} 1px, transparent 1px)`,
                          backgroundSize: '30px 30px',
                        }}
                      />

                      {/* Content */}
                      <div className="relative h-full p-8 flex flex-col justify-between">
                        <div className="text-white/40 text-xs font-mono tracking-wider">
                          {project.year}
                        </div>

                        <div>
                          <h3 className="text-3xl font-light text-white mb-2 group-hover:translate-x-2 transition-transform duration-500">
                            {project.title}
                          </h3>
                          <div
                            className="w-16 h-0.5 transition-all duration-500 group-hover:w-24"
                            style={{ backgroundColor: project.color }}
                          />
                        </div>

                        {/* Project number */}
                        <div
                          className="absolute top-8 right-8 text-6xl font-light opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                          style={{ color: project.color }}
                        >
                          {String(project.id).padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Track 2 - Top-right to bottom-left, scrolls right */}
          <div className="absolute top-0 right-0 w-full origin-top-right -rotate-[8deg] translate-x-[-5%] translate-y-[35%]">
            <div className="relative overflow-hidden">
              {/* Fade gradient mask */}
              <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-r from-black via-transparent to-black" />
              <div
                ref={track2Ref}
                className="flex gap-6"
                style={{ width: 'fit-content' }}
              >
                {track2Projects.map((project, index) => (
                  <div
                    key={`track2-${index}`}
                    className="project-card flex-shrink-0 w-[400px] h-[280px] rounded-2xl overflow-hidden border border-white/10 cursor-pointer group"
                  >
                    <div className="relative w-full h-full">
                      {/* Background gradient */}
                      <div
                        className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                        style={{
                          background: `linear-gradient(135deg, ${project.color}33 0%, ${project.color}11 100%)`,
                        }}
                      />

                      {/* Grid overlay */}
                      <div
                        className="absolute inset-0 opacity-[0.05]"
                        style={{
                          backgroundImage: `linear-gradient(${project.color} 1px, transparent 1px), linear-gradient(90deg, ${project.color} 1px, transparent 1px)`,
                          backgroundSize: '30px 30px',
                        }}
                      />

                      {/* Content */}
                      <div className="relative h-full p-8 flex flex-col justify-between">
                        <div className="text-white/40 text-xs font-mono tracking-wider">
                          {project.year}
                        </div>

                        <div>
                          <h3 className="text-3xl font-light text-white mb-2 group-hover:translate-x-2 transition-transform duration-500">
                            {project.title}
                          </h3>
                          <div
                            className="w-16 h-0.5 transition-all duration-500 group-hover:w-24"
                            style={{ backgroundColor: project.color }}
                          />
                        </div>

                        {/* Project number */}
                        <div
                          className="absolute top-8 right-8 text-6xl font-light opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                          style={{ color: project.color }}
                        >
                          {String(project.id).padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom text */}
        <div className="mt-32 text-center">
          <p className="text-white/40 text-sm">
            View all projects →
          </p>
        </div>
      </div>
    </section>
  )
}

export default ProjectsPreview
