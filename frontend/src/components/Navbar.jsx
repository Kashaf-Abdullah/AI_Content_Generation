// // src/components/Navbar.jsx
// import { useState } from 'react'
// import {
//   Box,
//   Flex,
//   HStack,
//   IconButton,
//   Text,
//   Avatar,
//   Menu,
//   MenuButton,
//   MenuList,
//   MenuItem,
//   useColorModeValue,
//   Button,
// } from '@chakra-ui/react'
// import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
// import { Link, useNavigate } from 'react-router-dom'
// import { useAuth } from '../contexts/AuthContext'

// const Navbar = () => {
//   const [isOpen, setIsOpen] = useState(false)
//   const { user, logout } = useAuth()
//   const navigate = useNavigate()
//   const bg = useColorModeValue('white', 'gray.800')

//   const handleLogout = () => {
//     logout()
//     navigate('/login')
//   }

//   return (
//     <Box bg={bg} boxShadow="sm" px={4} py={3} position="sticky" top="0" zIndex="1000">
//       <Flex alignItems="center" justifyContent="space-between">
//         <Link to="/">
//           <Text fontSize="2xl" fontWeight="bold" color="brand.500">
//             PostGen AI
//           </Text>
//         </Link>

//         <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
//           {user ? (
//             <>
//               <Text color="gray.600">Welcome, {user.name}</Text>
//               <Menu>
//                 <MenuButton>
//                   <Avatar size="sm" name={user.name} bg="brand.500" />
//                 </MenuButton>
//                 <MenuList>
//                   <MenuItem as={Link} to="/profile">Profile</MenuItem>
//                   {user.isAdmin && (
//                     <MenuItem as={Link} to="/admin">Admin Dashboard</MenuItem>
//                   )}
//                   <MenuItem onClick={handleLogout}>Logout</MenuItem>
//                 </MenuList>
//               </Menu>
//             </>
//           ) : (
//             <>
//               <Button as={Link} to="/login" variant="ghost">Login</Button>
//               <Button as={Link} to="/register" colorScheme="brand">Sign Up</Button>
//             </>
//           )}
//         </HStack>

//         <IconButton
//           display={{ base: 'flex', md: 'none' }}
//           onClick={() => setIsOpen(!isOpen)}
//           icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
//           variant="ghost"
//           aria-label="Toggle Navigation"
//         />
//       </Flex>

//       {isOpen && (
//         <Box pb={4} display={{ md: 'none' }}>
//           {user ? (
//             <>
//               <Text mb={2} px={4} color="gray.600">Welcome, {user.name}</Text>
//               <Button as={Link} to="/profile" w="full" variant="ghost" justifyContent="flex-start">
//                 Profile
//               </Button>
//               {user.isAdmin && (
//                 <Button as={Link} to="/admin" w="full" variant="ghost" justifyContent="flex-start">
//                   Admin Dashboard
//                 </Button>
//               )}
//               <Button onClick={handleLogout} w="full" variant="ghost" justifyContent="flex-start">
//                 Logout
//               </Button>
//             </>
//           ) : (
//             <>
//               <Button as={Link} to="/login" w="full" variant="ghost" justifyContent="flex-start">
//                 Login
//               </Button>
//               <Button as={Link} to="/register" w="full" colorScheme="brand" justifyContent="flex-start">
//                 Sign Up
//               </Button>
//             </>
//           )}
//         </Box>
//       )}
//     </Box>
//   )
// }

// export default Navbar
// src/components/Navbar.jsx
import { useState } from 'react'
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Button,
} from '@chakra-ui/react'
import { FiMenu, FiX,FiUser,FiShield ,FiLogOut } from 'react-icons/fi' // Using react-icons
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const bg = useColorModeValue('white', 'gray.800')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Box bg={bg} boxShadow="sm" px={4} py={3} position="sticky" top="0" zIndex="1000">
      <Flex alignItems="center" justifyContent="space-between">
        <Link to="/">
          <Text fontSize="2xl" fontWeight="bold" color="brand.500">
            PostGen AI
          </Text>
        </Link>

        <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
          {user ? (
            <>
              <Text color="gray.600">Welcome, {user.name}</Text>
              <Menu>
                <MenuButton>
                  <Avatar size="sm" name={user.name} bg="brand.500" />
                </MenuButton>
                {/* <MenuList>
                  <MenuItem as={Link} to="/profile">Profile</MenuItem>
                  {user.isAdmin && (
                    <MenuItem as={Link} to="/admin">Admin Dashboard</MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </MenuList> */}
              
<MenuList>
  <MenuItem as={Link} to="/profile" icon={<FiUser />}>
    Profile
  </MenuItem>
  {user?.isAdmin && (
    <MenuItem as={Link} to="/admin" icon={<FiShield />}>
      Super Admin Dashboard
    </MenuItem>
  )}
  <MenuItem onClick={handleLogout} icon={<FiLogOut />}>
    Logout
  </MenuItem>
</MenuList>
              </Menu>
            </>
          ) : (
            <>
              <Button as={Link} to="/login" variant="ghost">Login</Button>
              <Button as={Link} to="/register" colorScheme="brand">Sign Up</Button>
            </>
          )}
        </HStack>

        <IconButton
          display={{ base: 'flex', md: 'none' }}
          onClick={() => setIsOpen(!isOpen)}
          icon={isOpen ? <FiX /> : <FiMenu />}
          variant="ghost"
          aria-label="Toggle Navigation"
        />
      </Flex>

      {isOpen && (
        <Box pb={4} display={{ md: 'none' }}>
          {user ? (
            <>
              <Text mb={2} px={4} color="gray.600">Welcome, {user.name}</Text>
              <Button as={Link} to="/profile" w="full" variant="ghost" justifyContent="flex-start">
                Profile
              </Button>
              {user.isAdmin && (
                <Button as={Link} to="/admin" w="full" variant="ghost" justifyContent="flex-start">
                  Admin Dashboard
                </Button>
              )}
              <Button onClick={handleLogout} w="full" variant="ghost" justifyContent="flex-start">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button as={Link} to="/login" w="full" variant="ghost" justifyContent="flex-start">
                Login
              </Button>
              <Button as={Link} to="/register" w="full" colorScheme="brand" justifyContent="flex-start">
                Sign Up
              </Button>
            </>
          )}
        </Box>
      )}
    </Box>
  )
}

export default Navbar