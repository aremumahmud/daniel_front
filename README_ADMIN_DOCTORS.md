# Admin Doctor Management API

## 🏥 Overview

The Admin Doctor Management API provides comprehensive functionality for administrators to create and manage doctor profiles with automatic user account generation. This system streamlines the onboarding process by automatically creating user credentials when a doctor profile is created.

## ✨ Key Features

- **Automatic User Account Creation**: Creates user accounts automatically when doctors are added
- **Credential Generation**: Auto-generates username and password based on doctor's name
- **Comprehensive Doctor Management**: Full CRUD operations for doctor profiles
- **Advanced Search & Filtering**: Search by specialization, department, license number
- **Pagination Support**: Efficient handling of large doctor datasets
- **Role-Based Access Control**: Admin-only access with proper authentication
- **Auto-Verification**: Admin-created doctors are automatically verified and activated

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- Admin account credentials

### Environment Setup

Ensure your `.env` file contains:




## 📚 API Endpoints

### Base URL
```
http://localhost:8080/api/admin/doctors
```

### Authentication
All endpoints require:
- **Bearer Token**: Include `Authorization: Bearer <admin_token>` in headers
- **Admin Role**: Only users with `role: "admin"` can access these endpoints

---

## 🔧 API Reference

### 1. Create Doctor

**Endpoint:** `POST /api/admin/doctors`

**Description:** Creates a new doctor profile with automatic user account generation.

**Auto-Generated Credentials:**
- Username: `firstname + lastname` (lowercase)
- Password: `lastname` (lowercase)
- Role: `doctor`
- Status: Auto-verified and activated

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@hospital.com",
  "phone": "+1234567890",
  "licenseNumber": "MD123456",
  "specialization": "Cardiology",
  "department": "Cardiology Department",
  "yearsExperience": 10,
  "education": "MD from Harvard Medical School",
  "bio": "Experienced cardiologist specializing in interventional procedures",
  "consultationFee": 200.00,
  "languages": ["English", "Spanish"],
  "certifications": [
    {
      "name": "Board Certified Cardiologist",
      "issuedBy": "American Board of Internal Medicine",
      "issuedDate": "2015-06-01",
      "expiryDate": "2025-06-01"
    }
  ]
}
```

**Required Fields:**
- `firstName` (2-50 characters)
- `lastName` (2-50 characters)
- `email` (valid email format)
- `licenseNumber` (3-50 characters, unique)
- `specialization` (2-100 characters)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Doctor created successfully",
  "data": {
    "doctor": {
      "_id": "doctor-uuid",
      "userId": "user-uuid",
      "licenseNumber": "MD123456",
      "specialization": "Cardiology",
      "firstName": "John",
      "lastName": "Smith",
      "email": "john.smith@hospital.com"
    },
    "credentials": {
      "username": "johnsmith",
      "password": "smith",
      "email": "john.smith@hospital.com"
    }
  }
}
```

### 2. Get All Doctors

**Endpoint:** `GET /api/admin/doctors`

**Description:** Retrieves all doctors with advanced filtering and pagination.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 10 | Items per page |
| `search` | string | - | Search in license, specialization, department |
| `specialization` | string | - | Filter by specialization |
| `department` | string | - | Filter by department |
| `isAvailable` | boolean | - | Filter by availability |
| `sortBy` | string | createdAt | Sort field |
| `sortOrder` | string | desc | Sort order (asc/desc) |

**Example Requests:**
```bash
# Basic request
GET /api/admin/doctors

# With filtering
GET /api/admin/doctors?specialization=cardiology&isAvailable=true&page=1&limit=20

# With search
GET /api/admin/doctors?search=john&sortBy=firstName&sortOrder=asc
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "_id": "doctor-uuid",
        "userId": {
          "firstName": "John",
          "lastName": "Smith",
          "email": "john.smith@hospital.com",
          "isActive": true
        },
        "licenseNumber": "MD123456",
        "specialization": "Cardiology",
        "isAvailable": true,
        "rating": 4.5,
        "totalReviews": 25
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalDoctors": 47,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## 🧪 Testing

### Using the Test Script

Run the comprehensive test script:

```bash
node scripts/test-admin-doctor-creation.js
```

This script tests:
- ✅ Admin login
- ✅ Doctor creation with auto user generation
- ✅ Doctor login with generated credentials
- ✅ Doctor listing and pagination
- ✅ Doctor search and filtering
- ✅ Doctor dashboard access

### Using Postman

Import the Postman collection:
```
docs/Admin_Doctor_API.postman_collection.json
```

Set environment variables:
- `base_url`: http://localhost:5000
- `admin_email`: your_admin_email
- `admin_password`: your_admin_password

### Manual Testing with cURL

```bash
# 1. Admin Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"admin123"}'

# 2. Create Doctor (replace YOUR_ADMIN_TOKEN)
curl -X POST http://localhost:5000/api/admin/doctors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@hospital.com",
    "licenseNumber": "MD789012",
    "specialization": "Neurology",
    "consultationFee": 250
  }'

# 3. Get All Doctors
curl -X GET "http://localhost:5000/api/admin/doctors?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 🔒 Security Features

- **Admin-Only Access**: Requires admin role authentication
- **Input Validation**: Comprehensive validation using express-validator
- **Unique Constraints**: Prevents duplicate emails and license numbers
- **Auto-Verification**: Admin-created accounts are pre-verified
- **Secure Credential Generation**: Predictable but secure initial passwords

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
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

**400 - Duplicate Email:**
```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

**400 - Duplicate License:**
```json
{
  "success": false,
  "message": "Doctor already exists with this license number"
}
```

**401 - Unauthorized:**
```json
{
  "success": false,
  "message": "Access denied. Admin token required."
}
```

---

## 🔄 Integration Workflow

1. **Admin Creates Doctor** → System creates user account automatically
2. **Credentials Generated** → Username: `firstname+lastname`, Password: `lastname`
3. **Doctor Receives Credentials** → Can immediately log in
4. **Doctor Accesses Dashboard** → Full access to doctor portal
5. **Admin Manages Doctors** → Search, filter, and manage all doctors

---

## 📁 File Structure

```
├── controllers/
│   └── adminDoctorController.js    # Doctor management logic
├── routes/
│   └── adminDoctors.js            # API routes
├── docs/
│   ├── ADMIN_DOCTOR_API.md        # Detailed API documentation
│   └── Admin_Doctor_API.postman_collection.json
├── scripts/
│   └── test-admin-doctor-creation.js  # Test script
└── README_ADMIN_DOCTORS.md        # This file
```

---

## 🚨 Important Notes

1. **Credential Security**: Initial passwords are based on surnames - doctors should change them after first login
2. **Unique Constraints**: Both email and license number must be unique across the system
3. **Auto-Verification**: Admin-created doctors bypass email verification
4. **Role Assignment**: All created users automatically get `role: "doctor"`
5. **Database Indexes**: Ensure proper indexing on email and licenseNumber fields for performance

---

## 🤝 Support

For issues or questions:
1. Check the comprehensive API documentation in `docs/ADMIN_DOCTOR_API.md`
2. Run the test script to verify functionality
3. Use the Postman collection for interactive testing
4. Review error responses for troubleshooting

---

## 📈 Future Enhancements

- Doctor profile updates
- Doctor deletion with cascade handling
- Bulk doctor import
- Doctor statistics and analytics
- Advanced role permissions
- Password reset functionality
