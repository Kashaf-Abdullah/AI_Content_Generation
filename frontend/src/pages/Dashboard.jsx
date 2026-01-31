// src/pages/Dashboard.jsx
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
} from '@chakra-ui/react'
import { FiFileText, FiTrendingUp, FiUsers, FiZap } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const toast = useToast()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // In a real app, you would fetch actual stats from your API
      const mockStats = {
        totalPosts: 42,
        trendingHashtags: 12,
        usage: user?.usageCount || 0,
        limit: user?.dailyLimit || 5,
      }
      setStats(mockStats)
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

  const statCards = [
    {
      icon: FiFileText,
      label: 'Total Posts',
      value: stats?.totalPosts || 0,
      color: 'blue',
      helpText: 'All time generated',
    },
    {
      icon: FiTrendingUp,
      label: 'Trending Hashtags',
      value: stats?.trendingHashtags || 0,
      color: 'green',
      helpText: 'Today in your location',
    },
    {
      icon: FiZap,
      label: 'Usage Today',
      value: `${stats?.usage || 0}/${stats?.limit || 5}`,
      color: 'orange',
      helpText: 'AI generations used',
    },
    {
      icon: FiUsers,
      label: 'Account Type',
      value: user?.subscription === 'pro' ? 'Pro' : 'Free',
      color: 'purple',
      helpText: user?.subscription === 'pro' ? 'Unlimited' : 'Upgrade for more',
    },
  ]

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
        Dashboard
      </Heading>

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
                <Button as={Link} to="/generate" colorScheme="brand" size="lg" leftIcon={<FiZap />}>
                  Generate New Post
                </Button>
                <Button as={Link} to="/history" variant="outline" size="lg">
                  View History
                </Button>
                {user?.subscription !== 'pro' && (
                  <Button as={Link} to="/pricing" colorScheme="green" variant="ghost" size="lg">
                    Upgrade to Pro
                  </Button>
                )}
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>Daily Usage</Heading>
              <VStack spacing={4}>
                <Box w="100%">
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" color="gray.600">Usage Progress</Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {stats?.usage || 0}/{stats?.limit || 5}
                    </Text>
                  </HStack>
                  <Progress 
                    value={(stats?.usage / stats?.limit) * 100 || 0} 
                    colorScheme={stats?.usage >= stats?.limit ? 'red' : 'brand'}
                    size="lg"
                    borderRadius="full"
                  />
                </Box>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  {user?.subscription === 'pro' 
                    ? 'You have unlimited generations!' 
                    : 'Upgrade to Pro for unlimited posts'}
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