// Types for VN Public APIs
export interface Province {
  code: string
  name: string
  name_with_type: string
  slug: string
  type: string
}

export interface District {
  code: string
  name: string
  name_with_type: string
  slug: string
  type: string
  province_code: string
}

export interface Ward {
  code: string
  name: string
  name_with_type: string
  slug: string
  type: string
  district_code: string
}

// Base URL for VN Public APIs
const VN_PUBLIC_API_BASE = 'https://vn-public-apis.fpo.vn'

// Get all provinces/cities
export const getProvinces = async (): Promise<Province[]> => {
  try {
    const response = await fetch(`${VN_PUBLIC_API_BASE}/provinces/getAll?limit=-1`)
    const result = await response.json()
    
    
    // Check if result is directly an array or has data property
    let dataArray = null
    if (Array.isArray(result)) {
      dataArray = result
    } else if (result && result.data && Array.isArray(result.data)) {
      dataArray = result.data
    } else if (result && result.data && result.data.data && Array.isArray(result.data.data)) {
      dataArray = result.data.data
    } else if (result && result.data && result.data.data && Array.isArray(result.data.data)) {
      dataArray = result.data.data
    }
    
    if (dataArray) {
      return dataArray.map((item: any) => ({
        code: item.code,
        name: item.name,
        name_with_type: item.name_with_type,
        slug: item.slug,
        type: item.type
      }))
    }
    
    return []
  } catch (error) {
    console.error('Error fetching provinces:', error)
    return []
  }
}

// Get districts by province code
export const getDistrictsByProvince = async (provinceCode: string): Promise<District[]> => {
  try {
    const response = await fetch(`${VN_PUBLIC_API_BASE}/districts/getByProvince?provinceCode=${provinceCode}&limit=-1`)
    const result = await response.json()
    
    
    // Check if result is directly an array or has data property
    let dataArray = null
    if (Array.isArray(result)) {
      dataArray = result
    } else if (result && result.data && Array.isArray(result.data)) {
      dataArray = result.data
    } else if (result && result.data && result.data.data && Array.isArray(result.data.data)) {
      dataArray = result.data.data
    } else if (result && result.data && result.data.data && Array.isArray(result.data.data)) {
      dataArray = result.data.data
    }
    
    if (dataArray) {
      return dataArray.map((item: any) => ({
        code: item.code,
        name: item.name,
        name_with_type: item.name_with_type,
        slug: item.slug,
        type: item.type,
        province_code: item.province_code || provinceCode
      }))
    }
    
    return []
  } catch (error) {
    console.error('Error fetching districts:', error)
    return []
  }
}

// Get wards by district code
export const getWardsByDistrict = async (districtCode: string): Promise<Ward[]> => {
  try {
    const response = await fetch(`${VN_PUBLIC_API_BASE}/wards/getByDistrict?districtCode=${districtCode}&limit=-1`)
    const result = await response.json()
    
    
    // Check if result is directly an array or has data property
    let dataArray = null
    if (Array.isArray(result)) {
      dataArray = result
    } else if (result && result.data && Array.isArray(result.data)) {
      dataArray = result.data
    } else if (result && result.data && result.data.data && Array.isArray(result.data.data)) {
      dataArray = result.data.data
    } else if (result && result.data && result.data.data && Array.isArray(result.data.data)) {
      dataArray = result.data.data
    }
    
    if (dataArray) {
      return dataArray.map((item: any) => ({
        code: item.code,
        name: item.name,
        name_with_type: item.name_with_type,
        slug: item.slug,
        type: item.type,
        district_code: item.district_code || districtCode
      }))
    }
    
    return []
  } catch (error) {
    console.error('Error fetching wards:', error)
    return []
  }
}

// Helper function to get full address string
export const getFullAddressString = (
  street: string,
  wardName: string,
  districtName: string,
  provinceName: string
): string => {
  return `${street}, ${wardName}, ${districtName}, ${provinceName}`
}

// Search functions for better UX
export const searchProvinces = async (query: string): Promise<Province[]> => {
  try {
    const response = await fetch(`${VN_PUBLIC_API_BASE}/provinces/getAll?q=${encodeURIComponent(query)}&limit=-1`)
    const result = await response.json()
    
    // Check if result is directly an array or has data property
    let dataArray = null
    if (Array.isArray(result)) {
      dataArray = result
    } else if (result && result.data && Array.isArray(result.data)) {
      dataArray = result.data
    } else if (result && result.data && result.data.data && Array.isArray(result.data.data)) {
      dataArray = result.data.data
    }
    
    if (dataArray) {
      return dataArray.map((item: any) => ({
        code: item.code,
        name: item.name,
        name_with_type: item.name_with_type,
        slug: item.slug,
        type: item.type
      }))
    }
    
    return []
  } catch (error) {
    console.error('Error searching provinces:', error)
    return []
  }
}

export const searchDistricts = async (provinceCode: string, query: string): Promise<District[]> => {
  try {
    const response = await fetch(`${VN_PUBLIC_API_BASE}/districts/getByProvince?provinceCode=${provinceCode}&q=${encodeURIComponent(query)}&limit=-1`)
    const result = await response.json()
    
    // Check if result is directly an array or has data property
    let dataArray = null
    if (Array.isArray(result)) {
      dataArray = result
    } else if (result && result.data && Array.isArray(result.data)) {
      dataArray = result.data
    } else if (result && result.data && result.data.data && Array.isArray(result.data.data)) {
      dataArray = result.data.data
    }
    
    if (dataArray) {
      return dataArray.map((item: any) => ({
        code: item.code,
        name: item.name,
        name_with_type: item.name_with_type,
        slug: item.slug,
        type: item.type,
        province_code: item.province_code || provinceCode
      }))
    }
    
    return []
  } catch (error) {
    console.error('Error searching districts:', error)
    return []
  }
}

export const searchWards = async (districtCode: string, query: string): Promise<Ward[]> => {
  try {
    const response = await fetch(`${VN_PUBLIC_API_BASE}/wards/getByDistrict?districtCode=${districtCode}&q=${encodeURIComponent(query)}&limit=-1`)
    const result = await response.json()
    
    // Check if result is directly an array or has data property
    let dataArray = null
    if (Array.isArray(result)) {
      dataArray = result
    } else if (result && result.data && Array.isArray(result.data)) {
      dataArray = result.data
    } else if (result && result.data && result.data.data && Array.isArray(result.data.data)) {
      dataArray = result.data.data
    }
    
    if (dataArray) {
      return dataArray.map((item: any) => ({
        code: item.code,
        name: item.name,
        name_with_type: item.name_with_type,
        slug: item.slug,
        type: item.type,
        district_code: item.district_code || districtCode
      }))
    }
    
    return []
  } catch (error) {
    console.error('Error searching wards:', error)
    return []
  }
}