import { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  Card,
  CardBody,
  Heading,
  Text,
  Tag,
  TagLabel,
  TagCloseButton,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  Grid,
  GridItem,
  Badge,
  Divider,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  SimpleGrid,
  Radio,
  RadioGroup,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Tooltip,
  Progress,
} from '@chakra-ui/react'
import { 
  FiCalendar, 
  FiClock, 
  FiRepeat, 
  FiTrash2, 
  FiEdit2, 
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiUpload,
  FiRefreshCw,
  FiImage
} from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const Schedule = () => {
  const [loading, setLoading] = useState(false)
  const [scheduledPosts, setScheduledPosts] = useState([])
  const [queueStatus, setQueueStatus] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState('')
  const [repeatType, setRepeatType] = useState('none')
  const [repeatEndDate, setRepeatEndDate] = useState(null)
  const [caption, setCaption] = useState('')
  const [platform, setPlatform] = useState('whatsapp_status')
  const [hashtags, setHashtags] = useState([])
  const [customHashtag, setCustomHashtag] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [textInput, setTextInput] = useState('')
  const [tone, setTone] = useState('casual')
  const [location, setLocation] = useState('karachi')
  const [activeTab, setActiveTab] = useState(0)
  
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const locationState = useLocation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingPost, setEditingPost] = useState(null)

  useEffect(() => {
    if (user) {
      fetchScheduledPosts()
      fetchQueueStatus()
      fetchAvailableSlots()
    }
  }, [user, selectedDate])

  const fetchScheduledPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/schedule')
      setScheduledPosts(response.data.posts || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load scheduled posts',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const fetchQueueStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/schedule/queue-status')
      setQueueStatus(response.data.queue)
    } catch (error) {
      console.error('Queue status error:', error)
    }
  }

  // const fetchAvailableSlots = async () => {
  //   try {
  //     const response = await axios.get(`http://localhost:5000/api/schedule/slots?date=${selectedDate.toISOString()}`)
  //     setAvailableSlots(response.data.slots || [])
  //   } catch (error) {
  //     console.error('Slots error:', error)
  //   }
  // }
  const fetchAvailableSlots = async () => {
  try {
    // Format date properly for API
    const dateStr = selectedDate.toISOString().split('T')[0];
    const response = await axios.get(`http://localhost:5000/api/schedule/slots?date=${selectedDate.toISOString()}`)
    
    // Filter out any past times for today
    const now = new Date()
    const isToday = selectedDate.toDateString() === now.toDateString()
    
    let slots = response.data.slots || []
    
    if (isToday) {
      // Only show future times for today
      slots = slots.filter(slot => new Date(slot.time) > now)
    }
    
    setAvailableSlots(slots)
  } catch (error) {
    console.error('Slots error:', error)
    toast({
      title: 'Error',
      description: 'Failed to load available time slots',
      status: 'error',
      duration: 3000,
    })
  }
}

// Add effect to refresh slots when component mounts and when date changes
useEffect(() => {
  if (user) {
    fetchScheduledPosts()
    fetchQueueStatus()
    fetchAvailableSlots()
  }
}, [user, selectedDate])

  const handleAddHashtag = () => {
    if (customHashtag && !hashtags.includes(customHashtag)) {
      setHashtags([...hashtags, customHashtag.startsWith('#') ? customHashtag : `#${customHashtag}`])
      setCustomHashtag('')
    }
  }

  const handleRemoveHashtag = (tagToRemove) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSchedule = async () => {
    if (!caption.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a caption',
        status: 'error',
        duration: 3000,
      })
      return
    }

    if (!selectedTime) {
      toast({
        title: 'Error',
        description: 'Please select a time',
        status: 'error',
        duration: 3000,
      })
      return
    }

    // const scheduledDateTime = new Date(selectedDate)
    // const [hours, minutes] = selectedTime.split(':')
    // scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      const scheduledDateTime = new Date(selectedDate)
  const [hours, minutes] = selectedTime.split(':')
  scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

  // Debug logging
  console.log('Selected Date:', selectedDate)
  console.log('Selected Time:', selectedTime)
  console.log('Scheduled DateTime:', scheduledDateTime)
  console.log('Current Time:', new Date())
  console.log('Is in future?', scheduledDateTime > new Date())

    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('textInput', textInput || caption)
      formData.append('platform', platform)
      formData.append('tone', tone)
      formData.append('location', location)
      formData.append('caption', caption)
      formData.append('hashtags', JSON.stringify(hashtags))
      formData.append('scheduledTime', scheduledDateTime.toISOString())
      formData.append('repeatType', repeatType)
      
      if (repeatEndDate) {
        formData.append('repeatEndDate', repeatEndDate.toISOString())
      }
      
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const response = await axios.post('http://localhost:5000/api/schedule', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      toast({
        title: 'Success',
        description: `Post scheduled for ${scheduledDateTime.toLocaleString()}`,
        status: 'success',
        duration: 5000,
      })

      // Reset form
      setCaption('')
      setSelectedTime('')
      setRepeatType('none')
      setRepeatEndDate(null)
      setHashtags([])
      setImageFile(null)
      setImagePreview(null)
      setTextInput('')

      fetchScheduledPosts()
      fetchQueueStatus()
      fetchAvailableSlots()
      
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to schedule post',
        status: 'error',
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (postId) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled post?')) {
      return
    }

    try {
      await axios.delete(`http://localhost:5000/api/schedule/${postId}`)
      
      toast({
        title: 'Cancelled',
        description: 'Scheduled post cancelled',
        status: 'info',
        duration: 3000,
      })

      fetchScheduledPosts()
      fetchQueueStatus()
      fetchAvailableSlots()
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel post',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleEdit = (post) => {
    setEditingPost(post)
    setCaption(post.caption)
    setPlatform(post.platform)
    setHashtags(post.hashtags || [])
    setSelectedDate(new Date(post.scheduledTime))
    const timeStr = new Date(post.scheduledTime).toTimeString().slice(0,5)
    setSelectedTime(timeStr)
    setRepeatType(post.repeatType || 'none')
    if (post.repeatEndDate) {
      setRepeatEndDate(new Date(post.repeatEndDate))
    }
    onOpen()
  }

  const handleUpdate = async () => {
    if (!editingPost) return

    const scheduledDateTime = new Date(selectedDate)
    const [hours, minutes] = selectedTime.split(':')
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    setLoading(true)
    
    try {
      await axios.put(`http://localhost:5000/api/schedule/${editingPost._id}`, {
        caption,
        scheduledTime: scheduledDateTime.toISOString(),
        repeatType,
        repeatEndDate: repeatEndDate?.toISOString()
      })

      toast({
        title: 'Updated',
        description: 'Scheduled post updated',
        status: 'success',
        duration: 3000,
      })

      onClose()
      fetchScheduledPosts()
      fetchQueueStatus()
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update post',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'blue',
      published: 'green',
      failed: 'red',
      expired: 'gray'
    }
    return colors[status] || 'gray'
  }

  const getRepeatIcon = (type) => {
    switch (type) {
      case 'daily':
        return '🔄 Daily'
      case 'weekly':
        return '📅 Weekly'
      case 'monthly':
        return '📆 Monthly'
      default:
        return 'One-time'
    }
  }

  const maxQueue = user?.subscription === 'pro' ? 200 : 50
  const queuePercentage = queueStatus ? (queueStatus.scheduledCount / maxQueue) * 100 : 0

  return (
    <Box>
      <Heading size="lg" mb={6}>Schedule Posts</Heading>

      {/* Queue Status Bar */}
      {queueStatus && (
        <Card mb={6}>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <HStack>
                  <FiClock />
                  <Text fontWeight="medium">Queue Status</Text>
                </HStack>
                <Badge colorScheme={queueStatus.scheduledCount > maxQueue * 0.8 ? 'orange' : 'green'}>
                  {queueStatus.scheduledCount}/{maxQueue} Scheduled
                </Badge>
              </HStack>
              <Progress value={queuePercentage} size="sm" colorScheme="brand" borderRadius="full" />
              <SimpleGrid columns={3} spacing={4} mt={2}>
                <Box>
                  <Text fontSize="sm" color="gray.600">Published Today</Text>
                  <Text fontSize="xl" fontWeight="bold">{queueStatus.publishedToday}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600">Next Post</Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {queueStatus.nextPost 
                      ? new Date(queueStatus.nextPost.scheduledTime).toLocaleString()
                      : 'None'}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600">Queue Items</Text>
                  <Text fontSize="xl" fontWeight="bold">{queueStatus.queue.length}</Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
      )}

      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
        {/* Schedule Form */}
        <GridItem>
          <Card>
            <CardBody>
              <VStack spacing={6}>
                <Heading size="md">Schedule New Post</Heading>

                <FormControl>
                  <FormLabel>Platform</FormLabel>
                  <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                    <option value="whatsapp_status">WhatsApp Status (24hrs)</option>
                    <option value="instagram">Instagram Post</option>
                    <option value="facebook">Facebook Post</option>
                    <option value="linkedin">LinkedIn Post</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Content Idea (Optional)</FormLabel>
                  <Textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Describe what you want to post about..."
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Caption</FormLabel>
                  <Textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Enter your post caption..."
                    minH="100px"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Tone</FormLabel>
                  <Select value={tone} onChange={(e) => setTone(e.target.value)}>
                    <option value="casual">Casual</option>
                    <option value="professional">Professional</option>
                    <option value="salesy">Salesy</option>
                    <option value="funny">Funny</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Location</FormLabel>
                  <Select value={location} onChange={(e) => setLocation(e.target.value)}>
                    <option value="karachi">Karachi</option>
                    <option value="lahore">Lahore</option>
                    <option value="islamabad">Islamabad</option>
                    <option value="hyderabad">Hyderabad</option>
                    <option value="peshawar">Peshawar</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Custom Hashtags</FormLabel>
                  <HStack>
                    <Input
                      value={customHashtag}
                      onChange={(e) => setCustomHashtag(e.target.value)}
                      placeholder="#yourhashtag"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddHashtag()}
                    />
                    <Button onClick={handleAddHashtag} colorScheme="brand">
                      Add
                    </Button>
                  </HStack>
                  {hashtags.length > 0 && (
                    <HStack mt={2} flexWrap="wrap" gap={2}>
                      {hashtags.map(tag => (
                        <Tag key={tag} size="md" colorScheme="blue" borderRadius="full">
                          <TagLabel>{tag}</TagLabel>
                          <TagCloseButton onClick={() => handleRemoveHashtag(tag)} />
                        </Tag>
                      ))}
                    </HStack>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Image (Optional)</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    display="none"
                    id="image-upload"
                  />
                  <Button
                    as="label"
                    htmlFor="image-upload"
                    leftIcon={<FiImage />}
                    variant="outline"
                    w="100%"
                    cursor="pointer"
                  >
                    Choose Image
                  </Button>
                  {imagePreview && (
                    <Box mt={2} position="relative">
                      <img src={imagePreview} alt="Preview" style={{ maxHeight: '100px', borderRadius: '8px' }} />
                      <IconButton
                        icon={<FiTrash2 />}
                        size="sm"
                        position="absolute"
                        top={1}
                        right={1}
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview(null)
                        }}
                        aria-label="Remove"
                      />
                    </Box>
                  )}
                </FormControl>

                <Divider />

                <FormControl isRequired>
                  <FormLabel>Select Date</FormLabel>
                  <Box borderWidth="1px" borderRadius="md" p={2}>
                    <DatePicker
                      selected={selectedDate}
                      onChange={date => {
                        setSelectedDate(date)
                        setSelectedTime('')
                      }}
                      minDate={new Date()}
                      maxDate={platform === 'whatsapp_status' 
                        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                      }
                      dateFormat="MMMM d, yyyy"
                      className="chakra-input"
                      style={{ width: '100%' }}
                    />
                  </Box>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Select Time</FormLabel>
                 <SimpleGrid columns={4} spacing={2}>
  {availableSlots.map((slot) => {
    // Extract time for comparison
    const slotTime = slot.time.split('T')[1].slice(0,5)
    return (
      <Button
        key={slot.time}
        size="sm"
        variant={selectedTime === slotTime ? 'solid' : 'outline'}
        colorScheme={selectedTime === slotTime ? 'brand' : 'gray'}
        onClick={() => {
          setSelectedTime(slotTime)
        }}
        isDisabled={new Date(slot.time) <= new Date()} // Disable past times
      >
        {slot.display}
      </Button>
    )
  })}
</SimpleGrid>
                </FormControl>

                <FormControl>
                  <FormLabel>Repeat</FormLabel>
                  <RadioGroup value={repeatType} onChange={setRepeatType}>
                    <Stack direction="row" spacing={4}>
                      <Radio value="none">None</Radio>
                      <Radio value="daily">Daily</Radio>
                      <Radio value="weekly">Weekly</Radio>
                      <Radio value="monthly">Monthly</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                {repeatType !== 'none' && (
                  <FormControl>
                    <FormLabel>Repeat Until</FormLabel>
                    <Box borderWidth="1px" borderRadius="md" p={2}>
                      <DatePicker
                        selected={repeatEndDate}
                        onChange={date => setRepeatEndDate(date)}
                        minDate={new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)}
                        dateFormat="MMMM d, yyyy"
                        className="chakra-input"
                        placeholderText="Select end date"
                      />
                    </Box>
                  </FormControl>
                )}

                <Button
                  onClick={handleSchedule}
                  colorScheme="brand"
                  size="lg"
                  w="100%"
                  isLoading={loading}
                  loadingText="Scheduling..."
                  leftIcon={<FiCalendar />}
                >
                  Schedule Post
                </Button>

                {user?.subscription !== 'pro' && (
                  <Alert status="info" borderRadius="lg">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="bold">Free Plan Limits</Text>
                      <Text fontSize="sm">Max 50 scheduled posts. Upgrade to Pro for 200.</Text>
                    </Box>
                  </Alert>
                )}
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        {/* Scheduled Posts List */}
        <GridItem>
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Your Queue ({scheduledPosts.length})</Heading>

                <Tabs onChange={setActiveTab}>
                  <TabList>
                    <Tab>Upcoming</Tab>
                    <Tab>Published</Tab>
                    <Tab>Failed</Tab>
                  </TabList>

                  <TabPanels>
                    {/* Upcoming Tab */}
                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        {scheduledPosts.filter(p => p.status === 'scheduled').length === 0 ? (
                          <Text color="gray.500" textAlign="center" py={8}>
                            No scheduled posts
                          </Text>
                        ) : (
                          scheduledPosts
                            .filter(p => p.status === 'scheduled')
                            .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
                            .map(post => (
                              <Card key={post._id} variant="outline">
                                <CardBody>
                                  <VStack spacing={3} align="stretch">
                                    <HStack justify="space-between">
                                      <Badge colorScheme={getStatusColor(post.status)}>
                                        {post.status}
                                      </Badge>
                                      <HStack>
                                        <Tooltip label="Edit">
                                          <IconButton
                                            icon={<FiEdit2 />}
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleEdit(post)}
                                            aria-label="Edit"
                                          />
                                        </Tooltip>
                                        <Tooltip label="Cancel">
                                          <IconButton
                                            icon={<FiTrash2 />}
                                            size="sm"
                                            variant="ghost"
                                            colorScheme="red"
                                            onClick={() => handleCancel(post._id)}
                                            aria-label="Cancel"
                                          />
                                        </Tooltip>
                                      </HStack>
                                    </HStack>

                                    <Text noOfLines={2}>{post.caption}</Text>

                                    <HStack spacing={4}>
                                      <Tooltip label="Scheduled Time">
                                        <HStack spacing={1}>
                                          <FiCalendar size={12} />
                                          <Text fontSize="sm">
                                            {new Date(post.scheduledTime).toLocaleDateString()}
                                          </Text>
                                        </HStack>
                                      </Tooltip>
                                      <Tooltip label="Time">
                                        <HStack spacing={1}>
                                          <FiClock size={12} />
                                          <Text fontSize="sm">
                                            {new Date(post.scheduledTime).toLocaleTimeString()}
                                          </Text>
                                        </HStack>
                                      </Tooltip>
                                      <Tooltip label="Repeat">
                                        <HStack spacing={1}>
                                          <FiRepeat size={12} />
                                          <Text fontSize="sm">{getRepeatIcon(post.repeatType)}</Text>
                                        </HStack>
                                      </Tooltip>
                                    </HStack>

                                    {post.hashtags?.length > 0 && (
                                      <HStack flexWrap="wrap" gap={1}>
                                        {post.hashtags.slice(0, 3).map(tag => (
                                          <Tag key={tag} size="sm" colorScheme="gray">
                                            {tag}
                                          </Tag>
                                        ))}
                                        {post.hashtags.length > 3 && (
                                          <Tag size="sm">+{post.hashtags.length - 3}</Tag>
                                        )}
                                      </HStack>
                                    )}
                                  </VStack>
                                </CardBody>
                              </Card>
                            ))
                        )}
                      </VStack>
                    </TabPanel>

                    {/* Published Tab */}
                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        {scheduledPosts.filter(p => p.status === 'published').length === 0 ? (
                          <Text color="gray.500" textAlign="center" py={8}>
                            No published posts
                          </Text>
                        ) : (
                          scheduledPosts
                            .filter(p => p.status === 'published')
                            .map(post => (
                              <Card key={post._id} variant="outline" bg="green.50">
                                <CardBody>
                                  <VStack spacing={3} align="stretch">
                                    <HStack justify="space-between">
                                      <Badge colorScheme="green">Published</Badge>
                                      <Tooltip label="View">
                                        <IconButton
                                          icon={<FiEye />}
                                          size="sm"
                                          variant="ghost"
                                          aria-label="View"
                                        />
                                      </Tooltip>
                                    </HStack>
                                    <Text noOfLines={2}>{post.caption}</Text>
                                    <Text fontSize="sm" color="gray.600">
                                      Published: {new Date(post.publishedAt).toLocaleString()}
                                    </Text>
                                  </VStack>
                                </CardBody>
                              </Card>
                            ))
                        )}
                      </VStack>
                    </TabPanel>

                    {/* Failed Tab */}
                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        {scheduledPosts.filter(p => p.status === 'failed').length === 0 ? (
                          <Text color="gray.500" textAlign="center" py={8}>
                            No failed posts
                          </Text>
                        ) : (
                          scheduledPosts
                            .filter(p => p.status === 'failed')
                            .map(post => (
                              <Card key={post._id} variant="outline" bg="red.50">
                                <CardBody>
                                  <VStack spacing={3} align="stretch">
                                    <Badge colorScheme="red">Failed</Badge>
                                    <Text noOfLines={2}>{post.caption}</Text>
                                    <Text fontSize="sm" color="red.600">
                                      {post.errorLog || 'Unknown error'}
                                    </Text>
                                    <Button
                                      size="sm"
                                      leftIcon={<FiRefreshCw />}
                                      onClick={() => handleEdit(post)}
                                    >
                                      Retry
                                    </Button>
                                  </VStack>
                                </CardBody>
                              </Card>
                            ))
                        )}
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Scheduled Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Caption</FormLabel>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  minH="100px"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Date</FormLabel>
                <Box borderWidth="1px" borderRadius="md" p={2}>
                  <DatePicker
                    selected={selectedDate}
                    onChange={date => setSelectedDate(date)}
                    minDate={new Date()}
                    dateFormat="MMMM d, yyyy"
                    className="chakra-input"
                  />
                </Box>
              </FormControl>

              <FormControl>
                <FormLabel>Time</FormLabel>
                <Select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                >
                  <option value="">Select time</option>
                  {availableSlots.map(slot => (
                    <option key={slot.time} value={slot.time.split('T')[1].slice(0,5)}>
                      {slot.display}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Repeat</FormLabel>
                <Select value={repeatType} onChange={(e) => setRepeatType(e.target.value)}>
                  <option value="none">One-time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
              </FormControl>

              {repeatType !== 'none' && (
                <FormControl>
                  <FormLabel>Repeat Until</FormLabel>
                  <Box borderWidth="1px" borderRadius="md" p={2}>
                    <DatePicker
                      selected={repeatEndDate}
                      onChange={date => setRepeatEndDate(date)}
                      minDate={new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)}
                      dateFormat="MMMM d, yyyy"
                      className="chakra-input"
                    />
                  </Box>
                </FormControl>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleUpdate}
              isLoading={loading}
            >
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default Schedule