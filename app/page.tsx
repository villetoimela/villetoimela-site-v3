import Hero from '@/components/Hero'
import HorizontalScroll from '@/components/HorizontalScroll'

export default function Home() {
  return (
    <main suppressHydrationWarning>
      <Hero />
      <HorizontalScroll />
    </main>
  )
}
