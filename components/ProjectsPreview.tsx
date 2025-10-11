'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { projects } from '@/data/projects'

gsap.registerPlugin(ScrollTrigger)

const ProjectsPreview = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const track1Ref = useRef<HTMLDivElement>(null)
  const track2Ref = useRef<HTMLDivElement>(null)

  // Split featured projects into two tracks
  const allFeatured = projects.filter(p => p.featured)
  const track1Featured = allFeatured.slice(0, 6)
  const track2Featured = allFeatured.slice(6, 12)

  // Duplicate projects for seamless loop
  const track1Projects = [...track1Featured, ...track1Featured]
  const track2Projects = [...track2Featured, ...track2Featured]

  useEffect(() => {
    if (!sectionRef.current || !track1Ref.current || !track2Ref.current) return

    const ctx = gsap.context(() => {
      // Set initial state for title
      gsap.set('.showcase-title', {
        opacity: 0,
        y: 50,
      })

      // Animate title
      gsap.to('.showcase-title', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 30%',
          end: 'top top',
          scrub: 1,
        },
      })

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

      // Set initial state for project cards
      gsap.set('.track1-card', {
        opacity: 0,
        y: 50,
      })

      gsap.set('.track2-card', {
        opacity: 0,
        y: 50,
      })

      // Animate track 1 cards in
      gsap.to('.track1-card', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 30%',
          end: 'top top',
          scrub: 1,
        },
      })

      // Animate track 2 cards in (slight delay)
      gsap.to('.track2-card', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 25%',
          end: 'top top',
          scrub: 1,
        },
      })

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
                  <a
                    key={`track1-${index}`}
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-card track1-card flex-shrink-0 w-[400px] h-[225px] rounded-2xl overflow-hidden border border-white/10 cursor-pointer group"
                  >
                    <div className="relative w-full h-full">
                      {/* Project Image */}
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transition-all duration-700 brightness-50 group-hover:brightness-100"
                        sizes="400px"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                      {/* Content */}
                      <div className="relative h-full p-8 flex flex-col justify-between">
                        <div className="flex flex-wrap gap-2">
                          {project.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs text-blue-300 border border-blue-400/30 rounded-full backdrop-blur-sm bg-blue-950/30"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div>
                          <h3 className="text-2xl font-light text-white mb-2 group-hover:translate-x-2 transition-transform duration-500">
                            {project.title}
                          </h3>
                        </div>
                      </div>

                      {/* Hover glow effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <div className="absolute inset-0 border-2 border-blue-400/50 rounded-2xl" />
                      </div>
                    </div>
                  </a>
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
                  <a
                    key={`track2-${index}`}
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-card track2-card flex-shrink-0 w-[400px] h-[225px] rounded-2xl overflow-hidden border border-white/10 cursor-pointer group"
                  >
                    <div className="relative w-full h-full">
                      {/* Project Image */}
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transition-all duration-700 brightness-50 group-hover:brightness-100"
                        sizes="400px"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                      {/* Content */}
                      <div className="relative h-full p-8 flex flex-col justify-between">
                        <div className="flex flex-wrap gap-2">
                          {project.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs text-blue-300 border border-blue-400/30 rounded-full backdrop-blur-sm bg-blue-950/30"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div>
                          <h3 className="text-2xl font-light text-white mb-2 group-hover:translate-x-2 transition-transform duration-500">
                            {project.title}
                          </h3>
                        </div>
                      </div>

                      {/* Hover glow effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <div className="absolute inset-0 border-2 border-blue-400/50 rounded-2xl" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProjectsPreview
