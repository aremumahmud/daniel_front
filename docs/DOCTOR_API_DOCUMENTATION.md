# 🏥 Doctor Dashboard API Documentation

## 📋 Overview

Complete API documentation with exact request and response objects for all Doctor Dashboard endpoints.

**Base URL:** `http://localhost:5000/api`  
**Authentication:** Bearer Token (Doctor Role Required)  
**Content-Type:** `application/json`

---

## 🔐 Authentication

All endpoints require:
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 1. Doctor Profile Management

### GET /doctor/me
Get authenticated doctor's complete profile.

**Request:**
```http
GET /api/doctor/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "doctor": {
      "_id": "doctor_123",
      "userId": {
        "_id": "user_123",
        "email": "dr.smith@hospital.com",
        "firstName": "John",
        "lastName": "Smith",
        "fullName": "Dr. John Smith",
        "phone": "+1234567890",
        "avatarUrl": "https://example.com/avatar.jpg",
        "role": "doctor",
        "emailVerified": true,
        "isActive": true,
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      },
      "specialization": "Cardiology",
      "licenseNumber": "MD123456",
      "experience": 10,
      "education": [
        {
          "degree": "MD",
          "institution": "Harvard Medical School",
          "year": 2014
        }
      ],
      "certifications": [
        "Board Certified Cardiologist",
        "Advanced Cardiac Life Support"
      ],
      "workingHours": {
        "monday": { "start": "09:00", "end": "17:00" },
        "tuesday": { "start": "09:00", "end": "17:00" },
        "wednesday": { "start": "09:00", "end": "17:00" },
        "thursday": { "start": "09:00", "end": "17:00" },
        "friday": { "start": "09:00", "end": "17:00" },
        "saturday": { "start": "09:00", "end": "13:00" },
        "sunday": { "isOff": true }
      },
      "consultationFee": 150,
      "rating": 4.8,
      "totalReviews": 127,
      "isAvailable": true,
      "joinedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

### PUT /doctor/me
Update doctor profile.

**Request:**
```http
PUT /api/doctor/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "specialization": "Interventional Cardiology",
  "consultationFee": 175,
  "workingHours": {
    "monday": { "start": "08:00", "end": "18:00" }
  },
  "isAvailable": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Doctor profile updated successfully",
  "data": {
    "doctor": {
      "_id": "doctor_123",
      "userId": { /* same as GET response */ },
      "specialization": "Interventional Cardiology",
      "consultationFee": 175,
      "workingHours": {
        "monday": { "start": "08:00", "end": "18:00" },
        /* other days unchanged */
      },
      "isAvailable": false,
      /* other fields unchanged */
    }
  }
}
```

---

## 2. Dashboard

### GET /doctor/dashboard
Get comprehensive dashboard data.

**Request:**
```http
GET /api/doctor/dashboard
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "todaysAppointments": [
      {
        "_id": "apt_123",
        "patient": {
          "_id": "patient_123",
          "userId": {
            "firstName": "John",
            "lastName": "Doe",
            "fullName": "John Doe",
            "avatarUrl": "https://example.com/avatar.jpg"
          },
          "age": 35,
          "gender": "male"
        },
        "appointmentDate": "2024-01-15",
        "appointmentTime": "10:30",
        "duration": 30,
        "type": "consultation",
        "status": "confirmed",
        "reason": "Regular checkup",
        "priority": "medium",
        "isVirtual": false,
        "virtualMeetingLink": null
      }
    ],
    "pendingAppointments": [
      {
        "_id": "apt_124",
        "patient": {
          "_id": "patient_124",
          "userId": {
            "firstName": "Jane",
            "lastName": "Smith",
            "fullName": "Jane Smith",
            "avatarUrl": null
          },
          "age": 28,
          "gender": "female"
        },
        "appointmentDate": "2024-01-16",
        "appointmentTime": "14:00",
        "duration": 30,
        "type": "follow-up",
        "status": "scheduled",
        "reason": "Follow-up on blood test results",
        "priority": "high",
        "isVirtual": true,
        "virtualMeetingLink": "https://meet.example.com/abc123"
      }
    ],
    "recentPatients": [
      {
        "_id": "patient_125",
        "userId": {
          "firstName": "Bob",
          "lastName": "Johnson",
          "fullName": "Bob Johnson",
          "avatarUrl": null,
          "lastLogin": "2024-01-14T10:00:00.000Z"
        },
        "age": 42,
        "gender": "male",
        "lastVisit": "2024-01-10T14:30:00.000Z"
      }
    ],
    "notifications": [
      {
        "_id": "notif_123",
        "title": "New appointment request",
        "message": "Patient John Doe requested an appointment for tomorrow",
        "type": "appointment",
        "priority": "medium",
        "isRead": false,
        "actionUrl": "/doctor/appointments/apt_123",
        "createdAt": "2024-01-15T09:00:00.000Z"
      }
    ],
    "statistics": {
      "totalPatients": 150,
      "todaysAppointments": 8,
      "pendingAppointments": 3,
      "confirmedToday": 5,
      "pendingToday": 3,
      "completedToday": 2,
      "pendingReports": 12,
      "averageRating": 4.8,
      "totalRevenue": 15000,
      "monthlyRevenue": 3500
    }
  }
}
```

---

## 3. Patient Management

### GET /doctor/patients
Get all patients (for appointment creation).

**Request:**
```http
GET /api/doctor/patients?search=john&page=1&limit=20&status=active&sortBy=name&sortOrder=asc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `search` (optional): Search by name, email, or phone
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): active, inactive, all (default: active)
- `sortBy` (optional): name, age, lastVisit, createdAt
- `sortOrder` (optional): asc, desc

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "_id": "patient_123",
        "userId": {
          "_id": "user_456",
          "email": "john.doe@email.com",
          "firstName": "John",
          "lastName": "Doe",
          "fullName": "John Doe",
          "phone": "+1234567890",
          "avatarUrl": "https://example.com/avatar.jpg"
        },
        "dateOfBirth": "1989-05-15T00:00:00.000Z",
        "age": 35,
        "gender": "male",
        "bloodType": "O+",
        "address": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001",
          "country": "USA"
        },
        "emergencyContact": {
          "name": "Jane Doe",
          "phone": "+1234567891",
          "relationship": "spouse"
        },
        "insurance": {
          "provider": "Blue Cross Blue Shield",
          "policyNumber": "BC123456789",
          "groupNumber": "GRP001"
        },
        "allergies": ["Penicillin", "Peanuts"],
        "chronicConditions": ["Hypertension"],
        "lastVisit": "2024-01-10T14:30:00.000Z",
        "isActive": true,
        "createdAt": "2023-06-15T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 8,
      "totalItems": 150,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### GET /doctor/my-patients
Get patients who have had appointments with this doctor.

**Request:**
```http
GET /api/doctor/my-patients?search=&page=1&limit=20&sortBy=lastVisit&sortOrder=desc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "_id": "patient_123",
        "userId": {
          "_id": "user_456",
          "email": "john.doe@email.com",
          "firstName": "John",
          "lastName": "Doe",
          "fullName": "John Doe",
          "phone": "+1234567890",
          "avatarUrl": "https://example.com/avatar.jpg",
          "lastLogin": "2024-01-14T08:30:00.000Z"
        },
        "dateOfBirth": "1989-05-15T00:00:00.000Z",
        "age": 35,
        "gender": "male",
        "bloodType": "O+",
        "address": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001",
          "country": "USA"
        },
        "emergencyContact": {
          "name": "Jane Doe",
          "phone": "+1234567891",
          "relationship": "spouse"
        },
        "insurance": {
          "provider": "Blue Cross Blue Shield",
          "policyNumber": "BC123456789",
          "groupNumber": "GRP001"
        },
        "allergies": ["Penicillin", "Peanuts"],
        "chronicConditions": ["Hypertension"],
        "lastVisit": "2024-01-10T14:30:00.000Z",
        "isActive": true,
        "createdAt": "2023-06-15T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 85,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### GET /doctor/patients/{patientId}
Get detailed information about a specific patient.

**Request:**
```http
GET /api/doctor/patients/patient_123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "patient": {
      "_id": "patient_123",
      "userId": {
        "_id": "user_456",
        "email": "john.doe@email.com",
        "firstName": "John",
        "lastName": "Doe",
        "fullName": "John Doe",
        "phone": "+1234567890",
        "avatarUrl": "https://example.com/avatar.jpg"
      },
      "dateOfBirth": "1989-05-15T00:00:00.000Z",
      "age": 35,
      "gender": "male",
      "bloodType": "O+",
      "medicalHistory": [
        {
          "condition": "Hypertension",
          "diagnosedDate": "2020-03-15T00:00:00.000Z",
          "status": "ongoing",
          "notes": "Well controlled with medication"
        }
      ],
      "medications": [
        {
          "name": "Lisinopril",
          "dosage": "10mg",
          "frequency": "Once daily",
          "startDate": "2020-03-15T00:00:00.000Z",
          "prescribedBy": "Dr. Smith"
        }
      ],
      "recentAppointments": [
        {
          "_id": "apt_789",
          "appointmentDate": "2024-01-10T00:00:00.000Z",
          "appointmentTime": "14:30",
          "type": "consultation",
          "status": "completed",
          "reason": "Regular checkup"
        }
      ],
      "vitalSigns": {
        "lastRecorded": "2024-01-10T14:30:00.000Z",
        "bloodPressure": { "systolic": 120, "diastolic": 80 },
        "heartRate": 72,
        "temperature": 98.6,
        "weight": 180,
        "height": 72
      }
    }
  }
}
```

---

## 4. Appointment Management

### GET /doctor/appointments
Get doctor's appointments with filtering.

**Request:**
```http
GET /api/doctor/appointments?date=2024-01-15&status=confirmed&page=1&limit=20&sortBy=date&sortOrder=asc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `date` (optional): Specific date (YYYY-MM-DD)
- `dateFrom` (optional): Start date for range
- `dateTo` (optional): End date for range
- `status` (optional): scheduled, confirmed, completed, cancelled, pending
- `type` (optional): consultation, follow-up, check-up, emergency
- `patientId` (optional): Filter by specific patient
- `page`, `limit`: Pagination
- `sortBy` (optional): date, time, status, patient
- `sortOrder` (optional): asc, desc

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "_id": "apt_123",
        "patient": {
          "_id": "patient_123",
          "userId": {
            "firstName": "John",
            "lastName": "Doe",
            "fullName": "John Doe",
            "phone": "+1234567890",
            "avatarUrl": "https://example.com/avatar.jpg"
          },
          "age": 35,
          "gender": "male"
        },
        "doctor": {
          "_id": "doctor_123",
          "userId": {
            "firstName": "John",
            "lastName": "Smith",
            "fullName": "Dr. John Smith"
          },
          "specialization": "Cardiology"
        },
        "appointmentDate": "2024-01-15",
        "appointmentTime": "10:30",
        "duration": 30,
        "type": "consultation",
        "status": "confirmed",
        "reason": "Regular checkup",
        "notes": "Patient reports feeling well",
        "priority": "medium",
        "isVirtual": false,
        "virtualMeetingLink": null,
        "createdAt": "2024-01-10T09:00:00.000Z",
        "updatedAt": "2024-01-12T14:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 95,
      "itemsPerPage": 20
    }
  }
}
```

### POST /doctor/appointments
Create a new appointment.

**Request:**
```http
POST /api/doctor/appointments
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "patientId": "patient_123",
  "appointmentDate": "2024-01-20",
  "appointmentTime": "14:00",
  "duration": 30,
  "type": "consultation",
  "reason": "Follow-up on blood test results",
  "priority": "medium",
  "isVirtual": false,
  "notes": "Patient requested afternoon slot"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "appointment": {
      "_id": "apt_124",
      "patient": {
        "_id": "patient_123",
        "userId": {
          "firstName": "John",
          "lastName": "Doe",
          "fullName": "John Doe",
          "avatarUrl": "https://example.com/avatar.jpg"
        },
        "age": 35,
        "gender": "male"
      },
      "doctor": {
        "_id": "doctor_123",
        "userId": {
          "firstName": "John",
          "lastName": "Smith",
          "fullName": "Dr. John Smith"
        },
        "specialization": "Cardiology"
      },
      "appointmentDate": "2024-01-20",
      "appointmentTime": "14:00",
      "duration": 30,
      "type": "consultation",
      "status": "scheduled",
      "reason": "Follow-up on blood test results",
      "priority": "medium",
      "isVirtual": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### PUT /doctor/appointments/{appointmentId}
Update appointment details.

**Request:**
```http
PUT /api/doctor/appointments/apt_124
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "confirmed",
  "appointmentTime": "15:00",
  "notes": "Confirmed via phone call - moved to 3 PM",
  "priority": "high"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Appointment updated successfully",
  "data": {
    "appointment": {
      "_id": "apt_124",
      "patient": {
        "_id": "patient_123",
        "userId": {
          "firstName": "John",
          "lastName": "Doe",
          "fullName": "John Doe",
          "avatarUrl": "https://example.com/avatar.jpg"
        },
        "age": 35,
        "gender": "male"
      },
      "appointmentDate": "2024-01-20",
      "appointmentTime": "15:00",
      "duration": 30,
      "type": "consultation",
      "status": "confirmed",
      "reason": "Follow-up on blood test results",
      "notes": "Confirmed via phone call - moved to 3 PM",
      "priority": "high",
      "isVirtual": false,
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

### DELETE /doctor/appointments/{appointmentId}
Cancel an appointment.

**Request:**
```http
DELETE /api/doctor/appointments/apt_124
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "reason": "Doctor unavailable due to emergency",
  "notifyPatient": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully"
}
```

### GET /doctor/appointments/available-slots
Get available time slots for appointment booking.

**Request:**
```http
GET /api/doctor/appointments/available-slots?date=2024-01-20&duration=30
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `date` (required): Date to check (YYYY-MM-DD)
- `duration` (optional): Appointment duration in minutes (default: 30)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-20",
    "availableSlots": [
      {
        "time": "09:00",
        "available": true
      },
      {
        "time": "09:30",
        "available": true
      },
      {
        "time": "10:00",
        "available": false,
        "reason": "Already booked"
      },
      {
        "time": "10:30",
        "available": true
      },
      {
        "time": "12:00",
        "available": false,
        "reason": "Break time"
      }
    ],
    "workingHours": {
      "start": "09:00",
      "end": "17:00",
      "breakTime": {
        "start": "12:00",
        "end": "13:00"
      }
    }
  }
}
```

---

## 5. Notification Management

### GET /doctor/notifications
Get doctor's notifications with filtering.

**Request:**
```http
GET /api/doctor/notifications?unread=true&type=appointment&priority=high&limit=20&page=1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `unread` (optional): true/false - filter by read status
- `type` (optional): appointment, patient, system, reminder
- `priority` (optional): low, medium, high, urgent
- `limit` (optional): Items per page (default: 20)
- `page` (optional): Page number (default: 1)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "notif_123",
        "title": "New appointment request",
        "message": "Patient John Doe requested an appointment for tomorrow at 2:00 PM",
        "type": "appointment",
        "priority": "medium",
        "isRead": false,
        "actionUrl": "/doctor/appointments/apt_125",
        "actionText": "View Appointment",
        "relatedId": "apt_125",
        "relatedType": "appointment",
        "createdAt": "2024-01-15T09:00:00.000Z"
      },
      {
        "_id": "notif_124",
        "title": "Lab results available",
        "message": "Blood test results for Jane Smith are now available for review",
        "type": "patient",
        "priority": "high",
        "isRead": false,
        "actionUrl": "/doctor/patients/patient_124/lab-results",
        "actionText": "View Results",
        "relatedId": "patient_124",
        "relatedType": "patient",
        "createdAt": "2024-01-15T08:30:00.000Z"
      }
    ],
    "unreadCount": 5,
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 45
    }
  }
}
```

### PUT /doctor/notifications/{notificationId}/read
Mark a specific notification as read.

**Request:**
```http
PUT /api/doctor/notifications/notif_123/read
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### PUT /doctor/notifications/mark-all-read
Mark all notifications as read.

**Request:**
```http
PUT /api/doctor/notifications/mark-all-read
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

### DELETE /doctor/notifications/{notificationId}
Delete a specific notification.

**Request:**
```http
DELETE /api/doctor/notifications/notif_123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

## 6. Medical Records Management

### GET /doctor/medical-records
Get medical records with filtering.

**Request:**
```http
GET /api/doctor/medical-records?patientId=patient_123&recordType=consultation&dateFrom=2024-01-01&dateTo=2024-01-31&page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `patientId` (optional): Filter by specific patient
- `recordType` (optional): consultation, follow-up, procedure, lab-review
- `dateFrom` (optional): Start date for range (YYYY-MM-DD)
- `dateTo` (optional): End date for range (YYYY-MM-DD)
- `page`, `limit`: Pagination

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "_id": "record_123",
        "patient": {
          "_id": "patient_123",
          "userId": {
            "fullName": "John Doe"
          },
          "age": 35
        },
        "doctor": {
          "_id": "doctor_123",
          "userId": {
            "fullName": "Dr. John Smith"
          }
        },
        "appointment": {
          "_id": "apt_123",
          "appointmentDate": "2024-01-15",
          "appointmentTime": "10:30"
        },
        "recordType": "consultation",
        "visitDate": "2024-01-15",
        "chiefComplaint": "Persistent headache for 3 days",
        "presentIllness": "Patient reports severe headache starting 3 days ago, worsening in the morning",
        "physicalExamination": "Neurological exam normal, no focal deficits observed",
        "diagnosis": [
          {
            "primary": true,
            "code": "G44.1",
            "description": "Vascular headache, not elsewhere classified"
          }
        ],
        "treatment": "Prescribed pain medication and advised rest",
        "medications": [
          {
            "name": "Sumatriptan",
            "dosage": "50mg",
            "frequency": "As needed",
            "duration": "7 days",
            "instructions": "Take at onset of headache, maximum 2 doses per day"
          }
        ],
        "vitalSigns": {
          "bloodPressure": { "systolic": 120, "diastolic": 80 },
          "heartRate": 72,
          "temperature": 98.6,
          "weight": 180,
          "height": 72
        },
        "labResults": [
          {
            "test": "Complete Blood Count",
            "result": "Normal",
            "date": "2024-01-14"
          }
        ],
        "followUpInstructions": "Return if symptoms worsen or persist beyond 1 week",
        "nextAppointment": "2024-01-22",
        "notes": "Patient advised to maintain headache diary",
        "createdAt": "2024-01-15T11:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 8,
      "totalItems": 156
    }
  }
}
```

### POST /doctor/medical-records
Create a new medical record.

**Request:**
```http
POST /api/doctor/medical-records
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "patientId": "patient_123",
  "appointmentId": "apt_123",
  "recordType": "consultation",
  "chiefComplaint": "Persistent headache for 3 days",
  "presentIllness": "Patient reports severe headache starting 3 days ago, worsening in the morning",
  "physicalExamination": "Neurological exam normal, no focal deficits observed",
  "diagnosis": [
    {
      "primary": true,
      "code": "G44.1",
      "description": "Vascular headache, not elsewhere classified"
    }
  ],
  "treatmentPlan": "Prescribed pain medication and advised rest",
  "medicationsPrescribed": [
    {
      "name": "Sumatriptan",
      "dosage": "50mg",
      "frequency": "As needed",
      "duration": "7 days",
      "instructions": "Take at onset of headache, maximum 2 doses per day"
    }
  ],
  "vitalSigns": {
    "bloodPressure": { "systolic": 120, "diastolic": 80 },
    "heartRate": 72,
    "temperature": 98.6,
    "weight": 180,
    "height": 72
  },
  "followUp": {
    "instructions": "Return if symptoms worsen or persist beyond 1 week",
    "scheduledDate": "2024-01-22"
  },
  "doctorNotes": {
    "additionalNotes": "Patient advised to maintain headache diary"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Medical record created successfully",
  "data": {
    "record": {
      "_id": "record_124",
      "patientId": "patient_123",
      "doctorId": "doctor_123",
      "appointmentId": "apt_123",
      "recordType": "consultation",
      "recordDate": "2024-01-15T11:00:00.000Z",
      "chiefComplaint": "Persistent headache for 3 days",
      "diagnosis": [
        {
          "primary": true,
          "code": "G44.1",
          "description": "Vascular headache, not elsewhere classified"
        }
      ],
      "treatmentPlan": "Prescribed pain medication and advised rest",
      "medicationsPrescribed": [
        {
          "name": "Sumatriptan",
          "dosage": "50mg",
          "frequency": "As needed",
          "duration": "7 days",
          "instructions": "Take at onset of headache, maximum 2 doses per day"
        }
      ],
      "vitalSigns": {
        "bloodPressure": { "systolic": 120, "diastolic": 80 },
        "heartRate": 72,
        "temperature": 98.6,
        "weight": 180,
        "height": 72
      },
      "followUp": {
        "instructions": "Return if symptoms worsen or persist beyond 1 week",
        "scheduledDate": "2024-01-22T00:00:00.000Z"
      },
      "doctorNotes": {
        "additionalNotes": "Patient advised to maintain headache diary"
      },
      "createdAt": "2024-01-15T11:00:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

### PUT /doctor/medical-records/{recordId}
Update an existing medical record.

**Request:**
```http
PUT /api/doctor/medical-records/record_124
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "diagnosis": [
    {
      "primary": true,
      "code": "G44.2",
      "description": "Tension-type headache"
    }
  ],
  "treatmentPlan": "Updated treatment plan with physical therapy",
  "doctorNotes": {
    "additionalNotes": "Updated diagnosis after further evaluation. Recommended physical therapy."
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Medical record updated successfully",
  "data": {
    "record": {
      "_id": "record_124",
      "patientId": "patient_123",
      "doctorId": "doctor_123",
      "diagnosis": [
        {
          "primary": true,
          "code": "G44.2",
          "description": "Tension-type headache"
        }
      ],
      "treatmentPlan": "Updated treatment plan with physical therapy",
      "doctorNotes": {
        "additionalNotes": "Updated diagnosis after further evaluation. Recommended physical therapy."
      },
      "updatedAt": "2024-01-15T15:30:00.000Z"
    }
  }
}
```

### GET /doctor/patients/{patientId}/medical-history
Get comprehensive medical history for a specific patient.

**Request:**
```http
GET /api/doctor/patients/patient_123/medical-history
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "patient": {
      "_id": "patient_123",
      "userId": {
        "fullName": "John Doe"
      }
    },
    "medicalHistory": {
      "allergies": [
        "Penicillin",
        "Peanuts"
      ],
      "chronicConditions": [
        {
          "condition": "Hypertension",
          "diagnosedDate": "2020-03-15T00:00:00.000Z",
          "status": "ongoing"
        }
      ],
      "surgicalHistory": [
        {
          "procedure": "Appendectomy",
          "date": "2015-08-20T00:00:00.000Z",
          "hospital": "General Hospital"
        }
      ],
      "familyHistory": [
        {
          "relation": "father",
          "condition": "Heart Disease",
          "ageOfOnset": 55
        }
      ],
      "socialHistory": {
        "smoking": "never",
        "alcohol": "occasional",
        "exercise": "regular"
      },
      "currentMedications": [
        {
          "name": "Lisinopril",
          "dosage": "10mg",
          "frequency": "Once daily",
          "startDate": "2020-03-15T00:00:00.000Z"
        }
      ],
      "recentRecords": [
        {
          "_id": "record_123",
          "recordDate": "2024-01-15T00:00:00.000Z",
          "recordType": "consultation",
          "doctor": {
            "name": "Dr. John Smith",
            "specialization": "Cardiology"
          },
          "chiefComplaint": "Persistent headache for 3 days",
          "diagnosis": [
            {
              "primary": true,
              "code": "G44.1",
              "description": "Vascular headache"
            }
          ]
        }
      ]
    }
  }
}
```

---

## 7. Analytics

### GET /doctor/analytics
Get comprehensive analytics and performance metrics.

**Request:**
```http
GET /api/doctor/analytics?period=monthly&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `period` (optional): daily, weekly, monthly, yearly, custom (default: monthly)
- `startDate` (optional): Start date for custom period (YYYY-MM-DD)
- `endDate` (optional): End date for custom period (YYYY-MM-DD)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "appointmentStats": {
      "total": 85,
      "completed": 72,
      "cancelled": 8,
      "noShow": 5,
      "completionRate": "84.7",
      "averagePerDay": "2.7",
      "peakDay": "Monday",
      "peakTime": "10:00-11:00"
    },
    "patientStats": {
      "totalPatients": 150,
      "newPatients": 12,
      "returningPatients": 138,
      "averageAge": 42,
      "genderDistribution": {
        "male": 45,
        "female": 55
      }
    },
    "revenueStats": {
      "totalRevenue": 12750,
      "averagePerAppointment": 150,
      "monthlyGrowth": 8.5,
      "topServices": [
        {
          "service": "Consultation",
          "count": 72,
          "revenue": 10800
        },
        {
          "service": "Follow-up",
          "count": 13,
          "revenue": 1950
        }
      ]
    },
    "ratingStats": {
      "averageRating": 4.8,
      "totalReviews": 127,
      "ratingDistribution": {
        "5": 89,
        "4": 25,
        "3": 9,
        "2": 3,
        "1": 1
      },
      "recentReviews": [
        {
          "rating": 5,
          "comment": "Excellent doctor, very thorough",
          "patientName": "Anonymous",
          "date": "2024-01-28"
        }
      ]
    },
    "performanceMetrics": {
      "averageConsultationTime": 28,
      "onTimePercentage": 92,
      "patientSatisfaction": 4.8,
      "followUpCompliance": 85
    }
  }
}
```

---

## 8. Error Responses

### Common Error Formats

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "appointmentDate",
      "message": "Valid appointment date is required"
    },
    {
      "field": "patientId",
      "message": "Valid patient ID is required"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Access denied. Doctor privileges required."
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**409 Conflict:**
```json
{
  "success": false,
  "message": "Time slot is already booked",
  "details": {
    "conflictingAppointment": {
      "id": "apt_123",
      "time": "14:00",
      "patient": "John Doe"
    }
  }
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 9. Rate Limiting

All endpoints are subject to rate limiting:
- **Limit**: 100 requests per 15 minutes per IP address
- **Headers**: Rate limit information is included in response headers

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642694400
```

**Rate Limit Exceeded (429):**
```json
{
  "success": false,
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 900
}
```

---

## 10. Data Types & Enums

### Appointment Status
- `scheduled` - Initial state when created
- `confirmed` - Confirmed by patient/doctor
- `pending` - Awaiting confirmation
- `cancelled` - Cancelled by doctor/patient
- `completed` - Appointment finished
- `no-show` - Patient didn't show up
- `urgent` - Urgent appointment
- `rescheduled` - Moved to different time

### Appointment Types
- `consultation` - Regular consultation
- `follow-up` - Follow-up visit
- `check-up` - Routine check-up
- `emergency` - Emergency appointment
- `procedure` - Medical procedure
- `therapy` - Therapy session
- `lab-review` - Lab results review

### Priority Levels
- `low` - Low priority
- `medium` - Medium priority (default)
- `high` - High priority
- `urgent` - Urgent priority

### Notification Types
- `appointment` - Appointment related
- `patient` - Patient related
- `system` - System notifications
- `reminder` - Reminders

### Record Types
- `consultation` - Consultation record
- `follow-up` - Follow-up record
- `procedure` - Procedure record
- `lab-review` - Lab review record

---

*Last Updated: 2025-06-20*
*Doctor Dashboard API Documentation v1.0.0*
```
```
```
