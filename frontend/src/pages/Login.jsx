// src/pages/Login.jsx
import { useState } from 'react'
import {
  Box,
  Card,
  CardBody,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  Text,
  Link as ChakraLink,
  useToast,
} from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(credentials.email, credentials.password)
    
    if (result.success) {
      toast({
        title: 'Welcome back!',
        status: 'success',
        duration: 3000,
      })
      navigate('/dashboard')
    } else {
      toast({
        title: 'Login failed',
        description: result.message,
        status: 'error',
        duration: 5000,
      })
    }
    
    setLoading(false)
  }

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      p={4}
    >
      <Card maxW="md" w="100%">
        <CardBody>
          <VStack spacing={6}>
            <Box textAlign="center">
              <Heading size="lg" color="brand.500">PostGen AI</Heading>
              <Text color="gray.600" mt={2}>Sign in to your account</Text>
            </Box>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  w="100%"
                  isLoading={loading}
                  loadingText="Signing in..."
                >
                  Sign In
                </Button>
              </VStack>
            </form>

            <Text textAlign="center">
              Don't have an account?{' '}
              <ChakraLink as={Link} to="/register" color="brand.500" fontWeight="semibold">
                Sign up
              </ChakraLink>
            </Text>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  )
}

export default Login