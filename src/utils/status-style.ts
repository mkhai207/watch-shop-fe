export const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'PENDINGPAYMENT':
      return 'warning'
    case 'UNPAID':
      return 'error'
    case 'PAID':
      return 'success'
    case 'SHIPPING':
      return 'info'
    case 'COMPLETED':
      return 'success'
    case 'CANCELLED':
      return 'error'
    default:
      return 'default'
  }
}

export const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Chờ xử lý'
    case 'PENDINGPAYMENT':
      return 'Chờ thanh toán'
    case 'UNPAID':
      return 'Chưa thanh toán'
    case 'PAID':
      return 'Đã thanh toán'
    case 'SHIPPING':
      return 'Đang vận chuyển'
    case 'COMPLETED':
      return 'Hoàn thành'
    case 'CANCELLED':
      return 'Đã hủy'
    default:
      return status
  }
}
