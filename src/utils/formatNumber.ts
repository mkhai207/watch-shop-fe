import { useState, useEffect } from 'react'

// Utility function để format số một cách nhất quán
export const formatPrice = (price: number): string => {
  if (typeof window === 'undefined') {
    // Server-side: sử dụng format mặc định
    return price.toLocaleString('en-US')
  } else {
    // Client-side: sử dụng format Việt Nam
    return price.toLocaleString('vi-VN')
  }
}

// Hook để format số với hydration safety
export const useFormatPrice = (price: number) => {
  const [formattedPrice, setFormattedPrice] = useState<string>(price.toLocaleString('en-US'))

  useEffect(() => {
    setFormattedPrice(price.toLocaleString('vi-VN'))
  }, [price])

  return formattedPrice
}
