import { NextPage } from 'next'
import LayoutNotApp from 'src/views/layouts/LayoutNotApp'
import TermsPage from 'src/views/pages/legal/Terms'

type TProps = {}

const Terms: NextPage<TProps> = () => {
  return <TermsPage />
}

export default Terms
;(Terms as any).getLayout = (page: React.ReactNode) => <LayoutNotApp>{page}</LayoutNotApp>
