import dayjs from 'dayjs'

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
