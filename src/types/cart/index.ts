export type TColor = {
  id: string
  name: string
  hex_code?: string
}

export type TSize = {
  id: string
  name: string
}

export type TWatch = {
  id: string
  code: string
  name: string
  description: string
  model: string
  base_price: number
  thumbnail?: string
  slider?: string
}

export type TStrapMaterial = {
  id: string
  name: string
}

export type TVariant = {
  id: string
  color_id: string
  strap_material_id: string
  watch_id: string
  price: number
  stock_quantity: number
  color: TColor
  strapMaterial: TStrapMaterial
  watch: TWatch
  // Legacy support
  colorId?: string
  sizeId?: string
  quantity?: number
  product?: TProduct
  size?: TSize
  name?: string
}

export type TAddToCart = {
  productId: string
  sizeId: number
  colorId: number
  quantity: number
}

export type TProduct = {
  id: string
  name: string
  price: number
  thumbnail: string
}

export type TCartItem = {
  id: string
  cart_id: string
  variant_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  created_by: string
  updated_at: string | null
  updated_by: string | null
  del_flag: string
  variant: TVariant
  // Legacy support
  product_variant_id?: string
  user_id?: string
}

export type TUpdateCartItem = {
  quantity: number
}
