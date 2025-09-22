import { NextPage } from 'next'
import LayoutNotApp from 'src/views/layouts/LayoutNotApp'
import DetailProductPage from 'src/views/pages/product/DetailProduct'

type TProps = {}

const DetailProduct: NextPage<TProps> = () => {
  return (
    <>
      <DetailProductPage />
    </>
  )
}

export default DetailProduct

DetailProduct.getLayout = (page: React.ReactNode) => <LayoutNotApp>{page}</LayoutNotApp>
DetailProduct.authGuard = false
