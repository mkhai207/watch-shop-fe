import { NextPage } from 'next'
import AccountWithHeaderLayout from 'src/views/layouts/AccountLayoutNotApp'
import OrderHistoryPage from 'src/views/pages/order/order-history'

type TProps = {}

const OrderHistory: NextPage<TProps> = () => {
  return (
    <>
      <OrderHistoryPage />
    </>
  )
}

export default OrderHistory

// OrderHistory.getLayout = (page: React.ReactNode) => <LayoutNotApp>{page}</LayoutNotApp>
OrderHistory.getLayout = (page: React.ReactNode) => <AccountWithHeaderLayout>{page}</AccountWithHeaderLayout>
