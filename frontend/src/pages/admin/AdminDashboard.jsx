// src/pages/admin/AdminDashboard.jsx
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
  useToast,
} from '@chakra-ui/react'
import { FiUsers, FiFileText, FiDollarSign, FiTrendingUp } from 'react-icons/fi'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const toast = useToast()

  useEffect(() => {
    if (user?.isAdmin) {
      fetchAdminData()
    }
  }, [user])

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats'),
        axios.get('http://localhost:5000/api/admin/users'),
      ])

      setStats(statsRes.data.stats)
      setUsers(usersRes.data.users || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResetLimit = async (userId) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/users/${userId}/reset-limit`)
      toast({
        title: 'Success',
        description: 'User limit reset',
        status: 'success',
        duration: 3000,
      })
      fetchAdminData()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset limit',
        status: 'error',
        duration: 3000,
      })
    }
  }

  if (!user?.isAdmin) {
    return (
      <Box textAlign="center" py={20}>
        <Heading color="red.500" mb={4}>Access Denied</Heading>
        <Text>You need admin privileges to access this page.</Text>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Loading admin dashboard...</Text>
      </Box>
    )
  }

  const adminStats = [
    {
      icon: FiUsers,
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      help: `${stats?.proUsers || 0} Pro, ${stats?.freeUsers || 0} Free`,
      color: 'blue',
    },
    {
      icon: FiFileText,
      label: 'Total Posts',
      value: stats?.totalPosts || 0,
      help: 'All generated posts',
      color: 'green',
    },
    {
      icon: FiDollarSign,
      label: 'Active Subscriptions',
      value: stats?.paidSubscriptions || 0,
      help: 'Revenue generating',
      color: 'purple',
    },
    {
      icon: FiTrendingUp,
      label: 'Active Today',
      value: stats?.activeUsersToday || 0,
      help: 'Users active today',
      color: 'orange',
    },
  ]

  return (
    <Box>
      <Heading size="lg" mb={6}>Admin Dashboard</Heading>

      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6} mb={8}>
        {adminStats.map((stat, index) => (
          <GridItem key={index}>
            <Card>
              <CardBody>
                <HStack>
                  <Box
                    p={3}
                    bg={`${stat.color}.100`}
                    borderRadius="lg"
                    color={`${stat.color}.600`}
                  >
                    <stat.icon size={24} />
                  </Box>
                  <Stat>
                    <StatLabel>{stat.label}</StatLabel>
                    <StatNumber fontSize="2xl">{stat.value}</StatNumber>
                    <StatHelpText>{stat.help}</StatHelpText>
                  </Stat>
                </HStack>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6} mb={8}>
        <GridItem>
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>Recent Users</Heading>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>User</Th>
                    <Th>Email</Th>
                    <Th>Plan</Th>
                    <Th>Usage</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.slice(0, 5).map((user) => (
                    <Tr key={user._id}>
                      <Td>
                        <Text fontWeight="medium">{user.name}</Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm" color="gray.600">{user.email}</Text>
                      </Td>
                      <Td>
                        <Badge colorScheme={user.subscription === 'pro' ? 'green' : 'gray'}>
                          {user.subscription}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {user.usageCount}/{user.dailyLimit}
                        </Text>
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResetLimit(user._id)}
                        >
                          Reset Limit
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>Quick Actions</Heading>
              <VStack align="stretch" spacing={3}>
                <Button colorScheme="brand" onClick={fetchAdminData}>
                  Refresh Data
                </Button>
                <Button variant="outline">
                  Export Users
                </Button>
                <Button variant="outline">
                  View All Posts
                </Button>
                <Button variant="outline" colorScheme="red">
                  Maintenance Mode
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      <Card>
        <CardBody>
          <Heading size="md" mb={4}>System Status</Heading>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
            <Box p={4} bg="green.50" borderRadius="lg">
              <Text fontWeight="bold" color="green.700">Database</Text>
              <Text fontSize="sm" color="green.600">Connected ✓</Text>
            </Box>
            <Box p={4} bg="blue.50" borderRadius="lg">
              <Text fontWeight="bold" color="blue.700">AI Service</Text>
              <Text fontSize="sm" color="blue.600">Operational ✓</Text>
            </Box>
            <Box p={4} bg="orange.50" borderRadius="lg">
              <Text fontWeight="bold" color="orange.700">Stripe</Text>
              <Text fontSize="sm" color="orange.600">Connected ✓</Text>
            </Box>
          </Grid>
        </CardBody>
      </Card>
    </Box>
  )
}

export default AdminDashboard