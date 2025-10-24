import { ReactNode, useEffect, useState } from 'react'

interface HydrationBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

const HydrationBoundary = ({ children, fallback = null }: HydrationBoundaryProps) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export default HydrationBoundary
