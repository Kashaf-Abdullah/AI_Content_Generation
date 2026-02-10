import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Heading,
  Text,
  Grid,
  GridItem,
  Badge,
  Button,
  Icon,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tag,
  TagLabel,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { 
  FiTrendingUp, 
  FiHash, 
  FiSearch, 
  FiMapPin, 
  FiClock,
  FiBarChart2,
  FiFilter,
  FiCopy,
  FiRefreshCw
} from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const Trending = () => {
  const [loading, setLoading] = useState(true)
  const [trendingData, setTrendingData] = useState(null)
  const [location, setLocation] = useState('karachi')
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useAuth()
  const toast = useToast()

  // Mock data for trending hashtags (replace with API call)
  const mockTrendingData = {
    location: 'karachi',
    updatedAt: new Date().toISOString(),
    hashtags: [
      { tag: '#KarachiFood', posts: 12500, growth: 42, category: 'Food' },
      { tag: '#KarachiEats', posts: 8900, growth: 35, category: 'Food' },
      { tag: '#SindhBusiness', posts: 7500, growth: 28, category: 'Business' },
      { tag: '#KarachiSales', posts: 6200, growth: 52, category: 'Shopping' },
      { tag: '#PakistanStartups', posts: 5400, growth: 18, category: 'Business' },
      { tag: '#KarachiTech', posts: 4800, growth: 32, category: 'Technology' },
      { tag: '#KarachiDeals', posts: 4100, growth: 45, category: 'Shopping' },
      { tag: '#SindhCulture', posts: 3800, growth: 22, category: 'Culture' },
    ],
    categories: [
      { name: 'Food', count: 21400, trending: true },
      { name: 'Shopping', count: 10300, trending: true },
      { name: 'Business', count: 12900, trending: true },
      { name: 'Technology', count: 4800, trending: false },
      { name: 'Culture', count: 3800, trending: false },
      { name: 'Travel', count: 2900, trending: false },
    ],
    platforms: {
      instagram: 65,
      twitter: 20,
      facebook: 10,
      linkedin: 5,
    }
  }

  useEffect(() => {
    fetchTrendingData()
  }, [location])

  const fetchTrendingData = async () => {
    setLoading(true)
    
    try {
      // For now, using mock data. Replace with real API call:
      // const response = await axios.get(`http://localhost:5000/api/hashtags/trending?location=${location}`)
      
      // Simulate API delay
      setTimeout(() => {
        setTrendingData(mockTrendingData)
        setLoading(false)
      }, 800)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load trending data',
        status: 'error',
        duration: 3000,
      })
      setLoading(false)
    }
  }

  const handleCopyHashtag = (hashtag) => {
    navigator.clipboard.writeText(hashtag)
    toast({
      title: 'Copied!',
      description: `${hashtag} copied to clipboard`,
      status: 'success',
      duration: 2000,
    })
  }

  const handleUseHashtag = (hashtag) => {
    // Navigate to generate page with hashtag prefilled
    window.location.href = `/generate?hashtag=${encodeURIComponent(hashtag)}`
  }

  const handleRefresh = () => {
    fetchTrendingData()
    toast({
      title: 'Refreshing...',
      description: 'Fetching latest trending data',
      status: 'info',
      duration: 2000,
    })
  }

  const getGrowthColor = (growth) => {
    if (growth > 40) return 'green'
    if (growth > 20) return 'blue'
    if (growth > 0) return 'yellow'
    return 'red'
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Food': 'red',
      'Shopping': 'purple',
      'Business': 'blue',
      'Technology': 'green',
      'Culture': 'orange',
      'Travel': 'teal',
    }
    return colors[category] || 'gray'
  }

  const filteredHashtags = trendingData?.hashtags.filter(hashtag => 
    searchTerm === '' || 
    hashtag.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hashtag.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (loading) {
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="xl" color="brand.500" />
        <Text mt={4}>Loading trending data...</Text>
      </Box>
    )
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">
          <Icon as={FiTrendingUp} mr={2} /> Trending Hashtags
        </Heading>
        <Button
          leftIcon={<FiRefreshCw />}
          onClick={handleRefresh}
          size="sm"
          variant="outline"
        >
          Refresh
        </Button>
      </HStack>

      {/* Location Selector */}
      <Card mb={6}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack>
              <Icon as={FiMapPin} color="brand.500" />
              <Text fontWeight="medium">Select Location</Text>
            </HStack>
            <HStack spacing={4}>
              <Select 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                maxW="200px"
              >
                <option value="karachi">Karachi</option>
                <option value="lahore">Lahore</option>
                <option value="islamabad">Islamabad</option>
                <option value="hyderabad">Hyderabad</option>
                <option value="peshawar">Peshawar</option>
                <option value="multan">Multan</option>
              </Select>
              <Text fontSize="sm" color="gray.600">
                <Icon as={FiClock} mr={1} /> 
                Updated {new Date(trendingData.updatedAt).toLocaleTimeString()}
              </Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Search and Filter */}
      <Card mb={6}>
        <CardBody>
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
            <InputGroup>
              <InputLeftElement>
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search hashtags or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Select placeholder="Filter by category">
              <option value="all">All Categories</option>
              <option value="food">Food</option>
              <option value="shopping">Shopping</option>
              <option value="business">Business</option>
              <option value="technology">Technology</option>
            </Select>
          </Grid>
        </CardBody>
      </Card>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        {/* Main Content - Trending Hashtags */}
        <GridItem>
          <Card>
            <CardBody>
              <Tabs colorScheme="brand">
                <TabList>
                  <Tab>Top Hashtags</Tab>
                  <Tab>By Platform</Tab>
                  <Tab>Categories</Tab>
                </TabList>

                <TabPanels mt={4}>
                  {/* Top Hashtags Tab */}
                  <TabPanel>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Rank</Th>
                          <Th>Hashtag</Th>
                          <Th>Category</Th>
                          <Th isNumeric>Posts</Th>
                          <Th isNumeric>Growth</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredHashtags.map((hashtag, index) => (
                          <Tr key={hashtag.tag}>
                            <Td>
                              <Badge colorScheme="brand" fontSize="md" p={1} borderRadius="md">
                                #{index + 1}
                              </Badge>
                            </Td>
                            <Td>
                              <Text fontWeight="bold" fontSize="lg">
                                {hashtag.tag}
                              </Text>
                            </Td>
                            <Td>
                              <Badge colorScheme={getCategoryColor(hashtag.category)}>
                                {hashtag.category}
                              </Badge>
                            </Td>
                            <Td isNumeric>
                              <Text fontWeight="bold">{hashtag.posts.toLocaleString()}</Text>
                            </Td>
                            <Td isNumeric>
                              <Badge colorScheme={getGrowthColor(hashtag.growth)}>
                                {hashtag.growth > 0 ? '+' : ''}{hashtag.growth}%
                              </Badge>
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  leftIcon={<FiCopy />}
                                  onClick={() => handleCopyHashtag(hashtag.tag)}
                                >
                                  Copy
                                </Button>
                                <Button
                                  size="sm"
                                  colorScheme="brand"
                                  onClick={() => handleUseHashtag(hashtag.tag)}
                                >
                                  Use
                                </Button>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TabPanel>

                  {/* By Platform Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      {Object.entries(trendingData.platforms).map(([platform, percentage]) => (
                        <Box key={platform}>
                          <HStack justify="space-between" mb={2}>
                            <Text fontWeight="medium" textTransform="capitalize">
                              {platform}
                            </Text>
                            <Text fontWeight="bold">{percentage}%</Text>
                          </HStack>
                          <Progress 
                            value={percentage} 
                            colorScheme="brand"
                            size="lg"
                            borderRadius="full"
                          />
                        </Box>
                      ))}
                    </VStack>
                  </TabPanel>

                  {/* Categories Tab */}
                  <TabPanel>
                    <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }} gap={4}>
                      {trendingData.categories.map(category => (
                        <Card key={category.name} variant="outline">
                          <CardBody>
                            <VStack spacing={3}>
                              <Badge 
                                colorScheme={category.trending ? 'green' : 'gray'}
                                fontSize="md"
                                p={2}
                              >
                                {category.name}
                              </Badge>
                              <Text fontSize="2xl" fontWeight="bold">
                                {category.count.toLocaleString()}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                Total Posts
                              </Text>
                              {category.trending && (
                                <Tag colorScheme="green" size="sm">
                                  <Icon as={FiTrendingUp} mr={1} /> Trending
                                </Tag>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </Grid>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </GridItem>

        {/* Sidebar - Quick Stats & Tips */}
        <GridItem>
          <Card mb={6}>
            <CardBody>
              <Heading size="md" mb={4}>Trending Stats</Heading>
              
              <VStack spacing={4} align="stretch">
                <Box bg="brand.50" p={4} borderRadius="lg">
                  <Text fontWeight="bold" color="brand.700" mb={2}>
                    <Icon as={FiHash} mr={2} /> Total Trending Hashtags
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold">
                    {trendingData.hashtags.length}
                  </Text>
                </Box>

                <Box bg="green.50" p={4} borderRadius="lg">
                  <Text fontWeight="bold" color="green.700" mb={2}>
                    <Icon as={FiTrendingUp} mr={2} /> Fastest Growing
                  </Text>
                  <Text fontSize="xl" fontWeight="bold">
                    #{trendingData.hashtags[0]?.tag || 'N/A'}
                  </Text>
                  <Text fontSize="sm" color="green.600">
                    +{trendingData.hashtags[0]?.growth || 0}% today
                  </Text>
                </Box>

                <Box bg="purple.50" p={4} borderRadius="lg">
                  <Text fontWeight="bold" color="purple.700" mb={2}>
                    <Icon as={FiBarChart2} mr={2} /> Most Posts
                  </Text>
                  <Text fontSize="xl" fontWeight="bold">
                    {trendingData.hashtags[0]?.posts.toLocaleString() || '0'} posts
                  </Text>
                  <Text fontSize="sm" color="purple.600">
                    In last 24 hours
                  </Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Heading size="md" mb={4}>Quick Tips</Heading>
              
              <VStack spacing={4} align="stretch">
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">
                    Use trending hashtags to increase your post visibility
                  </Text>
                </Alert>

                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">
                    Mix trending and niche hashtags for better engagement
                  </Text>
                </Alert>

                <Box>
                  <Text fontWeight="medium" mb={2}>Best Time to Post:</Text>
                  <Text fontSize="sm" color="gray.600">
                    7-9 PM in {location.charAt(0).toUpperCase() + location.slice(1)}
                  </Text>
                </Box>

                <Button
                  colorScheme="brand"
                  as="a"
                  href="/generate"
                  leftIcon={<FiHash />}
                >
                  Generate with Trends
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Popular Hashtag Groups */}
      <Card mt={6}>
        <CardBody>
          <Heading size="md" mb={4}>Popular Hashtag Groups</Heading>
          
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
            <Card variant="outline">
              <CardBody>
                <VStack spacing={2}>
                  <Text fontWeight="bold" color="red.600">Food & Restaurant</Text>
                  <HStack flexWrap="wrap" gap={2} justify="center">
                    <Tag colorScheme="red">#KarachiFood</Tag>
                    <Tag colorScheme="red">#KarachiEats</Tag>
                    <Tag colorScheme="red">#FoodieKarachi</Tag>
                  </HStack>
                  <Button size="sm" variant="ghost" mt={2}>
                    Use Group
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            <Card variant="outline">
              <CardBody>
                <VStack spacing={2}>
                  <Text fontWeight="bold" color="blue.600">Business</Text>
                  <HStack flexWrap="wrap" gap={2} justify="center">
                    <Tag colorScheme="blue">#SindhBusiness</Tag>
                    <Tag colorScheme="blue">#PakistanStartups</Tag>
                    <Tag colorScheme="blue">#KarachiBusiness</Tag>
                  </HStack>
                  <Button size="sm" variant="ghost" mt={2}>
                    Use Group
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            <Card variant="outline">
              <CardBody>
                <VStack spacing={2}>
                  <Text fontWeight="bold" color="purple.600">Shopping</Text>
                  <HStack flexWrap="wrap" gap={2} justify="center">
                    <Tag colorScheme="purple">#KarachiSales</Tag>
                    <Tag colorScheme="purple">#KarachiDeals</Tag>
                    <Tag colorScheme="purple">#KarachiShopping</Tag>
                  </HStack>
                  <Button size="sm" variant="ghost" mt={2}>
                    Use Group
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            <Card variant="outline">
              <CardBody>
                <VStack spacing={2}>
                  <Text fontWeight="bold" color="green.600">Culture</Text>
                  <HStack flexWrap="wrap" gap={2} justify="center">
                    <Tag colorScheme="green">#SindhCulture</Tag>
                    <Tag colorScheme="green">#KarachiHeritage</Tag>
                    <Tag colorScheme="green">#PakistanCulture</Tag>
                  </HStack>
                  <Button size="sm" variant="ghost" mt={2}>
                    Use Group
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </Grid>
        </CardBody>
      </Card>

      {/* How to Use Section */}
      <Card mt={6}>
        <CardBody>
          <Heading size="md" mb={4}>How to Use Trending Hashtags</Heading>
          
          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
            <Box>
              <HStack mb={2}>
                <Box bg="brand.100" p={2} borderRadius="md">
                  <Text fontWeight="bold" color="brand.600">1</Text>
                </Box>
                <Text fontWeight="bold">Copy & Use</Text>
              </HStack>
              <Text fontSize="sm" color="gray.600">
                Click "Copy" to copy any hashtag or "Use" to automatically add it to your next post.
              </Text>
            </Box>

            <Box>
              <HStack mb={2}>
                <Box bg="brand.100" p={2} borderRadius="md">
                  <Text fontWeight="bold" color="brand.600">2</Text>
                </Box>
                <Text fontWeight="bold">Filter by Location</Text>
              </HStack>
              <Text fontSize="sm" color="gray.600">
                Select your city to see location-specific trending hashtags relevant to your audience.
              </Text>
            </Box>

            <Box>
              <HStack mb={2}>
                <Box bg="brand.100" p={2} borderRadius="md">
                  <Text fontWeight="bold" color="brand.600">3</Text>
                </Box>
                <Text fontWeight="bold">Track Growth</Text>
              </HStack>
              <Text fontSize="sm" color="gray.600">
                Monitor hashtag growth percentages to identify rising trends before they peak.
              </Text>
            </Box>
          </Grid>
        </CardBody>
      </Card>
    </Box>
  )
}

export default Trending