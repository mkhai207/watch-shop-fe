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
  SEARCH: {
    INDEX: `${BASE_URL}/search`
  },

  CART: {
    INDEX: `${BASE_URL}/carts`
  },
  CART_ITEM: {
    INDEX: `${BASE_URL}/cart-items`
  },
  ORDER: {
    INDEX: `${BASE_URL}/orders`,
    GET_ORDERS: `${BASE_URL}/orders/get-orders`
  },
  DISCOUNT: {
    INDEX: `${BASE_URL}/discounts`,
    GET_DISCOUNTS: `${BASE_URL}/discounts`,
    CREATE_DISCOUNT: `${BASE_URL}/discounts/create-discount`
  },
  CATEGORY: {
    INDEX: `${BASE_URL}/categorys`,
    GET_CATEGORIES: `${BASE_URL}/categorys`,
    GET_CATEGORY_BY_ID: `${BASE_URL}/categorys`,
    CREATE_CATEGORY: `${BASE_URL}/categorys`,
    UPDATE_CATEGORY: `${BASE_URL}/categorys`,
    DELETE_CATEGORY: `${BASE_URL}/categorys`
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
  MOVEMENT_TYPE: {
    INDEX: `${BASE_URL}/movement-type`
  },
  WATCH: {
    INDEX: `${BASE_URL}/watches`
  },
  WATCH_VARIANT: {
    INDEX: `${BASE_URL}/watch-variants`
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
  ORDER_STATUS: {
    INDEX: `${BASE_URL}/order-status`
  },
  ORDER_STATUS_HISTORY: {
    INDEX: `${BASE_URL}/order-status-histories`
  },
  AI_RECOMMEND: {
    INDEX: `${AI_URL}/recommendations`,
    GET_SIMILAR_PRODUCTS: `${AI_URL}/recommendations_by_product`
  },
  REPORT: {
    INDEX: `${BASE_URL}/reports`
  }
}
