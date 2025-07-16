'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  User,
  Clock,
  Activity,
  Settings
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import queueNotificationService, { QueueNotification } from '@/services/queue-notification.service'

interface QueueNotificationsProps {
  className?: string
}

const QueueNotifications: React.FC<QueueNotificationsProps> = ({ className }) => {
  const [notifications, setNotifications] = useState<QueueNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Load initial notifications
    loadNotifications()

    // Set up event listeners
    queueNotificationService.on('notification_added', handleNotificationAdded)
    queueNotificationService.on('notification_read', handleNotificationRead)
    queueNotificationService.on('notification_removed', handleNotificationRemoved)
    queueNotificationService.on('all_notifications_read', handleAllNotificationsRead)

    return () => {
      // Clean up event listeners
      queueNotificationService.off('notification_added', handleNotificationAdded)
      queueNotificationService.off('notification_read', handleNotificationRead)
      queueNotificationService.off('notification_removed', handleNotificationRemoved)
      queueNotificationService.off('all_notifications_read', handleAllNotificationsRead)
    }
  }, [])

  const loadNotifications = () => {
    const allNotifications = queueNotificationService.getNotifications()
    const unread = queueNotificationService.getUnreadNotifications()
    
    setNotifications(allNotifications)
    setUnreadCount(unread.length)
  }

  const handleNotificationAdded = (notification: QueueNotification) => {
    setNotifications(prev => [notification, ...prev])
    setUnreadCount(prev => prev + 1)
  }

  const handleNotificationRead = (notification: QueueNotification) => {
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const handleNotificationRemoved = (notification: QueueNotification) => {
    setNotifications(prev => prev.filter(n => n.id !== notification.id))
    if (!notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const handleAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const markAsRead = (notificationId: string) => {
    queueNotificationService.markAsRead(notificationId)
  }

  const removeNotification = (notificationId: string) => {
    queueNotificationService.removeNotification(notificationId)
  }

  const markAllAsRead = () => {
    queueNotificationService.markAllAsRead()
  }

  const clearAllNotifications = () => {
    queueNotificationService.clearAllNotifications()
    setNotifications([])
    setUnreadCount(0)
  }

  const getNotificationIcon = (notification: QueueNotification) => {
    switch (notification.category) {
      case 'patient':
        return <User className="h-4 w-4" />
      case 'queue':
        return <Activity className="h-4 w-4" />
      case 'capacity':
        return <AlertTriangle className="h-4 w-4" />
      case 'system':
        return <Settings className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (notification: QueueNotification) => {
    switch (notification.type) {
      case 'error':
        return 'text-red-600'
      case 'warning':
        return 'text-orange-600'
      case 'success':
        return 'text-green-600'
      case 'info':
      default:
        return 'text-blue-600'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive" className="text-xs">Urgent</Badge>
      case 'high':
        return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">High</Badge>
      case 'medium':
        return <Badge variant="secondary" className="text-xs">Medium</Badge>
      case 'low':
        return <Badge variant="outline" className="text-xs">Low</Badge>
      default:
        return null
    }
  }

  const formatTime = (timestamp: string) => {
    const now = new Date()
    const notificationTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return notificationTime.toLocaleDateString()
  }

  const executeAction = (action: any) => {
    try {
      action.action()
      setIsOpen(false)
    } catch (error) {
      console.error('Error executing notification action:', error)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={`relative ${className}`}>
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    <Check className="h-4 w-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={clearAllNotifications}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div 
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`mt-1 ${getNotificationColor(notification)}`}>
                            {getNotificationIcon(notification)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-medium truncate">
                                {notification.title}
                              </h4>
                              <div className="flex items-center space-x-2 ml-2">
                                {getPriorityBadge(notification.priority)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeNotification(notification.id)
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(notification.timestamp)}
                              </span>
                              
                              {notification.actions && notification.actions.length > 0 && (
                                <div className="flex space-x-1">
                                  {notification.actions.map((action, actionIndex) => (
                                    <Button
                                      key={actionIndex}
                                      variant={action.style === 'primary' ? 'default' : 'outline'}
                                      size="sm"
                                      className="h-6 text-xs px-2"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        executeAction(action)
                                      }}
                                    >
                                      {action.label}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {index < notifications.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}

export default QueueNotifications
