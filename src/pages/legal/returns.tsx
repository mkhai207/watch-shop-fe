import { NextPage } from 'next'
import LayoutNotApp from 'src/views/layouts/LayoutNotApp'
import ReturnsPage from 'src/views/pages/legal/Returns'

type TProps = {}

const Returns: NextPage<TProps> = () => {
  return <ReturnsPage />
}

export default Returns
;(Returns as any).getLayout = (page: React.ReactNode) => <LayoutNotApp>{page}</LayoutNotApp>
