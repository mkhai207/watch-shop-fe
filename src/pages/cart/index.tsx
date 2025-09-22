import { NextPage } from 'next'
import LayoutNotApp from 'src/views/layouts/LayoutNotApp'
import CartPage from 'src/views/pages/cart'

type TProps = {}

const MyCart: NextPage<TProps> = () => {
  return <CartPage />
}

export default MyCart

MyCart.getLayout = (page: React.ReactNode) => <LayoutNotApp>{page}</LayoutNotApp>
