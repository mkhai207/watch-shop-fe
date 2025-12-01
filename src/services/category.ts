import axios from 'axios'
import { CONFIG_API } from 'src/configs/api'
import instanceAxios from 'src/helpers/axios'

export const getCategories = async (queryParams?: Record<string, any>) => {
  try {
    const url = CONFIG_API.CATEGORY.GET_CATEGORIES
    let finalUrl = url

    if (queryParams) {
      const params = new URLSearchParams()
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          params.set(key, String(value))
        }
      })
      if (params.toString()) {
        finalUrl = `${url}?${params.toString()}`
      }
    }

    const res = await axios.get(finalUrl, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return res.data
  } catch (error) {
    throw error
  }
}

export const createCategory = async (categoryData: { name: string; image_url?: string; description?: string }) => {
  try {
    console.log('Creating category with data:', categoryData)

    const res = await instanceAxios.post(CONFIG_API.CATEGORY.CREATE_CATEGORY, categoryData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    console.log('API Response:', res.data)

    return res.data
  } catch (error: any) {
    console.error('Create category error:', error)

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

export const updateCategory = async (
  id: string,
  categoryData: { name?: string; image_url?: string; description?: string }
) => {
  try {
    console.log('Updating category with ID:', id)
    console.log('Update data:', categoryData)

    const res = await instanceAxios.put(`${CONFIG_API.CATEGORY.UPDATE_CATEGORY}/${id}`, categoryData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    console.log('Update API Response:', res.data)

    return res.data
  } catch (error: any) {
    console.error('Update category error:', error)

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

export const deleteCategory = async (id: string) => {
  try {
    console.log('Deleting category with ID:', id)

    const res = await instanceAxios.delete(`${CONFIG_API.CATEGORY.DELETE_CATEGORY}/${id}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    console.log('Delete API Response:', res.data)

    return res.data
  } catch (error: any) {
    console.error('Delete category error:', error)

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

export const getCategoryById = async (id: string) => {
  try {
    console.log('Getting category by ID:', id)

    const res = await axios.get(`${CONFIG_API.CATEGORY.GET_CATEGORY_BY_ID}/${id}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    console.log('Get category by ID API Response:', res.data)

    return res.data
  } catch (error: any) {
    console.error('Get category by ID error:', error)

    if (error.response) {
      const { status, data } = error.response

      console.log('Response status:', status)
      console.log('Response data:', data)

      if (status === 401) {
        throw new Error('Token không hợp lệ. Vui lòng đăng nhập lại.')
      } else if (status === 403) {
        throw new Error('Bạn không có quyền xem chi tiết phân loại.')
      } else if (status === 404) {
        throw new Error('Không tìm thấy phân loại.')
      } else if (status === 400) {
        throw new Error(data?.message || 'Dữ liệu không hợp lệ.')
      } else if (status === 500) {
        const serverError = data?.message || data?.error || 'Lỗi server nội bộ'
        throw new Error(`Lỗi server (500): ${serverError}. Vui lòng liên hệ admin hoặc thử lại sau.`)
      } else {
        throw new Error(data?.message || `Lỗi server: ${status}`)
      }
    } else if (error.request) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.')
    } else {
      throw new Error(error.message || 'Có lỗi xảy ra khi lấy thông tin phân loại.')
    }
  }
}

export const categoryService = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById
}
