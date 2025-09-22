import { NextPage } from 'next'
import AccountWithHeaderLayout from 'src/views/layouts/AccountLayoutNotApp'
import AddressPage from 'src/views/pages/addresses'

type TProps = {}

const MyAddress: NextPage<TProps> = () => {
  return <AddressPage />
}

export default MyAddress

MyAddress.getLayout = (page: React.ReactNode) => <AccountWithHeaderLayout>{page}</AccountWithHeaderLayout>
