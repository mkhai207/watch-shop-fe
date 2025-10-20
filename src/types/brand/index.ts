export type TBrand = {
  id: string
  name: string
  logo_url?: string
  description?: string
  created_at?: string | null
  created_by?: string | null
  updated_at?: string | null
  updated_by?: string | null
  del_flag?: string | null
}

export type TParamsGetBrands = {
  page?: number
  limit?: number
  sort?: string
  search?: string
}

export type TCreateBrand = {
  name: string
  logo_url?: string
  description?: string
}

export type TUpdateBrand = {
  name: string
  logo_url?: string
  description?: string
}

export type GetBrandsResponse = {
  brands: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
    items: TBrand[]
  }
}

export type CreateBrandResponse = {
  brand: TBrand
}

export type UpdateBrandResponse = {
  brand: TBrand
}

export type GetBrandResponse = {
  brand: TBrand
}
