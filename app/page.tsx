import Hero from '@/components/Hero'
import HorizontalScroll from '@/components/HorizontalScroll'
import ZoomDive from '@/components/ZoomDive'
import ProjectMarquee from '@/components/ProjectMarquee'
import ProjectsPreview from '@/components/ProjectsPreview'
import TechStack from '@/components/TechStack'

export default function Home() {
  return (
    <main suppressHydrationWarning>
      <Hero />
      <HorizontalScroll
        panels={[
          {
            title: "Who am I",
            content: "Hello! I'm a 30-years-old eager Web Developer with about five years of active coding experience. While I've always been intrigued by programming, I officially embarked on my learning journey only six years ago. During this time, I learned many different skills and made some digital ideas real! I've logged tens of thousands of hours playing video games. The passion and commitment I once dedicated to gaming have now transitioned into coding. My aim is to accumulate atleast an equal number of hours in coding and continue expanding my knowledge."
          },
          {
            title: "What I do",
            content: (
              <>
                <p
                  className="text-lg md:text-xl lg:text-2xl text-gray-300 leading-relaxed mb-6"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  After an intensive two-year Software Developer training, I had the privilege of working at one of Finland's most influential marketing agencies. There, I've been involved in creating various websites tailored to meet the specific needs of clients. Most of these projects involved building custom WordPress themes. In addition to coding, this role has provided me with invaluable experience in teamwork and interacting effectively with clients.
                </p>
                <p
                  className="text-lg md:text-xl lg:text-2xl text-gray-300 leading-relaxed"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  During my studies, my brother and I co-founded a company. Through this venture, we had the chance to work on several exciting projects! If you're interested, check out{' '}
                  <a
                    href="https://hiisi.digital"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors underline decoration-blue-400/30 hover:decoration-blue-300/50"
                  >
                    hiisi.digital
                  </a>
                  .
                </p>
              </>
            )
          }
        ]}
      />
      <ProjectsPreview />
      <HorizontalScroll
        panels={[
          {
            title: "What i know",
            content: "For me, it's not just about mastering specific programming languages or technologies; it's about embracing the entirety of web development. I've garnered a wealth of experience across a range of technologies over the years."
          },
          {
            title: (
              <>
                Techs and<br />tools
              </>
            ),
            content: "Over the years, my journey as a web developer has been both vast and fulfilling. I've mastered the art of creating seamless user interfaces using tools like HTML, CSS, JavaScript, and React. Venturing further, PHP, Next.js, TailwindCSS, and WordPress became trusted companions in my toolkit, allowing me to shape visions into digital realities. Of course, I'm accustomed to using version control in my projects, and in addition, I've had a glimpse into the world of databases and servers."
          }
        ]}
      />
      <ZoomDive />
      <ProjectMarquee />
      <TechStack />
    </main>
  )
}
