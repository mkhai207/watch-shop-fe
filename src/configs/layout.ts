export interface MenuItem {
  title: string
  icon: string
  path?: string
  children?: MenuItem[]
}

export const VerticalItems: MenuItem[] = [
  {
    title: 'Hệ thống',
    icon: 'icon-park-outline:system',
    children: [
      {
        title: 'Thống kê',
        icon: 'material-symbols:analytics',
        path: '/manage-system/dashboard'
      },
      {
        title: 'Người dùng',
        icon: 'mdi:user',
        path: '/manage-system/user'
      }
    ]
  },
  {
    title: 'Quản trị sản phẩm',
    icon: 'oui:nav-manage',
    children: [
      {
        title: 'Sản phẩm',
        icon: 'ix:product',
        path: '/manage-system/product'
      },
      {
        title: 'Đơn hàng',
        icon: 'lets-icons:order',
        path: '/manage-system/order'
      },
      {
        title: 'Đánh giá',
        icon: 'material-symbols:rate-review-outline-rounded',
        path: '/manage-system/review'
      },
      {
        title: 'Khuyến mãi',
        icon: 'mdi:discount',
        path: '/manage-system/discount'
      },
      {
        title: 'Phân loại',
        icon: 'material-symbols:category',
        path: '/manage-system/category'
      },
      {
        title: 'Thương hiệu',
        icon: 'tabler:brand-nexo',
        path: '/manage-system/brand'
      }
    ]
  }
]
