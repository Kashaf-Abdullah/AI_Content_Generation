// src/components/Sidebar.jsx
import {
  Box,
  VStack,
  Text,
  Button,
  Icon,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react'
import { Link, useLocation } from 'react-router-dom'
import {
  FiHome,
  FiFileText,
  FiClock,
  FiDollarSign,
  FiSettings,
  FiTrendingUp,
} from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'

const Sidebar = () => {
  const location = useLocation()
  const { user } = useAuth()
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const menuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
    { icon: FiFileText, label: 'Generate Post', path: '/generate' },
    { icon: FiClock, label: 'History', path: '/history' },
    { icon: FiTrendingUp, label: 'Trending', path: '/trending' },
    { icon: FiDollarSign, label: 'Pricing', path: '/pricing' },
    { icon: FiSettings, label: 'Profile', path: '/profile' },
  ]

  return (
    <Box
      as="nav"
      position="fixed"
      left="0"
      top="0"
      h="100vh"
      w="250px"
      bg={bg}
      borderRight="1px"
      borderColor={borderColor}
      pt="80px"
      display={{ base: 'none', md: 'block' }}
      zIndex="900"
    >
      <VStack spacing={2} align="stretch" p={4}>
        {menuItems.map((item) => (
          <Button
            key={item.path}
            as={Link}
            to={item.path}
            leftIcon={<Icon as={item.icon} />}
            justifyContent="flex-start"
            variant={location.pathname === item.path ? 'solid' : 'ghost'}
            colorScheme={location.pathname === item.path ? 'brand' : 'gray'}
          >
            {item.label}
          </Button>
        ))}

        <Divider my={4} />

        <Box p={4} bg="brand.50" borderRadius="lg">
          <Text fontSize="sm" fontWeight="bold" color="brand.700">
            {user?.subscription === 'pro' ? 'Pro Plan' : 'Free Plan'}
          </Text>
          <Text fontSize="xs" color="gray.600" mt={1}>
            {user?.subscription === 'pro' 
              ? 'Unlimited generations' 
              : `${user?.usageCount || 0}/${user?.dailyLimit || 5} used today`}
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}

export default Sidebar