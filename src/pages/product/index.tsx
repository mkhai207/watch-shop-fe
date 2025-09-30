import { NextPage } from 'next'
import LayoutNotApp from 'src/views/layouts/LayoutNotApp'
import LuxuryProductPage from 'src/views/pages/product/LuxuryProductPage'

type TProps = {}

const DetailProduct: NextPage<TProps> = () => {
  return (
    <>
      <LuxuryProductPage />
    </>
  )
}

export default DetailProduct

DetailProduct.getLayout = (page: React.ReactNode) => <LayoutNotApp>{page}</LayoutNotApp>
DetailProduct.authGuard = false
