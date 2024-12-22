'use client'

import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Coffee, Code, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'

const developers = [
  { name: 'Karthikeya Somayajula', role: 'Frontend Architect', image: '/placeholder.svg?height=400&width=400' },
  { name: 'S. Abhiram Kanna', role: 'Backend Innovator', image: '/placeholder.svg?height=400&width=400' },
]

const skills = [
  { icon: <Coffee className="h-8 w-8" />, label: "Innovative Solutions" },
  { icon: <Code className="h-8 w-8" />, label: "Cutting-edge Tech" },
  { icon: <Zap className="h-8 w-8" />, label: "Rapid Development" }
]

export default function AboutUs() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 text-foreground p-4 sm:p-8 transition-all duration-300">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 right-4 z-10"
      >
        {mounted && <ThemeSwitcher />}
      </motion.div>

      <motion.h1 
        className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Shaping the Future
      </motion.h1>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {developers.map((dev, index) => (
          <TeamMember key={dev.name} developer={dev} index={index} />
        ))}
      </motion.div>

      <motion.div 
        className="mb-12"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-3xl font-bold text-center mb-8">Our Expertise</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {skills.map((skill, index) => (
            <SkillCard key={skill.label} skill={skill} index={index} />
          ))}
        </div>
      </motion.div>

      <motion.div 
        className="text-center"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Button variant="secondary" size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
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
    >
      <Card className="overflow-hidden backdrop-blur-sm bg-background/30 border-none shadow-lg">
        <CardContent className="p-0">
          <img src={developer.image} alt={developer.name} className="w-full h-64 object-cover" />
          <div className="p-4">
            <h2 className="text-xl font-bold">{developer.name}</h2>
            <p className="text-muted-foreground">{developer.role}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function SkillCard({ skill, index }: { skill: { icon: React.ReactNode, label: string }, index: number }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="w-48 h-48 flex flex-col items-center justify-center backdrop-blur-sm bg-background/30 border-none shadow-lg">
        <CardContent>
          {skill.icon}
          <h3 className="mt-4 text-center font-semibold">{skill.label}</h3>
        </CardContent>
      </Card>
    </motion.div>
  )
}

