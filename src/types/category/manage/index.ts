export type TCategory = {
  id: string
  name: string
  image_url?: string
  description?: string
  created_at?: string | null
  created_by?: string | null
  updated_at?: string | null
  updated_by?: string | null
  del_flag?: string | null
}

export type TCreateCategory = {
  name: string
  image_url?: string
  description?: string
}

export type TUpdateCategory = {
  name: string
  image_url?: string
  description?: string
}

export type GetCategorysResponse = {
  categorys: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
    items: TCategory[]
  }
}

export type CreateCategoryResponse = {
  category: TCategory
}

export type UpdateCategoryResponse = {
  category: TCategory
}

export type GetCategoryResponse = {
  category: TCategory
}
