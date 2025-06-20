# 🏥 Doctor Settings API Documentation

## 📋 Overview

Complete API documentation with exact request and response objects for all Doctor Settings endpoints. These APIs enable doctors to manage their profile, preferences, credentials, and account settings.

**Base URL:** `http://localhost:8080/api`  
**Authentication:** Bearer Token (Doctor Role Required)  
**Content-Type:** `application/json` (except for file uploads)

---

## 🔐 Authentication

All endpoints require:
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 1. Profile Management

### PUT /doctor/profile/basic
Update basic user information (name, phone) for doctors.

**Request:**
```http
PUT /api/doctor/profile/basic
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
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

**Validation Rules:**
- `firstName`: 2-50 characters, letters and spaces only
- `lastName`: 2-50 characters, letters and spaces only
- `phone`: Valid phone number format

---

## 2. Password Management

### PUT /doctor/password
Change doctor's password with current password verification.

**Request:**
```http
PUT /api/doctor/password
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "NewSecurePass456!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

**Validation Rules:**
- `currentPassword`: Required, must match existing password
- `newPassword`: Minimum 6 characters, must contain uppercase, lowercase, and number

---

## 3. Notification Preferences

### GET /doctor/preferences/notifications
Get doctor's notification preferences.

**Request:**
```http
GET /api/doctor/preferences/notifications
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
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
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "appointmentReminders": true,
  "appointmentCancellations": true,
  "newPatientRegistrations": false,
  "systemUpdates": true,
  "marketingEmails": false,
  "smsNotifications": true,
  "emailNotifications": true,
  "pushNotifications": false
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
      "pushNotifications": false,
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Validation Rules:**
- All fields are optional boolean values
- Invalid boolean values will return validation error

---

## 4. Avatar Management

### POST /doctor/avatar
Upload doctor's profile picture.

**Request:**
```http
POST /api/doctor/avatar
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

avatar: [file] // Image file (jpg, png, gif, webp)
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatarUrl": "http://localhost:5000/uploads/avatars/doctor-user_123-1642694400000-123456789.jpg",
    "thumbnailUrl": "http://localhost:5000/uploads/avatars/doctor-user_123-1642694400000-123456789.jpg"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "No file uploaded"
}
```

**File Validation:**
- **Allowed formats**: jpg, jpeg, png, gif, webp
- **Maximum size**: 5MB
- **File naming**: `doctor-{userId}-{timestamp}-{random}.{ext}`

### DELETE /doctor/avatar
Remove doctor's profile picture.

**Request:**
```http
DELETE /api/doctor/avatar
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Avatar removed successfully"
}
```

---

## 5. Professional Credentials

### PUT /doctor/credentials
Update professional credentials (requires admin approval).

**Request:**
```http
PUT /api/doctor/credentials
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "licenseNumber": "MD123456789",
  "experience": 12,
  "education": [
    {
      "degree": "MD",
      "institution": "Harvard Medical School",
      "year": 2014
    },
    {
      "degree": "Residency in Cardiology",
      "institution": "Johns Hopkins Hospital",
      "year": 2018
    }
  ],
  "certifications": [
    "Board Certified Cardiologist",
    "Advanced Cardiac Life Support (ACLS)",
    "Basic Life Support (BLS)"
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

**Validation Rules:**
- `licenseNumber`: 5-20 characters
- `experience`: Integer between 0-50
- `education`: Array of objects with degree, institution, year
- `certifications`: Array of strings

---

## 6. Account Management

### GET /doctor/account/status
Get current account status and settings.

**Request:**
```http
GET /api/doctor/account/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accountStatus": "active",
    "isActive": true,
    "isAvailable": true,
    "deactivatedAt": null,
    "reactivationDate": null,
    "deactivationReason": null,
    "pendingCredentialsUpdate": {
      "status": "pending_approval",
      "submittedAt": "2024-01-15T10:30:00.000Z",
      "licenseNumber": "MD123456789",
      "yearsExperience": 12
    }
  }
}
```

### PUT /doctor/account/deactivate
Temporarily deactivate doctor account.

**Request:**
```http
PUT /api/doctor/account/deactivate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "reason": "Taking a sabbatical for research work",
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

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Cannot deactivate account. You have 5 upcoming appointments. Please reschedule or cancel them first.",
  "data": {
    "upcomingAppointments": 5
  }
}
```

**Validation Rules:**
- `reason`: Required, 10-500 characters
- `reactivationDate`: Optional, must be future date

### PUT /doctor/account/reactivate
Reactivate a deactivated doctor account.

**Request:**
```http
PUT /api/doctor/account/reactivate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Account reactivated successfully",
  "data": {
    "status": "active",
    "reactivatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Account is already active"
}
```

---

## 7. Data Export

### POST /doctor/data/export
Request export of doctor's data.

**Request:**
```http
POST /api/doctor/data/export
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
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
    "exportId": "export_doctor_123_1642694400000",
    "estimatedTime": "24 hours",
    "notificationEmail": "dr.smith@hospital.com",
    "format": "json",
    "includedData": {
      "profile": true,
      "appointments": true,
      "medicalRecords": true,
      "patientData": false
    }
  }
}
```

**Validation Rules:**
- `format`: Must be "json", "csv", or "xml"
- `includePatientData`: Boolean (default: false)
- `includeAppointments`: Boolean (default: true)
- `includeMedicalRecords`: Boolean (default: true)

### GET /doctor/data/export/{exportId}
Get status of data export request.

**Request:**
```http
GET /api/doctor/data/export/export_doctor_123_1642694400000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK) - Processing:**
```json
{
  "success": true,
  "data": {
    "exportId": "export_doctor_123_1642694400000",
    "status": "processing",
    "progress": 65,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "completedAt": null,
    "downloadUrl": null,
    "expiresAt": null
  }
}
```

**Response (200 OK) - Completed:**
```json
{
  "success": true,
  "data": {
    "exportId": "export_doctor_123_1642694400000",
    "status": "completed",
    "progress": 100,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "completedAt": "2024-01-16T08:45:00.000Z",
    "downloadUrl": "http://localhost:5000/downloads/export_doctor_123_1642694400000.json",
    "expiresAt": "2024-01-23T08:45:00.000Z"
  }
}
```

**Export Status Values:**
- `pending`: Export request received, queued for processing
- `processing`: Export is being generated
- `completed`: Export ready for download
- `failed`: Export failed due to error
- `expired`: Download link has expired

---

## 8. Error Responses

### Common Error Formats

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "firstName",
      "message": "First name must be between 2 and 50 characters",
      "value": "J"
    },
    {
      "field": "newPassword",
      "message": "New password must contain at least one uppercase letter, one lowercase letter, and one number",
      "value": "weak"
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
  "message": "Doctor profile not found"
}
```

**413 Payload Too Large:**
```json
{
  "success": false,
  "message": "File too large. Maximum size is 5MB."
}
```

**415 Unsupported Media Type:**
```json
{
  "success": false,
  "message": "Only image files are allowed"
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
- **Special limits**: Avatar upload limited to 10 uploads per hour

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

## 10. Security Features

### Password Security
- **Current password verification** required for password changes
- **Strong password requirements**: Minimum 6 characters with uppercase, lowercase, and numbers
- **Password hashing**: bcrypt with salt rounds

### File Upload Security
- **File type validation**: Only image files allowed
- **File size limits**: Maximum 5MB per upload
- **Secure file naming**: Prevents directory traversal attacks
- **Virus scanning**: Recommended for production environments

### Data Protection
- **Admin approval required** for credential changes
- **Audit logging**: All profile changes logged
- **Data export controls**: Patient data inclusion requires explicit consent
- **Account deactivation safeguards**: Prevents deactivation with pending appointments

---

## 11. Integration Examples

### JavaScript/Node.js Example

```javascript
class DoctorSettingsAPI {
    constructor(baseURL, token) {
        this.baseURL = baseURL;
        this.token = token;
    }

    async updateBasicProfile(profileData) {
        const response = await fetch(`${this.baseURL}/doctor/profile/basic`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        });
        return await response.json();
    }

    async changePassword(currentPassword, newPassword) {
        const response = await fetch(`${this.baseURL}/doctor/password`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        return await response.json();
    }

    async uploadAvatar(file) {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await fetch(`${this.baseURL}/doctor/avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        });
        return await response.json();
    }

    async updateNotificationPreferences(preferences) {
        const response = await fetch(`${this.baseURL}/doctor/preferences/notifications`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preferences)
        });
        return await response.json();
    }

    async requestDataExport(options) {
        const response = await fetch(`${this.baseURL}/doctor/data/export`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(options)
        });
        return await response.json();
    }
}

// Usage
const api = new DoctorSettingsAPI('http://localhost:5000/api', 'your-jwt-token');

// Update profile
await api.updateBasicProfile({
    firstName: 'John',
    lastName: 'Smith',
    phone: '+1234567890'
});

// Change password
await api.changePassword('oldPassword123', 'NewSecurePass456!');

// Upload avatar
const fileInput = document.getElementById('avatar-input');
await api.uploadAvatar(fileInput.files[0]);
```

### cURL Examples

```bash
# Set token variable
export TOKEN="your_jwt_token_here"
export API_BASE="http://localhost:5000/api"

# Update basic profile
curl -X PUT "$API_BASE/doctor/profile/basic" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Smith",
    "phone": "+1234567890"
  }'

# Change password
curl -X PUT "$API_BASE/doctor/password" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldPassword123",
    "newPassword": "NewSecurePass456!"
  }'

# Upload avatar
curl -X POST "$API_BASE/doctor/avatar" \
  -H "Authorization: Bearer $TOKEN" \
  -F "avatar=@/path/to/profile-picture.jpg"

# Update notification preferences
curl -X PUT "$API_BASE/doctor/preferences/notifications" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentReminders": true,
    "emailNotifications": true,
    "smsNotifications": false
  }'

# Request data export
curl -X POST "$API_BASE/doctor/data/export" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "json",
    "includeAppointments": true,
    "includeMedicalRecords": true,
    "includePatientData": false
  }'
```

---

## 12. Testing Checklist

### Profile Management
- [ ] Update first name, last name, phone
- [ ] Validate field length restrictions
- [ ] Test special characters in names
- [ ] Verify phone number format validation

### Password Management
- [ ] Change password with correct current password
- [ ] Test incorrect current password
- [ ] Validate new password strength requirements
- [ ] Test password confirmation

### Avatar Management
- [ ] Upload valid image files (jpg, png, gif)
- [ ] Test file size limits (5MB)
- [ ] Test invalid file types
- [ ] Remove existing avatar

### Notification Preferences
- [ ] Get current preferences
- [ ] Update individual preferences
- [ ] Test boolean validation
- [ ] Verify persistence of changes

### Account Management
- [ ] Get account status
- [ ] Deactivate account (with/without appointments)
- [ ] Reactivate account
- [ ] Test deactivation with future appointments

### Data Export
- [ ] Request export with different formats
- [ ] Check export status
- [ ] Test different data inclusion options
- [ ] Verify email notifications

---

*Last Updated: 2025-06-20*
*Doctor Settings API Documentation v1.0.0*
