
// import {
//   Box,
//   VStack,
//   HStack,
//   Text,
//   Button,
//   Icon,
//   Divider,
//   useColorModeValue,
//   Badge,
// } from '@chakra-ui/react'
// import { Link, useLocation } from 'react-router-dom'
// import {
//   FiHome,
//   FiFileText,
//   FiClock,
//   FiDollarSign,
//   FiSettings,
//   FiTrendingUp,
//   FiUser,
//   FiShield,
// } from 'react-icons/fi'
// import { FaCrown } from 'react-icons/fa'
// import { useAuth } from '../contexts/AuthContext'

// const Sidebar = () => {
//   const location = useLocation()
//   const { user } = useAuth()
//   const bg = useColorModeValue('white', 'gray.800')
//   const borderColor = useColorModeValue('gray.200', 'gray.700')

//   // Base menu items for all users
//   const menuItems = [
//     { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
//     { icon: FiFileText, label: 'Generate Post', path: '/generate' },
//     { icon: FiClock, label: 'History', path: '/history' },
//     { icon: FiTrendingUp, label: 'Trending', path: '/trending' },
//     { icon: FiDollarSign, label: 'Pricing', path: '/pricing' },
//     { icon: FiUser, label: 'Profile', path: '/profile' },
//   ]

//   // Admin only menu item
//   const adminMenuItem = { 
//     icon: FiShield, 
//     label: 'Admin Dashboard', 
//     path: '/admin',
//     badge: 'Admin'
//   }

//   return (
//     <Box
//       as="nav"
//       position="fixed"
//       left="0"
//       top="0"
//       h="100vh"
//       w="250px"
//       bg={bg}
//       borderRight="1px"
//       borderColor={borderColor}
//       pt="80px"
//       display={{ base: 'none', md: 'block' }}
//       zIndex="900"
//     >
//       <VStack spacing={2} align="stretch" p={4}>
//         {/* Regular menu items */}
//         {menuItems.map((item) => (
//           <Button
//             key={item.path}
//             as={Link}
//             to={item.path}
//             leftIcon={<Icon as={item.icon} />}
//             justifyContent="flex-start"
//             variant={location.pathname === item.path ? 'solid' : 'ghost'}
//             colorScheme={location.pathname === item.path ? 'brand' : 'gray'}
//           >
//             {item.label}
//           </Button>
//         ))}

//         {/* Admin menu item - only show if user is admin */}
//         {user?.isAdmin && (
//           <Button
//             key={adminMenuItem.path}
//             as={Link}
//             to={adminMenuItem.path}
//             leftIcon={<Icon as={adminMenuItem.icon} />}
//             justifyContent="flex-start"
//             variant={location.pathname === adminMenuItem.path ? 'solid' : 'ghost'}
//             colorScheme={location.pathname === adminMenuItem.path ? 'purple' : 'gray'}
//           >
//             <HStack spacing={2}>
//               <Text>{adminMenuItem.label}</Text>
//               <Badge colorScheme="purple" size="sm">Admin</Badge>
//             </HStack>
//           </Button>
//         )}

//         <Divider my={4} />

//         {/* User plan info */}
//         <Box p={4} bg={user?.subscription === 'pro' ? 'green.50' : 'brand.50'} borderRadius="lg">
//           <HStack spacing={2} mb={1}>
//             {user?.subscription === 'pro' && <Icon as={FaCrown} color="green.600" />}
//             <Text fontSize="sm" fontWeight="bold" color={user?.subscription === 'pro' ? 'green.700' : 'brand.700'}>
//               {user?.subscription === 'pro' ? 'Pro Plan' : 'Free Plan'}
//             </Text>
//           </HStack>
//           <Text fontSize="xs" color="gray.600" mt={1}>
//             {user?.subscription === 'pro' 
//               ? 'Unlimited generations' 
//               : `${user?.usageCount || 0}/${user?.dailyLimit || 5} used today`}
//           </Text>
//         </Box>
//       </VStack>
//     </Box>
//   )
// }

// export default Sidebar
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Divider,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react'
import { Link, useLocation } from 'react-router-dom'
import {
  FiHome,
  FiFileText,
  FiClock,
  FiDollarSign,
  FiSettings,
  FiTrendingUp,
  FiUser,
  FiShield,
  FiCalendar, // Add this
} from 'react-icons/fi'
import { FaCrown } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'

const Sidebar = () => {
  const location = useLocation()
  const { user } = useAuth()
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // Base menu items for all users
  const menuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
    { icon: FiFileText, label: 'Generate Post', path: '/generate' },
    { icon: FiCalendar, label: 'Schedule', path: '/schedule' }, // Add this
    { icon: FiClock, label: 'History', path: '/history' },
    { icon: FiTrendingUp, label: 'Trending', path: '/trending' },
    { icon: FiDollarSign, label: 'Pricing', path: '/pricing' },
    { icon: FiUser, label: 'Profile', path: '/profile' },
  ]

  // Admin only menu item
  const adminMenuItem = { 
    icon: FiShield, 
    label: 'Admin Dashboard', 
    path: '/admin',
    badge: 'Admin'
  }

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
        {/* Regular menu items */}
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

        {/* Admin menu item - only show if user is admin */}
        {user?.isAdmin && (
          <Button
            key={adminMenuItem.path}
            as={Link}
            to={adminMenuItem.path}
            leftIcon={<Icon as={adminMenuItem.icon} />}
            justifyContent="flex-start"
            variant={location.pathname === adminMenuItem.path ? 'solid' : 'ghost'}
            colorScheme={location.pathname === adminMenuItem.path ? 'purple' : 'gray'}
          >
            <HStack spacing={2}>
              <Text>{adminMenuItem.label}</Text>
              <Badge colorScheme="purple" size="sm">Admin</Badge>
            </HStack>
          </Button>
        )}

        <Divider my={4} />

        {/* User plan info */}
        <Box p={4} bg={user?.subscription === 'pro' ? 'green.50' : 'brand.50'} borderRadius="lg">
          <HStack spacing={2} mb={1}>
            {user?.subscription === 'pro' && <Icon as={FaCrown} color="green.600" />}
            <Text fontSize="sm" fontWeight="bold" color={user?.subscription === 'pro' ? 'green.700' : 'brand.700'}>
              {user?.subscription === 'pro' ? 'Pro Plan' : 'Free Plan'}
            </Text>
          </HStack>
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