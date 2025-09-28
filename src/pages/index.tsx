'use client'
import Head from 'next/head'
import LayoutNotApp from 'src/views/layouts/LayoutNotApp'
import HomePage from 'src/views/pages/home'

export default function Home() {
  return (
    <>
      <Head>
        <title>CHRONOS - Đồng hồ cao cấp</title>
        <meta name='description' content='Bộ sưu tập đồng hồ cao cấp với thiết kế tinh tế và chất lượng vượt trội' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <HomePage />
    </>
  )
}

Home.getLayout = (page: React.ReactNode) => <LayoutNotApp>{page}</LayoutNotApp>
Home.authGuard = false
Home.guestGuard = false
