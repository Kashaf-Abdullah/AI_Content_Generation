// src/pages/Generate.jsx
import { useState } from 'react'
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
} from '@chakra-ui/react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

const Generate = () => {
  const [formData, setFormData] = useState({
    textInput: '',
    platform: 'instagram',
    tone: 'casual',
    location: 'karachi',
  })
  const [loading, setLoading] = useState(false)
  const [generatedPost, setGeneratedPost] = useState(null)
  const [hashtags, setHashtags] = useState([])
  const [customHashtag, setCustomHashtag] = useState('')
  const { user } = useAuth()
  const toast = useToast()

  const platforms = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'facebook', label: 'Facebook' },
  ]

  const tones = [
    { value: 'casual', label: 'Casual' },
    { value: 'professional', label: 'Professional' },
    { value: 'salesy', label: 'Salesy' },
    { value: 'funny', label: 'Funny' },
  ]

  const locations = [
    { value: 'karachi', label: 'Karachi' },
    { value: 'lahore', label: 'Lahore' },
    { value: 'islamabad', label: 'Islamabad' },
    { value: 'hyderabad', label: 'Hyderabad' },
    { value: 'peshawar', label: 'Peshawar' },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddHashtag = () => {
    if (customHashtag && !hashtags.includes(customHashtag)) {
      setHashtags([...hashtags, customHashtag])
      setCustomHashtag('')
    }
  }

  const handleRemoveHashtag = (tagToRemove) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove))
  }

  const handleGenerate = async () => {
    if (!formData.textInput.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some text to generate from',
        status: 'error',
        duration: 3000,
      })
      return
    }

    if (user?.subscription === 'free' && user?.usageCount >= user?.dailyLimit) {
      toast({
        title: 'Limit Reached',
        description: 'You have reached your daily limit. Please upgrade to Pro.',
        status: 'warning',
        duration: 5000,
      })
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('http://localhost:5000/api/posts/generate', {
        ...formData,
        hashtags: hashtags,
      })

      setGeneratedPost(response.data.post)
      
      toast({
        title: 'Success',
        description: 'Post generated successfully!',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      console.error('Generation error:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to generate post',
        status: 'error',
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToClipboard = () => {
    if (generatedPost) {
      const text = `${generatedPost.caption}\n\n${generatedPost.hashtags.join(' ')}`
      navigator.clipboard.writeText(text)
      toast({
        title: 'Copied!',
        description: 'Post copied to clipboard',
        status: 'success',
        duration: 2000,
      })
    }
  }

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Generate AI Post
      </Heading>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8}>
        <GridItem>
          <Card>
            <CardBody>
              <VStack spacing={6}>
                <FormControl>
                  <FormLabel>Enter your content idea</FormLabel>
                  <Textarea
                    name="textInput"
                    value={formData.textInput}
                    onChange={handleChange}
                    placeholder="Describe what you want to post about..."
                    minH="150px"
                  />
                </FormControl>

                <HStack w="100%" spacing={4}>
                  <FormControl>
                    <FormLabel>Platform</FormLabel>
                    <Select name="platform" value={formData.platform} onChange={handleChange}>
                      {platforms.map(platform => (
                        <option key={platform.value} value={platform.value}>
                          {platform.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Tone</FormLabel>
                    <Select name="tone" value={formData.tone} onChange={handleChange}>
                      {tones.map(tone => (
                        <option key={tone.value} value={tone.value}>
                          {tone.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>Location</FormLabel>
                  <Select name="location" value={formData.location} onChange={handleChange}>
                    {locations.map(location => (
                      <option key={location.value} value={location.value}>
                        {location.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Custom Hashtags (Optional)</FormLabel>
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

                {user?.subscription === 'free' && (
                  <Alert status="info" borderRadius="lg">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="bold">Usage: {user?.usageCount || 0}/{user?.dailyLimit || 5}</Text>
                      <Text fontSize="sm">Upgrade to Pro for unlimited generations</Text>
                    </Box>
                  </Alert>
                )}

                <Button
                  onClick={handleGenerate}
                  colorScheme="brand"
                  size="lg"
                  w="100%"
                  isLoading={loading}
                  loadingText="Generating..."
                  isDisabled={loading}
                >
                  Generate Post
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>Generated Post</Heading>
              
              {generatedPost ? (
                <VStack spacing={6} align="stretch">
                  <Box p={4} bg="gray.50" borderRadius="lg" borderWidth="1px">
                    <Text whiteSpace="pre-wrap" fontSize="lg">
                      {generatedPost.caption}
                    </Text>
                  </Box>

                  {generatedPost.hashtags && generatedPost.hashtags.length > 0 && (
                    <Box>
                      <Text fontWeight="semibold" mb={2}>Hashtags:</Text>
                      <HStack flexWrap="wrap" gap={2}>
                        {generatedPost.hashtags.map((hashtag, index) => (
                          <Tag key={index} colorScheme="blue" size="md">
                            {hashtag}
                          </Tag>
                        ))}
                      </HStack>
                    </Box>
                  )}

                  <VStack spacing={4}>
                    <Button
                      onClick={handleCopyToClipboard}
                      colorScheme="green"
                      w="100%"
                      leftIcon={<Text>📋</Text>}
                    >
                      Copy to Clipboard
                    </Button>
                    <Button variant="outline" w="100%">
                      Schedule Post
                    </Button>
                  </VStack>
                </VStack>
              ) : (
                <Box textAlign="center" py={10}>
                  <Text color="gray.500">Your generated post will appear here</Text>
                  <Text fontSize="sm" color="gray.400" mt={2}>
                    Fill out the form and click "Generate Post"
                  </Text>
                </Box>
              )}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  )
}

export default Generate