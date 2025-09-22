import { NextPage } from 'next'
import UserLayout from 'src/views/layouts/UserLayout'
import UserList from 'src/components/user-list'
import { Box, Container, Typography } from '@mui/material'

const UsersPage: NextPage = () => {
  return (
    <UserLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Quản lý người dùng
          </Typography>
          <UserList />
        </Box>
      </Container>
    </UserLayout>
  )
}

export default UsersPage 