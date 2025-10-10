import Hero from '@/components/Hero'
import HorizontalScroll from '@/components/HorizontalScroll'
import ProjectsPreview from '@/components/ProjectsPreview'

export default function Home() {
  return (
    <main suppressHydrationWarning>
      <Hero />
      <HorizontalScroll />
      <ProjectsPreview />
    </main>
  )
}
