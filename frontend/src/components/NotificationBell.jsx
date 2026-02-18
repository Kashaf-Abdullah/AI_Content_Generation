
import { useState, useEffect, useRef } from 'react'
import {
  IconButton,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Box,
  Text,
  HStack,
  VStack,
  Divider,
  Button,
  useToast,
  Spinner,
  Avatar,
  MenuDivider,
} from '@chakra-ui/react'
import { FiBell, FiCheck, FiTrash2, FiSettings } from 'react-icons/fi'
import { FaCrown, FaUserPlus, FaFileAlt, FaCreditCard } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const toast = useToast()
  const intervalRef = useRef()

  useEffect(() => {
    if (user) {
      fetchNotifications()
      fetchUnreadCount()
      
      // Poll for new notifications every 30 seconds
      intervalRef.current = setInterval(() => {
        fetchUnreadCount()
      }, 30000)
      
      return () => clearInterval(intervalRef.current)
    }
  }, [user])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await axios.get('http://localhost:5000/api/notifications?limit=5')
      setNotifications(response.data.notifications || [])
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/notifications/unread-count')
      setUnreadCount(response.data.unreadCount || 0)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${notificationId}/read`)
      
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      )
      
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/notifications/read-all')
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      )
      
      setUnreadCount(0)
      
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
        status: 'success',
        duration: 2000,
      })
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${notificationId}`)
      
      setNotifications(prev => prev.filter(n => n._id !== notificationId))
      
      toast({
        title: 'Deleted',
        description: 'Notification removed',
        status: 'info',
        duration: 2000,
      })
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'subscription_upgraded':
      case 'payment_success':
        return FaCrown
      case 'new_user_registered':
        return FaUserPlus
      case 'post_generated':
        return FaFileAlt
      case 'daily_limit_reached':
        return FaCreditCard
      case 'welcome':
        return FaCrown
      default:
        return FiBell
    }
  }

  const getIconColor = (type) => {
    switch (type) {
      case 'subscription_upgraded':
      case 'payment_success':
        return "#ECC94B"
      case 'new_user_registered':
        return "#48BB78"
      case 'post_generated':
        return "#4299E1"
      case 'daily_limit_reached':
        return "#ED8936"
      case 'welcome':
        return "#9F7AEA"
      default:
        return "#718096"
    }
  }

  const handleOpen = () => {
    setIsOpen(true)
    fetchNotifications()
    fetchUnreadCount()
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  if (!user) return null

  return (
    <Menu isOpen={isOpen} onClose={handleClose} placement="bottom-end">
      <MenuButton
        as={IconButton}
        icon={
          <Box position="relative">
            <FiBell size="20" />
            {unreadCount > 0 && (
              <Badge
                position="absolute"
                top="-8px"
                right="-8px"
                colorScheme="red"
                borderRadius="full"
                fontSize="xs"
                px={2}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Box>
        }
        variant="ghost"
        onClick={handleOpen}
        aria-label="Notifications"
      />
      
      <MenuList w={{ base: '300px', md: '400px' }} maxH="500px" overflowY="auto" zIndex={1000}>
        <Box px={4} py={2}>
          <HStack justify="space-between">
            <Text fontWeight="bold">Notifications</Text>
            <HStack spacing={2}>
              {unreadCount > 0 && (
                <Button 
                  size="xs" 
                  leftIcon={<FiCheck />} 
                  onClick={markAllAsRead}
                  variant="ghost"
                >
                  Mark all read
                </Button>
              )}
              <Button 
                as={Link}
                to="/profile?tab=notifications"
                size="xs" 
                leftIcon={<FiSettings />}
                variant="ghost"
                onClick={handleClose}
              >
                Settings
              </Button>
            </HStack>
          </HStack>
        </Box>
        
        <Divider />
        
        {loading ? (
          <Box textAlign="center" py={6}>
            <Spinner size="sm" />
            <Text mt={2} fontSize="sm" color="gray.500">Loading...</Text>
          </Box>
        ) : notifications.length === 0 ? (
          <Box textAlign="center" py={8}>
            <FiBell size={30} style={{ margin: '0 auto', color: '#CBD5E0' }} />
            <Text mt={2} color="gray.500">No notifications</Text>
          </Box>
        ) : (
          notifications.map((notification) => (
            <Box key={notification._id}>
              <MenuItem 
                px={4} 
                py={3} 
                bg={!notification.isRead ? 'blue.50' : 'transparent'}
                _hover={{ bg: !notification.isRead ? 'blue.100' : 'gray.100' }}
                onClick={() => markAsRead(notification._id)}
              >
                <HStack spacing={3} w="100%">
                  <Box
                    boxSize="32px"
                    borderRadius="full"
                    bg={!notification.isRead ? 'blue.500' : 'gray.400'}
                    color="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="16px"
                  >
                    {(() => {
                      const Icon = getNotificationIcon(notification.type)
                      return <Icon color="white" />
                    })()}
                  </Box>
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontWeight={!notification.isRead ? 'bold' : 'normal'} fontSize="sm">
                      {notification.title}
                    </Text>
                    <Text fontSize="xs" color="gray.600" noOfLines={2}>
                      {notification.message}
                    </Text>
                    <HStack justify="space-between" w="100%" mt={1}>
                      <Text fontSize="xs" color="gray.400">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </Text>
                      <Box
                        as="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification._id)
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '4px',
                          cursor: 'pointer',
                          color: '#A0AEC0',
                        }}
                        aria-label="Delete"
                      >
                        <FiTrash2 size="12px" />
                      </Box>
                    </HStack>
                  </VStack>
                </HStack>
              </MenuItem>
              <Divider />
            </Box>
          ))
        )}
        
        {notifications.length > 0 && (
          <>
            <MenuDivider />
            <MenuItem 
              as={Link} 
              to="/profile?tab=notifications" 
              justifyContent="center"
              onClick={handleClose}
            >
              View all notifications
            </MenuItem>
          </>
        )}
      </MenuList>
    </Menu>
  )
}

export default NotificationBell