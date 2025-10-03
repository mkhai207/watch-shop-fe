import { NextPage } from 'next'
import LayoutNotApp from 'src/views/layouts/LayoutNotApp'
import OrderFailPage from 'src/views/pages/order/order-fail'

type TProps = {}

const OrderFail: NextPage<TProps> = () => {
  return <OrderFailPage />
}

export default OrderFail

OrderFail.getLayout = (page: React.ReactNode) => <LayoutNotApp>{page}</LayoutNotApp>
