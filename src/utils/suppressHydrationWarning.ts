// Utility để tắt hydration warnings trong development
export const suppressHydrationWarning = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const originalError = console.error
    console.error = (...args: any[]) => {
      if (typeof args[0] === 'string' && args[0].includes('Text content does not match server-rendered HTML')) {
        return
      }
      originalError.apply(console, args)
    }
  }
}

// Hook để sử dụng trong components
export const useSuppressHydrationWarning = () => {
  if (typeof window !== 'undefined') {
    suppressHydrationWarning()
  }
}
