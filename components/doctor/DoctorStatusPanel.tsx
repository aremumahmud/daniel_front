'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  Users, 
  Clock, 
  Coffee,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Pause,
  Play
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface DoctorStatus {
  doctorId: string
  isOnline: boolean
  isAvailable: boolean
  status: string
  currentPatients: number
  maxPatients: number
  capacity: {
    current: number
    maximum: number
    percentage: number
    availabilityStatus: string
  }
  isOnBreak: boolean
  breakTimeRemaining: number
}

interface DoctorStatusPanelProps {
  status: DoctorStatus
  onStatusUpdate: () => void
}

const DoctorStatusPanel: React.FC<DoctorStatusPanelProps> = ({
  status,
  onStatusUpdate
}) => {
  const [showBreakDialog, setShowBreakDialog] = useState(false)
  const [breakType, setBreakType] = useState('')
  const [breakDuration, setBreakDuration] = useState('')
  const [breakNotes, setBreakNotes] = useState('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500 text-white'
      case 'busy':
        return 'bg-yellow-500 text-black'
      case 'on-break':
        return 'bg-orange-500 text-white'
      case 'offline':
        return 'bg-gray-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getAvailabilityIcon = (availabilityStatus: string) => {
    switch (availabilityStatus) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'near-capacity':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'at-capacity':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'on-break':
        return <Coffee className="h-4 w-4 text-orange-500" />
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const handleOnlineToggle = async (isOnline: boolean) => {
    try {
      // API call to update online status
      // await fetch('/api/doctor/status', {
      //   method: 'PUT',
      //   body: JSON.stringify({ isOnline })
      // })
      
      console.log('Updating online status:', isOnline)
      onStatusUpdate()
    } catch (error) {
      console.error('Failed to update online status:', error)
    }
  }

  const handleAvailabilityToggle = async (isAvailable: boolean) => {
    try {
      // API call to update availability
      // await fetch('/api/doctor/status', {
      //   method: 'PUT',
      //   body: JSON.stringify({ isAvailable })
      // })
      
      console.log('Updating availability:', isAvailable)
      onStatusUpdate()
    } catch (error) {
      console.error('Failed to update availability:', error)
    }
  }

  const handleStartBreak = async () => {
    try {
      // API call to start break
      // await fetch('/api/doctor/break', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     isOnBreak: true,
      //     breakType,
      //     duration: parseInt(breakDuration),
      //     notes: breakNotes
      //   })
      // })
      
      console.log('Starting break:', { breakType, breakDuration, breakNotes })
      setShowBreakDialog(false)
      onStatusUpdate()
      
      // Reset form
      setBreakType('')
      setBreakDuration('')
      setBreakNotes('')
    } catch (error) {
      console.error('Failed to start break:', error)
    }
  }

  const handleEndBreak = async () => {
    try {
      // API call to end break
      // await fetch('/api/doctor/break', {
      //   method: 'POST',
      //   body: JSON.stringify({ isOnBreak: false })
      // })
      
      console.log('Ending break')
      onStatusUpdate()
    } catch (error) {
      console.error('Failed to end break:', error)
    }
  }

  const formatBreakTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Doctor Status</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Online Status */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${status.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
              <span className="font-medium">Online</span>
            </div>
            <Switch
              checked={status.isOnline}
              onCheckedChange={handleOnlineToggle}
            />
          </div>

          {/* Availability Status */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-2">
              {getAvailabilityIcon(status.capacity.availabilityStatus)}
              <span className="font-medium">Available</span>
            </div>
            <Switch
              checked={status.isAvailable}
              onCheckedChange={handleAvailabilityToggle}
              disabled={!status.isOnline || status.isOnBreak}
            />
          </div>

          {/* Current Status */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(status.status)}>
                {status.status.replace('-', ' ').toUpperCase()}
              </Badge>
            </div>
            {status.isOnBreak && status.breakTimeRemaining > 0 && (
              <span className="text-sm text-muted-foreground">
                {formatBreakTime(status.breakTimeRemaining)} left
              </span>
            )}
          </div>
        </div>

        {/* Capacity Information */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="font-medium">Patient Capacity</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {status.capacity.current} / {status.capacity.maximum} patients
            </span>
          </div>
          
          <Progress 
            value={status.capacity.percentage} 
            className="h-2"
          />
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{status.capacity.percentage.toFixed(0)}% utilized</span>
            <span className="capitalize">{status.capacity.availabilityStatus}</span>
          </div>
        </div>

        {/* Break Management */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Coffee className="h-4 w-4" />
            <span className="font-medium">Break Management</span>
          </div>
          
          <div className="flex space-x-2">
            {status.isOnBreak ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleEndBreak}
                className="flex items-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>End Break</span>
              </Button>
            ) : (
              <Dialog open={showBreakDialog} onOpenChange={setShowBreakDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={!status.isOnline}
                    className="flex items-center space-x-2"
                  >
                    <Pause className="h-4 w-4" />
                    <span>Take Break</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Take a Break</DialogTitle>
                    <DialogDescription>
                      Set your break type and duration. You will be marked as unavailable during this time.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="breakType">Break Type</Label>
                      <Select value={breakType} onValueChange={setBreakType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select break type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lunch">🍽️ Lunch Break</SelectItem>
                          <SelectItem value="meeting">👥 Meeting</SelectItem>
                          <SelectItem value="emergency">🚨 Emergency</SelectItem>
                          <SelectItem value="break">☕ Short Break</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        placeholder="Enter duration in minutes"
                        value={breakDuration}
                        onChange={(e) => setBreakDuration(e.target.value)}
                        min="5"
                        max="120"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any additional notes..."
                        value={breakNotes}
                        onChange={(e) => setBreakNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowBreakDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleStartBreak}
                      disabled={!breakType || !breakDuration}
                    >
                      Start Break
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{status.currentPatients}</div>
            <div className="text-xs text-muted-foreground">Current Patients</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{status.maxPatients - status.currentPatients}</div>
            <div className="text-xs text-muted-foreground">Available Slots</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{status.capacity.percentage.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Utilization</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default DoctorStatusPanel
