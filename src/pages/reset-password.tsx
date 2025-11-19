import { NextPage } from 'next'
import BlankLayout from 'src/views/layouts/BlankLayout'
import ResetPasswordPage from 'src/views/pages/reset-password'

const ResetPassword: NextPage = () => {
  return <ResetPasswordPage />
}

ResetPassword.guestGuard = true

ResetPassword.getLayout = (page: React.ReactNode) => <BlankLayout>{page}</BlankLayout>

export default ResetPassword
