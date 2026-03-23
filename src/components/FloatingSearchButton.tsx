'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FloatingSearchButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling down 400px
      setIsVisible(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleAction = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // Wait a bit for the scroll then focus search
    setTimeout(() => {
      const searchInput = document.getElementById('toolbar-search') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
      }
    }, 500)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          onClick={handleAction}
          className="lg:hidden fixed bottom-6 right-6 z-[100] w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-700 active:scale-90 transition-all border-4 border-white"
          aria-label="Search and Filter"
        >
          <Search className="w-6 h-6 border-white" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
