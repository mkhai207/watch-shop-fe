import { NextPage } from 'next'
import LayoutNotApp from 'src/views/layouts/LayoutNotApp'
import WarrantyPage from 'src/views/pages/legal/Warranty'

type TProps = {}

const Warranty: NextPage<TProps> = () => {
  return <WarrantyPage />
}

export default Warranty
;(Warranty as any).getLayout = (page: React.ReactNode) => <LayoutNotApp>{page}</LayoutNotApp>
