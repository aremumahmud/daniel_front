# Profile Management API Documentation

## 🏥 Overview

The Profile Management API provides comprehensive functionality for users to view and update their profile information within the healthcare platform. This API supports role-specific data management for patients, doctors, and administrators with appropriate field access controls.

## ✨ Key Features

- **Comprehensive Profile View**: Get complete user profile with role-specific data
- **Smart Profile Updates**: Update basic and role-specific information with validation
- **Secure Email Changes**: Email updates with password verification and re-verification
- **Profile Completeness**: Automatic calculation of profile completion percentage
- **Role-Based Access**: Different fields available based on user role (patient/doctor/admin)
- **Account Statistics**: Member since, last login, verification status tracking

## 🚀 Quick Start

### Prerequisites

- Valid user account (any role: patient, doctor, admin)
- Authentication token from login

### Base URL
```
http://localhost:5000/api/user
```

### Authentication
All endpoints require:
- **Bearer Token**: `Authorization: Bearer <token>`
- **Valid User**: Token must belong to an authenticated user

---

## 📚 API Endpoints

### 1. Get User Profile

**Endpoint:** `GET /api/user/profile`

**Description:** Retrieve comprehensive user profile information including role-specific data and account statistics.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response (200 OK):**
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

**Role-Specific Fields:**

**For Patients:**
- `dateOfBirth`, `gender`, `bloodType`
- `allergies`, `medicalHistory`
- `address`, `emergencyContact`

**For Doctors:**
- `specialization`, `licenseNumber`, `department`
- `address`, `emergencyContact` (limited fields)

---

### 2. Update User Profile

**Endpoint:** `PUT /api/user/profile`

**Description:** Update user profile information including basic details and role-specific data.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
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
  "medicalHistory": ["Hypertension"]
}
```

**Field Validation:**

| Field | Type | Validation | Required |
|-------|------|------------|----------|
| `firstName` | string | 2-50 characters | No |
| `lastName` | string | 2-50 characters | No |
| `phone` | string | Valid phone number | No |
| `dateOfBirth` | string | ISO8601 date | No |
| `gender` | string | male, female, other, prefer_not_to_say | No |
| `bloodType` | string | A+, A-, B+, B-, AB+, AB-, O+, O- | No |
| `address.street` | string | Max 100 characters | No |
| `address.city` | string | Max 50 characters | No |
| `address.state` | string | Max 50 characters | No |
| `address.zipCode` | string | Max 20 characters | No |
| `address.country` | string | Max 50 characters | No |
| `emergencyContact.name` | string | 2-100 characters | No |
| `emergencyContact.phone` | string | Valid phone number | No |
| `emergencyContact.relationship` | string | Max 50 characters | No |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
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
      }
    }
  }
}
```

---

### 3. Update Email Address

**Endpoint:** `PUT /api/user/profile/email`

**Description:** Update user email address with password verification and email verification requirement.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "newEmail": "newemail@example.com",
  "password": "currentPassword123"
}
```

**Field Validation:**

| Field | Type | Validation | Required |
|-------|------|------------|----------|
| `newEmail` | string | Valid email format | Yes |
| `password` | string | Current user password | Yes |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email updated successfully. Please check your new email for verification instructions.",
  "data": {
    "oldEmail": "john.doe@example.com",
    "newEmail": "newemail@example.com",
    "emailVerified": false,
    "verificationRequired": true
  }
}
```

---

## 🔒 Security Features

### Password Verification
- Email changes require current password verification
- Prevents unauthorized email modifications
- Secure password comparison using bcrypt

### Email Verification
- New email addresses require verification
- Verification token generated with 24-hour expiry
- Account marked as unverified until confirmation

### Role-Based Access Control
- Patients can update medical information
- Doctors have restricted field access (license/specialization read-only)
- Admins have appropriate access levels

### Input Validation
- Comprehensive validation using express-validator
- Sanitization of all user inputs
- Type checking and format validation

---

## 📋 Error Handling

### Common Error Responses

**400 - Validation Error:**
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": [
    {
      "field": "firstName",
      "message": "First name must be between 2 and 50 characters"
    },
    {
      "field": "bloodType",
      "message": "Invalid blood type"
    }
  ]
}
```

**400 - Invalid Password:**
```json
{
  "success": false,
  "message": "Invalid password"
}
```

**400 - Email Already in Use:**
```json
{
  "success": false,
  "message": "Email is already in use"
}
```

**401 - Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

**404 - User Not Found:**
```json
{
  "success": false,
  "message": "User not found"
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🧪 Testing Examples

### Using cURL

**Get Profile:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/user/profile
```

**Update Profile:**
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "bloodType": "O+"
  }' \
  http://localhost:5000/api/user/profile
```

**Update Email:**
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newEmail": "newemail@example.com",
    "password": "currentPassword123"
  }' \
  http://localhost:5000/api/user/profile/email
```

### Using JavaScript/Axios

```javascript
// Get profile
const getProfile = async () => {
  const response = await axios.get('/api/user/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

// Update profile
const updateProfile = async (profileData) => {
  const response = await axios.put('/api/user/profile', profileData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

// Update email
const updateEmail = async (newEmail, password) => {
  const response = await axios.put('/api/user/profile/email', {
    newEmail,
    password
  }, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};
```

---

## 📊 Profile Completeness Calculation

The system automatically calculates profile completeness based on:

### Basic Fields (All Roles)
- firstName, lastName, email, phone
- avatarUrl

### Role-Specific Fields

**For Patients:**
- dateOfBirth, gender, bloodType
- address (street, city, state, zipCode)

**For Doctors:**
- specialization, licenseNumber, department

### Calculation Formula
```
completeness = (completed_fields / total_fields) * 100
```

**Example:**
- Total fields: 10
- Completed fields: 8
- Profile completeness: 80%

---

## 🔄 Integration Notes

1. **Partial Updates**: All update endpoints support partial updates
2. **Role Awareness**: API automatically handles role-specific fields
3. **Data Consistency**: Updates maintain referential integrity across models
4. **Real-time Calculation**: Profile completeness updated on every change
5. **Audit Trail**: All profile changes are logged for security

---

## 📈 Best Practices

1. **Always validate input** on the frontend before API calls
2. **Handle email verification flow** properly in your application
3. **Show profile completeness** to encourage users to complete their profiles
4. **Implement proper error handling** for all API responses
5. **Use HTTPS** in production for secure data transmission
6. **Cache profile data** appropriately to reduce API calls

---

## 🤝 Related APIs

- **Authentication API**: `/api/auth/*` - Login, password change
- **Avatar Management**: `/api/user/avatar` - Profile picture upload
- **User Preferences**: `/api/user/preferences` - UI and localization settings
- **Security Settings**: `/api/user/security` - 2FA and security configuration
