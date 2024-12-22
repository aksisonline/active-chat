'use client'

import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Coffee, Code, Heart, Moon, Sun } from 'lucide-react'
import { useTheme } from "next-themes"
import { useEffect, useState } from 'react'
import { ThemeProvider } from "@/components/theme-provider"

export default function AboutUs() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const developers = [
    { name: 'Alice Wonder', role: 'Frontend Wizard', image: '/placeholder.svg?height=300&width=300' },
    { name: 'Bob Coder', role: 'Backend Ninja', image: '/placeholder.svg?height=300&width=300' }
  ]

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background text-foreground p-8 transition-colors duration-300">
        <motion.h1 
          className="text-4xl font-bold text-center mb-8"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Meet Our Quirky Crew!
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute top-4 right-4"
        >
          {mounted && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {developers.map((dev, index) => (
            <motion.div
              key={dev.name}
              initial={{ x: index % 2 === 0 ? -100 : 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <img src={dev.image} alt={dev.name} className="w-full h-64 object-cover filter grayscale hover:grayscale-0 transition-all duration-300" />
                  <div className="p-4">
                    <h2 className="text-2xl font-bold">{dev.name}</h2>
                    <p className="text-muted-foreground">{dev.role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-12 text-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4">What We Do</h2>
          <div className="flex justify-center space-x-8">
            <BouncyIcon icon={<Coffee className="h-12 w-12" />} label="Drink Coffee" />
            <BouncyIcon icon={<Code className="h-12 w-12" />} label="Write Code" />
            <BouncyIcon icon={<Heart className="h-12 w-12" />} label="Love What We Do" />
          </div>
        </motion.div>

        <motion.div 
          className="mt-12 text-center"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Button variant="secondary" size="lg">
            Join Our Crazy Team!
          </Button>
        </motion.div>
      </div>
    </ThemeProvider>
  )
}

function BouncyIcon({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <div className="flex flex-col items-center">
        {icon}
        <span className="mt-2">{label}</span>
      </div>
    </motion.div>
  )
}


