import type { Metadata } from 'next'
import { Space_Grotesk, Space_Mono } from 'next/font/google'
import './globals.css'
import SmoothScroll from '@/components/SmoothScroll'
import SimpleCursor from '@/components/SimpleCursor'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['300', '400', '500', '600', '700'],
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-space-mono',
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: 'Ville Toimela - Front End Developer & Web Developer',
  description: 'Portfolio of Ville Toimela - Front end developer with 5 years of experience creating diverse websites and web applications.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="lenis">
      <body className={`${spaceGrotesk.variable} ${spaceMono.variable} cursor-none md:cursor-none`}>
        <SmoothScroll />
        <SimpleCursor />
        {children}
      </body>
    </html>
  )
}
