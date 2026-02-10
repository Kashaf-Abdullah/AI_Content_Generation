// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(Cookies.get('token') || null)

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  // const fetchUser = async () => {
  //   try {
  //     const response = await axios.get('http://localhost:5000/api/auth/profile')
  //     setUser(response.data.user)
  //   } catch (error) {
  //     console.error('Failed to fetch user:', error)
  //     logout()
  //   } finally {
  //     setLoading(false)
  //   }
  // }
// Update the fetchUser function

const fetchUser = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/auth/profile')
    const userData = response.data.user
    
    // Ensure usageCount and dailyLimit are properly set
    if (userData) {
      userData.usageCount = userData.usageCount || 0
      userData.dailyLimit = userData.dailyLimit || 5
    }
    
    setUser(userData)
  } catch (error) {
    console.error('Failed to fetch user:', error)
    logout()
  } finally {
    setLoading(false)
  }
}

// Add a function to refresh user data
const refreshUser = async () => {
  if (token) {
    await fetchUser()
  }
}
  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      })
      
      const { token, user } = response.data
      Cookies.set('token', token, { expires: 30 })
      setToken(token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
      })
      
      const { token, user } = response.data
      Cookies.set('token', token, { expires: 30 })
      setToken(token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    Cookies.remove('token')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}