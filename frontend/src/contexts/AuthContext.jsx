

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

  const fetchUser = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/profile')
      const userData = response.data.user
      
      // Ensure admin status is properly set
      if (userData) {
        userData.usageCount = userData.usageCount || 0
        userData.dailyLimit = userData.dailyLimit || 5
        userData.isAdmin = userData.isAdmin || false
      }
      
      setUser(userData)
      console.log('User fetched:', { 
        email: userData.email, 
        isAdmin: userData.isAdmin,
        subscription: userData.subscription 
      })
    } catch (error) {
      console.error('Failed to fetch user:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      })
      
      const { token, user } = response.data
      
      // Ensure admin status is set
      user.isAdmin = user.isAdmin || false
      
      Cookies.set('token', token, { expires: 30 })
      setToken(token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
      
      return { success: true, isAdmin: user.isAdmin }
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
      
      // New users are not admins by default
      user.isAdmin = false
      
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

  const refreshUser = async () => {
    if (token) {
      await fetchUser()
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
      isAdmin: user?.isAdmin || false,
    }}>
      {children}
    </AuthContext.Provider>
  )
}