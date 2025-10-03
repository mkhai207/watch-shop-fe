import { NextPage } from 'next'
import LayoutNotApp from 'src/views/layouts/LayoutNotApp'
import AboutPage from 'src/views/pages/about'

type TProps = {}

const About: NextPage<TProps> = () => {
  return <AboutPage />
}

export default About
;(About as any).getLayout = (page: React.ReactNode) => <LayoutNotApp>{page}</LayoutNotApp>
