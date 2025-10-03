import { NextPage } from 'next'
import LayoutNotApp from 'src/views/layouts/LayoutNotApp'
import LegalHubPage from 'src/views/pages/legal'

type TProps = {}

const Legal: NextPage<TProps> = () => {
  return <LegalHubPage />
}

export default Legal
;(Legal as any).getLayout = (page: React.ReactNode) => <LayoutNotApp>{page}</LayoutNotApp>
