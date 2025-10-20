export type TColor = {
  id: string
  name: string
  hex_code: string
  created_at?: string | null
  created_by?: string | null
  updated_at?: string | null
  updated_by?: string | null
  del_flag?: string | null
}

export type TCreateColor = {
  name: string
  hex_code: string
}

export type TUpdateColor = {
  name: string
  hex_code: string
}

export type GetColorsResponse = {
  colors: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
    items: TColor[]
  }
}

export type CreateColorResponse = {
  color: TColor
}

export type UpdateColorResponse = {
  color: TColor
}

export type GetColorResponse = {
  color: TColor
}
