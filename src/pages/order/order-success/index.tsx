import { NextPage } from 'next'
import LayoutNotApp from 'src/views/layouts/LayoutNotApp'
import OrderSuccessPage from 'src/views/pages/order/order-success'

type TProps = {}

const OrderSuccess: NextPage<TProps> = () => {
  return (
    <>
      <OrderSuccessPage />
    </>
  )
}

export default OrderSuccess

OrderSuccess.getLayout = (page: React.ReactNode) => <LayoutNotApp>{page}</LayoutNotApp>
