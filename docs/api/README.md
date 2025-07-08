# Healthcare Management System API Documentation

## Overview
This documentation covers the comprehensive API endpoints for the Healthcare Management System, including Queue Management and Enhanced Patient Management features.

## 📚 Documentation Structure

### Core API Documentation
- **[Queue Management API](./queue-management-api.md)** - Complete queue operations, doctor assignments, and real-time updates
- **[Patient Management API](./patient-management-api.md)** - Comprehensive patient data, health metrics, appointments, and communications

### Quick Reference
- **Base URL**: `http://localhost:3000/api`
- **Authentication**: JWT Bearer tokens required for all endpoints
- **Content Type**: `application/json` for all requests
- **Response Format**: Consistent JSON structure with `success`, `message`, and `data` fields

## 🔐 Authentication

All API endpoints require authentication via JWT tokens. Include the token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### Getting Authentication Token
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "role": "patient",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

## 🏥 API Endpoints Overview

### Queue Management System (`/api/queue`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/status` | Get current queue status | Admin, Doctor |
| POST | `/add-patient` | Add patient to queue | Admin, Doctor, Patient |
| POST | `/auto-assign` | Auto-assign patients to doctors | Admin |
| POST | `/assign-patient` | Manually assign patient to doctor | Admin, Doctor |
| PUT | `/:queueId/status` | Update queue entry status | Admin, Doctor |
| GET | `/available-doctors` | Get available doctors | Admin, Doctor |
| PUT | `/doctor-capacity` | Update doctor capacity | Doctor |
| GET | `/analytics` | Get queue analytics | Admin |
| GET | `/settings` | Get queue settings | Admin |
| PUT | `/settings` | Update queue settings | Admin |

### Enhanced Patient Management (`/api/patient`)

#### Health Metrics
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/health-metrics` | Add health metric | Patient, Doctor, Admin |
| GET | `/health-metrics` | Get health metrics | Patient, Doctor, Admin |
| GET | `/health-metrics/analytics` | Get health analytics | Patient, Doctor, Admin |
| PUT | `/health-metrics/:id` | Update health metric | Patient, Doctor, Admin |
| DELETE | `/health-metrics/:id` | Delete health metric | Patient, Doctor, Admin |

#### Medical Records
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/medical-records` | Get medical records | Patient, Doctor, Admin |
| GET | `/medical-records/:id` | Get specific medical record | Patient, Doctor, Admin |

#### Appointments
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/appointments/history` | Get appointment history | Patient, Doctor, Admin |
| PUT | `/appointments/:id/cancel` | Cancel appointment | Patient, Doctor, Admin |
| PUT | `/appointments/:id/reschedule` | Reschedule appointment | Patient, Doctor, Admin |
| GET | `/doctors/available` | Get available doctors | Patient, Doctor, Admin |

#### Documents
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/documents` | Upload document | Patient, Doctor, Admin |
| GET | `/documents` | Get documents | Patient, Doctor, Admin |
| DELETE | `/documents/:id` | Delete document | Patient, Doctor, Admin |

#### Communications
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/communications` | Send message | Patient |
| GET | `/communications` | Get communications | Patient, Doctor, Admin |

#### Summary
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/summary` | Get patient summary | Patient, Doctor, Admin |

## 🔄 Real-time Features

### WebSocket Connection
Connect to WebSocket for real-time updates:
```javascript
const socket = io('http://localhost:3000');

// Join queue updates room
socket.emit('join_queue_room');

// Listen for queue updates
socket.on('queue_updated', (data) => {
  console.log('Queue updated:', data);
});

// Listen for patient assignments
socket.on('patient_assigned', (data) => {
  console.log('Patient assigned:', data);
});
```

### WebSocket Events

#### Server-to-Client Events
- `queue_updated` - Queue status changed
- `patient_assigned` - Patient assigned to doctor
- `doctor_status_changed` - Doctor availability changed
- `queue_position_updated` - Patient position in queue changed
- `appointment_reminder` - Appointment reminder notification
- `new_message` - New communication message received

#### Client-to-Server Events
- `join_queue_room` - Join queue updates room
- `doctor_status_update` - Update doctor status
- `queue_refresh` - Request queue refresh

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": [
      {
        "field": "fieldName",
        "message": "Field-specific error message"
      }
    ]
  }
}
```

### Pagination Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalRecords": 100,
      "hasNext": true,
      "hasPrev": false,
      "limit": 20
    }
  }
}
```

## 🚦 HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful GET, PUT requests |
| 201 | Created | Successful POST requests |
| 204 | No Content | Successful DELETE requests |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (duplicate data) |
| 413 | Payload Too Large | File upload size exceeded |
| 422 | Unprocessable Entity | Business logic validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## 🔒 Role-Based Access Control

### User Roles
- **Patient**: Can manage own data, book appointments, communicate with doctors
- **Doctor**: Can view assigned patients, manage queue, access medical records
- **Admin**: Full system access, queue management, analytics, settings

### Permission Matrix

| Feature | Patient | Doctor | Admin |
|---------|---------|--------|-------|
| View own health metrics | ✅ | ✅ | ✅ |
| Add health metrics | ✅ | ✅ | ✅ |
| View queue status | ❌ | ✅ | ✅ |
| Manage queue | ❌ | ✅ | ✅ |
| Auto-assign patients | ❌ | ❌ | ✅ |
| View analytics | ❌ | ❌ | ✅ |
| Manage settings | ❌ | ❌ | ✅ |
| Upload documents | ✅ | ✅ | ✅ |
| Send messages | ✅ | ✅ | ✅ |
| Cancel appointments | ✅ | ✅ | ✅ |

## 📈 Rate Limiting

### Default Limits
- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 login attempts per 15 minutes
- **File Uploads**: 10 uploads per hour
- **Communications**: 50 messages per hour
- **Analytics**: 20 requests per hour
- **Auto-assignment**: 10 requests per minute

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642694400
```

## 🧪 Testing the API

### Using cURL
```bash
# Get authentication token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Use token for authenticated requests
curl -X GET http://localhost:3000/api/patient/summary \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman
1. Import the API collection (if available)
2. Set up environment variables for base URL and token
3. Use the authentication endpoint to get a token
4. Set the token in the Authorization header for subsequent requests

### Using JavaScript/Fetch
```javascript
// Get authentication token
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { data } = await loginResponse.json();
const token = data.token;

// Use token for authenticated requests
const response = await fetch('/api/patient/summary', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const patientData = await response.json();
```

## 🔧 Development Setup

### Environment Variables
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/healthcare_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
UPLOAD_MAX_SIZE=10485760
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Starting the Server
```bash
# Install dependencies
npm install

# Setup database
npm run setup-db:reset

# Start development server
npm run dev

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📞 Support

For API support and questions:
1. Check the specific endpoint documentation
2. Review the error response codes and messages
3. Test with the provided examples
4. Check the test files for usage patterns

## 🔄 API Versioning

Current API version: **v1**

All endpoints are prefixed with `/api/` and are considered version 1. Future versions will be available at `/api/v2/`, etc.

## 📋 Changelog

### Version 1.0.0 (Current)
- Initial release with Queue Management System
- Enhanced Patient Management features
- Real-time WebSocket support
- Comprehensive authentication and authorization
- File upload and document management
- Health metrics tracking and analytics
- Communication system between patients and doctors
