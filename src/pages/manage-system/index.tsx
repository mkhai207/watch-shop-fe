import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function ManageSystemIndex() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/manage-system/dashboard')
  }, [router])

  return null
}
