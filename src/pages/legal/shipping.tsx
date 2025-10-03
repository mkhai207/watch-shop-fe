import { NextPage } from 'next'
import LayoutNotApp from 'src/views/layouts/LayoutNotApp'
import ShippingPage from 'src/views/pages/legal/Shipping'

type TProps = {}

const Shipping: NextPage<TProps> = () => {
  return <ShippingPage />
}

export default Shipping
;(Shipping as any).getLayout = (page: React.ReactNode) => <LayoutNotApp>{page}</LayoutNotApp>
