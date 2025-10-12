'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import emailjs from '@emailjs/browser'
import { motion } from 'framer-motion'
import FloatingCanvasParticles from './FloatingCanvasParticles'

gsap.registerPlugin(ScrollTrigger)

const ContactFooter = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  // GSAP Animations
  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Animate subtitle
      gsap.fromTo(
        '.contact-subtitle',
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 80%',
            once: true,
          },
        }
      )

      // Animate main title with 3D effect
      gsap.fromTo(
        '.contact-title',
        {
          opacity: 0,
          y: 60,
          rotateX: 45,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1.2,
          ease: 'power4.out',
          delay: 0.2,
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 80%',
            once: true,
          },
        }
      )

      // Animate description
      gsap.fromTo(
        '.contact-description',
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          delay: 0.4,
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 80%',
            once: true,
          },
        }
      )

      // Animate form
      gsap.fromTo(
        '.contact-form',
        {
          y: 80,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.contact-form',
            start: 'top 85%',
          },
        }
      )

      // Animate footer links
      gsap.fromTo(
        '.footer-link',
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.footer-links',
            start: 'top 90%',
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')

    try {
      // EmailJS configuration - replace with your actual values
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID'
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID'
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY'

      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
          to_email: 'ville.toimela@gmail.com',
        },
        publicKey
      )

      setStatus('success')
      setFormData({ name: '', email: '', message: '' })

      // Reset status after 3 seconds
      setTimeout(() => setStatus('idle'), 3000)
    } catch (error) {
      console.error('EmailJS error:', error)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <footer
      ref={sectionRef}
      className="relative bg-black py-32 overflow-hidden"
    >
      {/* Animated gradient orbs in background */}
      <motion.div
        className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl hidden md:block"
        style={{
          background: 'radial-gradient(circle, rgba(100, 180, 255, 0.4) 0%, rgba(80, 150, 255, 0.2) 50%, transparent 70%)',
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
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl hidden md:block"
        style={{
          background: 'radial-gradient(circle, rgba(120, 200, 255, 0.3) 0%, rgba(100, 180, 255, 0.15) 50%, transparent 70%)',
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
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl hidden md:block"
        style={{
          background: 'radial-gradient(circle, rgba(150, 220, 255, 0.35) 0%, rgba(120, 200, 255, 0.18) 50%, transparent 70%)',
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
        <FloatingCanvasParticles particleCount={20} />
      )}

      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Contact Section */}
        <div className="max-w-4xl mx-auto mb-32">
          {/* Title */}
          <div ref={titleRef} className="text-center mb-16" style={{ perspective: '1000px' }}>
            <p className="contact-subtitle text-white/40 text-xs uppercase tracking-[0.3em] mb-4 font-light">
              Get in Touch
            </p>
            <h2 className="contact-title text-4xl md:text-6xl lg:text-7xl font-light text-white mb-6" style={{ transformStyle: 'preserve-3d' }}>
              Let's work together
            </h2>
            <p className="contact-description text-white/60 text-lg font-light max-w-2xl mx-auto">
              I'm open to freelance projects and full-time positions.
              Got an idea or just want to chat? Send me a message!
            </p>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="contact-form space-y-6">
            {/* Name */}
            <div className="group">
              <label htmlFor="name" className="block text-white/60 text-sm mb-2 font-light">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-6 py-4 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors duration-300"
                placeholder="Your name"
              />
            </div>

            {/* Email */}
            <div className="group">
              <label htmlFor="email" className="block text-white/60 text-sm mb-2 font-light">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-6 py-4 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors duration-300"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Message */}
            <div className="group">
              <label htmlFor="message" className="block text-white/60 text-sm mb-2 font-light">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-6 py-4 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors duration-300 resize-none"
                placeholder="Tell me about your project..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="group relative w-full md:w-auto px-12 py-4 bg-white text-black font-medium rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">
                {status === 'sending' && 'Sending...'}
                {status === 'success' && 'Message Sent!'}
                {status === 'error' && 'Error! Try again'}
                {status === 'idle' && 'Send Message'}
              </span>

              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            {/* Status Messages */}
            {status === 'success' && (
              <p className="text-green-400 text-sm">
                Thanks! I'll get back to you soon.
              </p>
            )}
            {status === 'error' && (
              <p className="text-red-400 text-sm">
                Something went wrong. Please try again or email me directly.
              </p>
            )}
          </form>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-16" />

        {/* Footer Links */}
        <div className="footer-links max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            {/* Social */}
            <div className="footer-link">
              <h3 className="text-white/40 text-xs uppercase tracking-[0.3em] mb-4 font-light">
                Social
              </h3>
              <div className="space-y-2">
                <a href="https://github.com/villetoimela" target="_blank" rel="noopener noreferrer" className="block text-white/80 hover:text-white transition-colors duration-300">
                  GitHub
                </a>
                <a href="https://fi.linkedin.com/in/villetoimela" target="_blank" rel="noopener noreferrer" className="block text-white/80 hover:text-white transition-colors duration-300">
                  LinkedIn
                </a>
                <a href="https://www.instagram.com/villetoimela/" target="_blank" rel="noopener noreferrer" className="block text-white/80 hover:text-white transition-colors duration-300">
                  Instagram
                </a>
              </div>
            </div>

            {/* Contact */}
            <div className="footer-link">
              <h3 className="text-white/40 text-xs uppercase tracking-[0.3em] mb-4 font-light">
                Contact
              </h3>
              <div className="space-y-2">
                <a href="mailto:ville@example.com" className="block text-white/80 hover:text-white transition-colors duration-300">
                  ville.toimela@gmail.com
                </a>
                <p className="text-white/60">
                  Based in Finland
                </p>
              </div>
            </div>

            {/* Availability */}
            <div className="footer-link">
              <h3 className="text-white/40 text-xs uppercase tracking-[0.3em] mb-4 font-light">
                Availability
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/80">Open to work</span>
              </div>
              <p className="text-white/60 text-sm">
                Available for freelance & full-time
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center text-white/40 text-sm">
            <p>© {new Date().getFullYear()} Ville Toimela. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default ContactFooter
