import { useState, useCallback, useMemo } from 'react'
import { FilterValues, FilterConfig } from './types'

export interface UseAdvancedFilterOptions {
  initialValues?: Partial<FilterValues>
  config: FilterConfig
}

export interface UseAdvancedFilterReturn {
  values: FilterValues
  setValues: (values: FilterValues) => void
  updateValue: (key: keyof FilterValues, value: any) => void
  reset: () => void
  hasActiveFilters: boolean
  buildQueryParams: () => Record<string, any>
  buildBackendQuery: () => Record<string, any>
}

export const useAdvancedFilter = ({
  initialValues = {},
  config
}: UseAdvancedFilterOptions): UseAdvancedFilterReturn => {
  const defaultValues: FilterValues = useMemo(
    () => ({
      search: '',
      filters: {},
      sort: config.sortOptions[0]?.value || '',
      dateRange: undefined,
      ...initialValues
    }),
    [config.sortOptions, initialValues]
  )

  const [values, setValues] = useState<FilterValues>(defaultValues)

  const updateValue = useCallback((key: keyof FilterValues, value: any) => {
    setValues(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const reset = useCallback(() => {
    setValues(defaultValues)
  }, [defaultValues])

  const hasActiveFilters = useMemo(() => {
    return !!(values.search || Object.keys(values.filters).length > 0 || values.dateRange?.from || values.dateRange?.to)
  }, [values])

  const buildQueryParams = useCallback(() => {
    const params: Record<string, any> = {}

    if (values.search) {
      params.search = values.search
    }

    if (values.sort) {
      params.sort = values.sort
    }

    Object.entries(values.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params[key] = value
      }
    })

    if (values.dateRange?.field && (values.dateRange.from || values.dateRange.to)) {
      if (values.dateRange.from && values.dateRange.to) {
        params[`${values.dateRange.field}__between`] = `${values.dateRange.from}:${values.dateRange.to}`
      } else if (values.dateRange.from) {
        params[`${values.dateRange.field}__gte`] = values.dateRange.from
      } else if (values.dateRange.to) {
        params[`${values.dateRange.field}__lte`] = values.dateRange.to
      }
    }

    return params
  }, [values])

  const buildBackendQuery = useCallback(() => {
    const query: Record<string, any> = {}

    if (values.search && config.searchFields.length > 0) {
      config.searchFields.forEach(field => {
        query[`${field.key}__like`] = values.search
      })
    }

    if (values.sort) {
      query.sort = values.sort
    }

    Object.entries(values.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        const field = config.filterFields.find(f => f.key === key)
        const operator = field?.operator || 'eq'

        if (operator === 'eq') {
          query[key] = value
        } else {
          query[`${key}__${operator}`] = value
        }
      }
    })

    if (values.dateRange?.field && (values.dateRange.from || values.dateRange.to)) {
      if (values.dateRange.from && values.dateRange.to) {
        query[`${values.dateRange.field}__between`] = `${values.dateRange.from}:${values.dateRange.to}`
      } else if (values.dateRange.from) {
        query[`${values.dateRange.field}__gte`] = values.dateRange.from
      } else if (values.dateRange.to) {
        query[`${values.dateRange.field}__lte`] = values.dateRange.to
      }
    }

    return query
  }, [values, config])

  return {
    values,
    setValues,
    updateValue,
    reset,
    hasActiveFilters,
    buildQueryParams,
    buildBackendQuery
  }
}
