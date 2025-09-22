import React from 'react'
import LayoutNotApp from './LayoutNotApp'
import AccountLayout from './AccountLayout'

type TProps = {
  children: React.ReactNode
}

const AccountWithHeaderLayout: React.FC<TProps> = ({ children }) => {
  return (
    <LayoutNotApp>
      <AccountLayout>{children}</AccountLayout>
    </LayoutNotApp>
  )
}

export default AccountWithHeaderLayout
