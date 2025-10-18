import { createContext, useContext, useState, ReactNode } from 'react'

interface FilterState {
  search: string
  priceRanges: string[]
  ratings: number[]
  sortBy: string
  categories?: string[]
  brands?: string[]
}

interface FilterContextType {
  filters: FilterState
  setFilters: (filters: FilterState) => void
  updateSearch: (search: string) => void
  updatePriceRanges: (priceRanges: string[]) => void
  updateRatings: (ratings: number[]) => void
  updateSortBy: (sortBy: string) => void
  resetFilters: () => void
  resetAllFilters: () => void
}

const initialFilters: FilterState = {
  search: '',
  priceRanges: [],
  ratings: [],
  sortBy: '',
  categories: [],
  brands: []
}

const FilterContext = createContext<FilterContextType | null>(null)

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters)

  const updateSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }))
  }

  const updatePriceRanges = (priceRanges: string[]) => {
    setFilters(prev => ({ ...prev, priceRanges }))
  }

  const updateRatings = (ratings: number[]) => {
    setFilters(prev => ({ ...prev, ratings }))
  }

  const updateSortBy = (sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy }))
  }

  const resetFilters = () => {
    setFilters(prev => ({
      ...initialFilters,
      search: prev.search,
      sortBy: prev.sortBy
    }))
  }

  const resetAllFilters = () => {
    setFilters(initialFilters)
  }

  const value: FilterContextType = {
    filters,
    setFilters,
    updateSearch,
    updatePriceRanges,
    updateRatings,
    updateSortBy,
    resetFilters,
    resetAllFilters
  }

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}

export const useFilter = (): FilterContextType => {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider')
  }

  return context
}
