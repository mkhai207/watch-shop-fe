export type TStrapMaterial = {
  id: string
  name: string
  code: string
  description?: string | null
  extra_money: number
  created_at?: string | null
  created_by?: string | null
  updated_at?: string | null
  updated_by?: string | null
  del_flag?: string | null
}

export type TCreateStrapMaterial = {
  name: string
  code: string
  description?: string | null
  extra_money: number
}

export type TUpdateStrapMaterial = {
  name: string
  code: string
  description?: string | null
  extra_money: number
}

export type GetStrapMaterialsResponse = {
  strapMaterials: {
    count: number
    rows: TStrapMaterial[]
  }
}

export type CreateStrapMaterialResponse = {
  strapMaterial: TStrapMaterial
}

export type UpdateStrapMaterialResponse = {
  strapMaterial: TStrapMaterial
}

export type GetStrapMaterialResponse = {
  strapMaterial: TStrapMaterial
}
