import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Box, Spinner ,Text} from '@chakra-ui/react'

const RoleBasedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="xl" color="brand.500" />
        <Text mt={4}>Loading...</Text>
      </Box>
    )
  }

  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Admin only route but user is not admin - redirect to user dashboard
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  // Regular user route - allow access
  return children
}

export default RoleBasedRoute