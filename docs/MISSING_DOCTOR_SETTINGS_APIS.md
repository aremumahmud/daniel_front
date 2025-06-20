# Missing Doctor Settings APIs

## Overview
This document outlines the additional APIs needed to make the Doctor Settings page fully functional. These APIs are currently missing from the existing doctor API documentation.

## Base URL
```
http://localhost:8080/api
```

## Authentication
All endpoints require:
- **Bearer Token**: Include `Authorization: Bearer <doctor_token>` in headers
- **Doctor Role**: Only users with `role: "doctor"` can access these endpoints

---

## 1. User Profile Management APIs

### PUT /doctor/profile/basic
Update basic user information (name, phone) for doctors.

**Request:**
```http
PUT /api/doctor/profile/basic
Authorization: Bearer <doctor_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Basic profile updated successfully",
  "data": {
    "user": {
      "_id": "user_123",
      "firstName": "John",
      "lastName": "Smith",
      "fullName": "John Smith",
      "phone": "+1234567890",
      "email": "dr.smith@hospital.com",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

## 2. Password Management APIs

### PUT /doctor/password
Change doctor's password.

**Request:**
```http
PUT /api/doctor/password
Authorization: Bearer <doctor_token>
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

---

## 3. Notification Preferences APIs

### GET /doctor/preferences/notifications
Get doctor's notification preferences.

**Request:**
```http
GET /api/doctor/preferences/notifications
Authorization: Bearer <doctor_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "notifications": {
      "appointmentReminders": true,
      "appointmentCancellations": true,
      "newPatientRegistrations": false,
      "systemUpdates": true,
      "marketingEmails": false,
      "smsNotifications": true,
      "emailNotifications": true,
      "pushNotifications": true
    }
  }
}
```

### PUT /doctor/preferences/notifications
Update doctor's notification preferences.

**Request:**
```http
PUT /api/doctor/preferences/notifications
Authorization: Bearer <doctor_token>
Content-Type: application/json

{
  "appointmentReminders": true,
  "appointmentCancellations": true,
  "newPatientRegistrations": false,
  "systemUpdates": true,
  "marketingEmails": false,
  "smsNotifications": true,
  "emailNotifications": true,
  "pushNotifications": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification preferences updated successfully",
  "data": {
    "notifications": {
      "appointmentReminders": true,
      "appointmentCancellations": true,
      "newPatientRegistrations": false,
      "systemUpdates": true,
      "marketingEmails": false,
      "smsNotifications": true,
      "emailNotifications": true,
      "pushNotifications": true,
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

## 4. Avatar/Profile Picture APIs

### POST /doctor/avatar
Upload doctor's profile picture.

**Request:**
```http
POST /api/doctor/avatar
Authorization: Bearer <doctor_token>
Content-Type: multipart/form-data

avatar: [file] // Image file (jpg, png, gif)
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatarUrl": "https://api.example.com/uploads/avatars/doctor123.jpg",
    "thumbnailUrl": "https://api.example.com/uploads/avatars/doctor123_thumb.jpg"
  }
}
```

### DELETE /doctor/avatar
Remove doctor's profile picture.

**Request:**
```http
DELETE /api/doctor/avatar
Authorization: Bearer <doctor_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Avatar removed successfully"
}
```

---

## 5. Professional Credentials Management APIs

### PUT /doctor/credentials
Update professional credentials (admin approval required).

**Request:**
```http
PUT /api/doctor/credentials
Authorization: Bearer <doctor_token>
Content-Type: application/json

{
  "licenseNumber": "MD123456",
  "experience": 12,
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
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Credentials update submitted for admin approval",
  "data": {
    "status": "pending_approval",
    "submittedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 6. Account Deactivation APIs

### PUT /doctor/account/deactivate
Temporarily deactivate doctor account.

**Request:**
```http
PUT /api/doctor/account/deactivate
Authorization: Bearer <doctor_token>
Content-Type: application/json

{
  "reason": "Taking a break",
  "reactivationDate": "2024-06-01T00:00:00.000Z"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Account deactivated successfully",
  "data": {
    "status": "deactivated",
    "reactivationDate": "2024-06-01T00:00:00.000Z"
  }
}
```

---

## 7. Data Export APIs

### POST /doctor/data/export
Request export of doctor's data.

**Request:**
```http
POST /api/doctor/data/export
Authorization: Bearer <doctor_token>
Content-Type: application/json

{
  "format": "json",
  "includePatientData": false,
  "includeAppointments": true,
  "includeMedicalRecords": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Data export requested successfully",
  "data": {
    "exportId": "export_123",
    "estimatedTime": "24 hours",
    "notificationEmail": "dr.smith@hospital.com"
  }
}
```

---

## Implementation Priority

### High Priority (Essential for Settings Page)
1. ✅ `PUT /doctor/profile/basic` - Update basic profile info
2. ✅ `PUT /doctor/password` - Change password
3. ✅ `POST /doctor/avatar` - Upload profile picture
4. ✅ `DELETE /doctor/avatar` - Remove profile picture

### Medium Priority (Enhanced User Experience)
5. ✅ `GET /doctor/preferences/notifications` - Get notification settings
6. ✅ `PUT /doctor/preferences/notifications` - Update notification settings
7. ✅ `PUT /doctor/account/deactivate` - Account management

### Low Priority (Advanced Features)
8. ✅ `PUT /doctor/credentials` - Update credentials (admin approval)
9. ✅ `POST /doctor/data/export` - Data export functionality

---

## Error Handling

All endpoints should return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error message"
    }
  ]
}
```

## Security Considerations

1. **Password Changes**: Require current password verification
2. **File Uploads**: Validate file types and sizes
3. **Rate Limiting**: Implement rate limiting for sensitive operations
4. **Audit Logging**: Log all profile changes for security
5. **Data Validation**: Validate all input data server-side
