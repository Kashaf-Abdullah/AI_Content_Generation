// src/components/Layout.jsx
import { Outlet } from 'react-router-dom'
import { Box, Flex } from '@chakra-ui/react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useAuth } from '../contexts/AuthContext'

const Layout = () => {
  const { user } = useAuth()

  return (
    <Box>
      <Navbar />
      <Flex>
        {user && <Sidebar />}
        <Box
          as="main"
          flex="1"
          p={{ base: 4, md: 6 }}
          ml={{ base: 0, md: user ? '250px' : 0 }}
          transition="margin-left 0.3s"
        >
          <Outlet />
        </Box>
      </Flex>
    </Box>
  )
}

export default Layout