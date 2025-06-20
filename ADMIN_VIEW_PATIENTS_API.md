# Admin Patient Viewing API Documentation

## Overview

This API provides comprehensive patient viewing and management capabilities for administrators. It includes advanced filtering, searching, pagination, and detailed patient information retrieval with user account binding.

## Authentication

**Required:**
- **Bearer Token Authentication**: Include `Authorization: Bearer <admin_token>` in headers
- **Admin Role**: Only users with `role: "admin"` can access these endpoints

## Base URL
```
/api/admin/patients
```

---

## 1. Get All Patients with Filtering

### Endpoint
```http
GET /api/admin/patients
```

### Description
Retrieves a paginated list of all patients with advanced filtering and search capabilities. Each patient record includes their linked user account information.

### Headers
```http
Authorization: Bearer <admin_token>
Content-Type: application/json
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | string | - | Search by name, email, or phone number |
| `gender` | string | - | Filter by gender (`male`, `female`, `other`) |
| `bloodType` | string | - | Filter by blood type (`O+`, `O-`, `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`) |
| `department` | string | - | Filter by admission department (`cardiology`, `neurology`, `pediatrics`, `other`) |
| `isActive` | boolean | - | Filter by active status (`true`, `false`) |
| `limit` | integer | 20 | Number of patients per page (max 100) |
| `offset` | integer | 0 | Number of patients to skip |
| `sortBy` | string | `createdAt` | Field to sort by |
| `sortOrder` | string | `desc` | Sort order (`asc`, `desc`) |

### Example Requests

#### Basic Request
```bash
curl -X GET "http://localhost:8080/api/admin/patients" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Advanced Filtering
```bash
curl -X GET "http://localhost:8080/api/admin/patients?search=john&gender=male&bloodType=O+&limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Search by Department
```bash
curl -X GET "http://localhost:8080/api/admin/patients?department=cardiology&isActive=true" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "_id": "patient-uuid-1",
        "userId": "user-uuid-1",
        "firstName": "John",
        "lastName": "Doe",
        "emailAddress": "john.doe@email.com",
        "phoneNumber": "+1234567890",
        "dateOfBirth": "1990-01-15T00:00:00.000Z",
        "gender": "male",
        "bloodType": "O+",
        "admission": {
          "department": "cardiology"
        },
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00.000Z",
        
      },
      {
        "_id": "patient-uuid-2",
        "userId": "user-uuid-2",
        "firstName": "Sarah",
        "lastName": "Johnson",
        "emailAddress": "sarah.johnson@email.com",
        "phoneNumber": "+1234567891",
        "dateOfBirth": "1985-03-22T00:00:00.000Z",
        "gender": "female",
        "bloodType": "A+",
        "admission": {
          "department": "neurology"
        },
        "isActive": true,
        "createdAt": "2024-01-20T14:30:00.000Z",
        
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 20,
      "offset": 0,
      "pages": 8
    }
  }
}
```

---

## 2. Get Patient Details by ID

### Endpoint
```http
GET /api/admin/patients/:id
```

### Description
Retrieves comprehensive details for a specific patient, including all medical history, vital signs, test results, and linked user account information.

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Patient ID |

### Example Request
```bash
curl -X GET "http://localhost:8080/api/admin/patients/patient-uuid-1" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "patient": {
      "_id": "patient-uuid-1",
      "userId": "user-uuid-1",
      
      // Demographics
      "firstName": "John",
      "lastName": "Doe",
      "middleName": "Michael",
      "dateOfBirth": "1990-01-15T00:00:00.000Z",
      "gender": "male",
      "maritalStatus": "single",
      "nationality": "American",
      "languageSpoken": "English",
      "bloodType": "O+",
      "religion": "Christianity",
      "occupation": "Software Engineer",
      
      // Contact Information
      "phoneNumber": "+1234567890",
      "emailAddress": "john.doe@email.com",
      "homeAddress": "123 Main St, City, State 12345",
      "emergencyContact": {
        "name": "Jane Doe",
        "phone": "+1234567891",
        "relationship": "spouse"
      },
      
      // Insurance & Billing
      "insurance": {
        "provider": "Blue Cross Blue Shield",
        "policyNumber": "BC123456789",
        "paymentType": "insurance",
        "billingAddress": "123 Billing St, City, State 12345"
      },
      
      // Medical History
      "medicalHistory": {
        "chronicIllnesses": ["Diabetes", "Hypertension"],
        "allergies": ["Penicillin", "Peanuts"],
        "pastSurgeries": ["Appendectomy"],
        "currentMedications": ["Metformin 500mg"],
        "familyHistory": "Father had heart disease",
        "smokingStatus": "never",
        "alcoholConsumption": "occasional",
        "vaccinationHistory": "COVID-19, Flu shot 2023"
      },
      
      // Admission & Visits
      "admission": {
        "dateOfAdmission": "2024-01-15T10:00:00.000Z",
        "doctorAssigned": "Dr. Smith",
        "department": "cardiology",
        "symptomsComplaints": "Chest pain and shortness of breath",
        "provisionalDiagnosis": "Possible angina",
        "labTestsOrdered": ["ECG", "Blood work"],
        "medicationsPrescribed": "Aspirin 81mg daily",
        "proceduresPerformed": ["ECG"],
        "treatmentPlan": "Monitor symptoms, follow-up in 1 week",
        "followUpDate": "2024-01-22T00:00:00.000Z"
      },
      
      // Enhanced Vital Signs
      "enhancedVitalSigns": {
        "temperature": 36.5,
        "bloodPressure": "120/80",
        "heartRate": 72,
        "respiratoryRate": 16,
        "oxygenSaturation": 98,
        "weight": 70.5,
        "height": 1.75
      },
      
      // Test Results
      "testResults": [
        {
          "testName": "Complete Blood Count",
          "testDate": "2024-01-15T00:00:00.000Z",
          "testResult": "Normal ranges",
          "doctorComments": "All values within normal limits"
        }
      ],
      
      // Discharge Summary
      "dischargeSummary": {
        "dischargeDate": "2024-01-20T00:00:00.000Z",
        "finalDiagnosis": "Stable angina",
        "medicationsForHome": "Aspirin 81mg daily, Metoprolol 25mg twice daily",
        "dischargeInstructions": "Rest, avoid strenuous activity, follow-up in 1 week",
        "nextFollowUp": "2024-01-27T00:00:00.000Z"
      },
      
      // Documents
      "documents": {
        "scannedIdCard": "/uploads/id-cards/patient-123-id.pdf",
        "labTestReports": ["/uploads/lab-reports/patient-123-cbc.pdf"],
        "imagingReports": ["/uploads/imaging/patient-123-xray.pdf"]
      },
      
      // System fields
      "createdBy": "admin-user-id",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

## 3. Get Patient Statistics

### Endpoint
```http
GET /api/admin/patients/statistics
```

### Description
Retrieves comprehensive statistics about patients in the system, including demographics distribution and overview metrics.

### Example Request
```bash
curl -X GET "http://localhost:8080/api/admin/patients/statistics" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalPatients": 1250,
      "totalInactivePatients": 45,
      "activePatients": 1205
    },
    "distributions": {
      "gender": [
        { "_id": "male", "count": 620 },
        { "_id": "female", "count": 585 },
        { "_id": "other", "count": 45 }
      ],
      "bloodType": [
        { "_id": "O+", "count": 450 },
        { "_id": "A+", "count": 320 },
        { "_id": "B+", "count": 180 },
        { "_id": "AB+", "count": 90 },
        { "_id": "O-", "count": 85 },
        { "_id": "A-", "count": 70 },
        { "_id": "B-", "count": 35 },
        { "_id": "AB-", "count": 20 }
      ],
      "department": [
        { "_id": "cardiology", "count": 420 },
        { "_id": "neurology", "count": 380 },
        { "_id": "pediatrics", "count": 250 },
        { "_id": "other", "count": 200 }
      ]
    }
  }
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "User role patient is not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Patient not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server error occurred"
}
```

---

## JavaScript Examples

### Fetch All Patients with Filtering
```javascript
const fetchPatients = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`/api/admin/patients?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Patients:', data.data.patients);
      console.log('Total:', data.data.pagination.total);
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
};

// Usage examples
fetchPatients({ search: 'john', gender: 'male', limit: 10 });
fetchPatients({ department: 'cardiology', isActive: true });
fetchPatients({ bloodType: 'O+', sortBy: 'lastName', sortOrder: 'asc' });
```

### Fetch Patient Details
```javascript
const fetchPatientDetails = async (patientId) => {
  try {
    const response = await fetch(`/api/admin/patients/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (data.success) {
      return data.data.patient;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching patient details:', error);
    throw error;
  }
};
```

### Fetch Patient Statistics
```javascript
const fetchPatientStatistics = async () => {
  try {
    const response = await fetch('/api/admin/patients/statistics', {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};
```

---

## React Component Examples

### Patient List Component
```jsx
import React, { useState, useEffect } from 'react';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    gender: '',
    bloodType: '',
    department: '',
    limit: 20,
    offset: 0
  });
  const [pagination, setPagination] = useState({});

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(
        Object.entries(filters).filter(([_, value]) => value !== '')
      ).toString();
      
      const response = await fetch(`/api/admin/patients?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setPatients(data.data.patients);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, offset: 0 }));
  };

  const handlePageChange = (newOffset) => {
    setFilters(prev => ({ ...prev, offset: newOffset }));
  };

  if (loading) return <div>Loading patients...</div>;

  return (
    <div className="patient-list">
      <h2>Patient Management</h2>
      
      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search patients..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        
        <select
          value={filters.gender}
          onChange={(e) => handleFilterChange('gender', e.target.value)}
        >
          <option value="">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        
        <select
          value={filters.bloodType}
          onChange={(e) => handleFilterChange('bloodType', e.target.value)}
        >
          <option value="">All Blood Types</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
        </select>
      </div>

      {/* Patient Table */}
      <table className="patient-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Gender</th>
            <th>Blood Type</th>
            <th>Department</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(patient => (
            <tr key={patient._id}>
              <td>{patient.firstName} {patient.lastName}</td>
              <td>{patient.emailAddress}</td>
              <td>{patient.phoneNumber}</td>
              <td>{patient.gender}</td>
              <td>{patient.bloodType}</td>
              <td>{patient.admission?.department}</td>
              <td>{patient.isActive ? 'Active' : 'Inactive'}</td>
              <td>
                <button onClick={() => viewPatient(patient._id)}>
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={filters.offset === 0}
          onClick={() => handlePageChange(Math.max(0, filters.offset - filters.limit))}
        >
          Previous
        </button>
        
        <span>
          Page {Math.floor(filters.offset / filters.limit) + 1} of {pagination.pages}
        </span>
        
        <button
          disabled={filters.offset + filters.limit >= pagination.total}
          onClick={() => handlePageChange(filters.offset + filters.limit)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PatientList;
```

---

## Key Features

### 1. **User Account Binding**
- Each patient is automatically linked to a user account
- Username: `firstname + lastname` (lowercase)
- Password: `lastname` (lowercase)
- Auto-verified email for admin-created patients

### 2. **Advanced Filtering**
- Search by name, email, or phone number
- Filter by gender, blood type, department
- Filter by active/inactive status
- Sortable by any field

### 3. **Comprehensive Data**
- Complete patient demographics
- Medical history and vital signs
- Test results and discharge summaries
- Insurance and billing information
- Digital document references

### 4. **Pagination Support**
- Configurable page size (max 100)
- Offset-based pagination
- Total count and page information

### 5. **Statistics Dashboard**
- Patient count overview
- Gender distribution
- Blood type distribution
- Department distribution

---

## Security Notes

- ✅ Admin-only access enforced
- ✅ JWT token validation
- ✅ Input sanitization and validation
- ✅ Rate limiting applied
- ✅ Audit logging for all operations

## Performance Considerations

- Use pagination for large datasets
- Implement caching for statistics
- Index frequently queried fields
- Consider virtual scrolling for large lists

## Patient User Account Creation

### Automatic User Creation
When an admin creates a new patient, a user account is automatically generated:

```json
{
  "success": true,
  "message": "Patient created successfully with user account",
  "data": {
    "patient": { /* patient data */ },
    "credentials": {
      "username": "johndoe",
      "password": "doe",
      "email": "john.doe@email.com",
      "note": "These credentials have been automatically generated for the patient"
    }
  }
}
```

### Credential Generation Rules
- **Username**: `firstname + lastname` (lowercase, no spaces)
- **Password**: `lastname` (lowercase)
- **Email**: Patient's email address
- **Role**: Automatically set to "patient"
- **Status**: Auto-verified and active

### Update Existing Patients
To create user accounts for existing patients without them:

```bash
# Dry run to see what would be created
node scripts/create-patient-users.js --dry-run

# Actually create the user accounts
node scripts/create-patient-users.js
```

## Troubleshooting

### Common Issue: E11000 Duplicate Key Error

If you encounter this error when creating patients:
```
E11000 duplicate key error collection: test.patients index: userId_1 dup key: { userId: null }
```

**Quick Fix:**
```bash
# Run the index fix script
node scripts/fix-patient-userid-index.js

# Then test patient creation
node scripts/test-patient-creation.js
```

**Root Cause**: The `userId` field has a unique index that doesn't properly handle `null` values.

**Solution**: The fix script will drop the problematic index and create a proper sparse unique index.

For detailed troubleshooting, see: `docs/TROUBLESHOOTING_PATIENT_CREATION.md`

## Related Scripts

- `scripts/create-patient-users.js` - Create user accounts for existing patients
- `scripts/fix-patient-userid-index.js` - Fix database index issues
- `scripts/test-patient-creation.js` - Test patient creation functionality
- `scripts/admin-login.js` - Admin account management
- `scripts/test-admin-me.js` - API testing utilities
