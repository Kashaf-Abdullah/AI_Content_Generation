

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Box,Heading,Button,Text } from '@chakra-ui/react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Generate from './pages/Generate'
import History from './pages/History'
import Login from './pages/Login'
import Register from './pages/Register'
import Pricing from './pages/Pricing'
import Profile from './pages/Profile'
import Trending from './pages/Trending'
import AdminDashboard from './pages/admin/AdminDashboard'
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard'
import { AuthProvider } from './contexts/AuthContext'
import RoleBasedRoute from './components/RoleBasedRoute'
import { Link, useLocation } from 'react-router-dom'
import Schedule from './pages/Schedule'
function App() {
  return (
    <Router>
      <AuthProvider>
        <Box minH="100vh" bg="gray.50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes - All require login */}
            <Route path="/" element={
              <RoleBasedRoute>
                <Layout />
              </RoleBasedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* User Routes - Accessible to all logged in users */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="generate" element={<Generate />} />
              <Route path="history" element={<History />} />
              <Route path="trending" element={<Trending />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="profile" element={<Profile />} />
                   <Route path="schedule" element={<Schedule />} />
              {/* Admin Routes - Only accessible to users with isAdmin = true */}
              <Route path="admin" element={
                <RoleBasedRoute adminOnly={true}>
                  <SuperAdminDashboard />
                </RoleBasedRoute>
              } />
              
              {/* Legacy Admin Route - Redirects to SuperAdminDashboard */}
              <Route path="admin-dashboard" element={<Navigate to="/admin" replace />} />
            </Route>
            
            {/* Catch all - 404 */}
            <Route path="*" element={
              <Box textAlign="center" py={20}>
                <Heading size="xl" mb={4}>404</Heading>
                <Text mb={6}>Page not found</Text>
                <Button as={Link} to="/" colorScheme="brand">
                  Go Home
                </Button>
              </Box>
            } />
          </Routes>
        </Box>
      </AuthProvider>
    </Router>
  )
}

export default App