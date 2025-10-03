import { NextPage } from 'next'
import ManageSystemLayout from 'src/views/layouts/ManageSystemLayout'
import OrderStatusManagement from 'src/views/pages/manage-system/order-status'

type TProps = {}

const OrderStatusPage: NextPage<TProps> = () => {
  return (
    <>
      <OrderStatusManagement />
    </>
  )
}

OrderStatusPage.getLayout = (page: React.ReactNode) => <ManageSystemLayout>{page}</ManageSystemLayout>

export default OrderStatusPage
