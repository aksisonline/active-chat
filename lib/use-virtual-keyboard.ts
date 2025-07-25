'use client'

import { useState, useEffect } from 'react'

// This hook helps to detect virtual keyboard state (open or closed)
export function useVirtualKeyboard() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)

  useEffect(() => {
    // Store the initial viewport height (when keyboard is closed)
    const initialHeight = window.visualViewport?.height || window.innerHeight
    setViewportHeight(initialHeight)

    const handleResize = () => {
      if (!window.visualViewport) return
      
      const currentHeight = window.visualViewport.height
      // If the height is significantly reduced, keyboard is likely open
      // Using a threshold of 15% of the original height
      if (currentHeight < initialHeight * 0.85) {
        setIsKeyboardOpen(true)
      } else {
        setIsKeyboardOpen(false)
      }
      
      setViewportHeight(currentHeight)
    }

    // Use visualViewport API if available, otherwise use window resize
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
    } else {
      window.addEventListener('resize', handleResize)
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      } else {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  return { isKeyboardOpen, viewportHeight }
}
