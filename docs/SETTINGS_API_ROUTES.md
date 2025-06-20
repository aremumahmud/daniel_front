# Settings Page API Routes Documentation

## Overview
This document outlines all the API routes needed to make the settings page fully functional. Some routes are already implemented, while others need to be created.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints require:
- **Bearer Token**: Include `Authorization: Bearer <token>` in headers
- **Valid User**: Token must belong to an authenticated user

---

## 1. Profile Management APIs

### ✅ Get User Profile (Use existing endpoint)
```http
GET /api/user/profile
```

**Response:** (See PROFILE_API.md for complete documentation)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "role": "patient",
      "avatarUrl": "https://example.com/avatar.jpg",
      "dateOfBirth": "1990-01-15",
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
      "allergies": ["Penicillin", "Peanuts"],
      "medicalHistory": ["Hypertension", "Diabetes Type 2"]
    },
    "accountStats": {
      "memberSince": "2023-01-01T00:00:00Z",
      "lastLogin": "2024-01-15T10:30:00Z",
      "emailVerified": true,
      "isActive": true,
      "profileCompleteness": 85
    }
  }
}
```

### ✅ Update User Profile (Use existing endpoint)
```http
PUT /api/user/profile
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "user123",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "role": "patient",
      "emailVerified": true,
      "avatarUrl": null,
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### ✅ Change Password (Already Implemented)
```http
PUT /api/auth/change-password
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 2. User Preferences APIs (🆕 Need Implementation)

### Get User Preferences
```http
GET /api/user/preferences
```

**Response:**
```json
{
  "success": true,
  "data": {
    "preferences": {
      "language": "en",
      "timezone": "UTC",
      "dateFormat": "MM/DD/YYYY",
      "theme": "system"
    }
  }
}
```

### Update User Preferences
```http
PUT /api/user/preferences
```

**Request Body:**
```json
{
  "language": "en",
  "timezone": "EST",
  "dateFormat": "DD/MM/YYYY",
  "theme": "dark"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "data": {
    "preferences": {
      "language": "en",
      "timezone": "EST",
      "dateFormat": "DD/MM/YYYY",
      "theme": "dark",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

## 3. Notification Settings APIs (🆕 Need Implementation)

### Get Notification Settings
```http
GET /api/user/notifications
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": {
      "emailNotifications": true,
      "appointmentReminders": true,
      "systemUpdates": false,
      "marketingEmails": false
    }
  }
}
```

### Update Notification Settings
```http
PUT /api/user/notifications
```

**Request Body:**
```json
{
  "emailNotifications": true,
  "appointmentReminders": true,
  "systemUpdates": true,
  "marketingEmails": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification settings updated successfully",
  "data": {
    "notifications": {
      "emailNotifications": true,
      "appointmentReminders": true,
      "systemUpdates": true,
      "marketingEmails": false,
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

## 4. Security Settings APIs (🆕 Need Implementation)

### Get Security Settings
```http
GET /api/user/security
```

**Response:**
```json
{
  "success": true,
  "data": {
    "security": {
      "twoFactorEnabled": false,
      "lastPasswordChange": "2024-01-01T00:00:00Z",
      "loginSessions": 3,
      "lastLogin": "2024-01-15T09:00:00Z"
    }
  }
}
```

### Update Two-Factor Authentication
```http
PUT /api/user/security/2fa
```

**Request Body:**
```json
{
  "enabled": true,
  "method": "email" // or "sms", "app"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Two-factor authentication updated successfully",
  "data": {
    "twoFactorEnabled": true,
    "method": "email",
    "backupCodes": ["123456", "789012", "345678"] // Only returned when enabling
  }
}
```

---

## 5. Data Export & Privacy APIs (✅ Implemented - Immediate Processing)

### ✅ Request Immediate Data Export
```http
POST /api/user/data-export
```

**Description:** Immediately processes and sends data export to user's email. Also provides instant download link for immediate access. No queuing or waiting required.

**Request Body:**
```json
{
  "format": "json", // "json", "csv", or "pdf"
  "includeDeleted": false,
  "dataTypes": ["profile", "preferences", "notifications", "security_logs"]
}
```

**Supported Formats:**
- `json` - Structured JSON format
- `csv` - Comma-separated values
- `pdf` - Text-based report format

**Available Data Types:**
- `profile` - User profile and role-specific data
- `preferences` - User interface preferences
- `notifications` - Notification settings
- `security_logs` - Security settings (excluding sensitive data)

**Response:**
```json
{
  "success": true,
  "message": "Data export completed and sent to your email successfully",
  "data": {
    "exportId": "export_123456",
    "sentToEmail": "user@example.com",
    "format": "json",
    "completedAt": "2024-01-15T10:30:00Z",
    "downloadUrl": "https://api.example.com/downloads/export_123456.json",
    "expiresAt": "2024-01-22T10:30:00Z"
  }
}
```

### ✅ Get Data Export Status (Optional)
```http
GET /api/user/data-export/{exportId}
```

**Description:** Get status of a data export request. Since exports are processed immediately, this is mainly for historical tracking.

**Response:**
```json
{
  "success": true,
  "data": {
    "exportId": "export_123456",
    "status": "completed",
    "downloadUrl": "https://api.example.com/downloads/export_123456.json",
    "expiresAt": "2024-01-22T10:30:00Z",
    "createdAt": "2024-01-15T10:30:00Z",
    "completedAt": "2024-01-15T10:30:15Z",
    "sentToEmail": "user@example.com"
  }
}
```

### Account Deletion Request
```http
POST /api/user/delete-account
```

**Request Body:**
```json
{
  "password": "currentPassword123",
  "reason": "No longer needed", // Optional
  "feedback": "Great service, just don't need it anymore" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account deletion requested successfully",
  "data": {
    "deletionId": "del_123456",
    "scheduledDate": "2024-01-22T10:30:00Z", // 7 days grace period
    "cancellationDeadline": "2024-01-21T10:30:00Z"
  }
}
```

### Cancel Account Deletion
```http
DELETE /api/user/delete-account/{deletionId}
```

**Response:**
```json
{
  "success": true,
  "message": "Account deletion cancelled successfully"
}
```

---

## 6. Avatar/Profile Picture APIs (🆕 Need Implementation)

### Upload Avatar
```http
POST /api/user/avatar
Content-Type: multipart/form-data
```

**Request Body:**
```
avatar: [file] // Image file (jpg, png, gif)
```

**Response:**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatarUrl": "https://api.example.com/uploads/avatars/user123.jpg",
    "thumbnailUrl": "https://api.example.com/uploads/avatars/user123_thumb.jpg"
  }
}
```

### Delete Avatar
```http
DELETE /api/user/avatar
```

**Response:**
```json
{
  "success": true,
  "message": "Avatar deleted successfully"
}
```

---

## Error Responses

All endpoints may return these error responses:

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized, no token",
  "statusCode": 401
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
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

## Implementation Priority

### High Priority (Core Functionality)
1. ✅ Profile update (already implemented)
2. ✅ Password change (already implemented)
3. 🆕 User preferences (language, timezone, theme)
4. 🆕 Notification settings

### Medium Priority (Enhanced Features)
5. 🆕 Security settings (2FA)
6. 🆕 Data export
7. 🆕 Avatar upload

### Low Priority (Advanced Features)
8. 🆕 Account deletion
9. 🆕 Session management
10. 🆕 Privacy controls

---

## Database Schema Additions Needed

### User Preferences Table
```sql
CREATE TABLE user_preferences (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
  theme VARCHAR(20) DEFAULT 'system',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Notification Settings Table
```sql
CREATE TABLE notification_settings (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  email_notifications BOOLEAN DEFAULT true,
  appointment_reminders BOOLEAN DEFAULT true,
  system_updates BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Security Settings Table
```sql
CREATE TABLE security_settings (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_method VARCHAR(20) DEFAULT 'email',
  backup_codes JSON,
  last_password_change TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```
