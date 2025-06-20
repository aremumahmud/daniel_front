# Patient User Management - Complete Guide

## Overview

This guide covers the enhanced patient management system that automatically creates user accounts for patients and binds them to patient records. When an admin creates a patient, a user account is automatically generated with login credentials.

## Key Features

✅ **Automatic User Creation**: User accounts are created automatically when patients are added  
✅ **Credential Generation**: Username and password are auto-generated based on patient name  
✅ **Account Binding**: Patient records are linked to user accounts via `userId`  
✅ **Admin Management**: Full CRUD operations for patient management  
✅ **Comprehensive Viewing**: Advanced filtering and search capabilities  

## Credential Generation Rules

### Username Format
```
firstname + lastname (lowercase, no spaces)
```
**Example**: John Doe → `johndoe`

### Password Format
```
lastname (lowercase)
```
**Example**: John Doe → `doe`

### Account Settings
- **Role**: Automatically set to "patient"
- **Email**: Uses patient's email address
- **Status**: Auto-verified and active
- **Permissions**: Standard patient portal access

## Quick Start

### 1. Create Your First Patient

```bash
# Login as admin
curl -X POST http://localhost:8080/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@healthcare.com",
    "password": "admin123",
    "adminCode": "ADMIN2024!@#"
  }'

# Create patient (use the token from login response)
curl -X POST http://localhost:8080/api/admin/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d @docs/sample-patient-data.json
```

### 2. Response with Generated Credentials

```json
{
  "success": true,
  "message": "Patient created successfully with user account",
  "data": {
    "patient": {
      "id": "patient-uuid",
      "userId": "user-uuid",
      "firstName": "Sarah",
      "lastName": "Johnson",
      "emailAddress": "sarah.johnson@email.com",
      "phoneNumber": "+15551234567",
      "dateOfBirth": "1985-03-22T00:00:00.000Z",
      "gender": "female",
      "bloodType": "A+",
      "createdAt": "2024-01-20T14:30:00.000Z"
    },
    "credentials": {
      "username": "sarahjohnson",
      "password": "johnson",
      "email": "sarah.johnson@email.com",
      "note": "These credentials have been automatically generated for the patient"
    }
  }
}
```

### 3. Test Patient Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah.johnson@email.com",
    "password": "johnson"
  }'
```

## Managing Existing Patients

### Update Existing Patients with User Accounts

If you have existing patients without user accounts, use the migration script:

```bash
# See what would be created (dry run)
node scripts/create-patient-users.js --dry-run

# Actually create the user accounts
node scripts/create-patient-users.js
```

### Script Output Example
```
🏥 Patient User Account Creation Script

🔍 Finding patients without user accounts...
📊 Found 25 patients without user accounts

🚀 Processing patients...

[1/25] Processing: John Smith
  ✅ User account created successfully
     User ID: user-uuid-1
     Username: johnsmith
     Password: smith
     Email: john.smith@email.com

[2/25] Processing: Mary Wilson
  ✅ User account created successfully
     User ID: user-uuid-2
     Username: marywilson
     Password: wilson
     Email: mary.wilson@email.com

📋 SUMMARY
✅ Successful: 23
❌ Failed: 2
⚠️  Skipped: 0
```

## Viewing and Managing Patients

### 1. List All Patients

```bash
curl -X GET "http://localhost:8080/api/admin/patients?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 2. Search and Filter Patients

```bash
# Search by name
curl -X GET "http://localhost:8080/api/admin/patients?search=john" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Filter by gender and blood type
curl -X GET "http://localhost:8080/api/admin/patients?gender=female&bloodType=A+" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Filter by department
curl -X GET "http://localhost:8080/api/admin/patients?department=cardiology" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. Get Patient Details

```bash
curl -X GET "http://localhost:8080/api/admin/patients/PATIENT_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 4. Get Patient Statistics

```bash
curl -X GET "http://localhost:8080/api/admin/patients/statistics" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Testing the System

### Automated Testing

```bash
# Test patient creation and user binding
node scripts/test-patient-creation.js

# Test admin profile functionality
node scripts/test-admin-me.js

# Test admin login functionality
node scripts/admin-login.js test-login
```

### Manual Testing Steps

1. **Create Admin Account**
   ```bash
   node scripts/admin-login.js create-admin
   ```

2. **Login as Admin**
   ```bash
   node scripts/admin-login.js test-login
   ```

3. **Create Test Patient**
   ```bash
   node scripts/test-patient-creation.js
   ```

4. **View Patients**
   - Use Postman collection: `docs/Admin_Patient_API.postman_collection.json`
   - Or use cURL commands from the documentation

## Frontend Integration

### React Component Example

```jsx
import React, { useState } from 'react';

const CreatePatient = () => {
  const [patientData, setPatientData] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    // ... other fields
  });
  const [credentials, setCredentials] = useState(null);

  const createPatient = async () => {
    try {
      const response = await fetch('/api/admin/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(patientData)
      });

      const result = await response.json();
      
      if (result.success) {
        setCredentials(result.data.credentials);
        alert('Patient created successfully!');
      }
    } catch (error) {
      console.error('Error creating patient:', error);
    }
  };

  return (
    <div>
      <h2>Create New Patient</h2>
      
      {/* Patient form fields */}
      <form onSubmit={(e) => { e.preventDefault(); createPatient(); }}>
        <input
          type="text"
          placeholder="First Name"
          value={patientData.firstName}
          onChange={(e) => setPatientData({...patientData, firstName: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={patientData.lastName}
          onChange={(e) => setPatientData({...patientData, lastName: e.target.value})}
          required
        />
        {/* Add more fields as needed */}
        
        <button type="submit">Create Patient</button>
      </form>

      {/* Display generated credentials */}
      {credentials && (
        <div className="credentials-display">
          <h3>Generated Login Credentials</h3>
          <p><strong>Username:</strong> {credentials.username}</p>
          <p><strong>Password:</strong> {credentials.password}</p>
          <p><strong>Email:</strong> {credentials.email}</p>
          <p><em>{credentials.note}</em></p>
        </div>
      )}
    </div>
  );
};

export default CreatePatient;
```

## Security Best Practices

### 1. Credential Management
- ✅ Store generated credentials securely
- ✅ Inform patients of their login details via secure channels
- ✅ Encourage password changes on first login
- ✅ Implement password reset functionality

### 2. Access Control
- ✅ Admin-only patient creation
- ✅ JWT token validation
- ✅ Role-based permissions
- ✅ Audit logging for all operations

### 3. Data Protection
- ✅ Input validation and sanitization
- ✅ Encrypted password storage
- ✅ HTTPS for all communications
- ✅ Rate limiting on API endpoints

## Troubleshooting

### Common Issues

1. **Patient Creation Fails**
   - Check if email already exists
   - Verify all required fields are provided
   - Ensure admin token is valid

2. **User Account Not Created**
   - Check server logs for errors
   - Verify database connectivity
   - Ensure User model is properly imported

3. **Patient Login Fails**
   - Verify credentials are correct
   - Check if user account was created
   - Ensure user is active and verified

### Debug Commands

```bash
# Check if patient has user account
curl -X GET "http://localhost:8080/api/admin/patients/PATIENT_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq '.data.patient.userId'

# Test patient login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@email.com","password":"lastname"}'
```

## Documentation References

- **API Documentation**: `docs/ADMIN_PATIENT_API.md`
- **Viewing Patients**: `docs/ADMIN_VIEW_PATIENTS_API.md`
- **Admin Profile**: `docs/ADMIN_ME_API.md`
- **Quick Start**: `docs/ADMIN_PATIENT_QUICK_START.md`
- **Postman Collections**: `docs/Admin_Patient_API.postman_collection.json`

## Support Scripts

- **Patient Creation Test**: `scripts/test-patient-creation.js`
- **User Migration**: `scripts/create-patient-users.js`
- **Admin Management**: `scripts/admin-login.js`
- **API Testing**: `scripts/test-admin-me.js`

---

## Summary

The enhanced patient management system now provides:

1. **Automatic user account creation** for all new patients
2. **Standardized credential generation** based on patient names
3. **Seamless account binding** between patients and users
4. **Migration tools** for existing patients
5. **Comprehensive viewing and management** capabilities
6. **Complete testing suite** for validation

This system ensures that every patient has login access to the patient portal while maintaining security and administrative control.
