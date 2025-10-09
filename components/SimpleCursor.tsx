'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

function SimpleCursorInner() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isPointer, setIsPointer] = useState(false)

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      setIsPointer(
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.classList.contains('cursor-pointer')
      )
    }

    window.addEventListener('mousemove', updatePosition)
    window.addEventListener('mouseover', handleMouseOver)

    return () => {
      window.removeEventListener('mousemove', updatePosition)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [])

  return (
    <>
      {/* Main cursor ring */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block"
        style={{
          transform: `translate(${position.x - 12}px, ${position.y - 12}px)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        <div
          className={`w-6 h-6 border border-blue-400/60 rounded-full transition-all duration-300 ${
            isPointer ? 'scale-150 border-blue-300 bg-blue-400/10' : ''
          }`}
          style={{
            boxShadow: isPointer ? '0 0 20px rgba(100, 180, 255, 0.3)' : 'none',
          }}
        />
      </div>

      {/* Center dot */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block"
        style={{
          transform: `translate(${position.x - 2}px, ${position.y - 2}px)`,
          transition: 'transform 0.05s ease-out',
        }}
      >
        <div
          className={`w-1 h-1 rounded-full transition-all duration-200 ${
            isPointer ? 'bg-blue-300 scale-150' : 'bg-blue-400'
          }`}
          style={{
            boxShadow: '0 0 8px rgba(100, 180, 255, 0.6)',
          }}
        />
      </div>
    </>
  )
}

// Export with dynamic import to prevent hydration mismatch
const SimpleCursor = dynamic(() => Promise.resolve(SimpleCursorInner), {
  ssr: false,
})

export default SimpleCursor
