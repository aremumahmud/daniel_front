# Doctor Queue Notification System - Backend Implementation

## Overview

This document outlines the backend implementation for the doctor queue notification system, which allows doctors to notify admins when they're ready for the next patient from the queue.

## API Endpoints

### 1. Request Next Patient (Doctor → Admin Notification)

**Endpoint:** `POST /api/doctor/queue/request-next-patient`

**Description:** Allows a doctor to notify the admin that they are ready for the next patient from the queue.

**Authentication:** Required (Doctor JWT token)

**Request Body:**
```json
{
  "message": "Optional custom message from doctor",
  "urgency": "normal" | "urgent" // Optional, defaults to "normal"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin has been notified. Next patient will be called shortly.",
  "data": {
    "notificationId": "notification_id",
    "queuePosition": 1,
    "estimatedWaitTime": "5 minutes",
    "nextPatient": {
      "id": "patient_id",
      "name": "John Doe",
      "queueNumber": "Q001"
    }
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "No patients in queue at the moment.",
  "error": "EMPTY_QUEUE"
}
```

### 2. Get Doctor Queue Status

**Endpoint:** `GET /api/doctor/queue/status`

**Description:** Get current queue status for the doctor.

**Response:**
```json
{
  "success": true,
  "data": {
    "currentPatient": {
      "id": "patient_id",
      "name": "Current Patient",
      "startTime": "2024-01-15T10:00:00Z"
    },
    "queueLength": 5,
    "nextPatients": [
      {
        "id": "patient_id",
        "name": "Next Patient",
        "queueNumber": "Q002",
        "estimatedTime": "10:30 AM"
      }
    ]
  }
}
```

## Database Schema

### Notifications Collection

```javascript
{
  _id: ObjectId,
  type: "DOCTOR_READY_FOR_NEXT_PATIENT",
  fromUserId: ObjectId, // Doctor ID
  toUserId: ObjectId,   // Admin ID (or null for all admins)
  doctorId: ObjectId,
  message: String,
  urgency: String,      // "normal" | "urgent"
  isRead: Boolean,
  createdAt: Date,
  readAt: Date,
  metadata: {
    queuePosition: Number,
    estimatedWaitTime: String,
    nextPatientId: ObjectId
  }
}
```

### Queue Management Collection

```javascript
{
  _id: ObjectId,
  patientId: ObjectId,
  doctorId: ObjectId,
  queueNumber: String,  // "Q001", "Q002", etc.
  status: String,       // "waiting" | "called" | "in_progress" | "completed" | "no_show"
  priority: String,     // "low" | "medium" | "high" | "emergency"
  assignedAt: Date,
  calledAt: Date,
  startedAt: Date,
  completedAt: Date,
  estimatedDuration: Number, // in minutes
  actualDuration: Number,    // in minutes
  notes: String
}
```

## Implementation Details

### 1. Request Next Patient Handler

```javascript
// POST /api/doctor/queue/request-next-patient
async function requestNextPatient(req, res) {
  try {
    const doctorId = req.user.doctorId; // From JWT token
    const { message, urgency = 'normal' } = req.body;

    // Check if doctor has any patients in queue
    const nextPatient = await Queue.findOne({
      doctorId: doctorId,
      status: 'waiting'
    }).sort({ priority: -1, assignedAt: 1 }).populate('patientId');

    if (!nextPatient) {
      return res.json({
        success: false,
        message: "No patients in queue at the moment.",
        error: "EMPTY_QUEUE"
      });
    }

    // Create notification for admin(s)
    const notification = await Notification.create({
      type: 'DOCTOR_READY_FOR_NEXT_PATIENT',
      fromUserId: req.user._id,
      doctorId: doctorId,
      message: message || `Dr. ${req.user.lastName} is ready for the next patient`,
      urgency: urgency,
      isRead: false,
      metadata: {
        queuePosition: 1,
        estimatedWaitTime: "5 minutes",
        nextPatientId: nextPatient.patientId._id
      }
    });

    // Emit real-time notification to admin dashboard
    io.to('admin-room').emit('doctor-ready-notification', {
      doctorId: doctorId,
      doctorName: `Dr. ${req.user.lastName}`,
      nextPatient: {
        id: nextPatient.patientId._id,
        name: nextPatient.patientId.fullName,
        queueNumber: nextPatient.queueNumber
      },
      urgency: urgency,
      timestamp: new Date()
    });

    // Update queue status
    await Queue.findByIdAndUpdate(nextPatient._id, {
      status: 'called',
      calledAt: new Date()
    });

    res.json({
      success: true,
      message: "Admin has been notified. Next patient will be called shortly.",
      data: {
        notificationId: notification._id,
        queuePosition: 1,
        estimatedWaitTime: "5 minutes",
        nextPatient: {
          id: nextPatient.patientId._id,
          name: nextPatient.patientId.fullName,
          queueNumber: nextPatient.queueNumber
        }
      }
    });

  } catch (error) {
    console.error('Error requesting next patient:', error);
    res.status(500).json({
      success: false,
      message: "Failed to notify admin. Please try again.",
      error: error.message
    });
  }
}
```

### 2. Real-time Notifications

```javascript
// Socket.IO implementation for real-time notifications
io.on('connection', (socket) => {
  socket.on('join-admin-room', () => {
    socket.join('admin-room');
  });

  socket.on('join-doctor-room', (doctorId) => {
    socket.join(`doctor-${doctorId}`);
  });
});

// Emit to specific doctor when patient is ready
function notifyDoctorPatientReady(doctorId, patientInfo) {
  io.to(`doctor-${doctorId}`).emit('patient-ready', {
    patient: patientInfo,
    message: "Your next patient is ready",
    timestamp: new Date()
  });
}
```

### 3. Queue Management Functions

```javascript
// Get next patient in queue for a doctor
async function getNextPatientInQueue(doctorId) {
  return await Queue.findOne({
    doctorId: doctorId,
    status: 'waiting'
  }).sort({ 
    priority: -1,    // High priority first
    assignedAt: 1    // Then by assignment time (FIFO)
  }).populate('patientId');
}

// Update queue status when patient consultation starts
async function startPatientConsultation(queueId) {
  return await Queue.findByIdAndUpdate(queueId, {
    status: 'in_progress',
    startedAt: new Date()
  });
}

// Complete patient consultation
async function completePatientConsultation(queueId, duration) {
  return await Queue.findByIdAndUpdate(queueId, {
    status: 'completed',
    completedAt: new Date(),
    actualDuration: duration
  });
}
```

## Integration Points

### 1. Admin Dashboard Integration
- Real-time notifications when doctors request next patient
- Queue management interface to call patients
- Ability to override queue order if needed

### 2. Doctor Dashboard Integration
- "Call Next Patient" button
- Queue status display
- Current patient information

### 3. Patient Notification System
- SMS/Email notifications when called
- Digital queue display updates
- Mobile app push notifications

## Security Considerations

1. **Authentication:** All endpoints require valid JWT tokens
2. **Authorization:** Doctors can only request patients from their own queue
3. **Rate Limiting:** Prevent spam requests (max 1 request per minute)
4. **Input Validation:** Sanitize all input data
5. **Audit Logging:** Log all queue management actions

## Testing Requirements

1. **Unit Tests:** Test all queue management functions
2. **Integration Tests:** Test API endpoints with various scenarios
3. **Real-time Tests:** Test Socket.IO notifications
4. **Load Tests:** Test with multiple concurrent doctors and patients
5. **Edge Cases:** Empty queue, multiple urgent requests, system failures
