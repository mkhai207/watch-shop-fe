import { NextPage } from 'next'
import LayoutNotApp from 'src/views/layouts/LayoutNotApp'
import ContactPage from 'src/views/pages/contact'

type TProps = {}

const Contact: NextPage<TProps> = () => {
  return <ContactPage />
}

export default Contact
;(Contact as any).getLayout = (page: React.ReactNode) => <LayoutNotApp>{page}</LayoutNotApp>
