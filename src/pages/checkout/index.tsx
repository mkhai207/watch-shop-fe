import { NextPage } from 'next'
import LayoutNotApp from 'src/views/layouts/LayoutNotApp'
import CheckoutPage from 'src/views/pages/checkout'

type TProps = {}

const Checkout: NextPage<TProps> = () => {
  return <CheckoutPage />
}

export default Checkout

Checkout.getLayout = (page: React.ReactNode) => <LayoutNotApp>{page}</LayoutNotApp>
