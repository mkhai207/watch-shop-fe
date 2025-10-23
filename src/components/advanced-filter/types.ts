export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'select' | 'multiselect'

export type OperatorType =
  | 'eq' // equal
  | 'like' // contains
  | 'startsWith'
  | 'endsWith'
  | 'in' // trong danh sách
  | 'gte' // greater than or equal
  | 'lte' // less than or equal
  | 'gt' // greater than
  | 'lt' // less than
  | 'between' // between two values
  | 'range' // range (from-to)

export interface FilterField {
  key: string
  label: string
  type: FieldType
  operator?: OperatorType
  options?: Array<{ value: string | number; label: string }>
  placeholder?: string
  defaultValue?: any
}

export interface SortOption {
  value: string
  label: string
}

export interface DateRangeField {
  key: string
  label: string
}

export interface FilterConfig {
  searchFields: FilterField[] // các field có thể search
  filterFields: FilterField[] // các field có thể filter
  sortOptions: SortOption[] // các option sắp xếp
  dateRangeFields?: DateRangeField[] // các field date range
}

export interface FilterValues {
  search: string
  filters: Record<string, any>
  sort: string
  dateRange?: {
    from?: string
    to?: string
    field?: string
  }
}

export interface AdvancedFilterProps {
  config: FilterConfig
  values: FilterValues
  onChange: (values: FilterValues) => void
  onReset?: () => void
  loading?: boolean
  compact?: boolean
}
