




import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  GridItem,
  Card,
  CardBody,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  HStack,
  VStack,
  Icon,
  useToast,
  Avatar,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Switch,
  Tooltip,
  Progress,
  Divider,
} from '@chakra-ui/react'
import {
  FiUsers,
  FiUserPlus,
  FiFileText,
  FiDollarSign,
  FiTrendingUp,
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiStar,
  FiShield,
  FiUserX,
  FiUserCheck,
  FiRefreshCw,
  FiDownload,
  FiActivity,
  FiCalendar,
  FiZap,
} from 'react-icons/fi'
import { FaCrown, FaUserCircle } from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPlan, setFilterPlan] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const { user, refreshUser } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    // Check if user is super admin
    if (!user) {
      navigate('/login')
      return
    }
    
    if (!user.isAdmin) {
      navigate('/dashboard')
      toast({
        title: 'Access Denied',
        description: 'You need admin privileges to access this page',
        status: 'error',
        duration: 3000,
      })
      return
    }
    
    fetchAdminData()
  }, [user])

  useEffect(() => {
    // Filter users based on search and plan filter
    let filtered = [...users]
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Filter by plan
    if (filterPlan !== 'all') {
      filtered = filtered.filter(u => u.subscription === filterPlan)
    }
    
    setFilteredUsers(filtered)
  }, [searchTerm, filterPlan, users])

  const fetchAdminData = async () => {
    setLoading(true)
    
    try {
      // Fetch all users
      const usersRes = await axios.get('http://localhost:5000/api/admin/users')
      console.log('Users response:', usersRes.data)
      
      const usersList = usersRes.data.users || []
      setUsers(usersList)
      setFilteredUsers(usersList)
      
      // Calculate statistics
      const totalUsers = usersList.length
      const proUsers = usersList.filter(u => u.subscription === 'pro').length
      const freeUsers = totalUsers - proUsers
      const adminUsers = usersList.filter(u => u.isAdmin === true).length
      
      // Calculate total posts generated
      let totalPosts = 0
      try {
        const postsRes = await axios.get('http://localhost:5000/api/admin/posts')
        totalPosts = postsRes.data.posts?.length || 0
      } catch (err) {
        console.log('Could not fetch posts:', err)
      }
      
      // Calculate total usage count
      const totalUsage = usersList.reduce((sum, u) => sum + (u.usageCount || 0), 0)
      const avgUsage = totalUsers > 0 ? Math.round(totalUsage / totalUsers) : 0
      
      setStats({
        totalUsers,
        proUsers,
        freeUsers,
        adminUsers,
        totalPosts,
        totalUsage,
        avgUsage,
        activeSubscriptions: proUsers,
      })
      
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load admin dashboard data',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAdmin = async (userId, currentStatus) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/users/${userId}/toggle-admin`, {
        isAdmin: !currentStatus
      })
      
      toast({
        title: 'Success',
        description: `Admin status ${!currentStatus ? 'granted' : 'revoked'}`,
        status: 'success',
        duration: 3000,
      })
      
      fetchAdminData()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update admin status',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleToggleSubscription = async (userId, currentPlan) => {
    const newPlan = currentPlan === 'pro' ? 'free' : 'pro'
    
    try {
      await axios.post(`http://localhost:5000/api/admin/users/${userId}/toggle-subscription`, {
        subscription: newPlan
      })
      
      toast({
        title: 'Success',
        description: `User ${newPlan === 'pro' ? 'upgraded to Pro' : 'downgraded to Free'}`,
        status: 'success',
        duration: 3000,
      })
      
      fetchAdminData()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update subscription',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleResetLimit = async (userId) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/users/${userId}/reset-limit`)
      
      toast({
        title: 'Success',
        description: 'User usage limit has been reset',
        status: 'success',
        duration: 3000,
      })
      
      fetchAdminData()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset user limit',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }
    
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`)
      
      toast({
        title: 'Success',
        description: 'User has been deleted',
        status: 'success',
        duration: 3000,
      })
      
      fetchAdminData()
      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleExportData = () => {
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        stats: stats,
        users: users,
        generatedBy: user?.email
      }
      
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `superadmin-export-${new Date().getTime()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: 'Export Successful',
        description: 'Admin data has been exported',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export data',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const openUserDetails = (user) => {
    setSelectedUser(user)
    onOpen()
  }

  const getPlanColor = (plan) => {
    return plan === 'pro' ? 'green' : 'gray'
  }

  const getUsagePercentage = (usageCount, dailyLimit) => {
    return (usageCount / dailyLimit) * 100
  }

  if (!user?.isAdmin) {
    return (
      <Box textAlign="center" py={20}>
        <Icon as={FiShield} boxSize={16} color="red.500" mb={4} />
        <Heading size="lg" color="red.500" mb={4}>Access Denied</Heading>
        <Text mb={6}>You need super admin privileges to access this page.</Text>
        <Button as={Link} to="/dashboard" colorScheme="brand">
          Go to Dashboard
        </Button>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="xl" color="brand.500" />
        <Text mt={4}>Loading super admin dashboard...</Text>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <HStack spacing={3}>
            <Icon as={FaCrown} boxSize={8} color="yellow.500" />
            <Heading size="lg">Super Admin Dashboard</Heading>
          </HStack>
          <Text color="gray.600" mt={1}>
            Manage all users, subscriptions, and platform activity
          </Text>
        </Box>
        <HStack spacing={3}>
          <Tooltip label="Export Data">
            <Button
              leftIcon={<FiDownload />}
              onClick={handleExportData}
              variant="outline"
            >
              Export
            </Button>
          </Tooltip>
          <Tooltip label="Refresh Data">
            <Button
              leftIcon={<FiRefreshCw />}
              onClick={fetchAdminData}
              isLoading={loading}
              colorScheme="brand"
            >
              Refresh
            </Button>
          </Tooltip>
        </HStack>
      </Flex>

      {/* Admin Badge */}
      <Alert status="info" borderRadius="lg" mb={6}>
        <AlertIcon />
        <Box>
          <Text fontWeight="bold">Super Admin Mode Active</Text>
          <Text fontSize="sm">You have full administrative privileges. All actions are logged.</Text>
        </Box>
      </Alert>

      {/* Statistics Cards */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }} gap={4} mb={8}>
        <GridItem>
          <Card bg="blue.50">
            <CardBody>
              <Stat>
                <StatLabel color="blue.700">Total Users</StatLabel>
                <StatNumber fontSize="2xl" color="blue.700">{stats?.totalUsers || 0}</StatNumber>
                <StatHelpText color="blue.600">
                  <Icon as={FiUsers} mr={1} /> Registered users
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card bg="green.50">
            <CardBody>
              <Stat>
                <StatLabel color="green.700">Pro Users</StatLabel>
                <StatNumber fontSize="2xl" color="green.700">{stats?.proUsers || 0}</StatNumber>
                <StatHelpText color="green.600">
                  <Icon as={FaCrown} mr={1} /> {((stats?.proUsers / stats?.totalUsers) * 100 || 0).toFixed(1)}% of users
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card bg="gray.50">
            <CardBody>
              <Stat>
                <StatLabel color="gray.700">Free Users</StatLabel>
                <StatNumber fontSize="2xl" color="gray.700">{stats?.freeUsers || 0}</StatNumber>
                <StatHelpText color="gray.600">
                  <Icon as={FiUserCheck} mr={1} /> {((stats?.freeUsers / stats?.totalUsers) * 100 || 0).toFixed(1)}% of users
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card bg="purple.50">
            <CardBody>
              <Stat>
                <StatLabel color="purple.700">Admins</StatLabel>
                <StatNumber fontSize="2xl" color="purple.700">{stats?.adminUsers || 0}</StatNumber>
                <StatHelpText color="purple.600">
                  <Icon as={FiShield} mr={1} /> Super admins
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card bg="orange.50">
            <CardBody>
              <Stat>
                <StatLabel color="orange.700">Total Posts</StatLabel>
                <StatNumber fontSize="2xl" color="orange.700">{stats?.totalPosts || 0}</StatNumber>
                <StatHelpText color="orange.600">
                  <Icon as={FiFileText} mr={1} /> Generated content
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card bg="teal.50">
            <CardBody>
              <Stat>
                <StatLabel color="teal.700">Avg Usage</StatLabel>
                <StatNumber fontSize="2xl" color="teal.700">{stats?.avgUsage || 0}</StatNumber>
                <StatHelpText color="teal.600">
                  <Icon as={FiZap} mr={1} /> Posts per user
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Main Content Tabs */}
      <Tabs colorScheme="brand" variant="enclosed">
        <TabList>
          <Tab><Icon as={FiUsers} mr={2} /> All Users ({stats?.totalUsers})</Tab>
          <Tab><Icon as={FaCrown} mr={2} /> Pro Users ({stats?.proUsers})</Tab>
          <Tab><Icon as={FiUserCheck} mr={2} /> Free Users ({stats?.freeUsers})</Tab>
          <Tab><Icon as={FiShield} mr={2} /> Admins ({stats?.adminUsers})</Tab>
        </TabList>

        <TabPanels>
          {/* All Users Tab */}
          <TabPanel>
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {/* Search and Filter */}
                  <Flex direction={{ base: 'column', md: 'row' }} gap={4} mb={4}>
                    <InputGroup flex={1}>
                      <InputLeftElement>
                        <Icon as={FiSearch} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                    
                    <Select 
                      w={{ base: '100%', md: '200px' }}
                      value={filterPlan}
                      onChange={(e) => setFilterPlan(e.target.value)}
                    >
                      <option value="all">All Plans</option>
                      <option value="pro">Pro Users</option>
                      <option value="free">Free Users</option>
                    </Select>
                  </Flex>

                  {/* Users Table */}
                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>User</Th>
                          <Th>Email</Th>
                          <Th>Plan</Th>
                          <Th>Admin</Th>
                          <Th>Usage</Th>
                          <Th>Posts</Th>
                          <Th>Joined</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredUsers.length === 0 ? (
                          <Tr>
                            <Td colSpan={8} textAlign="center" py={10}>
                              <Text color="gray.500">No users found</Text>
                            </Td>
                          </Tr>
                        ) : (
                          filteredUsers.map((u) => (
                            <Tr key={u._id}>
                              <Td>
                                <HStack spacing={3}>
                                  <Avatar 
                                    size="sm" 
                                    name={u.name} 
                                    bg={u.subscription === 'pro' ? 'green.500' : 'brand.500'}
                                  />
                                  <Text fontWeight="medium">{u.name}</Text>
                                  {u.isAdmin && (
                                    <Badge colorScheme="purple">Admin</Badge>
                                  )}
                                </HStack>
                              </Td>
                              <Td>
                                <Text fontSize="sm">{u.email}</Text>
                              </Td>
                              <Td>
                                <Badge colorScheme={getPlanColor(u.subscription)}>
                                  {u.subscription === 'pro' ? (
                                    <HStack spacing={1}>
                                      <FaCrown />
                                      <Text>Pro</Text>
                                    </HStack>
                                  ) : 'Free'}
                                </Badge>
                              </Td>
                              <Td>
                                <Switch
                                  isChecked={u.isAdmin}
                                  onChange={() => handleToggleAdmin(u._id, u.isAdmin)}
                                  colorScheme="purple"
                                  size="sm"
                                />
                              </Td>
                              <Td>
                                <VStack align="start" spacing={1}>
                                  <HStack justify="space-between" w="100%">
                                    <Text fontSize="xs">{u.usageCount || 0}/{u.dailyLimit || 5}</Text>
                                  </HStack>
                                  <Progress 
                                    value={getUsagePercentage(u.usageCount || 0, u.dailyLimit || 5)} 
                                    size="xs" 
                                    w="100px"
                                    colorScheme={u.subscription === 'pro' ? 'green' : 'brand'}
                                  />
                                </VStack>
                              </Td>
                              <Td>
                                <Text>{u.postCount || 0}</Text>
                              </Td>
                              <Td>
                                <Text fontSize="sm">
                                  {new Date(u.createdAt).toLocaleDateString()}
                                </Text>
                              </Td>
                              <Td>
                                <Menu>
                                  <MenuButton
                                    as={Button}
                                    variant="ghost"
                                    size="sm"
                                  >
                                    <Icon as={FiMoreVertical} />
                                  </MenuButton>
                                  <MenuList>
                                    <MenuItem 
                                      icon={<FiEdit2 />}
                                      onClick={() => openUserDetails(u)}
                                    >
                                      View Details
                                    </MenuItem>
                                    <MenuItem 
                                      icon={u.subscription === 'pro' ? <FiUserCheck /> : <FaCrown />}
                                      onClick={() => handleToggleSubscription(u._id, u.subscription)}
                                    >
                                      {u.subscription === 'pro' ? 'Downgrade to Free' : 'Upgrade to Pro'}
                                    </MenuItem>
                                    <MenuItem 
                                      icon={<FiRefreshCw />}
                                      onClick={() => handleResetLimit(u._id)}
                                    >
                                      Reset Usage Limit
                                    </MenuItem>
                                    <MenuItem 
                                      icon={<FiTrash2 />}
                                      color="red.500"
                                      onClick={() => handleDeleteUser(u._id)}
                                    >
                                      Delete User
                                    </MenuItem>
                                  </MenuList>
                                </Menu>
                              </Td>
                            </Tr>
                          ))
                        )}
                      </Tbody>
                    </Table>
                  </Box>

                  {/* Footer Stats */}
                  <Flex justify="space-between" align="center" mt={4}>
                    <Text fontSize="sm" color="gray.600">
                      Showing {filteredUsers.length} of {users.length} users
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Total Pro Users: {stats?.proUsers} | Total Free Users: {stats?.freeUsers}
                    </Text>
                  </Flex>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Pro Users Tab */}
          <TabPanel>
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md" mb={4}>Pro Users</Heading>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>User</Th>
                        <Th>Email</Th>
                        <Th>Posts</Th>
                        <Th>Joined</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {users.filter(u => u.subscription === 'pro').map((u) => (
                        <Tr key={u._id}>
                          <Td>
                            <HStack spacing={3}>
                              <Avatar size="sm" name={u.name} bg="green.500" />
                              <Text fontWeight="medium">{u.name}</Text>
                            </HStack>
                          </Td>
                          <Td>{u.email}</Td>
                          <Td>{u.postCount || 0}</Td>
                          <Td>{new Date(u.createdAt).toLocaleDateString()}</Td>
                          <Td>
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleToggleSubscription(u._id, 'pro')}
                            >
                              Downgrade
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Free Users Tab */}
          <TabPanel>
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md" mb={4}>Free Users</Heading>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>User</Th>
                        <Th>Email</Th>
                        <Th>Usage</Th>
                        <Th>Posts</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {users.filter(u => u.subscription !== 'pro').map((u) => (
                        <Tr key={u._id}>
                          <Td>
                            <HStack spacing={3}>
                              <Avatar size="sm" name={u.name} bg="gray.500" />
                              <Text fontWeight="medium">{u.name}</Text>
                            </HStack>
                          </Td>
                          <Td>{u.email}</Td>
                          <Td>
                            <Text fontSize="sm">
                              {u.usageCount || 0}/{u.dailyLimit || 5}
                            </Text>
                          </Td>
                          <Td>{u.postCount || 0}</Td>
                          <Td>
                            <Button
                              size="sm"
                              colorScheme="green"
                              variant="ghost"
                              onClick={() => handleToggleSubscription(u._id, 'free')}
                            >
                              Upgrade
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Admins Tab */}
          <TabPanel>
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md" mb={4}>Administrators</Heading>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Admin</Th>
                        <Th>Email</Th>
                        <Th>Role</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {users.filter(u => u.isAdmin === true).map((u) => (
                        <Tr key={u._id}>
                          <Td>
                            <HStack spacing={3}>
                              <Avatar size="sm" name={u.name} bg="purple.500" />
                              <Text fontWeight="medium">{u.name}</Text>
                            </HStack>
                          </Td>
                          <Td>{u.email}</Td>
                          <Td>
                            <Badge colorScheme="purple">Super Admin</Badge>
                          </Td>
                          <Td>
                            <Badge colorScheme="green">Active</Badge>
                          </Td>
                          <Td>
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleToggleAdmin(u._id, true)}
                              isDisabled={u._id === user._id}
                            >
                              Revoke Admin
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* User Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Avatar name={selectedUser?.name} />
              <Box>
                <Text>{selectedUser?.name}</Text>
                <Text fontSize="sm" color="gray.600">{selectedUser?.email}</Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUser && (
              <VStack spacing={4} align="stretch">
                <Divider />
                
                <Grid templateColumns="1fr 1fr" gap={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Account Type</Text>
                    <Badge colorScheme={getPlanColor(selectedUser.subscription)} mt={1}>
                      {selectedUser.subscription === 'pro' ? 'Pro Account' : 'Free Account'}
                    </Badge>
                  </Box>
                  
                  <Box>
                    <Text fontSize="sm" color="gray.600">Admin Status</Text>
                    <HStack mt={1}>
                      <Badge colorScheme={selectedUser.isAdmin ? 'purple' : 'gray'}>
                        {selectedUser.isAdmin ? 'Admin' : 'User'}
                      </Badge>
                    </HStack>
                  </Box>
                  
                  <Box>
                    <Text fontSize="sm" color="gray.600">Member Since</Text>
                    <Text fontWeight="medium">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </Text>
                  </Box>
                  
                  <Box>
                    <Text fontSize="sm" color="gray.600">Last Active</Text>
                    <Text fontWeight="medium">
                      {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleDateString() : 'N/A'}
                    </Text>
                  </Box>
                </Grid>

                <Divider />

                <Box>
                  <Text fontSize="sm" color="gray.600" mb={2}>Usage Statistics</Text>
                  <VStack spacing={3}>
                    <HStack justify="space-between" w="100%">
                      <Text fontSize="sm">Daily Usage:</Text>
                      <Text fontSize="sm" fontWeight="bold">
                        {selectedUser.usageCount || 0}/{selectedUser.dailyLimit || 5}
                      </Text>
                    </HStack>
                    <Progress 
                      value={getUsagePercentage(selectedUser.usageCount || 0, selectedUser.dailyLimit || 5)} 
                      size="sm" 
                      w="100%"
                      colorScheme={selectedUser.subscription === 'pro' ? 'green' : 'brand'}
                    />
                    <HStack justify="space-between" w="100%">
                      <Text fontSize="sm">Total Posts:</Text>
                      <Text fontSize="sm" fontWeight="bold">{selectedUser.postCount || 0}</Text>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" variant="ghost" mr={3} onClick={() => handleDeleteUser(selectedUser?._id)}>
              Delete User
            </Button>
            <Button colorScheme="brand" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default SuperAdminDashboard