import { useState, useEffect } from 'react'

interface PriceDisplayProps {
  price: number
  currency?: string
}

const PriceDisplay = ({ price, currency = 'VND' }: PriceDisplayProps) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <span suppressHydrationWarning>
        {price.toLocaleString('en-US')} {currency}
      </span>
    )
  }

  return (
    <span>
      {price.toLocaleString('vi-VN')} {currency}
    </span>
  )
}

export default PriceDisplay
