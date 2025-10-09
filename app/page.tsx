import Hero from '@/components/Hero'

export default function Home() {
  return (
    <main suppressHydrationWarning>
      <Hero />
      {/* Temporary content to enable scrolling */}
      <div className="h-screen bg-black" />
    </main>
  )
}
