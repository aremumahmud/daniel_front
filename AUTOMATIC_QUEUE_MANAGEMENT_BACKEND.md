# Automatic Queue Management System - Backend Implementation

## Overview

This document outlines the backend implementation for an automatic queue management system that automatically assigns the next patient from the queue to the next available doctor when a consultation is marked as complete.

## System Architecture

### Core Components

1. **Queue Manager Service** - Handles automatic patient assignment
2. **Doctor Availability Tracker** - Monitors doctor status and availability
3. **Patient Queue System** - Manages patient waiting queue
4. **Notification Service** - Sends real-time updates to all stakeholders
5. **Event-Driven Architecture** - Uses events to trigger automatic assignments

## API Endpoints

### 1. Complete Patient Consultation

**Endpoint:** `POST /api/doctor/consultations/:consultationId/complete`

**Description:** Marks a consultation as complete and triggers automatic queue management.

**Request Body:**
```json
{
  "duration": 30,
  "notes": "Patient consultation completed successfully",
  "followUpRequired": false,
  "nextAppointmentDate": "2024-02-15T10:00:00Z",
  "prescriptions": [
    {
      "medication": "Medication Name",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "7 days"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Consultation completed successfully",
  "data": {
    "consultationId": "consultation_id",
    "nextPatientAssigned": {
      "patientId": "patient_id",
      "patientName": "John Doe",
      "queueNumber": "Q002",
      "estimatedStartTime": "2024-01-15T10:35:00Z"
    },
    "doctorStatus": "available"
  }
}
```

### 2. Get Doctor Availability Status

**Endpoint:** `GET /api/admin/doctors/availability`

**Response:**
```json
{
  "success": true,
  "data": {
    "availableDoctors": [
      {
        "doctorId": "doctor_id",
        "name": "Dr. Smith",
        "specialization": "General Medicine",
        "currentLoad": 2,
        "maxCapacity": 5,
        "averageConsultationTime": 25,
        "status": "available"
      }
    ],
    "busyDoctors": [
      {
        "doctorId": "doctor_id",
        "name": "Dr. Johnson",
        "currentPatient": "Jane Doe",
        "estimatedCompletionTime": "2024-01-15T10:45:00Z",
        "status": "busy"
      }
    ]
  }
}
```

### 3. Manual Queue Override

**Endpoint:** `POST /api/admin/queue/assign-patient`

**Description:** Manually assign a patient to a specific doctor (override automatic assignment).

**Request Body:**
```json
{
  "patientId": "patient_id",
  "doctorId": "doctor_id",
  "priority": "high",
  "reason": "Emergency case requires specialist"
}
```

## Database Schema

### Doctor Availability Collection

```javascript
{
  _id: ObjectId,
  doctorId: ObjectId,
  status: String,           // "available" | "busy" | "break" | "offline"
  currentPatientId: ObjectId,
  currentConsultationId: ObjectId,
  consultationStartTime: Date,
  estimatedEndTime: Date,
  maxCapacity: Number,      // Maximum patients per day
  currentLoad: Number,      // Current number of patients assigned
  averageConsultationTime: Number, // in minutes
  specializations: [String],
  workingHours: {
    start: String,          // "09:00"
    end: String,            // "17:00"
    breakStart: String,     // "12:00"
    breakEnd: String        // "13:00"
  },
  lastUpdated: Date
}
```

### Queue Events Collection

```javascript
{
  _id: ObjectId,
  eventType: String,        // "CONSULTATION_COMPLETED" | "PATIENT_ASSIGNED" | "DOCTOR_AVAILABLE"
  doctorId: ObjectId,
  patientId: ObjectId,
  consultationId: ObjectId,
  queueId: ObjectId,
  timestamp: Date,
  metadata: {
    previousStatus: String,
    newStatus: String,
    assignmentReason: String,
    processingTime: Number  // milliseconds
  }
}
```

### Consultation Collection

```javascript
{
  _id: ObjectId,
  doctorId: ObjectId,
  patientId: ObjectId,
  queueId: ObjectId,
  status: String,           // "scheduled" | "in_progress" | "completed" | "cancelled"
  startTime: Date,
  endTime: Date,
  duration: Number,         // actual duration in minutes
  estimatedDuration: Number,
  notes: String,
  prescriptions: [{
    medication: String,
    dosage: String,
    frequency: String,
    duration: String
  }],
  followUpRequired: Boolean,
  nextAppointmentDate: Date,
  completedAt: Date
}
```

## Core Implementation

### 1. Queue Manager Service

```javascript
class QueueManagerService {
  
  async processConsultationCompletion(consultationId, completionData) {
    try {
      // 1. Mark consultation as complete
      const consultation = await this.completeConsultation(consultationId, completionData);
      
      // 2. Update doctor availability
      await this.updateDoctorAvailability(consultation.doctorId, 'available');
      
      // 3. Find next patient in queue
      const nextPatient = await this.getNextPatientInQueue();
      
      // 4. Find best available doctor
      const availableDoctor = await this.findBestAvailableDoctor(nextPatient);
      
      // 5. Assign patient to doctor if available
      if (availableDoctor && nextPatient) {
        await this.assignPatientToDoctor(nextPatient._id, availableDoctor._id);
        
        // 6. Send notifications
        await this.sendAssignmentNotifications(nextPatient, availableDoctor);
      }
      
      // 7. Log event
      await this.logQueueEvent('CONSULTATION_COMPLETED', {
        consultationId,
        doctorId: consultation.doctorId,
        nextAssignment: availableDoctor ? {
          patientId: nextPatient._id,
          doctorId: availableDoctor._id
        } : null
      });
      
      return {
        success: true,
        nextPatientAssigned: availableDoctor ? {
          patientId: nextPatient._id,
          patientName: nextPatient.fullName,
          doctorId: availableDoctor._id,
          doctorName: availableDoctor.name
        } : null
      };
      
    } catch (error) {
      console.error('Error processing consultation completion:', error);
      throw error;
    }
  }

  async findBestAvailableDoctor(patient) {
    const availableDoctors = await DoctorAvailability.find({
      status: 'available',
      currentLoad: { $lt: '$maxCapacity' }
    }).populate('doctorId');

    if (availableDoctors.length === 0) {
      return null;
    }

    // Prioritize by:
    // 1. Specialization match
    // 2. Current load (least busy)
    // 3. Average consultation time (fastest)
    
    const scoredDoctors = availableDoctors.map(doc => {
      let score = 0;
      
      // Specialization match bonus
      if (patient.requiredSpecialization && 
          doc.specializations.includes(patient.requiredSpecialization)) {
        score += 100;
      }
      
      // Load factor (lower is better)
      score += (doc.maxCapacity - doc.currentLoad) * 10;
      
      // Speed factor (faster is better)
      score += Math.max(0, 60 - doc.averageConsultationTime);
      
      return { doctor: doc, score };
    });

    // Sort by score (highest first)
    scoredDoctors.sort((a, b) => b.score - a.score);
    
    return scoredDoctors[0].doctor;
  }

  async assignPatientToDoctor(patientId, doctorId) {
    // Update queue status
    await Queue.findOneAndUpdate(
      { patientId: patientId, status: 'waiting' },
      { 
        doctorId: doctorId,
        status: 'assigned',
        assignedAt: new Date(),
        estimatedStartTime: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
      }
    );

    // Update doctor availability
    await DoctorAvailability.findOneAndUpdate(
      { doctorId: doctorId },
      { 
        $inc: { currentLoad: 1 },
        status: 'busy',
        lastUpdated: new Date()
      }
    );

    // Create consultation record
    const consultation = await Consultation.create({
      doctorId: doctorId,
      patientId: patientId,
      status: 'scheduled',
      estimatedDuration: 30,
      scheduledTime: new Date(Date.now() + 5 * 60 * 1000)
    });

    return consultation;
  }

  async sendAssignmentNotifications(patient, doctor) {
    // Notify admin
    await NotificationService.sendToAdmins({
      type: 'PATIENT_ASSIGNED',
      message: `${patient.fullName} has been assigned to Dr. ${doctor.name}`,
      data: { patientId: patient._id, doctorId: doctor._id }
    });

    // Notify doctor
    await NotificationService.sendToDoctor(doctor._id, {
      type: 'NEW_PATIENT_ASSIGNED',
      message: `New patient ${patient.fullName} has been assigned to you`,
      data: { patientId: patient._id, queueNumber: patient.queueNumber }
    });

    // Notify patient
    await NotificationService.sendToPatient(patient._id, {
      type: 'DOCTOR_ASSIGNED',
      message: `You have been assigned to Dr. ${doctor.name}. Please proceed to consultation room.`,
      data: { doctorId: doctor._id, estimatedTime: '5 minutes' }
    });

    // Real-time updates
    io.emit('queue-update', {
      type: 'PATIENT_ASSIGNED',
      patientId: patient._id,
      doctorId: doctor._id,
      timestamp: new Date()
    });
  }
}
```

### 2. Event-Driven Architecture

```javascript
// Event handlers for automatic queue management
const EventEmitter = require('events');
const queueEmitter = new EventEmitter();

// Listen for consultation completion events
queueEmitter.on('consultation-completed', async (data) => {
  await queueManager.processConsultationCompletion(data.consultationId, data.completionData);
});

// Listen for doctor availability changes
queueEmitter.on('doctor-available', async (data) => {
  const nextPatient = await queueManager.getNextPatientInQueue();
  if (nextPatient) {
    await queueManager.assignPatientToDoctor(nextPatient._id, data.doctorId);
  }
});

// Listen for patient queue additions
queueEmitter.on('patient-added-to-queue', async (data) => {
  const availableDoctor = await queueManager.findBestAvailableDoctor(data.patient);
  if (availableDoctor) {
    await queueManager.assignPatientToDoctor(data.patient._id, availableDoctor._id);
  }
});
```

### 3. Monitoring and Analytics

```javascript
// Queue performance monitoring
async function getQueueAnalytics() {
  const analytics = await QueueEvent.aggregate([
    {
      $match: {
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }
    },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        avgProcessingTime: { $avg: '$metadata.processingTime' }
      }
    }
  ]);

  return {
    totalAssignments: analytics.find(a => a._id === 'PATIENT_ASSIGNED')?.count || 0,
    totalCompletions: analytics.find(a => a._id === 'CONSULTATION_COMPLETED')?.count || 0,
    avgProcessingTime: analytics.find(a => a._id === 'PATIENT_ASSIGNED')?.avgProcessingTime || 0,
    efficiency: calculateQueueEfficiency()
  };
}
```

## Integration Requirements

### 1. Real-time Updates
- WebSocket connections for live queue updates
- Push notifications for mobile apps
- Dashboard refresh triggers

### 2. Fallback Mechanisms
- Manual override capabilities
- Queue pause/resume functionality
- Emergency assignment protocols

### 3. Performance Optimization
- Database indexing on frequently queried fields
- Caching of doctor availability status
- Batch processing for multiple assignments

## Testing Strategy

1. **Unit Tests:** Test individual queue management functions
2. **Integration Tests:** Test complete assignment workflow
3. **Load Tests:** Test with high patient volume
4. **Stress Tests:** Test system limits and failure scenarios
5. **Real-time Tests:** Test WebSocket notifications and updates
