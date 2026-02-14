import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Heading,
  Text,
  Switch,
  Button,
  useToast,
  Divider,
  FormControl,
  FormLabel,
  Select,
  Alert,
  AlertIcon,
  Spinner,
  SimpleGrid,
} from '@chakra-ui/react'
import { FiBell, FiMail, FiVolume2, FiMoon } from 'react-icons/fi'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

const NotificationSettings = () => {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()
  const toast = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await axios.get('http://localhost:5000/api/notifications/settings')
      setSettings(response.data.settings)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load notification settings',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: !prev.preferences[key]
      }
    }))
  }

  const handleSoundChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      sound: {
        ...prev.sound,
        [key]: value
      }
    }))
  }

  const handleDoNotDisturbChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      doNotDisturb: {
        ...prev.doNotDisturb,
        [key]: value
      }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await axios.put('http://localhost:5000/api/notifications/settings', settings)
      toast({
        title: 'Success',
        description: 'Notification settings updated',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="brand.500" />
        <Text mt={4}>Loading settings...</Text>
      </Box>
    )
  }

  return (
    <Box>
      <Heading size="lg" mb={6}>Notification Settings</Heading>
      
      <Alert status="info" mb={6} borderRadius="lg">
        <AlertIcon />
        <Text>Choose which notifications you want to receive</Text>
      </Alert>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="md" display="flex" alignItems="center" gap={2}>
                <FiBell /> Notification Preferences
              </Heading>

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Text fontWeight="medium">Email Notifications</Text>
                  <Text fontSize="sm" color="gray.600">Receive notifications via email</Text>
                </Box>
                <Switch 
                  isChecked={settings?.preferences?.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                  colorScheme="brand"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Text fontWeight="medium">Push Notifications</Text>
                  <Text fontSize="sm" color="gray.600">Receive in-app notifications</Text>
                </Box>
                <Switch 
                  isChecked={settings?.preferences?.pushNotifications}
                  onChange={() => handleToggle('pushNotifications')}
                  colorScheme="brand"
                />
              </FormControl>

              <Divider />

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Text fontWeight="medium">Subscription Updates</Text>
                  <Text fontSize="sm" color="gray.600">Get notified about plan changes</Text>
                </Box>
                <Switch 
                  isChecked={settings?.preferences?.subscriptionUpdates}
                  onChange={() => handleToggle('subscriptionUpdates')}
                  colorScheme="brand"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Text fontWeight="medium">Post Generations</Text>
                  <Text fontSize="sm" color="gray.600">Get notified when posts are generated</Text>
                </Box>
                <Switch 
                  isChecked={settings?.preferences?.postGenerations}
                  onChange={() => handleToggle('postGenerations')}
                  colorScheme="brand"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Text fontWeight="medium">Daily Limit Alerts</Text>
                  <Text fontSize="sm" color="gray.600">Get notified when approaching limits</Text>
                </Box>
                <Switch 
                  isChecked={settings?.preferences?.dailyLimitAlerts}
                  onChange={() => handleToggle('dailyLimitAlerts')}
                  colorScheme="brand"
                />
              </FormControl>

              {user?.isAdmin && (
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Text fontWeight="medium">Admin Alerts</Text>
                    <Text fontSize="sm" color="gray.600">Get notified about new users and actions</Text>
                  </Box>
                  <Switch 
                    isChecked={settings?.preferences?.adminAlerts}
                    onChange={() => handleToggle('adminAlerts')}
                    colorScheme="purple"
                  />
                </FormControl>
              )}
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="md" display="flex" alignItems="center" gap={2}>
                <FiVolume2 /> Sound Settings
              </Heading>

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Text fontWeight="medium">Notification Sounds</Text>
                  <Text fontSize="sm" color="gray.600">Play sound for new notifications</Text>
                </Box>
                <Switch 
                  isChecked={settings?.sound?.enabled}
                  onChange={() => handleSoundChange('enabled', !settings.sound.enabled)}
                  colorScheme="brand"
                />
              </FormControl>

              {settings?.sound?.enabled && (
                <FormControl>
                  <FormLabel>Sound Type</FormLabel>
                  <Select 
                    value={settings.sound.soundFile}
                    onChange={(e) => handleSoundChange('soundFile', e.target.value)}
                  >
                    <option value="default">Default</option>
                    <option value="gentle">Gentle</option>
                    <option value="pop">Pop</option>
                    <option value="chime">Chime</option>
                  </Select>
                </FormControl>
              )}

              <Divider />

              <Heading size="md" display="flex" alignItems="center" gap={2} mt={4}>
                <FiMoon /> Do Not Disturb
              </Heading>

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Text fontWeight="medium">Enable Do Not Disturb</Text>
                  <Text fontSize="sm" color="gray.600">Mute notifications during specific hours</Text>
                </Box>
                <Switch 
                  isChecked={settings?.doNotDisturb?.enabled}
                  onChange={() => handleDoNotDisturbChange('enabled', !settings.doNotDisturb.enabled)}
                  colorScheme="brand"
                />
              </FormControl>

              {settings?.doNotDisturb?.enabled && (
                <SimpleGrid columns={2} spacing={4}>
                  <FormControl>
                    <FormLabel>Start Time</FormLabel>
                    <Select 
                      value={settings.doNotDisturb.startTime}
                      onChange={(e) => handleDoNotDisturbChange('startTime', e.target.value)}
                    >
                      <option value="20:00">8:00 PM</option>
                      <option value="21:00">9:00 PM</option>
                      <option value="22:00">10:00 PM</option>
                      <option value="23:00">11:00 PM</option>
                      <option value="00:00">12:00 AM</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>End Time</FormLabel>
                    <Select 
                      value={settings.doNotDisturb.endTime}
                      onChange={(e) => handleDoNotDisturbChange('endTime', e.target.value)}
                    >
                      <option value="06:00">6:00 AM</option>
                      <option value="07:00">7:00 AM</option>
                      <option value="08:00">8:00 AM</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
              )}
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card mt={6}>
        <CardBody>
          <HStack justify="space-between">
            <Text color="gray.600">Changes are saved automatically or click save</Text>
            <Button
              colorScheme="brand"
              onClick={handleSave}
              isLoading={saving}
              loadingText="Saving..."
            >
              Save Settings
            </Button>
          </HStack>
        </CardBody>
      </Card>
    </Box>
  )
}

export default NotificationSettings