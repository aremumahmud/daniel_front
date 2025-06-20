# Doctor Dashboard API Documentation

## Overview
Complete API specification for the Doctor Dashboard functionality. All endpoints require authentication with a valid JWT token for a user with `doctor` role.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints require:
- **Bearer Token**: Include `Authorization: Bearer <token>` in headers
- **Doctor Role**: Token must belong to a user with role `doctor`

---

## 1. Doctor Profile APIs

### ✅ Get Doctor Profile
```http
GET /api/doctor/me
```

**Description:** Get the authenticated doctor's complete profile information.

**Response:**
```json
{
  "success": true,
  "data": {
    "doctor": {
      "_id": "doctor123",
      "userId": {
        "_id": "user123",
        "email": "dr.smith@hospital.com",
        "firstName": "John",
        "lastName": "Smith",
        "fullName": "Dr. John Smith",
        "phone": "+1234567890",
        "avatarUrl": "https://example.com/avatar.jpg",
        "role": "doctor",
        "emailVerified": true,
        "isActive": true,
        "createdAt": "2023-01-01T00:00:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
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
      "joinedAt": "2023-01-01T00:00:00Z"
    }
  }
}
```

### ✅ Update Doctor Profile
```http
PUT /api/doctor/me
```

**Request Body:**
```json
{
  "specialization": "Interventional Cardiology",
  "consultationFee": 175,
  "workingHours": {
    "monday": { "start": "08:00", "end": "18:00" }
  },
  "isAvailable": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Doctor profile updated successfully",
  "data": {
    "doctor": {
      // Updated doctor object
    }
  }
}
```

---

## 2. Dashboard Overview API

### ✅ Get Dashboard Data
```http
GET /api/doctor/dashboard
```

**Description:** Get comprehensive dashboard data including appointments, patients, notifications, and statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "todaysAppointments": [
      {
        "_id": "apt123",
        "patient": {
          "_id": "patient123",
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
      // Similar structure to todaysAppointments but with status: "pending"
    ],
    "recentPatients": [
      {
        "_id": "patient123",
        "userId": {
          "firstName": "John",
          "lastName": "Doe",
          "fullName": "John Doe",
          "avatarUrl": "https://example.com/avatar.jpg",
          "lastLogin": "2024-01-14T10:00:00Z"
        },
        "age": 35,
        "gender": "male",
        "lastVisit": "2024-01-10T14:30:00Z"
      }
    ],
    "notifications": [
      {
        "_id": "notif123",
        "title": "New appointment request",
        "message": "Patient John Doe requested an appointment for tomorrow",
        "type": "appointment",
        "priority": "medium",
        "isRead": false,
        "actionUrl": "/doctor/appointments/apt123",
        "createdAt": "2024-01-15T09:00:00Z"
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

## 3. Patient Management APIs

### ✅ Get All Patients
```http
GET /api/doctor/patients
```

**Description:** Get list of all patients in the system (for appointment creation and patient selection).

**Query Parameters:**
- `search` (optional): Search by name, email, or phone
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): active, inactive, all (default: active)
- `sortBy` (optional): name, age, lastVisit, createdAt
- `sortOrder` (optional): asc, desc

**Response:**
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "_id": "patient123",
        "userId": {
          "_id": "user123",
          "email": "john.doe@email.com",
          "firstName": "John",
          "lastName": "Doe",
          "fullName": "John Doe",
          "phone": "+1234567890",
          "avatarUrl": "https://example.com/avatar.jpg"
        },
        "dateOfBirth": "1989-05-15",
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
        "lastVisit": "2024-01-10T14:30:00Z",
        "isActive": true,
        "createdAt": "2023-06-15T00:00:00Z"
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

### ✅ Get My Patients
```http
GET /api/doctor/my-patients
```

**Description:** Get patients who have had appointments with this doctor.

**Query Parameters:** Same as above

**Response:** Same structure as `/api/doctor/patients` but filtered to patients who have been seen by this doctor.

### ✅ Get Patient Details
```http
GET /api/doctor/patients/{patientId}
```

**Description:** Get detailed information about a specific patient.

**Response:**
```json
{
  "success": true,
  "data": {
    "patient": {
      // Complete patient object with full details
      "_id": "patient123",
      "userId": { /* user details */ },
      "medicalHistory": [
        {
          "condition": "Hypertension",
          "diagnosedDate": "2020-03-15",
          "status": "ongoing",
          "notes": "Well controlled with medication"
        }
      ],
      "medications": [
        {
          "name": "Lisinopril",
          "dosage": "10mg",
          "frequency": "Once daily",
          "startDate": "2020-03-15",
          "prescribedBy": "Dr. Smith"
        }
      ],
      "recentAppointments": [
        // Last 5 appointments with this doctor
      ],
      "vitalSigns": {
        "lastRecorded": "2024-01-10T14:30:00Z",
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

## 4. Appointment Management APIs

### ✅ Get Appointments
```http
GET /api/doctor/appointments
```

**Description:** Get doctor's appointments with filtering and pagination.

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

**Response:**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "_id": "apt123",
        "patient": {
          "_id": "patient123",
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
          "_id": "doctor123",
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
        "createdAt": "2024-01-10T09:00:00Z",
        "updatedAt": "2024-01-12T14:30:00Z"
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

### ✅ Create Appointment
```http
POST /api/doctor/appointments
```

**Description:** Create a new appointment by selecting from existing patients.

**Request Body:**
```json
{
  "patientId": "patient123",
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

**Response:**
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "appointment": {
      "_id": "apt124",
      "patient": {
        // Patient details
      },
      "doctor": {
        // Doctor details
      },
      "appointmentDate": "2024-01-20",
      "appointmentTime": "14:00",
      "duration": 30,
      "type": "consultation",
      "status": "scheduled",
      "reason": "Follow-up on blood test results",
      "priority": "medium",
      "isVirtual": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### ✅ Update Appointment
```http
PUT /api/doctor/appointments/{appointmentId}
```

**Description:** Update appointment details or status.

**Request Body:**
```json
{
  "status": "confirmed",
  "appointmentTime": "15:00",
  "notes": "Confirmed via phone call - moved to 3 PM",
  "priority": "high"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment updated successfully",
  "data": {
    "appointment": {
      // Updated appointment object
    }
  }
}
```

### ✅ Cancel Appointment
```http
DELETE /api/doctor/appointments/{appointmentId}
```

**Description:** Cancel an appointment.

**Request Body:**
```json
{
  "reason": "Doctor unavailable due to emergency",
  "notifyPatient": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully"
}
```

### ✅ Get Available Time Slots
```http
GET /api/doctor/appointments/available-slots
```

**Description:** Get available time slots for appointment booking.

**Query Parameters:**
- `date` (required): Date to check (YYYY-MM-DD)
- `duration` (optional): Appointment duration in minutes (default: 30)

**Response:**
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

## 5. Notification APIs

### ✅ Get Notifications
```http
GET /api/doctor/notifications
```

**Description:** Get doctor's notifications with filtering options.

**Query Parameters:**
- `unread` (optional): true/false to filter unread notifications
- `type` (optional): appointment, lab-result, system, reminder, message
- `priority` (optional): low, medium, high, urgent
- `limit` (optional): Number of notifications (default: 20)
- `page` (optional): Page number

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "notif123",
        "title": "New appointment request",
        "message": "Patient John Doe requested an appointment for tomorrow at 2:00 PM",
        "type": "appointment",
        "priority": "medium",
        "isRead": false,
        "actionUrl": "/doctor/appointments/apt123",
        "actionText": "View Appointment",
        "relatedId": "apt123",
        "relatedType": "appointment",
        "createdAt": "2024-01-15T09:00:00Z"
      },
      {
        "_id": "notif124",
        "title": "Lab results available",
        "message": "Blood test results for Jane Smith are now available",
        "type": "lab-result",
        "priority": "high",
        "isRead": false,
        "actionUrl": "/doctor/patients/patient124/lab-results",
        "actionText": "View Results",
        "relatedId": "patient124",
        "relatedType": "patient",
        "createdAt": "2024-01-15T08:30:00Z"
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

### ✅ Mark Notification as Read
```http
PUT /api/doctor/notifications/{notificationId}/read
```

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### ✅ Mark All Notifications as Read
```http
PUT /api/doctor/notifications/mark-all-read
```

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

### ✅ Delete Notification
```http
DELETE /api/doctor/notifications/{notificationId}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

## 6. Medical Records APIs

### ✅ Get Medical Records
```http
GET /api/doctor/medical-records
```

**Description:** Get medical records for patients seen by this doctor.

**Query Parameters:**
- `patientId` (optional): Filter by specific patient
- `recordType` (optional): consultation, lab-result, prescription, diagnosis
- `dateFrom`, `dateTo` (optional): Date range filter
- `page`, `limit`: Pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "_id": "record123",
        "patient": {
          "_id": "patient123",
          "userId": {
            "fullName": "John Doe"
          },
          "age": 35
        },
        "doctor": {
          "_id": "doctor123",
          "userId": {
            "fullName": "Dr. John Smith"
          }
        },
        "appointment": {
          "_id": "apt123",
          "appointmentDate": "2024-01-10",
          "appointmentTime": "14:30"
        },
        "recordType": "consultation",
        "visitDate": "2024-01-10",
        "chiefComplaint": "Chest pain and shortness of breath",
        "presentIllness": "Patient reports chest pain for 2 days...",
        "physicalExamination": "Alert and oriented, no acute distress...",
        "diagnosis": [
          {
            "primary": true,
            "code": "I25.9",
            "description": "Chronic ischemic heart disease, unspecified"
          }
        ],
        "treatment": "Prescribed medication and lifestyle changes",
        "medications": [
          {
            "name": "Metoprolol",
            "dosage": "50mg",
            "frequency": "Twice daily",
            "duration": "30 days",
            "instructions": "Take with food"
          }
        ],
        "vitalSigns": {
          "bloodPressure": {
            "systolic": 140,
            "diastolic": 90
          },
          "heartRate": 85,
          "temperature": 98.6,
          "respiratoryRate": 18,
          "oxygenSaturation": 98
        },
        "labResults": [
          {
            "test": "Complete Blood Count",
            "result": "Normal",
            "date": "2024-01-09"
          }
        ],
        "followUpInstructions": "Return in 2 weeks for follow-up",
        "nextAppointment": "2024-01-24",
        "notes": "Patient responded well to treatment plan",
        "createdAt": "2024-01-10T15:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 12,
      "totalItems": 230
    }
  }
}
```

### ✅ Create Medical Record
```http
POST /api/doctor/medical-records
```

**Description:** Create a new medical record after patient consultation.

**Request Body:**
```json
{
  "patientId": "patient123",
  "appointmentId": "apt123",
  "recordType": "consultation",
  "chiefComplaint": "Persistent headache for 3 days",
  "presentIllness": "Patient reports severe headache starting 3 days ago...",
  "physicalExamination": "Neurological exam normal, no focal deficits...",
  "diagnosis": [
    {
      "primary": true,
      "code": "G44.1",
      "description": "Vascular headache, not elsewhere classified"
    }
  ],
  "treatment": "Prescribed pain medication and rest",
  "medications": [
    {
      "name": "Sumatriptan",
      "dosage": "50mg",
      "frequency": "As needed",
      "duration": "7 days",
      "instructions": "Take at onset of headache"
    }
  ],
  "vitalSigns": {
    "bloodPressure": {
      "systolic": 120,
      "diastolic": 80
    },
    "heartRate": 72,
    "temperature": 98.6
  },
  "followUpInstructions": "Return if symptoms worsen or persist beyond 1 week",
  "nextAppointment": "2024-01-22",
  "notes": "Patient advised to maintain headache diary"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Medical record created successfully",
  "data": {
    "record": {
      "_id": "record124",
      // Complete record object
    }
  }
}
```

### ✅ Update Medical Record
```http
PUT /api/doctor/medical-records/{recordId}
```

**Description:** Update an existing medical record.

**Request Body:**
```json
{
  "diagnosis": [
    {
      "primary": true,
      "code": "G44.2",
      "description": "Tension-type headache"
    }
  ],
  "notes": "Updated diagnosis after further evaluation"
}
```

### ✅ Get Patient Medical History
```http
GET /api/doctor/patients/{patientId}/medical-history
```

**Description:** Get complete medical history for a specific patient.

**Response:**
```json
{
  "success": true,
  "data": {
    "patient": {
      "_id": "patient123",
      "userId": {
        "fullName": "John Doe"
      }
    },
    "medicalHistory": {
      "allergies": ["Penicillin", "Shellfish"],
      "chronicConditions": [
        {
          "condition": "Hypertension",
          "diagnosedDate": "2020-03-15",
          "status": "controlled"
        }
      ],
      "surgicalHistory": [
        {
          "procedure": "Appendectomy",
          "date": "2015-08-20",
          "hospital": "General Hospital"
        }
      ],
      "familyHistory": [
        {
          "relation": "father",
          "condition": "Heart disease",
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
          "frequency": "daily",
          "startDate": "2020-03-15"
        }
      ],
      "recentRecords": [
        // Last 10 medical records
      ]
    }
  }
}
```

---

## 7. Schedule Management APIs

### ✅ Get Doctor Schedule
```http
GET /api/doctor/schedule
```

**Description:** Get doctor's availability schedule and exceptions.

**Response:**
```json
{
  "success": true,
  "data": {
    "schedule": {
      "monday": {
        "isAvailable": true,
        "startTime": "09:00",
        "endTime": "17:00",
        "breakTime": {
          "start": "12:00",
          "end": "13:00"
        },
        "slotDuration": 30
      },
      "tuesday": {
        "isAvailable": true,
        "startTime": "09:00",
        "endTime": "17:00",
        "breakTime": {
          "start": "12:00",
          "end": "13:00"
        },
        "slotDuration": 30
      },
      "wednesday": {
        "isAvailable": true,
        "startTime": "09:00",
        "endTime": "17:00",
        "breakTime": {
          "start": "12:00",
          "end": "13:00"
        },
        "slotDuration": 30
      },
      "thursday": {
        "isAvailable": true,
        "startTime": "09:00",
        "endTime": "17:00",
        "breakTime": {
          "start": "12:00",
          "end": "13:00"
        },
        "slotDuration": 30
      },
      "friday": {
        "isAvailable": true,
        "startTime": "09:00",
        "endTime": "17:00",
        "breakTime": {
          "start": "12:00",
          "end": "13:00"
        },
        "slotDuration": 30
      },
      "saturday": {
        "isAvailable": true,
        "startTime": "09:00",
        "endTime": "13:00",
        "slotDuration": 30
      },
      "sunday": {
        "isAvailable": false
      }
    },
    "exceptions": [
      {
        "_id": "exc123",
        "date": "2024-01-20",
        "isAvailable": false,
        "reason": "Medical Conference",
        "type": "unavailable"
      },
      {
        "_id": "exc124",
        "date": "2024-01-25",
        "isAvailable": true,
        "customHours": {
          "startTime": "10:00",
          "endTime": "15:00"
        },
        "reason": "Modified hours",
        "type": "modified"
      }
    ]
  }
}
```

### ✅ Update Doctor Schedule
```http
PUT /api/doctor/schedule
```

**Description:** Update doctor's regular availability schedule.

**Request Body:**
```json
{
  "schedule": {
    "monday": {
      "isAvailable": true,
      "startTime": "08:00",
      "endTime": "18:00",
      "breakTime": {
        "start": "12:30",
        "end": "13:30"
      },
      "slotDuration": 30
    },
    "saturday": {
      "isAvailable": false
    }
  }
}
```

### ✅ Add Schedule Exception
```http
POST /api/doctor/schedule/exceptions
```

**Description:** Add a schedule exception (unavailable day or modified hours).

**Request Body:**
```json
{
  "date": "2024-01-30",
  "isAvailable": false,
  "reason": "Personal leave",
  "type": "unavailable"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Schedule exception added successfully",
  "data": {
    "exception": {
      "_id": "exc125",
      "date": "2024-01-30",
      "isAvailable": false,
      "reason": "Personal leave",
      "type": "unavailable",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

## 8. Analytics & Reports APIs

### ✅ Get Doctor Analytics
```http
GET /api/doctor/analytics
```

**Description:** Get comprehensive analytics for doctor's practice.

**Query Parameters:**
- `period`: daily, weekly, monthly, yearly, custom
- `startDate`, `endDate`: For custom period (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "appointmentStats": {
      "total": 120,
      "completed": 110,
      "cancelled": 8,
      "noShow": 2,
      "completionRate": 91.7,
      "averagePerDay": 3.9,
      "peakDay": "Tuesday",
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
      "totalRevenue": 15000,
      "averagePerAppointment": 125,
      "monthlyGrowth": 8.5,
      "topServices": [
        {
          "service": "Consultation",
          "count": 95,
          "revenue": 11875
        }
      ]
    },
    "ratingStats": {
      "averageRating": 4.8,
      "totalReviews": 85,
      "ratingDistribution": {
        "5": 60,
        "4": 20,
        "3": 4,
        "2": 1,
        "1": 0
      },
      "recentReviews": [
        {
          "rating": 5,
          "comment": "Excellent doctor, very thorough",
          "patientName": "Anonymous",
          "date": "2024-01-14"
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

### ✅ Get Revenue Report
```http
GET /api/doctor/analytics/revenue
```

**Description:** Detailed revenue analytics.

**Query Parameters:**
- `period`: daily, weekly, monthly, yearly
- `startDate`, `endDate`: Date range

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 15000,
    "periodRevenue": [
      {
        "date": "2024-01-01",
        "revenue": 500,
        "appointments": 4
      }
    ],
    "revenueByService": [
      {
        "service": "Consultation",
        "revenue": 11875,
        "percentage": 79.2
      }
    ],
    "paymentMethods": [
      {
        "method": "Insurance",
        "amount": 12000,
        "percentage": 80
      }
    ]
  }
}
```

---

## 9. Communication APIs

### ✅ Get Messages
```http
GET /api/doctor/messages
```

**Description:** Get message conversations with patients.

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "_id": "conv123",
        "patient": {
          "_id": "patient123",
          "userId": {
            "fullName": "John Doe",
            "avatarUrl": "https://example.com/avatar.jpg"
          }
        },
        "lastMessage": {
          "_id": "msg123",
          "content": "Thank you for the prescription, feeling much better",
          "sentAt": "2024-01-15T14:30:00Z",
          "sender": "patient",
          "isRead": true
        },
        "unreadCount": 0,
        "updatedAt": "2024-01-15T14:30:00Z"
      }
    ],
    "totalUnread": 3
  }
}
```

### ✅ Get Conversation Messages
```http
GET /api/doctor/messages/{conversationId}
```

**Description:** Get messages in a specific conversation.

**Response:**
```json
{
  "success": true,
  "data": {
    "conversation": {
      "_id": "conv123",
      "patient": {
        // Patient details
      }
    },
    "messages": [
      {
        "_id": "msg123",
        "content": "Hello doctor, I have a question about my medication",
        "sentAt": "2024-01-15T10:00:00Z",
        "sender": "patient",
        "isRead": true
      },
      {
        "_id": "msg124",
        "content": "Hi John, what's your question?",
        "sentAt": "2024-01-15T10:05:00Z",
        "sender": "doctor",
        "isRead": true
      }
    ]
  }
}
```

### ✅ Send Message
```http
POST /api/doctor/messages/{conversationId}
```

**Description:** Send a message to a patient.

**Request Body:**
```json
{
  "content": "Please take the medication with food as discussed"
}
```

---

## 10. Implementation Priority

### **🚀 Phase 1 - Core Functionality (High Priority)**
1. ✅ `GET /api/doctor/me` - Doctor profile
2. ✅ `GET /api/doctor/dashboard` - Dashboard overview
3. ✅ `GET /api/doctor/patients` - All patients list
4. ✅ `GET /api/doctor/appointments` - Appointments list
5. ✅ `POST /api/doctor/appointments` - Create appointment
6. ✅ `PUT /api/doctor/appointments/{id}` - Update appointment
7. ✅ `GET /api/doctor/notifications` - Notifications

### **📈 Phase 2 - Enhanced Features (Medium Priority)**
8. ✅ `GET /api/doctor/my-patients` - Doctor's patients
9. ✅ `GET /api/doctor/patients/{id}` - Patient details
10. ✅ `GET /api/doctor/appointments/available-slots` - Available slots
11. ✅ `PUT /api/doctor/notifications/{id}/read` - Mark notification read
12. ✅ `GET /api/doctor/medical-records` - Medical records
13. ✅ `POST /api/doctor/medical-records` - Create record

### **🎯 Phase 3 - Advanced Features (Low Priority)**
14. ✅ `GET /api/doctor/schedule` - Schedule management
15. ✅ `GET /api/doctor/analytics` - Analytics dashboard
16. ✅ `GET /api/doctor/messages` - Patient communication
17. ✅ `PUT /api/doctor/schedule` - Update schedule
18. ✅ `GET /api/doctor/analytics/revenue` - Revenue reports

---

## 11. Testing Commands

```bash
# Set your JWT token
TOKEN="your_jwt_token_here"

# Test doctor profile
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/doctor/me

# Test dashboard data
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/doctor/dashboard

# Test patients list (for appointment creation)
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/doctor/patients?search=john&limit=10"

# Test create appointment (select from existing patients)
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient123",
    "appointmentDate": "2024-01-20",
    "appointmentTime": "14:00",
    "duration": 30,
    "type": "consultation",
    "reason": "Regular checkup"
  }' \
  http://localhost:5000/api/doctor/appointments

# Test appointments list
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/doctor/appointments?date=2024-01-15&status=confirmed"

# Test notifications
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/doctor/notifications?unread=true"

# Test available slots
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/doctor/appointments/available-slots?date=2024-01-20"
```

---

## 12. Error Responses

All endpoints may return these standard error responses:

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized, no token",
  "statusCode": 401
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Doctor privileges required.",
  "statusCode": 403
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "statusCode": 404
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "appointmentDate",
      "message": "Invalid date format"
    }
  ],
  "statusCode": 400
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "statusCode": 500
}
```

---

## 13. Notes

- **Patient Selection**: Doctors select from existing patients in the system rather than creating new ones during appointment booking
- **Authentication**: All endpoints require valid JWT token with doctor role
- **Pagination**: Most list endpoints support pagination with `page` and `limit` parameters
- **Filtering**: Search and filter capabilities on most list endpoints
- **Real-time**: Consider implementing WebSocket connections for real-time notifications
- **File Uploads**: Medical records may need file upload capabilities for attachments
- **Audit Trail**: All medical record changes should be logged for compliance

This comprehensive API specification covers all functionality needed for a complete doctor dashboard! 🏥