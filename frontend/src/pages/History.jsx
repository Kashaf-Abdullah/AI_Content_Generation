// src/pages/History.jsx
import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardBody,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  Select,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react'
import { FiMoreVertical, FiCopy, FiTrash2, FiEye } from 'react-icons/fi'
import axios from 'axios'

const History = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const toast = useToast()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/posts/history')
      setPosts(response.data.posts || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load posts',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = search === '' || 
      post.textInput.toLowerCase().includes(search.toLowerCase()) ||
      post.caption.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || post.platform === filter
    return matchesSearch && matchesFilter
  })

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: 'Post copied to clipboard',
      status: 'success',
      duration: 2000,
    })
  }

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        // In a real app, you would call your API to delete
        setPosts(posts.filter(post => post._id !== postId))
        toast({
          title: 'Deleted',
          description: 'Post deleted successfully',
          status: 'success',
          duration: 3000,
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete post',
          status: 'error',
          duration: 3000,
        })
      }
    }
  }

  const getPlatformColor = (platform) => {
    const colors = {
      instagram: 'pink',
      whatsapp: 'green',
      linkedin: 'blue',
      facebook: 'facebook',
    }
    return colors[platform] || 'gray'
  }

  const getToneColor = (tone) => {
    const colors = {
      casual: 'green',
      professional: 'blue',
      salesy: 'orange',
      funny: 'purple',
    }
    return colors[tone] || 'gray'
  }

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Loading posts...</Text>
      </Box>
    )
  }

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Post History
      </Heading>

      <Card mb={6}>
        <CardBody>
          <HStack spacing={4} flexWrap="wrap">
            <Input
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              maxW="300px"
            />
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              maxW="200px"
            >
              <option value="all">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="linkedin">LinkedIn</option>
              <option value="facebook">Facebook</option>
            </Select>
            <Text color="gray.600" fontSize="sm">
              Showing {filteredPosts.length} of {posts.length} posts
            </Text>
          </HStack>
        </CardBody>
      </Card>

      {filteredPosts.length === 0 ? (
        <Card>
          <CardBody textAlign="center" py={10}>
            <Text color="gray.500">No posts found</Text>
            <Text fontSize="sm" color="gray.400" mt={2}>
              {posts.length === 0 ? 'Generate your first post!' : 'Try changing your filters'}
            </Text>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Input</Th>
                  <Th>Platform</Th>
                  <Th>Tone</Th>
                  <Th>Generated On</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredPosts.map((post) => (
                  <Tr key={post._id}>
                    <Td maxW="300px">
                      <Text noOfLines={2} fontSize="sm">
                        {post.textInput}
                      </Text>
                    </Td>
                    <Td>
                      <Badge colorScheme={getPlatformColor(post.platform)}>
                        {post.platform}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme={getToneColor(post.tone)}>
                        {post.tone}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </Text>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<FiEye />}
                            onClick={() => handleCopy(post.caption)}
                          >
                            View Full Post
                          </MenuItem>
                          <MenuItem
                            icon={<FiCopy />}
                            onClick={() => handleCopy(`${post.caption}\n\n${post.hashtags?.join(' ')}`)}
                          >
                            Copy to Clipboard
                          </MenuItem>
                          <MenuItem
                            icon={<FiTrash2 />}
                            color="red.500"
                            onClick={() => handleDelete(post._id)}
                          >
                            Delete
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      )}
    </Box>
  )
}

export default History