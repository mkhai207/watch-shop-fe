import { useEffect, useState } from 'react'

const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState('')

  useEffect(() => {
    const timerRef = setTimeout(() => setDebouncedValue(value), delay)

    return () => {
      clearTimeout(timerRef)
    }
  }, [value])

  return debouncedValue
}

export { useDebounce }
