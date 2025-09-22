import { NextPage } from 'next'
import LayoutNotApp from 'src/views/layouts/LayoutNotApp'
import ProductPage from 'src/views/pages/product'

type TProps = {}

const DetailProduct: NextPage<TProps> = () => {
  return (
    <>
      <ProductPage />
    </>
  )
}

export default DetailProduct

DetailProduct.getLayout = (page: React.ReactNode) => <LayoutNotApp>{page}</LayoutNotApp>
DetailProduct.authGuard = false
