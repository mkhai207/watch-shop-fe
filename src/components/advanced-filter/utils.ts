import { FilterValues, FilterConfig, OperatorType } from './types'

export const buildBackendQuery = (values: FilterValues, config: FilterConfig) => {
  const params: Record<string, any> = {}

  if (values.search && config.searchFields.length > 0) {
    config.searchFields.forEach(field => {
      params[field.key] = values.search
    })
  }

  Object.entries(values.filters).forEach(([key, value]) => {
    if (value === undefined || value === '' || value === null) return

    const field = config.filterFields.find(f => f.key === key)
    if (!field) return

    if (key === 'final_amount_min') {
      if (values.filters.final_amount_max) {
        params.final_amount = `${value}:${values.filters.final_amount_max}`
      } else {
        params.final_amount = `${value}:`
      }

      return
    }

    if (key === 'final_amount_max') {
      if (!values.filters.final_amount_min) {
        params.final_amount = `:${value}`
      }

      return
    }

    const finalValue = field.type === 'number' ? Number(value) : value
    params[key] = finalValue
  })

  if (values.dateRange?.field && (values.dateRange.from || values.dateRange.to)) {
    const dateField = values.dateRange.field

    if (values.dateRange.from && values.dateRange.to) {
      const fromDate = values.dateRange.from.replace(/-/g, '') + '000000'
      const toDate = values.dateRange.to.replace(/-/g, '') + '235959'
      params[dateField] = `${fromDate}:${toDate}`
    } else if (values.dateRange.from) {
      const fromDate = values.dateRange.from.replace(/-/g, '') + '000000'
      params[dateField] = `${fromDate}:`
    } else if (values.dateRange.to) {
      const toDate = values.dateRange.to.replace(/-/g, '') + '235959'
      params[dateField] = `:${toDate}`
    }
  }

  if (values.sort) {
    params.sort = values.sort
  }

  return params
}

export const applyFilters = <T extends Record<string, any>>(
  data: T[],
  values: FilterValues,
  config: FilterConfig
): T[] => {
  let filtered = [...data]

  if (values.search && config.searchFields.length > 0) {
    const searchLower = values.search.toLowerCase().trim()
    filtered = filtered.filter(item => {
      return config.searchFields.some(field => {
        const fieldValue = getNestedValue(item, field.key)

        return String(fieldValue || '')
          .toLowerCase()
          .includes(searchLower)
      })
    })
  }

  Object.entries(values.filters).forEach(([key, value]) => {
    if (value === undefined || value === '' || value === null) return

    const field = config.filterFields.find(f => f.key === key)
    if (!field) return

    const operator = field.operator || 'eq'

    filtered = filtered.filter(item => {
      let itemValue = getNestedValue(item, key)

      if (key === 'final_amount_min') {
        itemValue = getNestedValue(item, 'final_amount')

        return matchesCondition(itemValue, value, 'gte', field.type)
      }
      if (key === 'final_amount_max') {
        itemValue = getNestedValue(item, 'final_amount')

        return matchesCondition(itemValue, value, 'lte', field.type)
      }

      return matchesCondition(itemValue, value, operator, field.type)
    })
  })

  if (values.dateRange?.field && (values.dateRange.from || values.dateRange.to)) {
    filtered = filtered.filter(item => {
      const itemValue = getNestedValue(item, values.dateRange!.field!)
      const itemDate = new Date(itemValue)

      if (isNaN(itemDate.getTime())) return false

      if (values.dateRange!.from) {
        const fromDate = new Date(values.dateRange!.from)
        if (itemDate < fromDate) return false
      }

      if (values.dateRange!.to) {
        const toDate = new Date(values.dateRange!.to)
        toDate.setHours(23, 59, 59, 999)
        if (itemDate > toDate) return false
      }

      return true
    })
  }

  if (values.sort) {
    const [field, direction] = values.sort.split(':')
    const isDesc = direction?.toLowerCase() === 'desc'

    filtered.sort((a, b) => {
      const aVal = getNestedValue(a, field)
      const bVal = getNestedValue(b, field)

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return isDesc ? bVal - aVal : aVal - bVal
      }

      if (aVal instanceof Date && bVal instanceof Date) {
        return isDesc ? bVal.getTime() - aVal.getTime() : aVal.getTime() - bVal.getTime()
      }

      const aStr = String(aVal || '').toLowerCase()
      const bStr = String(bVal || '').toLowerCase()

      if (aStr < bStr) return isDesc ? 1 : -1
      if (aStr > bStr) return isDesc ? -1 : 1

      return 0
    })
  }

  return filtered
}

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

const matchesCondition = (itemValue: any, filterValue: any, operator: OperatorType, fieldType?: string): boolean => {
  if (itemValue === null || itemValue === undefined) return false

  switch (operator) {
    case 'eq':
      return itemValue === filterValue

    case 'like':
      return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase())

    case 'startsWith':
      return String(itemValue).toLowerCase().startsWith(String(filterValue).toLowerCase())

    case 'endsWith':
      return String(itemValue).toLowerCase().endsWith(String(filterValue).toLowerCase())

    case 'in':
      const inValues = Array.isArray(filterValue) ? filterValue : [filterValue]

      return inValues.includes(itemValue)

    case 'gte':
      if (fieldType === 'number') return Number(itemValue) >= Number(filterValue)
      if (fieldType === 'date') return new Date(itemValue) >= new Date(filterValue)

      return String(itemValue) >= String(filterValue)

    case 'lte':
      if (fieldType === 'number') return Number(itemValue) <= Number(filterValue)
      if (fieldType === 'date') return new Date(itemValue) <= new Date(filterValue)

      return String(itemValue) <= String(filterValue)

    case 'gt':
      if (fieldType === 'number') return Number(itemValue) > Number(filterValue)
      if (fieldType === 'date') return new Date(itemValue) > new Date(filterValue)

      return String(itemValue) > String(filterValue)

    case 'lt':
      if (fieldType === 'number') return Number(itemValue) < Number(filterValue)
      if (fieldType === 'date') return new Date(itemValue) < new Date(filterValue)

      return String(itemValue) < String(filterValue)

    case 'between':
      if (typeof filterValue === 'string' && filterValue.includes(':')) {
        const [min, max] = filterValue.split(':')
        if (fieldType === 'number') {
          const num = Number(itemValue)

          return num >= Number(min) && num <= Number(max)
        }
        if (fieldType === 'date') {
          const date = new Date(itemValue)

          return date >= new Date(min) && date <= new Date(max)
        }

        return String(itemValue) >= min && String(itemValue) <= max
      }

      return false

    case 'range':
      return matchesCondition(itemValue, filterValue, 'between', fieldType)

    default:
      return false
  }
}

export const buildUrlParams = (values: FilterValues): URLSearchParams => {
  const params = new URLSearchParams()

  if (values.search) {
    params.set('search', values.search)
  }

  if (values.sort) {
    params.set('sort', values.sort)
  }

  Object.entries(values.filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      params.set(key, String(value))
    }
  })

  if (values.dateRange?.field) {
    if (values.dateRange.from) {
      params.set(`${values.dateRange.field}_from`, values.dateRange.from)
    }
    if (values.dateRange.to) {
      params.set(`${values.dateRange.field}_to`, values.dateRange.to)
    }
  }

  return params
}

export const parseUrlParams = (searchParams: URLSearchParams, config: FilterConfig): Partial<FilterValues> => {
  const values: Partial<FilterValues> = {
    filters: {}
  }

  const search = searchParams.get('search')
  if (search) values.search = search

  const sort = searchParams.get('sort')
  if (sort) values.sort = sort

  config.filterFields.forEach(field => {
    const value = searchParams.get(field.key)
    if (value) {
      values.filters![field.key] = field.type === 'number' ? Number(value) : value
    }
  })

  if (config.dateRangeFields) {
    for (const field of config.dateRangeFields) {
      const from = searchParams.get(`${field.key}_from`)
      const to = searchParams.get(`${field.key}_to`)

      if (from || to) {
        values.dateRange = {
          field: field.key,
          from: from || undefined,
          to: to || undefined
        }
        break
      }
    }
  }

  return values
}
