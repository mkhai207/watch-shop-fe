export type TMovementType = {
  id: string
  name: string
  code: string
  description?: string | null
  created_at?: string | null
  created_by?: string | null
  updated_at?: string | null
  updated_by?: string | null
  del_flag?: string | null
}

export type TCreateMovementType = {
  name: string
  code: string
  description?: string | null
}

export type TUpdateMovementType = {
  name: string
  code: string
  description?: string | null
}

export type GetMovementTypesResponse = {
  movementTypes: {
    count: number
    rows: TMovementType[]
  }
}

export type CreateMovementTypeResponse = {
  movementType: TMovementType
}

export type UpdateMovementTypeResponse = {
  movementType: TMovementType
}

export type GetMovementTypeResponse = {
  movementType: TMovementType
}
