import Hero from '@/components/Hero'
import HorizontalScroll from '@/components/HorizontalScroll'
import ConditionalZoomDive from '@/components/ConditionalZoomDive'
import ProjectMarquee from '@/components/ProjectMarquee'
import ParallaxRevealLayers from '@/components/ParallaxRevealLayers'
import TechStack from '@/components/TechStack'
import ContactFooter from '@/components/ContactFooter'

export default function Home() {
  // Calculate dynamic age and years
  const currentYear = new Date().getFullYear()
  const birthYear = 1995
  const codingStartYear = 2019
  const professionalStartYear = 2020
  
  const age = currentYear - birthYear
  const yearsOfCoding = currentYear - codingStartYear
  const yearsOfExperience = currentYear - professionalStartYear

  return (
    <main suppressHydrationWarning>
      <Hero />
      <HorizontalScroll
        panels={[
          {
            title: "Who am I",
            content: `I'm a ${age}-year-old web developer from Finland with about ${yearsOfExperience} years of hands-on experience. I started learning to code ${yearsOfCoding} years ago, and honestly, I haven't looked back since. I've picked up a bunch of different skills along the way and turned quite a few ideas into real, working websites. Fun fact: I used to be a massive gamer (still kind of am), like tens of thousands of hours kind of gamer. These days, that same energy goes into coding. I'm aiming to rack up just as many hours building stuff on the web.`
          },
          {
            title: "What I do",
            content: (
              <>
                <p
                  className="text-sm md:text-xl lg:text-2xl text-gray-300 leading-relaxed mb-6"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  After completing a two-year Software Developer program, I got to work at one of Finland's top marketing agencies. There I built all kinds of websites for different clients — mostly custom WordPress themes, but also some more complex projects. It's been great for learning not just the technical side, but also how to work with teams and communicate with clients who may not speak "developer."
                </p>
                <p
                  className="text-sm md:text-xl lg:text-2xl text-gray-300 leading-relaxed"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  My brother and I also started our own company during my studies. This means I can take on freelance projects outside of regular work hours and invoice them through the company. I've worked on some pretty cool projects over the years.
                </p>
              </>
            )
          }
        ]}
      />
      {/* Spacer between HorizontalScroll and ParallaxRevealLayers */}
      <div className="h-16 sm:h-24 md:h-32 lg:h-40 bg-black" />
      <ParallaxRevealLayers projectIds={['1','2','3','5','6','7','9','10','11','12','13','14','15','16','17','18','19','20','21','22','24','25','27','28']} />
      <HorizontalScroll
        panels={[
          {
            title: "What I know",
            content: "Web development isn't just about knowing a bunch of programming languages — it's about understanding how everything fits together. Over the years, I've worked with a wide range of technologies and picked up experience across the full stack."
          },
          {
            title: (
              <>
                Techs and<br />tools
              </>
            ),
            content: "I'm comfortable building user interfaces with HTML, CSS, JavaScript, and React. On the backend side, I work with PHP, and I've been using Next.js and TailwindCSS quite a bit lately. WordPress is something I know inside and out from all those client projects. Version control with Git is second nature at this point, and I've also dabbled with databases and server stuff when needed."
          }
        ]}
      />
      <ConditionalZoomDive />
      <ProjectMarquee />
      <TechStack />
      <ContactFooter />
    </main>
  )
}
