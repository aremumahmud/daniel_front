# Doctor Queue Notification System API Documentation

## Overview
This API provides endpoints for the doctor queue notification system that allows doctors to notify admins when they are ready for the next patient, with real-time WebSocket notifications.

## Base URL
```
/api
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Doctor Notification Endpoints

### 1. Request Next Patient
**Endpoint:** `POST /doctor/queue/request-next-patient`  
**Access:** Private (Doctor)  
**Description:** Notify admin that doctor is ready for the next patient

#### Request Body
```json
{
  "message": "Ready for next patient - consultation room 3",
  "urgency": "normal"
}
```

#### Request Body Parameters
- `message` (optional): Custom message for the admin
- `urgency` (optional): Urgency level - `"low"`, `"normal"`, `"high"`, `"urgent"`, `"critical"` (default: `"normal"`)

#### Success Response
```json
{
  "success": true,
  "message": "Admin has been notified. Next patient will be called shortly.",
  "data": {
    "notificationId": "aa1b2c3d-4e5f-6789-abcd-ef1234567890",
    "queuePosition": 1,
    "estimatedWaitTime": "5 minutes",
    "nextPatient": {
      "id": "660f9511-f3ac-52e5-b827-557766551111",
      "name": "Jane Smith",
      "queueNumber": "Q001"
    }
  }
}
```

#### No Patients Available Response
```json
{
  "success": false,
  "message": "No patients in queue at the moment.",
  "error": "EMPTY_QUEUE"
}
```

### 2. Get Doctor Queue Status
**Endpoint:** `GET /doctor/queue/status`  
**Access:** Private (Doctor)  
**Description:** Get current queue status for the doctor

#### Response
```json
{
  "success": true,
  "data": {
    "currentPatient": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "startTime": "2024-01-10T14:30:00Z",
      "queueNumber": "Q002",
      "priority": "normal"
    },
    "queueLength": 3,
    "nextPatients": [
      {
        "id": "660f9511-f3ac-52e5-b827-557766551111",
        "name": "Jane Smith",
        "queueNumber": "Q003",
        "priority": "high",
        "status": "waiting",
        "estimatedTime": "15:00",
        "waitingTime": 25
      },
      {
        "id": "771h1733-h8fh-97j0-g37c-00cc11006666",
        "name": "Michael Johnson",
        "queueNumber": "Q004",
        "priority": "normal",
        "status": "waiting",
        "estimatedTime": "15:30",
        "waitingTime": 15
      }
    ],
    "hasWaitingPatients": true
  }
}
```

### 3. Get Doctor Notifications
**Endpoint:** `GET /doctor/notifications`  
**Access:** Private (Doctor)  
**Description:** Get doctor's notifications with pagination

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `unreadOnly` (optional): Show only unread notifications (default: false)

#### Response
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "bb2c3d4e-5f6g-7890-bcde-f23456789012",
        "type": "PATIENT_ASSIGNED",
        "title": "New Patient Assigned",
        "message": "New patient Jane Smith has been assigned to you",
        "isRead": false,
        "priority": 5,
        "urgency": "normal",
        "createdAt": "2024-01-10T14:25:00Z",
        "doctorId": "770g0622-g4bd-63f6-c938-668877662222",
        "patientId": "660f9511-f3ac-52e5-b827-557766551111",
        "queueId": "880h1733-h5ce-74g7-d049-779988773333",
        "metadata": {
          "queueNumber": "Q001",
          "patientAge": 39
        },
        "actions": [
          {
            "label": "View Patient",
            "action": "view",
            "url": "/doctor/patients/660f9511-f3ac-52e5-b827-557766551111"
          }
        ],
        "fromUserId": null,
        "patientId": {
          "firstName": "Jane",
          "lastName": "Smith"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 45,
      "itemsPerPage": 20
    },
    "unreadCount": 8
  }
}
```

### 4. Mark Notification as Read
**Endpoint:** `PUT /doctor/notifications/:notificationId/read`  
**Access:** Private (Doctor)  
**Description:** Mark a specific notification as read

#### Request Parameters
- `notificationId` (path parameter): UUID of the notification

#### Response
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "notificationId": "bb2c3d4e-5f6g-7890-bcde-f23456789012",
    "isRead": true,
    "readAt": "2024-01-10T14:35:00Z"
  }
}
```

### 5. Get Doctor Availability
**Endpoint:** `GET /doctor/availability`  
**Access:** Private (Doctor)  
**Description:** Get doctor's current availability status

#### Response
```json
{
  "success": true,
  "data": {
    "doctorId": "770g0622-g4bd-63f6-c938-668877662222",
    "name": "Dr. John Doe",
    "isOnline": true,
    "isAvailable": true,
    "currentPatients": 1,
    "maxPatients": 5,
    "averageConsultationTime": 30,
    "workingHours": {
      "start": "09:00",
      "end": "17:00"
    },
    "status": "available"
  }
}
```

---

## Admin Notification Endpoints

### 6. Get Admin Notifications
**Endpoint:** `GET /admin/notifications`  
**Access:** Private (Admin)  
**Description:** Get admin notifications including doctor ready requests

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `unreadOnly` (optional): Show only unread notifications (default: false)
- `type` (optional): Filter by notification type

#### Response
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "cc3d4e5f-6g7h-8901-cdef-345678901234",
        "type": "DOCTOR_READY_FOR_NEXT_PATIENT",
        "title": "Doctor Ready for Next Patient",
        "message": "Dr. John Doe is ready for the next patient",
        "isRead": false,
        "priority": 5,
        "urgency": "normal",
        "createdAt": "2024-01-10T14:30:00Z",
        "fromUserId": {
          "firstName": "John",
          "lastName": "Doe"
        },
        "doctorId": {
          "userId": {
            "firstName": "John",
            "lastName": "Doe"
          },
          "specialization": "General Medicine"
        },
        "patientId": {
          "firstName": "Jane",
          "lastName": "Smith"
        },
        "metadata": {
          "queuePosition": 1,
          "estimatedWaitTime": "5 minutes",
          "nextPatientId": "660f9511-f3ac-52e5-b827-557766551111",
          "doctorName": "Dr. John Doe",
          "patientName": "Jane Smith",
          "queueNumber": "Q001"
        },
        "actions": [
          {
            "label": "Call Patient",
            "action": "call",
            "data": {
              "queueId": "880h1733-h5ce-74g7-d049-779988773333",
              "patientId": "660f9511-f3ac-52e5-b827-557766551111",
              "doctorId": "770g0622-g4bd-63f6-c938-668877662222"
            },
            "style": "primary"
          },
          {
            "label": "View Queue",
            "action": "view",
            "url": "/admin/queue",
            "style": "secondary"
          }
        ]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 28,
      "itemsPerPage": 20
    },
    "unreadCount": 5
  }
}
```

---

## WebSocket Events

### Real-time Notification Events
The system emits real-time events via WebSocket for live admin dashboard updates:

#### 1. Doctor Ready Notification
**Event:** `doctor-ready-notification`  
**Room:** `admin-room`  
**Description:** Emitted when a doctor requests the next patient

```json
{
  "notificationId": "cc3d4e5f-6g7h-8901-cdef-345678901234",
  "doctorId": "770g0622-g4bd-63f6-c938-668877662222",
  "doctorName": "Dr. John Doe",
  "nextPatient": {
    "id": "660f9511-f3ac-52e5-b827-557766551111",
    "name": "Jane Smith",
    "queueNumber": "Q001"
  },
  "urgency": "normal",
  "message": "Dr. John Doe is ready for the next patient",
  "timestamp": "2024-01-10T14:30:00Z"
}
```

#### 2. Patient Called
**Event:** `patient-called`  
**Room:** `doctor-room-{doctorId}`  
**Description:** Emitted when admin calls a patient for the doctor

```json
{
  "patientId": "660f9511-f3ac-52e5-b827-557766551111",
  "patientName": "Jane Smith",
  "queueNumber": "Q001",
  "doctorId": "770g0622-g4bd-63f6-c938-668877662222",
  "calledAt": "2024-01-10T14:32:00Z",
  "estimatedArrival": "2024-01-10T14:37:00Z"
}
```

#### 3. Queue Status Update
**Event:** `queue-status-update`  
**Room:** `admin-room`, `doctor-room-{doctorId}`  
**Description:** Emitted when queue status changes

```json
{
  "queueLength": 12,
  "availableDoctors": 3,
  "patientsInConsultation": 5,
  "averageWaitTime": 18,
  "lastUpdated": "2024-01-10T14:30:00Z"
}
```

---

## Notification Types

### Doctor Notification Types
- `PATIENT_ASSIGNED` - New patient assigned to doctor
- `PATIENT_CALLED` - Patient has been called and is on the way
- `CONSULTATION_REMINDER` - Reminder about upcoming consultation
- `QUEUE_UPDATE` - General queue status update
- `EMERGENCY_ALERT` - Emergency patient assigned
- `SYSTEM_NOTIFICATION` - System-wide announcements

### Admin Notification Types
- `DOCTOR_READY_FOR_NEXT_PATIENT` - Doctor requesting next patient
- `PATIENT_NO_SHOW` - Patient didn't show up for consultation
- `DOCTOR_BREAK_REQUEST` - Doctor requesting break
- `QUEUE_OVERFLOW_WARNING` - Queue getting too long
- `SHIFT_CHANGE_NOTIFICATION` - Doctor shift changes
- `EMERGENCY_ALERT` - Emergency situations

---

## Error Responses

### Common Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Specific Error Cases

#### Empty Queue Error
```json
{
  "success": false,
  "message": "No patients in queue at the moment.",
  "error": "EMPTY_QUEUE"
}
```

#### Doctor Not Available Error
```json
{
  "success": false,
  "message": "Doctor is not currently available",
  "error": "DOCTOR_UNAVAILABLE"
}
```

---

## WebSocket Connection

### Connection Setup
```javascript
const socket = io('/queue-notifications', {
  auth: {
    token: 'jwt_token_here'
  }
});

// Join appropriate room based on user role
if (userRole === 'admin') {
  socket.emit('join-room', 'admin-room');
} else if (userRole === 'doctor') {
  socket.emit('join-room', `doctor-room-${doctorId}`);
}
```

### Event Listeners
```javascript
// Listen for doctor ready notifications (admin)
socket.on('doctor-ready-notification', (data) => {
  console.log('Doctor ready:', data);
  // Update admin dashboard
});

// Listen for patient called notifications (doctor)
socket.on('patient-called', (data) => {
  console.log('Patient called:', data);
  // Update doctor interface
});

// Listen for queue updates
socket.on('queue-status-update', (data) => {
  console.log('Queue updated:', data);
  // Update queue display
});
```

---

## Rate Limiting
- **Notification endpoints**: 60 requests per minute
- **WebSocket connections**: 5 connections per user
- **Request next patient**: 10 requests per minute per doctor

## Notes
- All timestamps are in ISO 8601 format (UTC)
- UUIDs are used for all entity identifiers
- WebSocket notifications are delivered in real-time
- Notification history is maintained for audit purposes
- Urgency levels affect notification priority and display
- Actions in notifications provide quick access to relevant functions
