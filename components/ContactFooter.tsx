'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import emailjs from '@emailjs/browser'

gsap.registerPlugin(ScrollTrigger)

const ContactFooter = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Animate title
      gsap.fromTo(
        '.contact-title',
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
          to_email: 'ville@example.com', // Replace with your email
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
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Contact Section */}
        <div className="max-w-4xl mx-auto mb-32">
          {/* Title */}
          <div className="contact-title text-center mb-16">
            <p className="text-white/40 text-xs uppercase tracking-[0.3em] mb-4 font-light">
              Get in Touch
            </p>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-6">
              Let's Work Together
            </h2>
            <p className="text-white/60 text-lg font-light max-w-2xl mx-auto">
              I'm currently available for freelance work and full-time opportunities.
              Drop me a line and let's create something amazing!
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
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="block text-white/80 hover:text-white transition-colors duration-300">
                  GitHub
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="block text-white/80 hover:text-white transition-colors duration-300">
                  LinkedIn
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="block text-white/80 hover:text-white transition-colors duration-300">
                  Twitter
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
                  ville@example.com
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
