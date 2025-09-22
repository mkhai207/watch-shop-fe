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
  id: string
  colorId: string
  sizeId: string
  quantity: number
  product: TProduct
  color: TColor
  size: TSize
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
  created_at: string
  created_by: string
  updated_at: string
  updated_by: string
  quantity: number
  product_variant_id: string
  user_id: string
  variant: TVariant
}

export type TUpdateCartItem = {
  quantity: number
}
