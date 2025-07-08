# Enhanced Patient Management API Documentation

## Overview
The Enhanced Patient Management System provides comprehensive APIs for managing patient health records, medical data, appointments, documents, and communications in the healthcare system.

**Base URL**: `/api/patient`

## Authentication
All endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Health Metrics Management

#### 1.1 Add Health Metric

**Endpoint**: `POST /api/patient/health-metrics`
**Access**: Patient, Doctor, Admin
**Description**: Add a new health metric for the patient

##### Request
```http
POST /api/patient/health-metrics HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "metricType": "blood_pressure",
  "systolicValue": 120,
  "diastolicValue": 80,
  "unit": "mmHg",
  "notes": "Normal reading after medication",
  "recordedBy": "patient",
  "deviceInfo": {
    "deviceName": "Omron BP Monitor",
    "deviceModel": "HEM-7120"
  },
  "tags": ["morning", "after_medication"]
}
```

##### Request Body Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| metricType | string | Yes | Type: weight, height, blood_pressure, heart_rate, temperature, blood_sugar, cholesterol |
| value | number | No | Single value for simple metrics |
| systolicValue | number | No | Systolic value for blood pressure |
| diastolicValue | number | No | Diastolic value for blood pressure |
| unit | string | Yes | Unit of measurement |
| notes | string | No | Additional notes |
| recordedBy | string | No | Who recorded: patient, doctor, nurse |
| deviceInfo | object | No | Device information |
| tags | array | No | Tags for categorization |

##### Response
```json
{
  "success": true,
  "message": "Health metric added successfully",
  "data": {
    "_id": "550e8400-e29b-41d4-a716-446655440000",
    "patientId": "550e8400-e29b-41d4-a716-446655440001",
    "metricType": "blood_pressure",
    "systolicValue": 120,
    "diastolicValue": 80,
    "unit": "mmHg",
    "notes": "Normal reading after medication",
    "recordedBy": "patient",
    "recordedAt": "2024-01-15T10:30:00.000Z",
    "status": "normal",
    "deviceInfo": {
      "deviceName": "Omron BP Monitor",
      "deviceModel": "HEM-7120"
    },
    "tags": ["morning", "after_medication"]
  }
}
```

#### 1.2 Get Health Metrics

**Endpoint**: `GET /api/patient/health-metrics`
**Access**: Patient, Doctor, Admin
**Description**: Get patient's health metrics with filtering options

##### Request
```http
GET /api/patient/health-metrics?metricType=blood_pressure&period=30d&limit=50&page=1 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

##### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| metricType | string | No | Filter by metric type |
| period | string | No | Time period: 7d, 30d, 90d, 1y |
| startDate | string | No | Start date (ISO format) |
| endDate | string | No | End date (ISO format) |
| limit | number | No | Number of records per page (default: 20) |
| page | number | No | Page number (default: 1) |
| sortBy | string | No | Sort field (default: recordedAt) |
| sortOrder | string | No | Sort order: asc, desc (default: desc) |

##### Response
```json
{
  "success": true,
  "data": {
    "metrics": [
      {
        "_id": "550e8400-e29b-41d4-a716-446655440000",
        "metricType": "blood_pressure",
        "systolicValue": 120,
        "diastolicValue": 80,
        "unit": "mmHg",
        "recordedAt": "2024-01-15T10:30:00.000Z",
        "status": "normal",
        "notes": "Normal reading after medication"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalRecords": 45,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### 1.3 Get Health Metrics Analytics

**Endpoint**: `GET /api/patient/health-metrics/analytics`
**Access**: Patient, Doctor, Admin
**Description**: Get analytics and trends for health metrics

##### Request
```http
GET /api/patient/health-metrics/analytics?metricType=weight&period=90d&includeComparisons=true HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

##### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| metricType | string | No | Specific metric type or 'all' |
| period | string | No | Analysis period: 30d, 90d, 6m, 1y |
| includeComparisons | boolean | No | Include comparisons with normal ranges |
| groupBy | string | No | Group by: day, week, month |

##### Response
```json
{
  "success": true,
  "data": {
    "analytics": {
      "weight": {
        "average": 72.5,
        "min": 70.2,
        "max": 74.8,
        "trend": "stable",
        "changePercentage": 2.1,
        "lastReading": {
          "value": 73.2,
          "date": "2024-01-15T10:30:00.000Z"
        },
        "normalRange": {
          "min": 65,
          "max": 80,
          "status": "within_range"
        }
      }
    },
    "trends": [
      {
        "date": "2024-01-01",
        "weight": 71.5
      },
      {
        "date": "2024-01-08",
        "weight": 72.1
      }
    ],
    "insights": [
      "Weight has remained stable over the past 90 days",
      "All readings are within normal range"
    ]
  }
}
```

#### 1.4 Update Health Metric

**Endpoint**: `PUT /api/patient/health-metrics/:metricId`
**Access**: Patient, Doctor, Admin
**Description**: Update an existing health metric

##### Request
```http
PUT /api/patient/health-metrics/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "value": 73.5,
  "notes": "Updated weight after morning exercise",
  "tags": ["morning", "post_exercise"]
}
```

##### Response
```json
{
  "success": true,
  "message": "Health metric updated successfully",
  "data": {
    "_id": "550e8400-e29b-41d4-a716-446655440000",
    "value": 73.5,
    "notes": "Updated weight after morning exercise",
    "tags": ["morning", "post_exercise"],
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

#### 1.5 Delete Health Metric

**Endpoint**: `DELETE /api/patient/health-metrics/:metricId`
**Access**: Patient, Doctor, Admin
**Description**: Delete a health metric

##### Request
```http
DELETE /api/patient/health-metrics/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

##### Response
```json
{
  "success": true,
  "message": "Health metric deleted successfully"
}
```

### 2. Medical Records Management

#### 2.1 Get Medical Records

**Endpoint**: `GET /api/patient/medical-records`
**Access**: Patient, Doctor, Admin
**Description**: Get patient's medical records

##### Request
```http
GET /api/patient/medical-records?recordType=consultation&limit=10&page=1 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

##### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| recordType | string | No | Filter by record type |
| doctorId | string | No | Filter by doctor |
| startDate | string | No | Start date filter |
| endDate | string | No | End date filter |
| limit | number | No | Records per page |
| page | number | No | Page number |

##### Response
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "_id": "550e8400-e29b-41d4-a716-446655440002",
        "recordType": "consultation",
        "recordDate": "2024-01-15T10:00:00.000Z",
        "doctorId": "550e8400-e29b-41d4-a716-446655440003",
        "doctorName": "Dr. Jane Smith",
        "diagnosis": [
          {
            "code": "Z00.00",
            "description": "General health checkup",
            "severity": "routine"
          }
        ],
        "symptoms": ["No specific symptoms"],
        "medications": [
          {
            "name": "Vitamin D3",
            "dosage": "1000 IU",
            "frequency": "daily",
            "duration": "30 days"
          }
        ],
        "notes": "Patient in good health, continue current lifestyle",
        "followUpRequired": false
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalRecords": 48
    }
  }
}
```

#### 2.2 Get Medical Record by ID

**Endpoint**: `GET /api/patient/medical-records/:recordId`
**Access**: Patient, Doctor, Admin
**Description**: Get detailed medical record by ID

##### Request
```http
GET /api/patient/medical-records/550e8400-e29b-41d4-a716-446655440002 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

##### Response
```json
{
  "success": true,
  "data": {
    "_id": "550e8400-e29b-41d4-a716-446655440002",
    "recordType": "consultation",
    "recordDate": "2024-01-15T10:00:00.000Z",
    "doctorId": "550e8400-e29b-41d4-a716-446655440003",
    "doctorName": "Dr. Jane Smith",
    "diagnosis": [
      {
        "code": "Z00.00",
        "description": "General health checkup",
        "severity": "routine"
      }
    ],
    "symptoms": ["No specific symptoms"],
    "medications": [
      {
        "name": "Vitamin D3",
        "dosage": "1000 IU",
        "frequency": "daily",
        "duration": "30 days",
        "instructions": "Take with food"
      }
    ],
    "labResults": [
      {
        "testName": "Complete Blood Count",
        "result": "Normal",
        "referenceRange": "Normal values",
        "date": "2024-01-14T09:00:00.000Z"
      }
    ],
    "vitalSigns": {
      "bloodPressure": "120/80",
      "heartRate": 72,
      "temperature": 98.6,
      "weight": 73.2
    },
    "notes": "Patient in good health, continue current lifestyle",
    "followUpRequired": false,
    "nextAppointment": "2024-04-15T10:00:00.000Z"
  }
}
```

### 3. Appointment Management

#### 3.1 Get Appointment History

**Endpoint**: `GET /api/patient/appointments/history`
**Access**: Patient, Doctor, Admin
**Description**: Get patient's appointment history

##### Request
```http
GET /api/patient/appointments/history?status=completed&limit=20&page=1 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

##### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status: scheduled, completed, cancelled |
| doctorId | string | No | Filter by doctor |
| startDate | string | No | Start date filter |
| endDate | string | No | End date filter |
| limit | number | No | Records per page |
| page | number | No | Page number |

##### Response
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "_id": "550e8400-e29b-41d4-a716-446655440004",
        "doctorId": "550e8400-e29b-41d4-a716-446655440003",
        "doctorName": "Dr. Jane Smith",
        "appointmentDate": "2024-01-15",
        "appointmentTime": "10:00",
        "type": "consultation",
        "reason": "Regular checkup",
        "status": "completed",
        "duration": 30,
        "notes": "Routine examination completed",
        "createdAt": "2024-01-10T09:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalRecords": 25
    },
    "summary": {
      "totalAppointments": 25,
      "completedAppointments": 22,
      "cancelledAppointments": 2,
      "upcomingAppointments": 1
    }
  }
}
```

#### 3.2 Cancel Appointment

**Endpoint**: `PUT /api/patient/appointments/:appointmentId/cancel`
**Access**: Patient, Doctor, Admin
**Description**: Cancel a scheduled appointment

##### Request
```http
PUT /api/patient/appointments/550e8400-e29b-41d4-a716-446655440004/cancel HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "reason": "Personal emergency",
  "notifyDoctor": true,
  "requestReschedule": false
}
```

##### Request Body Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | string | Yes | Cancellation reason |
| notifyDoctor | boolean | No | Send notification to doctor |
| requestReschedule | boolean | No | Request to reschedule |

##### Response
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "data": {
    "_id": "550e8400-e29b-41d4-a716-446655440004",
    "status": "cancelled",
    "cancellationReason": "Personal emergency",
    "cancelledAt": "2024-01-14T15:30:00.000Z",
    "cancelledBy": "patient",
    "refundEligible": true,
    "rescheduleOptions": [
      {
        "date": "2024-01-18",
        "time": "10:00"
      },
      {
        "date": "2024-01-19",
        "time": "14:00"
      }
    ]
  }
}
```

#### 3.3 Reschedule Appointment

**Endpoint**: `PUT /api/patient/appointments/:appointmentId/reschedule`
**Access**: Patient, Doctor, Admin
**Description**: Reschedule an existing appointment

##### Request
```http
PUT /api/patient/appointments/550e8400-e29b-41d4-a716-446655440004/reschedule HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "appointmentDate": "2024-01-20",
  "appointmentTime": "14:00",
  "reason": "Schedule conflict resolved",
  "notifyDoctor": true
}
```

##### Request Body Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| appointmentDate | string | Yes | New appointment date (YYYY-MM-DD) |
| appointmentTime | string | Yes | New appointment time (HH:MM) |
| reason | string | No | Reschedule reason |
| notifyDoctor | boolean | No | Send notification to doctor |

##### Response
```json
{
  "success": true,
  "message": "Appointment rescheduled successfully",
  "data": {
    "_id": "550e8400-e29b-41d4-a716-446655440004",
    "appointmentDate": "2024-01-20",
    "appointmentTime": "14:00",
    "status": "scheduled",
    "rescheduledAt": "2024-01-14T15:45:00.000Z",
    "rescheduledBy": "patient",
    "rescheduleReason": "Schedule conflict resolved",
    "previousDate": "2024-01-15",
    "previousTime": "10:00"
  }
}
```

#### 3.4 Get Available Doctors

**Endpoint**: `GET /api/patient/doctors/available`
**Access**: Patient, Doctor, Admin
**Description**: Get available doctors for appointment booking

##### Request
```http
GET /api/patient/doctors/available?specialization=General Medicine&date=2024-01-20&time=14:00 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

##### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| specialization | string | No | Doctor specialization |
| date | string | No | Preferred date (YYYY-MM-DD) |
| time | string | No | Preferred time (HH:MM) |
| consultationType | string | No | Type: in-person, video, phone |

##### Response
```json
{
  "success": true,
  "data": [
    {
      "_id": "550e8400-e29b-41d4-a716-446655440003",
      "firstName": "Dr. Jane",
      "lastName": "Smith",
      "specialization": "General Medicine",
      "consultationFee": 100,
      "rating": 4.8,
      "experience": 10,
      "availableSlots": [
        {
          "date": "2024-01-20",
          "slots": ["09:00", "10:00", "14:00", "15:00"]
        },
        {
          "date": "2024-01-21",
          "slots": ["09:00", "11:00", "16:00"]
        }
      ],
      "consultationTypes": ["in-person", "video"],
      "languages": ["English", "Spanish"]
    }
  ]
}
```

### 4. Document Management

#### 4.1 Upload Patient Document

**Endpoint**: `POST /api/patient/documents`
**Access**: Patient, Doctor, Admin
**Description**: Upload a new patient document

##### Request
```http
POST /api/patient/documents HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "documentType": "lab_result",
  "fileName": "blood_test_results.pdf",
  "fileUrl": "https://storage.example.com/documents/blood_test_results.pdf",
  "fileSize": 2048576,
  "mimeType": "application/pdf",
  "description": "Complete blood count results from January 2024",
  "tags": ["blood_test", "routine", "2024"],
  "metadata": {
    "dateOfDocument": "2024-01-14",
    "issuingOrganization": "City Medical Lab",
    "documentNumber": "LAB-2024-001234"
  },
  "accessLevel": "patient_doctor",
  "expiryDate": "2025-01-14"
}
```

##### Request Body Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| documentType | string | Yes | Type: lab_result, prescription, insurance, id_document, medical_image, report |
| fileName | string | Yes | Original file name |
| fileUrl | string | Yes | URL to the uploaded file |
| fileSize | number | Yes | File size in bytes |
| mimeType | string | Yes | MIME type of the file |
| description | string | No | Document description |
| tags | array | No | Tags for categorization |
| metadata | object | No | Additional metadata |
| accessLevel | string | No | Access level: patient_only, patient_doctor, public |
| expiryDate | string | No | Document expiry date |

##### Response
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "_id": "550e8400-e29b-41d4-a716-446655440005",
    "patientId": "550e8400-e29b-41d4-a716-446655440001",
    "documentType": "lab_result",
    "fileName": "blood_test_results.pdf",
    "fileUrl": "https://storage.example.com/documents/blood_test_results.pdf",
    "fileSize": 2048576,
    "mimeType": "application/pdf",
    "description": "Complete blood count results from January 2024",
    "tags": ["blood_test", "routine", "2024"],
    "uploadedAt": "2024-01-15T11:00:00.000Z",
    "uploadedBy": "550e8400-e29b-41d4-a716-446655440001",
    "version": 1,
    "isActive": true,
    "accessLevel": "patient_doctor"
  }
}
```

#### 4.2 Get Patient Documents

**Endpoint**: `GET /api/patient/documents`
**Access**: Patient, Doctor, Admin
**Description**: Get patient's documents with filtering options

##### Request
```http
GET /api/patient/documents?documentType=lab_result&limit=10&page=1 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

##### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| documentType | string | No | Filter by document type |
| tags | string | No | Filter by tags (comma-separated) |
| startDate | string | No | Start date filter |
| endDate | string | No | End date filter |
| limit | number | No | Documents per page |
| page | number | No | Page number |

##### Response
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "_id": "550e8400-e29b-41d4-a716-446655440005",
        "documentType": "lab_result",
        "fileName": "blood_test_results.pdf",
        "fileSize": 2048576,
        "description": "Complete blood count results from January 2024",
        "uploadedAt": "2024-01-15T11:00:00.000Z",
        "tags": ["blood_test", "routine", "2024"],
        "version": 1,
        "isActive": true,
        "downloadUrl": "https://api.example.com/patient/documents/550e8400-e29b-41d4-a716-446655440005/download"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalRecords": 15
    },
    "summary": {
      "totalDocuments": 15,
      "documentTypes": {
        "lab_result": 5,
        "prescription": 4,
        "insurance": 2,
        "medical_image": 3,
        "report": 1
      }
    }
  }
}
```

#### 4.3 Delete Patient Document

**Endpoint**: `DELETE /api/patient/documents/:documentId`
**Access**: Patient, Doctor, Admin
**Description**: Delete a patient document

##### Request
```http
DELETE /api/patient/documents/550e8400-e29b-41d4-a716-446655440005 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

##### Response
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

### 5. Communication Management

#### 5.1 Send Message to Doctor

**Endpoint**: `POST /api/patient/communications`
**Access**: Patient
**Description**: Send a message to a doctor

##### Request
```http
POST /api/patient/communications HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "recipientId": "550e8400-e29b-41d4-a716-446655440003",
  "subject": "Question about medication side effects",
  "message": "I've been experiencing mild dizziness since starting the new medication. Is this normal?",
  "priority": "medium",
  "type": "message",
  "relatedTo": {
    "entityType": "appointment",
    "entityId": "550e8400-e29b-41d4-a716-446655440004"
  },
  "attachments": [
    {
      "fileName": "symptom_log.pdf",
      "fileUrl": "https://storage.example.com/attachments/symptom_log.pdf",
      "fileSize": 512000
    }
  ]
}
```

##### Request Body Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| recipientId | string | Yes | Doctor's user ID |
| subject | string | Yes | Message subject |
| message | string | Yes | Message content |
| priority | string | No | Priority: low, medium, high, urgent |
| type | string | No | Type: message, question, concern, feedback |
| relatedTo | object | No | Related entity (appointment, record, etc.) |
| attachments | array | No | File attachments |

##### Response
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "550e8400-e29b-41d4-a716-446655440006",
    "senderId": "550e8400-e29b-41d4-a716-446655440001",
    "recipientId": "550e8400-e29b-41d4-a716-446655440003",
    "subject": "Question about medication side effects",
    "message": "I've been experiencing mild dizziness since starting the new medication. Is this normal?",
    "priority": "medium",
    "type": "message",
    "sentAt": "2024-01-15T12:00:00.000Z",
    "status": "sent",
    "threadId": "550e8400-e29b-41d4-a716-446655440007",
    "relatedTo": {
      "entityType": "appointment",
      "entityId": "550e8400-e29b-41d4-a716-446655440004"
    }
  }
}
```

#### 5.2 Get Patient Communications

**Endpoint**: `GET /api/patient/communications`
**Access**: Patient, Doctor, Admin
**Description**: Get patient's communications

##### Request
```http
GET /api/patient/communications?type=message&status=unread&limit=20 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

##### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | string | No | Filter by type |
| status | string | No | Filter by status: sent, delivered, read, unread |
| priority | string | No | Filter by priority |
| threadId | string | No | Filter by thread |
| limit | number | No | Messages per page |
| page | number | No | Page number |

##### Response
```json
{
  "success": true,
  "data": {
    "communications": [
      {
        "_id": "550e8400-e29b-41d4-a716-446655440006",
        "senderId": "550e8400-e29b-41d4-a716-446655440001",
        "recipientId": "550e8400-e29b-41d4-a716-446655440003",
        "senderName": "John Doe",
        "recipientName": "Dr. Jane Smith",
        "subject": "Question about medication side effects",
        "message": "I've been experiencing mild dizziness...",
        "priority": "medium",
        "type": "message",
        "sentAt": "2024-01-15T12:00:00.000Z",
        "status": "read",
        "threadId": "550e8400-e29b-41d4-a716-446655440007",
        "hasAttachments": true,
        "responseCount": 1
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalRecords": 28
    },
    "summary": {
      "totalMessages": 28,
      "unreadMessages": 3,
      "urgentMessages": 1
    }
  }
}
```

### 6. Patient Summary

#### 6.1 Get Patient Summary

**Endpoint**: `GET /api/patient/summary`
**Access**: Patient, Doctor, Admin
**Description**: Get comprehensive patient summary

##### Request
```http
GET /api/patient/summary?includeMetrics=true&includeRecords=true&period=90d HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

##### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| includeMetrics | boolean | No | Include health metrics summary |
| includeRecords | boolean | No | Include recent medical records |
| includeAppointments | boolean | No | Include appointment history |
| period | string | No | Data period: 30d, 90d, 6m, 1y |

##### Response
```json
{
  "success": true,
  "data": {
    "patient": {
      "_id": "550e8400-e29b-41d4-a716-446655440001",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-01",
      "age": 34,
      "gender": "male",
      "contactInfo": {
        "phoneMain": "+1234567890",
        "email": "john.doe@example.com"
      },
      "primaryDoctorId": "550e8400-e29b-41d4-a716-446655440003",
      "primaryDoctorName": "Dr. Jane Smith"
    },
    "statistics": {
      "totalAppointments": 25,
      "completedAppointments": 22,
      "totalHealthMetrics": 156,
      "totalDocuments": 15,
      "totalCommunications": 28,
      "lastVisit": "2024-01-15T10:00:00.000Z"
    },
    "recentActivity": [
      {
        "type": "appointment",
        "description": "Completed consultation with Dr. Jane Smith",
        "date": "2024-01-15T10:00:00.000Z"
      },
      {
        "type": "health_metric",
        "description": "Added blood pressure reading: 120/80",
        "date": "2024-01-15T08:30:00.000Z"
      }
    ],
    "healthMetricsSummary": {
      "weight": {
        "current": 73.2,
        "trend": "stable",
        "lastUpdated": "2024-01-15T08:30:00.000Z"
      },
      "bloodPressure": {
        "current": "120/80",
        "status": "normal",
        "lastUpdated": "2024-01-15T08:30:00.000Z"
      }
    },
    "upcomingAppointments": [
      {
        "_id": "550e8400-e29b-41d4-a716-446655440008",
        "doctorName": "Dr. Jane Smith",
        "appointmentDate": "2024-01-22",
        "appointmentTime": "10:00",
        "type": "follow-up"
      }
    ],
    "alerts": [
      {
        "type": "medication_reminder",
        "message": "Time to take your daily vitamin D3",
        "priority": "low"
      }
    ]
  }
}
```

## Error Responses

### Common Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate data)
- `413` - Payload Too Large (file upload limit exceeded)
- `422` - Unprocessable Entity (business logic errors)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "metricType",
        "message": "Invalid metric type provided"
      }
    ]
  }
}
```

## Rate Limiting
- **General endpoints**: 100 requests per 15 minutes
- **File uploads**: 10 uploads per hour
- **Communications**: 50 messages per hour
- **Analytics**: 20 requests per hour
```
```