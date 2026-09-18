'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function RevealProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    let observer: IntersectionObserver | null = null
    const timeout = window.setTimeout(() => {
      const pageObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible')
              pageObserver.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      )
      observer = pageObserver

      document.querySelectorAll('.reveal:not(.visible)').forEach((element) => {
        pageObserver.observe(element)
      })
    }, 100)

    return () => {
      window.clearTimeout(timeout)
      observer?.disconnect()
    }
  }, [pathname])

  return <>{children}</>
}
