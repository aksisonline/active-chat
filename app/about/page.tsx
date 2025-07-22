'use client'

import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { CardBody, CardContainer, CardItem } from '@/components/ui/3d-card'
import Image from 'next/image'
import AnimatedGridPattern from '@/components/ui/animated-grid-pattern'
import { cn } from '@/lib/utils'
import Logo from '@/components/logo-button'
import { useRouter } from 'next/navigation'

const developers = [
  { name: 'Karthikeya Somayajula', role: 'Frontend Architect', image: '/Team/kk.jpeg' },
  { name: 'S. Abhiram Kanna', role: 'Backend Innovator', image: '/Team/aks.jpg' },
]

export default function AboutUs() {

    const router = useRouter()

    const handleClick = () => {
        router.push("https://www.youtube.com/watch?v=xvFZjo5PgG0");
    };



  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 transition-all duration-300 relative overflow-hidden">
      <AnimatedGridPattern
      numSquares={90}
      maxOpacity={0.1}
      duration={3}
      repeatDelay={1}
      className={cn(
        "[mask-image:radial-gradient(1200px_circle_at_center,white,transparent)]",
        "absolute inset-0 w-full skew-y-7",
      )}
      />
      
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 left-4 z-10"
      >
        <Logo className="w-8 h-8 sm:w-10 sm:h-10" />
      </motion.div>
      
      {/* Theme Switcher */}
      <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute top-4 right-4 z-10"
      >
      <ThemeSwitcher />
      </motion.div>
      
      <motion.div 
      className="flex flex-wrap justify-center items-center gap-10 sm:flex-row flex-col h-full relative z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      >
      {developers.map((dev, index) => (
        <TeamMember key={dev.name} developer={dev} index={index} />
      ))}
      </motion.div>

      <motion.div 
      className="text-center relative z-10"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      >
      <Button variant="secondary" onClick={handleClick} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
        Join Our Visionary Team
      </Button>
      </motion.div>
    </div>
  )
}

function TeamMember({ developer, index }: { developer: { name: string, role: string, image: string }, index: number }) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative"
    >
      <CardContainer className="inter-var">
      <CardBody className="bg-background relative group/card hover:shadow-2xl hover:shadow-primary/10 border-border w-auto sm:w-[30rem] h-auto rounded-xl p-6 border">
        <CardItem
          translateZ="50"
          className="text-xl font-bold text-foreground"
        >
          {developer.name}
        </CardItem>
        <CardItem
          as="p"
          translateZ="60"
          className="text-muted-foreground text-sm max-w-sm mt-2"
        >
          {developer.role}
        </CardItem>
        <CardItem translateZ="100" className="w-full mt-4">
          <Image
            src={developer.image}
            height="300"
            width="300"
            className="h-83 w-full object-cover rounded-xl group-hover/card:shadow-xl"
            alt="thumbnail"
          />
        </CardItem>
        {/* <div className="flex justify-between items-center mt-20">
          <CardItem
            translateZ={20}
            as={Link}
            href="/Team/kk.png"
            target="__blank"
            className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white"
          >
            Try now →
          </CardItem>
          <CardItem
            translateZ={20}
            as="button"
            className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
          >
            Sign up
          </CardItem>
        </div> */}
      </CardBody>
    </CardContainer>
    </motion.div>
  )
}