"use client"

import { useEffect, useState } from "react"

export function useMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }

    // Initial check
    checkIfMobile()

    // Add event listener with passive option for better performance
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const handleChange = () => setIsMobile(mediaQuery.matches)
    
    mediaQuery.addEventListener('change', handleChange)
    handleChange() // Set initial value

    // Clean up
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Return false during SSR to avoid hydration mismatch
  return isMobile ?? false
}
