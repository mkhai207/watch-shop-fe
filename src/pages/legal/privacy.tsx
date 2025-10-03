import { NextPage } from 'next'
import LayoutNotApp from 'src/views/layouts/LayoutNotApp'
import PrivacyPage from 'src/views/pages/legal/Privacy'

type TProps = {}

const Privacy: NextPage<TProps> = () => {
  return <PrivacyPage />
}

export default Privacy
;(Privacy as any).getLayout = (page: React.ReactNode) => <LayoutNotApp>{page}</LayoutNotApp>
