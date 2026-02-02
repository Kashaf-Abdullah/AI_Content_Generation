// src/config/api.js
import axios from 'axios'
import Cookies from 'js-cookie'

// Configure axios defaults (use Vite env or fallback to localhost)
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
axios.defaults.headers.common['Content-Type'] = 'application/json'

// Request interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('token')
      Cookies.remove('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axios