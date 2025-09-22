import { NextPage } from 'next'
import AccountWithHeaderLayout from 'src/views/layouts/AccountLayoutNotApp'
import MyProfilePage from 'src/views/pages/my-profile'

type TProps = {}

const MyProfile: NextPage<TProps> = () => {
  return <MyProfilePage />
}

export default MyProfile

MyProfile.getLayout = (page: React.ReactNode) => <AccountWithHeaderLayout>{page}</AccountWithHeaderLayout>
