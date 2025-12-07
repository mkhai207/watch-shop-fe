export interface MenuItem {
  title: string
  icon: string
  path?: string
  children?: MenuItem[]
}

export const VerticalItems: MenuItem[] = [
  {
    title: 'Điều hướng',
    icon: 'mdi:menu',
    children: [
      {
        title: 'Dashboard',
        icon: 'mdi:view-dashboard-outline',
        path: '/manage-system/dashboard'
      },
      {
        title: 'Sản phẩm',
        icon: 'mdi:package-variant',
        path: '/manage-system/watch'
      },
      {
        title: 'Đơn hàng',
        icon: 'mdi:cart-outline',
        path: '/manage-system/order'
      },
      {
        title: 'Khách hàng',
        icon: 'mdi:account-group-outline',
        path: '/manage-system/user'
      },
      {
        title: 'Thương hiệu',
        icon: 'mdi:office-building-outline',
        path: '/manage-system/brand'
      },
      {
        title: 'Phân loại',
        icon: 'mdi:tag-outline',
        path: '/manage-system/category'
      },
      {
        title: 'Khuyến mãi',
        icon: 'mdi:percent-outline',
        path: '/manage-system/discount'
      },
      {
        title: 'Màu sắc',
        icon: 'mdi:palette',
        path: '/manage-system/color'
      },
      {
        title: 'Trạng thái đơn hàng',
        icon: 'mdi:clipboard-list-outline',
        path: '/manage-system/order-status'
      },
      {
        title: 'Vật liệu dây đeo',
        icon: 'mdi:watch',
        path: '/manage-system/strap-material'
      },
      {
        title: 'Loại máy',
        icon: 'mdi:cogs',
        path: '/manage-system/movement-type'
      }
    ]
  }
]
