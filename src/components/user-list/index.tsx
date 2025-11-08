import React, { useEffect, useState } from 'react'
import { 
  Card, 
  CardContent, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Chip,
  Avatar,
  Box,
  CircularProgress
} from '@mui/material'
import { useAuth } from 'src/hooks/useAuth'
import { TUser } from 'src/types/auth'

const UserList: React.FC = () => {
  const { fetchUsers } = useAuth()
  const [users, setUsers] = useState<TUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetchUsers()
        setUsers(response.data)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch users')
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [fetchUsers])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error" variant="h6">
            Error: {error}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Danh sách người dùng
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Avatar</TableCell>
                <TableCell>Họ tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Số điện thoại</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => {
                const fullName = `${user.first_name} ${user.last_name}`.trim()
                const initials = fullName ? fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()
                const isActive = user.status === 'ACTIVE' || user.status === 'active'
                
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar src={undefined}>
                        {initials}
                      </Avatar>
                    </TableCell>
                    <TableCell>{fullName || user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone_number}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role.name} 
                        color={user.role.code === 'ADMIN' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={isActive ? 'Hoạt động' : 'Không hoạt động'} 
                        color={isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}

export default UserList 