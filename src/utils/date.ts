import dayjs from 'dayjs'
// Note: We intentionally do NOT shift timezone when formatting compact timestamps

/**
 * Convert ISO UTC date string to YYYY-MM-DD for input[type="date"]
 * @example '1996-04-17T17:00:00.000Z' -> '1996-04-18'
 */
export const toDate = (dateStr?: string): string => {
  if (!dateStr) return ''

  return dayjs(dateStr).format('YYYY-MM-DD')
}

/**
 * Convert input[type="date"] back to UTC ISO string
 * @example '1996-04-18' -> '1996-04-17T17:00:00.000Z'
 */
export const toISOStringUTC = (dateStr?: string): string => {
  if (!dateStr) return ''

  return dayjs(dateStr).toISOString()
}

// Input: compact timestamp 'yyyyMMddHHmmss' (e.g. 20250924232544)
// Output: 'HH:mm:ss dd/MM/yyyy' in VN timezone
export const formatCompactVN = (compact?: string | null): string => {
  if (!compact) return ''
  const s = String(compact)
  if (s.length !== 14) return ''
  const year = s.slice(0, 4)
  const month = s.slice(4, 6)
  const day = s.slice(6, 8)
  const hour = s.slice(8, 10)
  const minute = s.slice(10, 12)
  const second = s.slice(12, 14)
  // Display exactly as provided (no timezone conversion)
  return `${hour}:${minute}:${second} ${day}/${month}/${year}`
}
