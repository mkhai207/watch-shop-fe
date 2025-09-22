import axios from 'axios'
import { CONFIG_API } from 'src/configs/api'
import instanceAxios from 'src/helpers/axios'
import { TParamsGetProducts } from 'src/types/product'
import qs from 'qs'

export const getAllProductsPublic = async (data: {
  params: TParamsGetProducts
  paramsSerializer?: (params: any) => string
}) => {
  try {
    const res = await axios.get(CONFIG_API.MANAGE_PRODUCT.PRODUCT.GET_ALL_PRODUCTS_PUBLIC, {
      params: data.params,
      paramsSerializer: data.paramsSerializer
    })

    return res.data
  } catch (error) {
    return error
  }
}

export const getDetailsProductPublic = async (id: string) => {
  try {
    const res = await axios.get(`${CONFIG_API.MANAGE_PRODUCT.PRODUCT.GET_DETAIL_PRODUCT_PUBLIC}/${id}`)

    return res.data
  } catch (error) {
    return error
  }
}

export const searchProducts = async (data: {
  params: TParamsGetProducts
  paramsSerializer?: (params: any) => string
}) => {
  try {
    const res = await axios.get(`${CONFIG_API.MANAGE_PRODUCT.PRODUCT.INDEX}/search`, {
      params: data.params,
      paramsSerializer: data.paramsSerializer
    })

    return res.data
  } catch (error) {
    return error
  }
}

export const getProductRecommend = async (id: string) => {
  try {
    const res = await axios.get(`${CONFIG_API.AI_RECOMMEND.INDEX}/${id}`)

    return res.data
  } catch (error) {
    return error
  }
}

export const getSimilarProducts = async (productId: string) => {
  try {
    const res = await axios.get(`${CONFIG_API.AI_RECOMMEND.GET_SIMILAR_PRODUCTS}/${productId}`)

    return res.data
  } catch (error) {
    return error
  }
}

export const createProduct = async (productData: any) => {
  try {
    const res = await instanceAxios.post(`${CONFIG_API.PRODUCT.INDEX}/create-product`, productData)

    return res.data
  } catch (error) {
    return error
  }
}

export const deleteProduct = async (productId: string) => {
  try {
    const res = await instanceAxios.delete(`${CONFIG_API.PRODUCT.INDEX}/delete/${productId}`)

    return res.data
  } catch (error) {
    return error
  }
}

export const updateProduct = async (productId: string, updateData: any) => {
  try {
    const res = await instanceAxios.put(`${CONFIG_API.PRODUCT.INDEX}/update/${productId}`, updateData)

    return res.data
  } catch (error) {
    return error
  }
}

export const getVariantId = async (productId: string, colorId: string, sizeId: string) => {
  try {
    const res = await instanceAxios.post(`${CONFIG_API.VARIANT.INDEX}/get-variantid`, {
      product_id: productId,
      color_id: colorId,
      size_id: sizeId
    })

    return res.data
  } catch (error) {
    return error
  }
}

export const getVariantsByProductId = async (params: { productId: string }) => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.VARIANT.INDEX}/get-variants`, {
      params,
      paramsSerializer: params => qs.stringify(params, { encode: false })
    })

    return res.data
  } catch (error) {
    return error
  }
}
