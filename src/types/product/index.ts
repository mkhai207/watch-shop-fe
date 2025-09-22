export type TParamsGetProducts = {}

export type TBrand = {
  id: string
  name: string
}

export type TCategory = {
  id: string
  code: string
  name: string
}

export type TColor = {
  id: string
  name: string
  hex_code: string
}

export type TSize = {
  id: string
  name: string
}

export type TVariant = {
  variantId: string
  colorId: string
  sizeId: string
  stock: number
  color: TColor
  size: TSize
}

export type TProductDetail = {
  id: string
  created_at: string
  created_by: string
  updated_at: string
  updated_by: string
  name: string
  description: string
  price: number
  gender: 'MALE' | 'FEMALE' | 'UNISEX'
  sold: number
  rating: number
  status: boolean
  thumbnail: string
  slider: string
  brand: TBrand
  category: TCategory
  colors: TColor[]
  sizes: TSize[]
  variants: TVariant[]
}

export type TProduct = {
  id: string
  name: string
  description: string
  price: number
  gender: 'MALE' | 'FEMALE' | 'UNISEX'
  rating: number
  sold: number
  status: boolean
  thumbnail: string | ''
  slider: string[] | null
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
  brand_id: string
  category_id: string
  brand: TBrand
  category: TCategory
}
