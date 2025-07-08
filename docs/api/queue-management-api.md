# Queue Management System API Documentation

## Overview
The Queue Management System provides comprehensive APIs for managing patient queues, doctor assignments, and real-time queue operations in the healthcare system.

**Base URL**: `/api/queue`

## Authentication
All endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Get Queue Status

**Endpoint**: `GET /api/queue/status`
**Access**: Admin, Doctor
**Description**: Get current queue status with patient list and doctor capacities

#### Request
```http
GET /api/queue/status HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response
```json
{
  "success": true,
  "data": {
    "queue": [
      {
        "_id": "550e8400-e29b-41d4-a716-446655440000",
        "patientId": "550e8400-e29b-41d4-a716-446655440001",
        "patientName": "John Doe",
        "position": 1,
        "priority": "high",
        "status": "waiting",
        "reason": "Regular checkup",
        "symptoms": "Mild headache and fatigue",
        "queuedAt": "2024-01-15T09:30:00.000Z",
        "estimatedWaitTime": 15,
        "assignedDoctorId": null,
        "assignedAt": null
      }
    ],
    "doctorCapacities": [
      {
        "doctorId": "550e8400-e29b-41d4-a716-446655440002",
        "doctorName": "Dr. Jane Smith",
        "specialization": "General Medicine",
        "isOnline": true,
        "isAvailable": true,
        "currentPatients": 2,
        "maxPatients": 5,
        "averageConsultationTime": 20
      }
    ],
    "stats": {
      "totalWaiting": 8,
      "totalInConsultation": 3,
      "totalDoctors": 4,
      "availableDoctors": 2,
      "averageWaitTime": 18.5
    }
  }
}
```

### 2. Add Patient to Queue

**Endpoint**: `POST /api/queue/add-patient`
**Access**: Admin, Doctor, Patient
**Description**: Add a patient to the queue

#### Request
```http
POST /api/queue/add-patient HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "priority": "medium",
  "reason": "Regular checkup",
  "symptoms": "Feeling unwell, mild fever",
  "type": "walk-in",
  "appointmentId": "550e8400-e29b-41d4-a716-446655440001"
}
```

#### Request Body Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| patientId | string | Yes | UUID of the patient |
| priority | string | No | Priority level: emergency, high, medium, low (default: medium) |
| reason | string | Yes | Reason for visit (5-500 characters) |
| symptoms | string | No | Patient symptoms (max 1000 characters) |
| type | string | No | Type: walk-in, scheduled (default: walk-in) |
| appointmentId | string | No | UUID of related appointment |

#### Response
```json
{
  "success": true,
  "message": "Patient added to queue successfully",
  "data": {
    "queueId": "550e8400-e29b-41d4-a716-446655440002",
    "queuePosition": 3,
    "estimatedWaitTime": 25
  }
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Patient is already in the queue",
  "code": "ALREADY_QUEUED"
}
```

### 3. Assign Patient to Doctor

**Endpoint**: `POST /api/queue/assign-patient`
**Access**: Admin, Doctor
**Description**: Assign a waiting patient to a doctor (manual or auto-assignment)

#### Request
```http
POST /api/queue/assign-patient HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "doctorId": "550e8400-e29b-41d4-a716-446655440003"
}
```

#### Request Body Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| patientId | string | Yes | UUID of the patient |
| doctorId | string | No | UUID of the doctor (if not provided, auto-assigns) |

#### Response
```json
{
  "success": true,
  "message": "Patient assigned to Dr. Jane Smith successfully",
  "data": {
    "assignedDoctorId": "550e8400-e29b-41d4-a716-446655440003",
    "assignedDoctorName": "Dr. Jane Smith",
    "estimatedConsultationTime": "2024-01-15T10:50:00.000Z"
  }
}
```

### 4. Auto-Assign All Waiting Patients

**Endpoint**: `POST /api/queue/auto-assign`
**Access**: Admin
**Description**: Automatically assign all waiting patients to available doctors using round-robin

#### Request
```http
POST /api/queue/auto-assign HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response
```json
{
  "success": true,
  "message": "Auto-assignment completed. 3 patients assigned.",
  "data": {
    "totalAssigned": 3,
    "results": [
      {
        "patientId": "550e8400-e29b-41d4-a716-446655440000",
        "doctorId": "550e8400-e29b-41d4-a716-446655440003",
        "assignedAt": "2024-01-15T10:35:00.000Z"
      }
    ]
  }
```

### 5. Update Patient Status

**Endpoint**: `PUT /api/queue/patient/:queueId/status`
**Access**: Admin, Doctor
**Description**: Update the status of a queue entry

#### Request
```http
PUT /api/queue/patient/550e8400-e29b-41d4-a716-446655440002/status HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "completed",
  "notes": "Consultation completed successfully"
}
```

#### Request Body Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | New status: waiting, assigned, in-consultation, completed, cancelled |
| notes | string | No | Status update notes |

#### Response
```json
{
  "success": true,
  "message": "Patient status updated successfully",
  "data": {
    "queueId": "550e8400-e29b-41d4-a716-446655440002",
    "status": "completed",
    "updatedAt": "2024-01-15T11:15:00.000Z"
  }
}
```

### 6. Remove Patient from Queue

**Endpoint**: `DELETE /api/queue/patient/:queueId`
**Access**: Admin, Doctor
**Description**: Remove a patient from the queue

#### Request
```http
DELETE /api/queue/patient/550e8400-e29b-41d4-a716-446655440002 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "reason": "Patient cancelled appointment"
}
```

#### Response
```json
{
  "success": true,
  "message": "Patient removed from queue successfully"
}
```

## Doctor Capacity Management

### 7. Get Doctor Capacities

**Endpoint**: `GET /api/queue/doctors/capacities`
**Access**: Admin, Doctor
**Description**: Get capacity information for all doctors

#### Request
```http
GET /api/queue/doctors/capacities HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "doctorId": "550e8400-e29b-41d4-a716-446655440003",
      "doctorName": "Dr. Jane Smith",
      "specialization": "General Medicine",
      "isOnline": true,
      "isAvailable": true,
      "currentPatients": 2,
      "maxPatients": 5,
      "workingHours": {
        "start": "09:00",
        "end": "17:00"
      },
      "averageConsultationTime": 25,
      "lastAssignedAt": "2024-01-15T10:30:00.000Z",
      "capacityPercentage": 40,
      "availabilityStatus": "available"
    }
  ]
}
```

### 8. Update Doctor Status

**Endpoint**: `PUT /api/queue/doctors/:doctorId/status`
**Access**: Admin, Doctor
**Description**: Update doctor's online/offline status

#### Request
```http
PUT /api/queue/doctors/550e8400-e29b-41d4-a716-446655440003/status HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "isOnline": true,
  "isAvailable": true
}
```

#### Request Body Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| isOnline | boolean | No | Doctor online status |
| isAvailable | boolean | No | Doctor availability for new patients |

#### Response
```json
{
  "success": true,
  "message": "Doctor status updated successfully",
  "data": {
    "doctorId": "550e8400-e29b-41d4-a716-446655440003",
    "isOnline": true,
    "isAvailable": true,
    "updatedAt": "2024-01-15T10:45:00.000Z"
  }
}
```

## Queue Analytics and Settings

### 9. Get Queue Analytics

**Endpoint**: `GET /api/queue/analytics`
**Access**: Admin
**Description**: Get queue performance analytics and statistics

#### Request
```http
GET /api/queue/analytics?period=24h&doctorId=550e8400-e29b-41d4-a716-446655440003 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| period | string | No | Time period: 1h, 24h, 7d, 30d (default: 24h) |
| doctorId | string | No | Filter by specific doctor |

#### Response
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalPatients": 45,
      "completedConsultations": 38,
      "averageWaitTime": 22.5,
      "averageConsultationTime": 28.3,
      "patientSatisfactionRate": 94.2
    },
    "queueMetrics": {
      "peakHours": ["10:00", "14:00", "16:00"],
      "busyDays": ["Monday", "Wednesday", "Friday"],
      "averageQueueLength": 8.5,
      "maxQueueLength": 15
    },
    "doctorPerformance": [
      {
        "doctorId": "550e8400-e29b-41d4-a716-446655440003",
        "doctorName": "Dr. Jane Smith",
        "patientsHandled": 12,
        "averageConsultationTime": 25,
        "efficiency": 92.3
      }
    ]
  }
}
```

### 10. Get Queue Settings

**Endpoint**: `GET /api/queue/settings`
**Access**: Admin
**Description**: Get current queue management settings

#### Request
```http
GET /api/queue/settings HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response
```json
{
  "success": true,
  "data": {
    "autoAssignment": {
      "enabled": true,
      "algorithm": "round_robin",
      "considerSpecialization": true,
      "maxWaitTime": 30
    },
    "prioritySettings": {
      "emergency": {
        "maxWaitTime": 5,
        "autoEscalate": true
      },
      "high": {
        "maxWaitTime": 15,
        "autoEscalate": true
      },
      "medium": {
        "maxWaitTime": 30,
        "autoEscalate": false
      },
      "low": {
        "maxWaitTime": 60,
        "autoEscalate": false
      }
    },
    "notifications": {
      "enabled": true,
      "channels": ["websocket", "email"],
      "adminAlerts": true,
      "doctorAlerts": true
    },
    "workingHours": {
      "start": "08:00",
      "end": "18:00",
      "timezone": "UTC"
    }
  }
}
```

### 11. Update Queue Settings

**Endpoint**: `PUT /api/queue/settings`
**Access**: Admin
**Description**: Update queue management settings

#### Request
```http
PUT /api/queue/settings HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "autoAssignment": {
    "enabled": true,
    "algorithm": "priority_first",
    "considerSpecialization": true,
    "maxWaitTime": 25
  },
  "prioritySettings": {
    "emergency": {
      "maxWaitTime": 3,
      "autoEscalate": true
    }
  },
  "notifications": {
    "enabled": true,
    "channels": ["websocket", "email", "sms"]
  }
}
```

#### Response
```json
{
  "success": true,
  "message": "Queue settings updated successfully",
  "data": {
    "updatedAt": "2024-01-15T11:00:00.000Z",
    "updatedBy": "admin@example.com"
  }
}
```

## Error Responses

### Common Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (patient already in queue)
- `422` - Unprocessable Entity (business logic errors)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {
    "field": "fieldName",
    "value": "invalidValue"
  }
}
```

### Specific Error Examples

#### Patient Already in Queue
```json
{
  "success": false,
  "message": "Patient is already in the queue",
  "code": "ALREADY_QUEUED"
}
```

#### No Available Doctors
```json
{
  "success": false,
  "message": "No doctors available for assignment",
  "code": "NO_AVAILABLE_DOCTORS"
```

#### Doctor Not Available
```json
{
  "success": false,
  "message": "Doctor is not available",
  "code": "DOCTOR_NOT_AVAILABLE"
}
```

## WebSocket Events

### Real-time Queue Updates
Connect to WebSocket endpoint for real-time updates:

```javascript
const socket = io('/queue-updates', {
  auth: { token: 'jwt_token_here' }
});

// Join queue room
socket.emit('join-queue-room');

// Listen for events
socket.on('queue-updated', (data) => {
  console.log('Queue updated:', data);
});
```

#### Server-to-Client Events

**queue-updated**
```json
{
  "event": "queue-updated",
  "data": {
    "totalWaiting": 8,
    "totalInConsultation": 3,
    "averageWaitTime": 22,
    "lastUpdated": "2024-01-15T11:00:00.000Z"
  }
}
```

**patient-assigned**
```json
{
  "event": "patient-assigned",
  "data": {
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "doctorId": "550e8400-e29b-41d4-a716-446655440003",
    "estimatedStartTime": "2024-01-15T11:05:00.000Z"
  }
}
```

**doctor-status-changed**
```json
{
  "event": "doctor-status-changed",
  "data": {
    "doctorId": "550e8400-e29b-41d4-a716-446655440003",
    "isOnline": true,
    "isAvailable": false,
    "currentPatients": 3
  }
}
```

## Rate Limiting
- **General endpoints**: 100 requests per 15 minutes
- **Queue status**: 60 requests per minute
- **Analytics**: 20 requests per hour
- **Settings updates**: 10 requests per hour

## Notes
- All timestamps are in ISO 8601 format (UTC)
- UUIDs are used for all entity identifiers
- Queue positions are automatically managed
- Real-time updates are delivered via WebSocket
- Priority levels: emergency > high > medium > low
- Auto-assignment uses round-robin algorithm with priority consideration
- Doctor capacity is automatically managed based on current load
