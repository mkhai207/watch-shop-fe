import { NextPage } from 'next'
import AccountWithHeaderLayout from 'src/views/layouts/AccountLayoutNotApp'
import OrderDetailPage from 'src/views/pages/order/order-detail'

type TProps = {}

const OrderDetail: NextPage<TProps> = () => {
  return (
    <>
      <OrderDetailPage />
    </>
  )
}

export default OrderDetail

OrderDetail.getLayout = (page: React.ReactNode) => <AccountWithHeaderLayout>{page}</AccountWithHeaderLayout>
