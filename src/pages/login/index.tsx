import { NextPage } from 'next'
import BlankLayout from 'src/views/layouts/BlankLayout'
import LoginPage from 'src/views/pages/login'

type TProps = {}

const Login: NextPage<TProps> = () => {
  return <LoginPage />
}

export default Login

Login.getLayout = (page: React.ReactNode) => <BlankLayout>{page}</BlankLayout>
Login.guestGuard = true
