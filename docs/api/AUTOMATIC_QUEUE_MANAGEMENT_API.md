# Automatic Queue Management System API Documentation

## Overview
This API provides endpoints for the automatic queue management system that handles consultation completion and automatic patient assignment to available doctors.

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

## Consultation Management Endpoints

### 1. Complete Consultation
**Endpoint:** `POST /doctor/consultations/:consultationId/complete`  
**Access:** Private (Doctor)  
**Description:** Complete a consultation and trigger automatic queue management

#### Request Parameters
- `consultationId` (path parameter): UUID of the consultation to complete

#### Request Body
```json
{
  "duration": 25,
  "notes": "Patient responded well to treatment. Prescribed antibiotics for infection.",
  "followUpRequired": true,
  "nextAppointmentDate": "2024-01-15T10:00:00Z",
  "prescriptions": [
    {
      "medication": "Amoxicillin",
      "dosage": "500mg",
      "frequency": "3 times daily",
      "duration": "7 days",
      "instructions": "Take with food"
    }
  ],
  "diagnosis": [
    {
      "condition": "Upper Respiratory Infection",
      "icd10Code": "J06.9",
      "severity": "mild"
    }
  ],
  "recommendations": [
    "Rest and hydration",
    "Complete full course of antibiotics"
  ],
  "testsOrdered": [],
  "referrals": [],
  "consultationFee": 150.00
}
```

#### Response
```json
{
  "success": true,
  "message": "Consultation completed successfully",
  "data": {
    "consultationId": "550e8400-e29b-41d4-a716-446655440000",
    "nextPatientAssigned": {
      "patientId": "660f9511-f3ac-52e5-b827-557766551111",
      "patientName": "Jane Smith",
      "doctorId": "770g0622-g4bd-63f6-c938-668877662222",
      "doctorName": "Dr. John Doe",
      "estimatedStartTime": "2024-01-10T14:35:00Z"
    },
    "doctorStatus": "assigned"
  }
}
```

### 2. Start Consultation
**Endpoint:** `POST /doctor/consultations/:consultationId/start`  
**Access:** Private (Doctor)  
**Description:** Start a scheduled consultation

#### Request Parameters
- `consultationId` (path parameter): UUID of the consultation to start

#### Response
```json
{
  "success": true,
  "message": "Consultation started successfully",
  "data": {
    "consultation": {
      "_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "in_progress",
      "startTime": "2024-01-10T14:30:00Z",
      "patient": {
        "_id": "660f9511-f3ac-52e5-b827-557766551111",
        "firstName": "Jane",
        "lastName": "Smith"
      }
    }
  }
}
```

### 3. Get Current Consultation
**Endpoint:** `GET /doctor/consultations/current`  
**Access:** Private (Doctor)  
**Description:** Get doctor's current active consultation

#### Response
```json
{
  "success": true,
  "data": {
    "consultation": {
      "_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "in_progress",
      "startTime": "2024-01-10T14:30:00Z",
      "estimatedDuration": 30,
      "patient": {
        "_id": "660f9511-f3ac-52e5-b827-557766551111",
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "queue": {
        "_id": "880h1733-h5ce-74g7-d049-779988773333",
        "queueNumber": "Q001",
        "priority": "normal"
      }
    }
  }
}
```

### 4. Get Consultation Details
**Endpoint:** `GET /doctor/consultations/:consultationId`  
**Access:** Private (Doctor)  
**Description:** Get detailed information about a specific consultation

#### Response
```json
{
  "success": true,
  "data": {
    "consultation": {
      "_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "completed",
      "startTime": "2024-01-10T14:30:00Z",
      "endTime": "2024-01-10T14:55:00Z",
      "duration": 25,
      "patient": {
        "_id": "660f9511-f3ac-52e5-b827-557766551111",
        "firstName": "Jane",
        "lastName": "Smith",
        "dateOfBirth": "1985-03-15",
        "gender": "female",
        "phone": "+1234567890",
        "email": "jane.smith@email.com"
      },
      "doctor": {
        "_id": "770g0622-g4bd-63f6-c938-668877662222",
        "userId": {
          "firstName": "John",
          "lastName": "Doe"
        },
        "specialization": "General Medicine"
      },
      "queue": {
        "_id": "880h1733-h5ce-74g7-d049-779988773333",
        "queueNumber": "Q001",
        "priority": "normal",
        "position": 1
      },
      "prescriptions": [
        {
          "medication": "Amoxicillin",
          "dosage": "500mg",
          "frequency": "3 times daily",
          "duration": "7 days"
        }
      ],
      "diagnosis": [
        {
          "condition": "Upper Respiratory Infection",
          "icd10Code": "J06.9"
        }
      ]
    }
  }
}
```

### 5. Get Consultation History
**Endpoint:** `GET /doctor/consultations/history`  
**Access:** Private (Doctor)  
**Description:** Get doctor's consultation history with pagination and filtering

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by consultation status
- `startDate` (optional): Filter from date (ISO 8601)
- `endDate` (optional): Filter to date (ISO 8601)

#### Response
```json
{
  "success": true,
  "data": {
    "consultations": [
      {
        "_id": "550e8400-e29b-41d4-a716-446655440000",
        "status": "completed",
        "startTime": "2024-01-10T14:30:00Z",
        "duration": 25,
        "patient": {
          "firstName": "Jane",
          "lastName": "Smith",
          "dateOfBirth": "1985-03-15"
        },
        "queue": {
          "queueNumber": "Q001",
          "priority": "normal"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 95,
      "itemsPerPage": 20
    },
    "statistics": {
      "totalConsultations": 95,
      "averageDuration": 28.5,
      "completionRate": 98.9
    }
  }
}
```

### 6. Cancel Consultation
**Endpoint:** `POST /doctor/consultations/:consultationId/cancel`  
**Access:** Private (Doctor)  
**Description:** Cancel a scheduled or in-progress consultation

#### Request Body
```json
{
  "reason": "Patient did not show up"
}
```

#### Response
```json
{
  "success": true,
  "message": "Consultation cancelled successfully",
  "data": {
    "consultationId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "cancelled"
  }
}
```

---

## Admin Queue Management Endpoints

### 7. Get Doctor Availability
**Endpoint:** `GET /admin/doctors/availability`  
**Access:** Private (Admin)  
**Description:** Get real-time availability status of all doctors

#### Response
```json
{
  "success": true,
  "data": {
    "availableDoctors": [
      {
        "doctorId": "770g0622-g4bd-63f6-c938-668877662222",
        "name": "Dr. John Doe",
        "specialization": "General Medicine",
        "currentLoad": 0,
        "maxCapacity": 5,
        "averageConsultationTime": 30,
        "status": "available",
        "isOnline": true,
        "workingHours": {
          "start": "09:00",
          "end": "17:00"
        }
      }
    ],
    "busyDoctors": [
      {
        "doctorId": "881i2844-i6df-85h8-e15a-88aa99884444",
        "name": "Dr. Sarah Wilson",
        "specialization": "Cardiology",
        "currentLoad": 3,
        "maxCapacity": 3,
        "status": "busy",
        "currentPatient": "Michael Johnson",
        "estimatedCompletionTime": "2024-01-10T15:15:00Z"
      }
    ],
    "summary": {
      "totalDoctors": 8,
      "availableCount": 3,
      "busyCount": 4,
      "offlineCount": 1
    }
  }
}
```

### 8. Manual Patient Assignment
**Endpoint:** `POST /admin/queue/assign-patient`  
**Access:** Private (Admin)  
**Description:** Manually assign a patient to a specific doctor

#### Request Body
```json
{
  "patientId": "660f9511-f3ac-52e5-b827-557766551111",
  "doctorId": "770g0622-g4bd-63f6-c938-668877662222",
  "priority": "high",
  "reason": "Patient requested specific doctor"
}
```

#### Response
```json
{
  "success": true,
  "message": "Patient assigned successfully",
  "data": {
    "assignment": {
      "patientId": "660f9511-f3ac-52e5-b827-557766551111",
      "patientName": "Jane Smith",
      "doctorId": "770g0622-g4bd-63f6-c938-668877662222",
      "doctorName": "Dr. John Doe",
      "priority": "high",
      "reason": "Patient requested specific doctor",
      "assignedAt": "2024-01-10T14:30:00Z"
    }
  }
}
```

### 9. Get Queue Analytics
**Endpoint:** `GET /admin/queue/analytics`  
**Access:** Private (Admin)  
**Description:** Get comprehensive queue performance analytics

#### Query Parameters
- `startDate` (optional): Analytics start date (ISO 8601)
- `endDate` (optional): Analytics end date (ISO 8601)
- `doctorId` (optional): Filter by specific doctor

#### Response
```json
{
  "success": true,
  "data": {
    "currentQueue": {
      "waiting": 12,
      "assigned": 8,
      "inConsultation": 5,
      "total": 25
    },
    "performance": {
      "totalAssignments": 156,
      "totalCompletions": 148,
      "completionRate": "94.87",
      "avgProcessingTime": 125,
      "avgWaitTime": 18
    },
    "resources": {
      "availableDoctors": 3,
      "avgWaitTime": 18
    },
    "eventAnalytics": [
      {
        "_id": {
          "eventType": "CONSULTATION_COMPLETED",
          "hour": 14
        },
        "count": 12,
        "avgProcessingTime": 1850
      }
    ],
    "dateRange": {
      "start": "2024-01-09T14:30:00Z",
      "end": "2024-01-10T14:30:00Z"
    }
  }
}
```

### 10. Get Queue Events
**Endpoint:** `GET /admin/queue/events`  
**Access:** Private (Admin)  
**Description:** Get recent queue management events for monitoring

#### Query Parameters
- `limit` (optional): Number of events to return (default: 50)
- `eventType` (optional): Filter by event type
- `doctorId` (optional): Filter by doctor
- `priority` (optional): Filter by priority

#### Response
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "_id": "990j3955-j7eg-96i9-f26b-99bb00995555",
        "eventType": "CONSULTATION_COMPLETED",
        "timestamp": "2024-01-10T14:55:00Z",
        "doctorId": "770g0622-g4bd-63f6-c938-668877662222",
        "patientId": "660f9511-f3ac-52e5-b827-557766551111",
        "description": "Consultation completed and automatic assignment processed",
        "metadata": {
          "processingTime": 1250,
          "nextAssignment": {
            "patientId": "771h1733-h8fh-97j0-g37c-00cc11006666",
            "doctorId": "770g0622-g4bd-63f6-c938-668877662222"
          }
        },
        "source": "system",
        "status": "success"
      }
    ],
    "total": 1
  }
}
```

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
  "error": "Detailed error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

---

## WebSocket Events

### Real-time Events
The system emits real-time events via WebSocket for live updates:

#### 1. Consultation Completed
```json
{
  "event": "consultation-completed",
  "data": {
    "consultationId": "550e8400-e29b-41d4-a716-446655440000",
    "doctorId": "770g0622-g4bd-63f6-c938-668877662222",
    "nextPatientAssigned": {
      "patientId": "771h1733-h8fh-97j0-g37c-00cc11006666",
      "patientName": "Michael Johnson"
    }
  }
}
```

#### 2. Patient Auto-Assigned
```json
{
  "event": "patient-auto-assigned",
  "data": {
    "patientId": "771h1733-h8fh-97j0-g37c-00cc11006666",
    "doctorId": "770g0622-g4bd-63f6-c938-668877662222",
    "queuePosition": 1,
    "estimatedStartTime": "2024-01-10T15:00:00Z"
  }
}
```

---

## Rate Limiting
- **General endpoints**: 100 requests per minute
- **Analytics endpoints**: 20 requests per minute
- **WebSocket connections**: 5 connections per user

## Notes
- All timestamps are in ISO 8601 format (UTC)
- UUIDs are used for all entity identifiers
- Automatic assignment occurs within 5 seconds of consultation completion
- System maintains audit trail of all queue management events
