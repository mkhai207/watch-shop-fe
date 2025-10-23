export type TWatch = {
  id: string
  code: string
  name: string
  description?: string | null
  model?: string | null
  case_material?: string | null
  case_size?: number | null
  strap_size?: number | null
  gender?: string | null
  water_resistance?: string | null
  release_date?: string | null
  sold?: number | null
  base_price: number
  rating?: number | null
  status?: string | boolean | null
  thumbnail?: string | null
  slider?: string | null
  category_id: string | number
  brand_id: string | number
  movement_type_id: string | number
  // ML Fields
  price_tier?: string | null
  gender_target?: string | null
  size_category?: string | null
  style_tags?: string[] | null
  material_tags?: string[] | null
  color_tags?: string[] | null
  movement_type_tags?: string[] | null
  created_at?: string | null
  created_by?: string | null
  updated_at?: string | null
  updated_by?: string | null
  del_flag?: string | null
}

export type TWatchVariant = {
  id: string
  watch_id: string | number
  color_id: string | number
  strap_material_id: string | number
  stock_quantity: number
  price: number
  created_at?: string | null
  created_by?: string | null
  updated_at?: string | null
  updated_by?: string | null
  del_flag?: string | null
}

export type TCreateWatch = Omit<
  TWatch,
  'id' | 'created_at' | 'created_by' | 'updated_at' | 'updated_by' | 'del_flag'
> & {
  variants?: Array<Omit<TWatchVariant, 'id' | 'created_at' | 'created_by' | 'updated_at' | 'updated_by' | 'del_flag'>>
}

export type TUpdateWatch = Partial<TCreateWatch>

export type GetWatchesResponse = {
  watches: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
    items: TWatch[]
  }
}

export type CreateWatchResponse = {
  watch: {
    watch: TWatch
    variants: TWatchVariant[]
  }
}

export type UpdateWatchResponse = {
  watch: TWatch
}

export type GetWatchResponse = {
  watch: TWatch
}

export type CreateWatchVariant = Omit<
  TWatchVariant,
  'id' | 'created_at' | 'created_by' | 'updated_at' | 'updated_by' | 'del_flag' | 'price'
>
export type CreateWatchVariantResponse = { variant: TWatchVariant }
