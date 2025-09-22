import axios from 'axios'
import { CONFIG_API } from 'src/configs/api'
import { CategoryResponse } from 'src/types/category'
import { getLocalUserData } from 'src/helpers/storage'

export const getCategories = async () => {
  try {
    const res = await axios.get(CONFIG_API.CATEGORY.GET_CATEGORIES, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return res.data
  } catch (error) {
    throw error
  }
}

export const createCategory = async (categoryData: { code: string; name: string }) => {
  try {
    // Lấy token từ helper function
    const { accessToken } = getLocalUserData()
    
    if (!accessToken) {
      throw new Error('Không có token xác thực. Vui lòng đăng nhập lại.')
    }

    console.log('Creating category with data:', categoryData)
    console.log('Using token:', accessToken ? 'Token exists' : 'No token')

    const res = await axios.post(CONFIG_API.CATEGORY.CREATE_CATEGORY, categoryData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    })

    console.log('API Response:', res.data)
    return res.data
  } catch (error: any) {
    console.error('Create category error:', error)
    
    // Xử lý các loại lỗi cụ thể
    if (error.response) {
      const { status, data } = error.response
      
      console.log('Response status:', status)
      console.log('Response data:', data)
      
      if (status === 401) {
        throw new Error('Token không hợp lệ. Vui lòng đăng nhập lại.')
      } else if (status === 403) {
        throw new Error('Bạn không có quyền tạo phân loại.')
      } else if (status === 409) {
        throw new Error('Mã phân loại đã tồn tại.')
      } else if (status === 400) {
        throw new Error(data?.message || 'Dữ liệu không hợp lệ.')
      } else if (status === 500) {
        // Lỗi server - hiển thị thông tin chi tiết hơn
        const serverError = data?.message || data?.error || 'Lỗi server nội bộ'
        throw new Error(`Lỗi server (500): ${serverError}. Vui lòng liên hệ admin hoặc thử lại sau.`)
      } else {
        throw new Error(data?.message || `Lỗi server: ${status}`)
      }
    } else if (error.request) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.')
    } else {
      throw new Error(error.message || 'Có lỗi xảy ra khi tạo phân loại.')
    }
  }
}

export const updateCategory = async (id: number, categoryData: { code?: string; name?: string }) => {
  try {
    // Lấy token từ helper function
    const { accessToken } = getLocalUserData()
    
    if (!accessToken) {
      throw new Error('Không có token xác thực. Vui lòng đăng nhập lại.')
    }

    console.log('Updating category with ID:', id)
    console.log('Update data:', categoryData)
    console.log('Using token:', accessToken ? 'Token exists' : 'No token')

    const res = await axios.put(`${CONFIG_API.CATEGORY.UPDATE_CATEGORY}/${id}`, categoryData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    })

    console.log('Update API Response:', res.data)
    return res.data
  } catch (error: any) {
    console.error('Update category error:', error)
    
    // Xử lý các loại lỗi cụ thể
    if (error.response) {
      const { status, data } = error.response
      
      console.log('Response status:', status)
      console.log('Response data:', data)
      
      if (status === 401) {
        throw new Error('Token không hợp lệ. Vui lòng đăng nhập lại.')
      } else if (status === 403) {
        throw new Error('Bạn không có quyền cập nhật phân loại.')
      } else if (status === 404) {
        throw new Error('Không tìm thấy phân loại cần cập nhật.')
      } else if (status === 409) {
        throw new Error('Mã phân loại đã tồn tại.')
      } else if (status === 400) {
        throw new Error(data?.message || 'Dữ liệu không hợp lệ.')
      } else if (status === 500) {
        // Lỗi server - hiển thị thông tin chi tiết hơn
        const serverError = data?.message || data?.error || 'Lỗi server nội bộ'
        throw new Error(`Lỗi server (500): ${serverError}. Vui lòng liên hệ admin hoặc thử lại sau.`)
      } else {
        throw new Error(data?.message || `Lỗi server: ${status}`)
      }
    } else if (error.request) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.')
    } else {
      throw new Error(error.message || 'Có lỗi xảy ra khi cập nhật phân loại.')
    }
  }
}

export const deleteCategory = async (id: number) => {
  try {
    // Lấy token từ helper function
    const { accessToken } = getLocalUserData()
    
    if (!accessToken) {
      throw new Error('Không có token xác thực. Vui lòng đăng nhập lại.')
    }

    console.log('Deleting category with ID:', id)
    console.log('Using token:', accessToken ? 'Token exists' : 'No token')

    const res = await axios.delete(`${CONFIG_API.CATEGORY.DELETE_CATEGORY}/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    })

    console.log('Delete API Response:', res.data)
    return res.data
  } catch (error: any) {
    console.error('Delete category error:', error)
    
    // Xử lý các loại lỗi cụ thể
    if (error.response) {
      const { status, data } = error.response
      
      console.log('Response status:', status)
      console.log('Response data:', data)
      
      if (status === 401) {
        throw new Error('Token không hợp lệ. Vui lòng đăng nhập lại.')
      } else if (status === 403) {
        throw new Error('Bạn không có quyền xóa phân loại.')
      } else if (status === 404) {
        throw new Error('Không tìm thấy phân loại cần xóa.')
      } else if (status === 409) {
        throw new Error('Không thể xóa phân loại này vì có sản phẩm đang sử dụng.')
      } else if (status === 400) {
        throw new Error(data?.message || 'Dữ liệu không hợp lệ.')
      } else if (status === 500) {
        // Lỗi server - hiển thị thông tin chi tiết hơn
        const serverError = data?.message || data?.error || 'Lỗi server nội bộ'
        throw new Error(`Lỗi server (500): ${serverError}. Vui lòng liên hệ admin hoặc thử lại sau.`)
      } else {
        throw new Error(data?.message || `Lỗi server: ${status}`)
      }
    } else if (error.request) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.')
    } else {
      throw new Error(error.message || 'Có lỗi xảy ra khi xóa phân loại.')
    }
  }
}

export const categoryService = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
}
