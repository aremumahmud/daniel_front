'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Users, 
  Clock, 
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Save,
  RotateCcw
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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

interface CapacityManagementProps {
  status: DoctorStatus
  onUpdate: () => void
}

const CapacityManagement: React.FC<CapacityManagementProps> = ({
  status,
  onUpdate
}) => {
  const [maxPatients, setMaxPatients] = useState(status.maxPatients.toString())
  const [averageConsultationTime, setAverageConsultationTime] = useState('20')
  const [workingHoursStart, setWorkingHoursStart] = useState('08:00')
  const [workingHoursEnd, setWorkingHoursEnd] = useState('17:00')
  const [hasChanges, setHasChanges] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (setter: (value: string) => void) => (value: string) => {
    setter(value)
    setHasChanges(true)
  }

  const calculateDailyCapacity = () => {
    const startTime = new Date(`2000-01-01T${workingHoursStart}:00`)
    const endTime = new Date(`2000-01-01T${workingHoursEnd}:00`)
    const workingMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60)
    const consultationTime = parseInt(averageConsultationTime) || 20
    return Math.floor(workingMinutes / consultationTime)
  }

  const calculatePatientsPerHour = () => {
    const consultationTime = parseInt(averageConsultationTime) || 20
    return Math.round((60 / consultationTime) * 100) / 100
  }

  const getCapacityRecommendation = () => {
    const dailyCapacity = calculateDailyCapacity()
    const currentMax = parseInt(maxPatients) || status.maxPatients
    
    if (currentMax > dailyCapacity) {
      return {
        type: 'warning',
        message: `Your maximum capacity (${currentMax}) exceeds daily capacity (${dailyCapacity}). Consider reducing it.`
      }
    } else if (currentMax < dailyCapacity * 0.7) {
      return {
        type: 'info',
        message: `You could potentially handle more patients. Daily capacity allows up to ${dailyCapacity}.`
      }
    } else {
      return {
        type: 'success',
        message: 'Your capacity settings are well-balanced for your schedule.'
      }
    }
  }

  const handleSave = async () => {
    try {
      // Validate inputs
      const maxPatientsNum = parseInt(maxPatients)
      const consultationTimeNum = parseInt(averageConsultationTime)

      if (maxPatientsNum < 1 || maxPatientsNum > 20) {
        toast({
          title: "Invalid Input",
          description: "Maximum patients must be between 1 and 20",
          variant: "destructive"
        })
        return
      }

      if (consultationTimeNum < 5 || consultationTimeNum > 120) {
        toast({
          title: "Invalid Input", 
          description: "Consultation time must be between 5 and 120 minutes",
          variant: "destructive"
        })
        return
      }

      // Check if reducing capacity below current patient count
      if (maxPatientsNum < status.currentPatients) {
        toast({
          title: "Cannot Reduce Capacity",
          description: `Cannot reduce capacity below current patient count (${status.currentPatients})`,
          variant: "destructive"
        })
        return
      }

      // API call to update capacity settings
      // await fetch('/api/doctor/capacity', {
      //   method: 'PUT',
      //   body: JSON.stringify({
      //     maxPatients: maxPatientsNum,
      //     averageConsultationTime: consultationTimeNum,
      //     workingHours: {
      //       start: workingHoursStart,
      //       end: workingHoursEnd
      //     }
      //   })
      // })

      console.log('Updating capacity settings:', {
        maxPatients: maxPatientsNum,
        averageConsultationTime: consultationTimeNum,
        workingHours: { start: workingHoursStart, end: workingHoursEnd }
      })

      setHasChanges(false)
      onUpdate()

      toast({
        title: "Settings Updated",
        description: "Your capacity settings have been updated successfully",
      })

    } catch (error) {
      console.error('Failed to update capacity settings:', error)
      toast({
        title: "Update Failed",
        description: "Failed to update capacity settings. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleReset = () => {
    setMaxPatients(status.maxPatients.toString())
    setAverageConsultationTime('20')
    setWorkingHoursStart('08:00')
    setWorkingHoursEnd('17:00')
    setHasChanges(false)
  }

  const recommendation = getCapacityRecommendation()

  return (
    <div className="space-y-6">
      {/* Current Capacity Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Current Capacity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{status.currentPatients}</div>
              <div className="text-sm text-muted-foreground">Current Patients</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{status.maxPatients}</div>
              <div className="text-sm text-muted-foreground">Maximum Capacity</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{status.capacity.percentage.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Utilization</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Capacity Utilization</span>
              <span>{status.currentPatients} / {status.maxPatients}</span>
            </div>
            <Progress value={status.capacity.percentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className="capitalize">{status.capacity.availabilityStatus}</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capacity Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Capacity Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Maximum Patients */}
          <div className="space-y-2">
            <Label htmlFor="maxPatients">Maximum Patients</Label>
            <Input
              id="maxPatients"
              type="number"
              value={maxPatients}
              onChange={(e) => handleInputChange(setMaxPatients)(e.target.value)}
              min="1"
              max="20"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of patients you can handle simultaneously (1-20)
            </p>
          </div>

          {/* Average Consultation Time */}
          <div className="space-y-2">
            <Label htmlFor="consultationTime">Average Consultation Time (minutes)</Label>
            <Input
              id="consultationTime"
              type="number"
              value={averageConsultationTime}
              onChange={(e) => handleInputChange(setAverageConsultationTime)(e.target.value)}
              min="5"
              max="120"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Average time spent per patient consultation (5-120 minutes)
            </p>
          </div>

          {/* Working Hours */}
          <div className="space-y-2">
            <Label>Working Hours</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime" className="text-xs">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={workingHoursStart}
                  onChange={(e) => handleInputChange(setWorkingHoursStart)(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endTime" className="text-xs">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={workingHoursEnd}
                  onChange={(e) => handleInputChange(setWorkingHoursEnd)(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Calculated Metrics */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Calculated Metrics</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="text-lg font-semibold">{calculatePatientsPerHour()}</div>
                <div className="text-sm text-muted-foreground">Patients per hour</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-lg font-semibold">{calculateDailyCapacity()}</div>
                <div className="text-sm text-muted-foreground">Daily capacity</div>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className={`p-4 rounded-lg border ${
            recommendation.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
            recommendation.type === 'success' ? 'bg-green-50 border-green-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start space-x-2">
              {recommendation.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />}
              {recommendation.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
              {recommendation.type === 'info' && <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />}
              <div>
                <div className="font-medium text-sm">Recommendation</div>
                <div className="text-sm text-muted-foreground">{recommendation.message}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handleReset}
              disabled={!hasChanges}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!hasChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CapacityManagement
