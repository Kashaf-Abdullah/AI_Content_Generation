
import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Heading,
  Text,
  Avatar,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Grid,
  GridItem,
  Badge,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Switch,
  Icon,
  Spinner,
} from '@chakra-ui/react'
import { 
  FiUser, 
  FiMail, 
  FiCalendar, 
  FiEdit, 
  FiSave, 
  FiShield, 
  FiCreditCard,
  FiLock,
  FiTrash2,
  FiBell,
  FiDownload
} from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import NotificationSettings from './NotificationSettings'
const Profile = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const { user, refreshUser } = useAuth()
  const toast = useToast()

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Fetch user profile
      const profileRes = await axios.get('http://localhost:5000/api/auth/profile')
      const userData = profileRes.data.user
      
      // Fetch user's posts count
      let postsCount = 0
      try {
        const postsRes = await axios.get('http://localhost:5000/api/posts/history')
        postsCount = postsRes.data.posts?.length || 0
      } catch (err) {
        console.log('Could not fetch posts count:', err)
      }

      setProfileData({
        name: userData.name,
        email: userData.email,
        subscription: userData.subscription || 'free',
        usageCount: userData.usageCount || 0,
        dailyLimit: userData.dailyLimit || 5,
        joinDate: new Date(userData.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        lastLogin: new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        postsGenerated: postsCount,
        isEmailVerified: true,
        notifications: {
          email: true,
          usageAlerts: true,
          newFeatures: false,
        }
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!profileData) return
    
    setSaving(true)
    
    try {
      await axios.put('http://localhost:5000/api/auth/profile', {
        name: profileData.name,
        email: profileData.email,
      })
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
        status: 'success',
        duration: 3000,
      })
      
      setEditing(false)
      refreshUser() // Refresh user data in auth context
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNotificationChange = (key) => {
    setProfileData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }))
  }

  const handleExportData = async () => {
    try {
      toast({
        title: 'Preparing Export',
        description: 'Your data export is being prepared...',
        status: 'info',
        duration: 2000,
      })
      
      // In a real app, you would call an API to export data
      // For now, we'll create a simple JSON export
      const exportData = {
        userProfile: profileData,
        exportDate: new Date().toISOString(),
      }
      
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `postgen-profile-${new Date().getTime()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: 'Export Complete',
        description: 'Your data has been downloaded',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export your data',
        status: 'error',
        duration: 3000,
      })
    }
  }

  if (loading) {
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="xl" color="brand.500" />
        <Text mt={4}>Loading your profile...</Text>
      </Box>
    )
  }

  if (!profileData) {
    return (
      <Box textAlign="center" py={20}>
        <Heading size="lg" color="red.500" mb={4}>Profile Not Found</Heading>
        <Text>Unable to load your profile. Please try again.</Text>
      </Box>
    )
  }

  const remainingPosts = profileData.dailyLimit - profileData.usageCount
  const usagePercentage = (profileData.usageCount / profileData.dailyLimit) * 100

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Your Profile
      </Heading>

      <Grid templateColumns={{ base: '1fr', lg: '3fr 2fr' }} gap={6}>
        {/* Left Column - Profile Info */}
        <GridItem>
          <Card>
            <CardBody>
              <Tabs colorScheme="brand">
                <TabList>
                  <Tab>Personal Info</Tab>
                  <Tab>Account Settings</Tab>
                  <Tab>Notifications</Tab>
                  <Tab>Notifications</Tab>
                </TabList>

                <TabPanels mt={4}>
                  {/* Personal Info Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <HStack justify="space-between">
                        <Heading size="md">Personal Information</Heading>
                        <Button
                          leftIcon={editing ? <FiSave /> : <FiEdit />}
                          onClick={editing ? handleSaveProfile : () => setEditing(true)}
                          colorScheme={editing ? 'green' : 'brand'}
                          isLoading={saving}
                          size="sm"
                        >
                          {editing ? 'Save Changes' : 'Edit Profile'}
                        </Button>
                      </HStack>

                      <HStack spacing={6}>
                        <Avatar
                          size="xl"
                          name={profileData.name}
                          bg="brand.500"
                          color="white"
                          fontSize="2xl"
                        />
                        <Box>
                          <Text fontSize="2xl" fontWeight="bold">{profileData.name}</Text>
                          <Badge 
                            colorScheme={profileData.subscription === 'pro' ? 'green' : 'gray'}
                            mt={1}
                          >
                            {profileData.subscription === 'pro' ? 'Pro Account' : 'Free Account'}
                          </Badge>
                          <Text fontSize="sm" color="gray.600" mt={1}>
                            Member since {profileData.joinDate}
                          </Text>
                        </Box>
                      </HStack>

                      <Divider />

                      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
                        <FormControl>
                          <FormLabel display="flex" alignItems="center" gap={2}>
                            <FiUser /> Full Name
                          </FormLabel>
                          {editing ? (
                            <Input
                              name="name"
                              value={profileData.name}
                              onChange={handleInputChange}
                              placeholder="Enter your full name"
                            />
                          ) : (
                            <Text fontSize="lg" fontWeight="medium">{profileData.name}</Text>
                          )}
                        </FormControl>

                        <FormControl>
                          <FormLabel display="flex" alignItems="center" gap={2}>
                            <FiMail /> Email Address
                          </FormLabel>
                          {editing ? (
                            <Input
                              name="email"
                              type="email"
                              value={profileData.email}
                              onChange={handleInputChange}
                              placeholder="Enter your email"
                            />
                          ) : (
                            <HStack>
                              <Text fontSize="lg">{profileData.email}</Text>
                              {profileData.isEmailVerified && (
                                <Badge colorScheme="green" size="sm">Verified</Badge>
                              )}
                            </HStack>
                          )}
                        </FormControl>

                        <FormControl>
                          <FormLabel display="flex" alignItems="center" gap={2}>
                            <FiCalendar /> Join Date
                          </FormLabel>
                          <Text>{profileData.joinDate}</Text>
                        </FormControl>

                        <FormControl>
                          <FormLabel display="flex" alignItems="center" gap={2}>
                            <FiCalendar /> Last Login
                          </FormLabel>
                          <Text>{profileData.lastLogin}</Text>
                        </FormControl>
                      </Grid>
                    </VStack>
                  </TabPanel>

                  {/* Account Settings Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Heading size="md">Account Settings</Heading>
                      
                      <Box>
                        <Text fontWeight="semibold" mb={2} display="flex" alignItems="center" gap={2}>
                          <FiCreditCard /> Subscription Plan
                        </Text>
                        <Card variant="outline" p={4}>
                          <HStack justify="space-between">
                            <Box>
                              <Text fontWeight="bold" fontSize="lg">
                                {profileData.subscription === 'pro' ? 'Pro Plan' : 'Free Plan'}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {profileData.subscription === 'pro' 
                                  ? 'Unlimited posts, premium features' 
                                  : 'Limited posts, basic features'}
                              </Text>
                            </Box>
                            <Button 
                              colorScheme="brand" 
                              variant={profileData.subscription === 'pro' ? 'outline' : 'solid'}
                              as="a"
                              href="/pricing"
                              leftIcon={<FiCreditCard />}
                            >
                              {profileData.subscription === 'pro' ? 'Manage Plan' : 'Upgrade Now'}
                            </Button>
                          </HStack>
                        </Card>
                      </Box>

                      <Box>
                        <Text fontWeight="semibold" mb={2} display="flex" alignItems="center" gap={2}>
                          <FiLock /> Password
                        </Text>
                        <Button variant="outline" leftIcon={<FiLock />}>
                          Change Password
                        </Button>
                      </Box>

                      <Box>
                        <Text fontWeight="semibold" mb={2} display="flex" alignItems="center" gap={2}>
                          <FiDownload /> Data Export
                        </Text>
                        <Button 
                          variant="outline" 
                          leftIcon={<FiDownload />}
                          onClick={handleExportData}
                        >
                          Export My Data
                        </Button>
                      </Box>

                      <Box>
                        <Text fontWeight="semibold" mb={2} display="flex" alignItems="center" gap={2}>
                          <FiTrash2 /> Danger Zone
                        </Text>
                        <Button colorScheme="red" variant="outline">Delete Account</Button>
                      </Box>
                    </VStack>
                  </TabPanel>

                  {/* Notifications Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Heading size="md">Notification Preferences</Heading>
                      
                      <FormControl display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Text fontWeight="medium">Email Notifications</Text>
                          <Text fontSize="sm" color="gray.600">Receive updates about new features</Text>
                        </Box>
                        <Switch 
                          isChecked={profileData.notifications.email}
                          onChange={() => handleNotificationChange('email')}
                          colorScheme="brand"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Text fontWeight="medium">Usage Alerts</Text>
                          <Text fontSize="sm" color="gray.600">Get notified when reaching daily limits</Text>
                        </Box>
                        <Switch 
                          isChecked={profileData.notifications.usageAlerts}
                          onChange={() => handleNotificationChange('usageAlerts')}
                          colorScheme="brand"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Text fontWeight="medium">New Features</Text>
                          <Text fontSize="sm" color="gray.600">Updates about new platform features</Text>
                        </Box>
                        <Switch 
                          isChecked={profileData.notifications.newFeatures}
                          onChange={() => handleNotificationChange('newFeatures')}
                          colorScheme="brand"
                        />
                      </FormControl>

                      <Button 
                        mt={4} 
                        colorScheme="brand" 
                        size="sm"
                        onClick={() => {
                          toast({
                            title: 'Preferences Saved',
                            status: 'success',
                            duration: 2000,
                          })
                        }}
                      >
                        Save Preferences
                      </Button>
                    </VStack>
                  </TabPanel>

                  <TabPanel>
  <NotificationSettings />
</TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </GridItem>

        {/* Right Column - Usage Stats & Security */}
        <GridItem>
          <Card mb={6}>
            <CardBody>
              <Heading size="md" mb={4}>Usage Statistics</Heading>
              
              <VStack spacing={6} align="stretch">
                <Stat>
                  <StatLabel>Total Posts Generated</StatLabel>
                  <StatNumber fontSize="3xl">{profileData.postsGenerated}</StatNumber>
                  <StatHelpText>All time posts created</StatHelpText>
                </Stat>

                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="medium">Daily Usage</Text>
                    <Text fontSize="sm" color="gray.600">
                      {profileData.usageCount}/{profileData.dailyLimit} posts
                    </Text>
                  </HStack>
                  <Progress 
                    value={usagePercentage} 
                    colorScheme={remainingPosts > 0 ? 'brand' : 'red'}
                    size="lg"
                    borderRadius="full"
                  />
                </Box>

                <Box bg="gray.50" p={4} borderRadius="lg">
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm">Posts Used Today:</Text>
                      <Text fontSize="sm" fontWeight="bold">{profileData.usageCount}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Posts Remaining:</Text>
                      <Text fontSize="sm" fontWeight="bold" color={remainingPosts > 0 ? 'green.600' : 'red.600'}>
                        {remainingPosts}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Daily Limit:</Text>
                      <Text fontSize="sm" fontWeight="bold">{profileData.dailyLimit}</Text>
                    </HStack>
                  </VStack>
                </Box>

                {profileData.subscription !== 'pro' && (
                  <Button 
                    colorScheme="green" 
                    as="a"
                    href="/pricing"
                    leftIcon={<FiCreditCard />}
                  >
                    Upgrade to Pro for Unlimited Posts
                  </Button>
                )}
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Heading size="md" mb={4}>Account Security</Heading>
              
              <VStack spacing={4} align="stretch">
                <HStack>
                  <Box
                    p={2}
                    bg="green.100"
                    borderRadius="md"
                    color="green.600"
                  >
                    <Icon as={FiShield} />
                  </Box>
                  <Box>
                    <Text fontWeight="medium">Account Protected</Text>
                    <Text fontSize="sm" color="gray.600">Standard security enabled</Text>
                  </Box>
                </HStack>

                <HStack>
                  <Box
                    p={2}
                    bg={profileData.isEmailVerified ? 'green.100' : 'yellow.100'}
                    borderRadius="md"
                    color={profileData.isEmailVerified ? 'green.600' : 'yellow.600'}
                  >
                    <Icon as={FiMail} />
                  </Box>
                  <Box>
                    <Text fontWeight="medium">Email Verification</Text>
                    <Text fontSize="sm" color="gray.600">
                      {profileData.isEmailVerified ? 'Verified' : 'Not Verified'}
                    </Text>
                  </Box>
                </HStack>

                <Button variant="outline" w="100%" leftIcon={<FiBell />}>
                  View Login History
                </Button>
                
                <Button variant="outline" w="100%" leftIcon={<FiShield />}>
                  Enable Two-Factor Auth
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  )
}

export default Profile