'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Play,
  Square,
  FileText,
  Phone,
  Mail,
  Calendar,
  Stethoscope,
  Timer
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface Patient {
  queueId: string
  patientId: string
  patientName: string
  status: string
  priority: 'emergency' | 'high' | 'medium' | 'low'
  reason: string
  assignedAt: string
  timeInQueue: number
  // Optional fields
  symptoms?: string[]
  type?: string
  position?: number
  queuedAt?: string
  consultationStartTime?: string
  estimatedDuration?: number
  waitTime?: number
  waitTimeDisplay?: string
}

interface PatientQueueCardProps {
  patient: Patient
  onStatusUpdate: (queueId: string, newStatus: string, data?: any) => void
  isCurrentPatient: boolean
}

const PatientQueueCard: React.FC<PatientQueueCardProps> = ({
  patient,
  onStatusUpdate,
  isCurrentPatient
}) => {
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [consultationNotes, setConsultationNotes] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [treatment, setTreatment] = useState('')
  const [followUp, setFollowUp] = useState('')

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-500 text-white'
      case 'high':
        return 'bg-orange-500 text-white'
      case 'medium':
        return 'bg-yellow-500 text-black'
      case 'low':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-consultation':
        return 'bg-blue-500 text-white'
      case 'assigned':
        return 'bg-purple-500 text-white'
      case 'waiting':
        return 'bg-gray-500 text-white'
      case 'completed':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const handleStartConsultation = () => {
    onStatusUpdate(patient.queueId, 'in-consultation', {
      startTime: new Date().toISOString()
    })
  }

  const handleCompleteConsultation = () => {
    const consultationSummary = {
      diagnosis,
      treatment,
      followUp,
      notes: consultationNotes,
      completedAt: new Date().toISOString()
    }

    onStatusUpdate(patient.queueId, 'completed', {
      completedAt: new Date().toISOString(),
      consultationSummary
    })

    setShowCompleteDialog(false)
    // Reset form
    setConsultationNotes('')
    setDiagnosis('')
    setTreatment('')
    setFollowUp('')
  }

  const handleCancelAppointment = () => {
    onStatusUpdate(patient.queueId, 'cancelled', {
      reason: 'Cancelled by doctor'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className={`${isCurrentPatient ? 'border-blue-500 shadow-lg' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{patient.patientName}</span>
            {isCurrentPatient && (
              <Badge variant="secondary" className="ml-2">
                Current Patient
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={getPriorityColor(patient.priority)}>
              {patient.priority.toUpperCase()}
            </Badge>
            <Badge className={getStatusColor(patient.status)}>
              {patient.status.replace('-', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Patient Information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Patient ID:</span>
              <span className="text-xs font-mono">{patient.patientId.slice(0, 8)}...</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Priority:</span>
              <Badge className={getPriorityColor(patient.priority)} variant="outline">
                {patient.priority.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Status:</span>
              <Badge className={getStatusColor(patient.status)} variant="outline">
                {patient.status.replace('-', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Time in Queue:</span>
              <span>{Math.floor(patient.timeInQueue / 60)} min</span>
            </div>
            <div className="flex items-center space-x-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Assigned At:</span>
              <span className="text-xs">{formatTime(patient.assignedAt)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Type:</span>
              <span className="capitalize">{patient.type || 'consultation'}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Consultation Details */}
        <div className="space-y-2">
          <div>
            <span className="font-medium text-sm">Reason for Visit:</span>
            <p className="text-sm text-muted-foreground mt-1">{patient.reason}</p>
          </div>

          {patient.symptoms && patient.symptoms.length > 0 && (
            <div>
              <span className="font-medium text-sm">Symptoms:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {patient.symptoms.map((symptom, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {symptom}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div>
            <span className="font-medium">Queue ID:</span>
            <p className="font-mono">{patient.queueId.slice(0, 8)}...</p>
          </div>
          <div>
            <span className="font-medium">Assigned:</span>
            <p>{formatDate(patient.assignedAt)}</p>
          </div>
          {patient.consultationStartTime && (
            <div>
              <span className="font-medium">Started:</span>
              <p>{formatDate(patient.consultationStartTime)}</p>
            </div>
          )}
          <div>
            <span className="font-medium">Total Time:</span>
            <p>{Math.floor(patient.timeInQueue / 60)} minutes</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-2">
            {patient.status === 'assigned' && (
              <Button 
                onClick={handleStartConsultation}
                className="flex items-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>Start Consultation</span>
              </Button>
            )}

            {patient.status === 'in-consultation' && (
              <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Complete</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Complete Consultation</DialogTitle>
                    <DialogDescription>
                      Please provide consultation summary for {patient.patientName}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="diagnosis">Diagnosis</Label>
                      <Textarea
                        id="diagnosis"
                        placeholder="Enter diagnosis..."
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="treatment">Treatment Plan</Label>
                      <Textarea
                        id="treatment"
                        placeholder="Enter treatment plan..."
                        value={treatment}
                        onChange={(e) => setTreatment(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="followUp">Follow-up Instructions</Label>
                      <Textarea
                        id="followUp"
                        placeholder="Enter follow-up instructions..."
                        value={followUp}
                        onChange={(e) => setFollowUp(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Enter additional notes..."
                        value={consultationNotes}
                        onChange={(e) => setConsultationNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCompleteConsultation}>
                      Complete Consultation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            {patient.status !== 'completed' && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleCancelAppointment}
              >
                <Square className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PatientQueueCard
