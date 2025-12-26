import { NextPage } from 'next'
import BlankLayout from 'src/views/layouts/BlankLayout'
import ForgotPasswordPage from 'src/views/pages/forgot-password'

const ForgotPassword: NextPage = () => {
  return <ForgotPasswordPage />
}

ForgotPassword.guestGuard = true

ForgotPassword.getLayout = (page: React.ReactNode) => <BlankLayout>{page}</BlankLayout>

export default ForgotPassword
