import { CONFIG_API } from 'src/configs/api'
import instanceAxios from 'src/helpers/axios'

export const uploadImage = async (file: File) => {
  try {
    const formData = new FormData()
    formData.append('image', file)

    const res = await instanceAxios.post(`${CONFIG_API.FILE.UPLOAD}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return res.data
  } catch (error) {
    return error
  }
}

export const uploadMultipleImages = async (files: File[]) => {
  try {
    const formData = new FormData()

    files.forEach(file => {
      formData.append('images', file)
    })

    const res = await instanceAxios.post(`${CONFIG_API.FILE.UPLOAD}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return res.data
  } catch (error) {
    return error
  }
}
