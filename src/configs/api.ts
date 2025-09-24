export const BASE_URL = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:8080/v1'
export const AI_URL = 'http://localhost:8000'

export const CONFIG_API = {
  AUTH: {
    INDEX: `${BASE_URL}/auth`,
    AUTH_ME: `${BASE_URL}/auth/me`
  },
  USER: {
    INDEX: `${BASE_URL}/users`,
    GET_USERS: `${BASE_URL}/users/get-users`
  },
  MANAGE_PRODUCT: {
    PRODUCT: {
      INDEX: `${BASE_URL}/products`,
      GET_ALL_PRODUCTS_PUBLIC: `${BASE_URL}/products/get-products`,
      GET_DETAIL_PRODUCT_PUBLIC: `${BASE_URL}/products/get-product`
    }
  },
  CART: {
    INDEX: `${BASE_URL}/carts`
  },
  ORDER: {
    INDEX: `${BASE_URL}/orders`,
    GET_ORDERS: `${BASE_URL}/orders/get-orders`
  },
  DISCOUNT: {
    INDEX: `${BASE_URL}/discounts`,
    GET_DISCOUNTS: `${BASE_URL}/discounts/get-discounts`,
    CREATE_DISCOUNT: `${BASE_URL}/discounts/create-discount`
  },
  CATEGORY: {
    INDEX: `${BASE_URL}/categories`,
    GET_CATEGORIES: `${BASE_URL}/categories/get-categories`,
    CREATE_CATEGORY: `${BASE_URL}/categories/create-category`,
    UPDATE_CATEGORY: `${BASE_URL}/categories/update`,
    DELETE_CATEGORY: `${BASE_URL}/categories/delete`
  },
  CATEGORY_V1: {
    INDEX: `${BASE_URL}/categorys`
  },
  BRAND: {
    INDEX: `${BASE_URL}/brands`
  },
  COLOR: {
    INDEX: `${BASE_URL}/colors`
  },
  STRAP_MATERIAL: {
    INDEX: `${BASE_URL}/strap-materials`
  },
  PRODUCT: {
    INDEX: `${BASE_URL}/products`
  },
  VARIANT: {
    INDEX: `${BASE_URL}/variants`
  },
  FILE: {
    UPLOAD: `${BASE_URL}/uploads`
  },
  USER_INTERACTION: {
    INDEX: `${BASE_URL}/user-interactions`
  },
  REVIEW: {
    INDEX: `${BASE_URL}/reviews`
  },
  ADDRESS: {
    INDEX: `${BASE_URL}/addresses`
  },
  DASHBOARD: {
    INDEX: `${BASE_URL}/dashboard`
  },
  AI_RECOMMEND: {
    INDEX: `${AI_URL}/recommendations`,
    GET_SIMILAR_PRODUCTS: `${AI_URL}/recommendations_by_product`
  }
}
