import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  GridItem,
  Card,
  CardBody,
  Text,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  VStack,
  HStack,
  Icon,
  Button,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { FiFileText, FiTrendingUp, FiUsers, FiZap, FiAlertCircle } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const [dashboardStats, setDashboardStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user, refreshUser } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login')
      return
    }
    
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      // Get user's current usage from auth context
      const currentUser = user
      
      if (!currentUser) return
      
      const usageData = {
        usageCount: currentUser?.usageCount || 0,
        dailyLimit: currentUser?.dailyLimit || 5,
        subscription: currentUser?.subscription || 'free',
      }
      
      // Fetch post count
      let totalPosts = 0
      try {
        const postsRes = await axios.get('http://localhost:5000/api/posts/history')
        totalPosts = postsRes.data.posts?.length || 0
      } catch (err) {
        console.log('Could not fetch posts:', err)
      }

      setDashboardStats({
        ...usageData,
        totalPosts,
        postsToday: 0, // You can calculate this with proper timestamps
      })
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  // Calculate remaining posts
  const remainingPosts = dashboardStats ? 
    Math.max(0, dashboardStats.dailyLimit - dashboardStats.usageCount) : 
    user?.dailyLimit - user?.usageCount || 5

  // Usage progress percentage
  const usagePercentage = dashboardStats ? 
    (dashboardStats.usageCount / dashboardStats.dailyLimit) * 100 : 
    (user?.usageCount / user?.dailyLimit) * 100 || 0

  const statCards = [
    {
      icon: FiFileText,
      label: 'Total Posts',
      value: dashboardStats?.totalPosts || 0,
      color: 'blue',
      helpText: 'All time generated posts',
    },
    {
      icon: FiZap,
      label: 'Used Today',
      value: `${dashboardStats?.usageCount || user?.usageCount || 0}/${dashboardStats?.dailyLimit || user?.dailyLimit || 5}`,
      color: 'orange',
      helpText: 'AI generations used today',
    },
    {
      icon: FiTrendingUp,
      label: 'Remaining',
      value: `${remainingPosts}`,
      color: remainingPosts > 0 ? 'green' : 'red',
      helpText: 'Posts left for today',
    },
    {
      icon: FiUsers,
      label: 'Account Type',
      value: user?.subscription === 'pro' ? 'Pro' : 'Free',
      color: 'purple',
      helpText: user?.subscription === 'pro' ? 'Unlimited posts' : 'Limited posts',
    },
  ]

  if (!user) {
    return (
      <Box textAlign="center" py={20}>
        <Heading color="brand.500" mb={4}>Please Login</Heading>
        <Text mb={6}>You need to login to access the dashboard</Text>
        <Button as={Link} to="/login" colorScheme="brand">
          Go to Login
        </Button>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Loading dashboard...</Text>
      </Box>
    )
  }

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Welcome, {user?.name}!
      </Heading>

      {/* Usage Alert */}
      {remainingPosts <= 0 && user?.subscription !== 'pro' && (
        <Alert status="warning" borderRadius="lg" mb={6}>
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Daily limit reached!</Text>
            <Text fontSize="sm">
              You've used all {user?.dailyLimit} posts for today. 
              Upgrade to Pro for unlimited posts.
            </Text>
          </Box>
        </Alert>
      )}

      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6} mb={8}>
        {statCards.map((stat, index) => (
          <GridItem key={index}>
            <Card>
              <CardBody>
                <HStack justify="space-between" mb={4}>
                  <Icon as={stat.icon} boxSize={6} color={`${stat.color}.500`} />
                  <Stat>
                    <StatLabel>{stat.label}</StatLabel>
                    <StatNumber fontSize="2xl">{stat.value}</StatNumber>
                    <StatHelpText>{stat.helpText}</StatHelpText>
                  </Stat>
                </HStack>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        <GridItem>
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>Quick Actions</Heading>
              <VStack align="stretch" spacing={4}>
                <Button 
                  as={Link} 
                  to="/generate" 
                  colorScheme="brand" 
                  size="lg" 
                  leftIcon={<FiZap />}
                  isDisabled={remainingPosts <= 0 && user?.subscription !== 'pro'}
                >
                  {remainingPosts <= 0 && user?.subscription !== 'pro'
                    ? 'Daily Limit Reached'
                    : 'Generate New Post'
                  }
                </Button>
                <Button as={Link} to="/history" variant="outline" size="lg">
                  View History
                </Button>
                {user?.subscription !== 'pro' && (
                  <Button as={Link} to="/pricing" colorScheme="green" variant="ghost" size="lg">
                    Upgrade to Pro (Unlimited)
                  </Button>
                )}
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>Daily Usage Progress</Heading>
              <VStack spacing={4}>
                <Box w="100%">
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" color="gray.600">Usage Progress</Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {user?.usageCount || 0}/{user?.dailyLimit || 5}
                    </Text>
                  </HStack>
                  <Progress 
                    value={usagePercentage} 
                    colorScheme={remainingPosts > 0 ? 'brand' : 'red'}
                    size="lg"
                    borderRadius="full"
                  />
                </Box>
                
                <Box bg="gray.50" p={4} borderRadius="lg" w="100%">
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm">Posts Used:</Text>
                      <Text fontSize="sm" fontWeight="bold" color="orange.600">
                        {user?.usageCount || 0}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Posts Remaining:</Text>
                      <Text fontSize="sm" fontWeight="bold" color="green.600">
                        {remainingPosts}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Daily Limit:</Text>
                      <Text fontSize="sm" fontWeight="bold">
                        {user?.dailyLimit || 5}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
                
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  {user?.subscription === 'pro' 
                    ? '🎉 You have unlimited generations!' 
                    : `🚀 ${remainingPosts} posts available today`}
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  )
}

export default Dashboard