# Admin Patient Management API Documentation

## Overview

This API provides comprehensive patient management functionality exclusively for administrators. It includes enhanced patient data collection with detailed medical history, vital signs, admission details, and document management.

## Authentication

All endpoints require:
- **Bearer Token Authentication**: Include `Authorization: Bearer <token>` in headers
- **Admin Role**: Only users with `role: "admin"` can access these endpoints

## Base URL

```
POST /api/admin/patients
```

## Create New Patient

### Endpoint
```http
POST /api/admin/patients
```

### Description
Creates a new patient record with comprehensive medical and personal information. This endpoint is restricted to administrators only and provides extensive data collection capabilities beyond standard patient registration.

### Headers
```http
Content-Type: application/json
Authorization: Bearer <admin_jwt_token>
```

### Request Body Schema

The request body must include the following sections:

#### Section 1: Patient Demographics (Required)
```json
{
  "firstName": "string (required, max 50 chars)",
  "lastName": "string (required, max 50 chars)", 
  "middleName": "string (optional, max 50 chars)",
  "dateOfBirth": "ISO 8601 date (required)",
  "gender": "enum: male|female|other (required)",
  "maritalStatus": "enum: single|married|divorced|widowed (required)",
  "nationality": "string (required)",
  "languageSpoken": "string (required)",
  "bloodType": "enum: O+|O-|A+|A-|B+|B-|AB+|AB- (required)",
  "religion": "string (optional)",
  "occupation": "string (optional)"
}
```

#### Section 2: Contact Information (Required)
```json
{
  "phoneNumber": "string (required, E.164 format)",
  "emailAddress": "string (required, valid email)",
  "homeAddress": "string (required)",
  "emergencyContact": {
    "name": "string (required)",
    "phone": "string (required, E.164 format)",
    "relationship": "enum: spouse|parent|sibling|friend|other (required)"
  }
}
```

#### Section 3: Insurance & Billing (Required)
```json
{
  "insurance": {
    "provider": "string (required)",
    "policyNumber": "string (required)",
    "paymentType": "enum: insurance|cash|creditCard|other (required)",
    "billingAddress": "string (optional)"
  }
}
```

#### Section 4: Medical History (Required)
```json
{
  "medicalHistory": {
    "chronicIllnesses": ["string array (optional)"],
    "allergies": ["string array (optional)"],
    "pastSurgeries": ["string array (optional)"],
    "currentMedications": ["string array (optional)"],
    "familyHistory": "string (optional)",
    "smokingStatus": "enum: never|formerSmoker|currentSmoker (required)",
    "alcoholConsumption": "enum: none|occasional|frequent (required)",
    "vaccinationHistory": "string (optional)"
  }
}
```

#### Section 5: Admission & Visits (Required)
```json
{
  "admission": {
    "dateOfAdmission": "ISO 8601 datetime (required)",
    "doctorAssigned": "string (required)",
    "department": "enum: cardiology|neurology|pediatrics|other (required)",
    "symptomsComplaints": "string (required)",
    "provisionalDiagnosis": "string (required)",
    "labTestsOrdered": ["string array (optional)"],
    "medicationsPrescribed": "string (optional)",
    "proceduresPerformed": ["string array (optional)"],
    "treatmentPlan": "string (required)",
    "followUpDate": "ISO 8601 date (optional)"
  }
}
```

#### Section 6: Vital Signs (Required)
```json
{
  "vitalSigns": {
    "temperature": "number (required, 30-50°C)",
    "bloodPressure": "string (required, format: XXX/XX)",
    "heartRate": "integer (required, 30-250 bpm)",
    "respiratoryRate": "integer (required, 5-60 breaths/min)",
    "oxygenSaturation": "integer (required, 70-100%)",
    "weight": "number (required, 0.5-500 kg)",
    "height": "number (required, 0.3-3 m)"
  }
}
```

#### Section 7: Test Results (Optional)
```json
{
  "testResults": [
    {
      "testName": "string (required if section included)",
      "testDate": "ISO 8601 date (required if section included)",
      "testResult": "string (required if section included)",
      "doctorComments": "string (required if section included)"
    }
  ]
}
```

#### Section 8: Discharge Summary (Optional)
```json
{
  "dischargeSummary": {
    "dischargeDate": "ISO 8601 date (optional)",
    "finalDiagnosis": "string (optional)",
    "medicationsForHome": "string (optional)",
    "dischargeInstructions": "string (optional)",
    "nextFollowUp": "ISO 8601 date (optional)"
  }
}
```

#### Section 9: Digital Documents (Optional)
```json
{
  "documents": {
    "scannedIdCard": "string (optional, file path/URL)",
    "labTestReports": ["string array (optional, file paths/URLs)"],
    "imagingReports": ["string array (optional, file paths/URLs)"]
  }
}
```

### Complete Example Request

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "Michael",
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "maritalStatus": "single",
  "nationality": "American",
  "languageSpoken": "English",
  "bloodType": "O+",
  "religion": "Christianity",
  "occupation": "Software Engineer",
  
  "phoneNumber": "+1234567890",
  "emailAddress": "john.doe@email.com",
  "homeAddress": "123 Main St, City, State 12345",
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "+1234567891",
    "relationship": "spouse"
  },
  
  "insurance": {
    "provider": "Blue Cross Blue Shield",
    "policyNumber": "BC123456789",
    "paymentType": "insurance",
    "billingAddress": "123 Billing St, City, State 12345"
  },
  
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
  
  "admission": {
    "dateOfAdmission": "2024-01-15T10:00:00Z",
    "doctorAssigned": "Dr. Smith",
    "department": "cardiology",
    "symptomsComplaints": "Chest pain and shortness of breath",
    "provisionalDiagnosis": "Possible angina",
    "labTestsOrdered": ["ECG", "Blood work"],
    "medicationsPrescribed": "Aspirin 81mg daily",
    "proceduresPerformed": ["ECG"],
    "treatmentPlan": "Monitor symptoms, follow-up in 1 week",
    "followUpDate": "2024-01-22"
  },
  
  "vitalSigns": {
    "temperature": 36.5,
    "bloodPressure": "120/80",
    "heartRate": 72,
    "respiratoryRate": 16,
    "oxygenSaturation": 98,
    "weight": 70.5,
    "height": 1.75
  },
  
  "testResults": [
    {
      "testName": "Complete Blood Count",
      "testDate": "2024-01-15",
      "testResult": "Normal ranges",
      "doctorComments": "All values within normal limits"
    }
  ],
  
  "dischargeSummary": {
    "dischargeDate": "2024-01-20",
    "finalDiagnosis": "Stable angina",
    "medicationsForHome": "Aspirin 81mg daily, Metoprolol 25mg twice daily",
    "dischargeInstructions": "Rest, avoid strenuous activity, follow-up in 1 week",
    "nextFollowUp": "2024-01-27"
  },
  
  "documents": {
    "scannedIdCard": "/uploads/id-cards/patient-123-id.pdf",
    "labTestReports": ["/uploads/lab-reports/patient-123-cbc.pdf"],
    "imagingReports": ["/uploads/imaging/patient-123-xray.pdf"]
  }
}
```

### Response Examples

#### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Patient created successfully",
  "data": {
    "patient": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "John",
      "lastName": "Doe",
      "emailAddress": "john.doe@email.com",
      "phoneNumber": "+1234567890",
      "dateOfBirth": "1990-01-15T00:00:00.000Z",
      "gender": "male",
      "bloodType": "O+",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### Validation Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "First name is required and must be between 1-50 characters",
      "path": "firstName",
      "location": "body"
    },
    {
      "type": "field",
      "value": "invalid-email",
      "msg": "Please enter a valid email address",
      "path": "emailAddress",
      "location": "body"
    }
  ]
}
```

#### Patient Already Exists (400 Bad Request)
```json
{
  "success": false,
  "message": "Patient with this email already exists"
}
```

#### Unauthorized Access (401 Unauthorized)
```json
{
  "success": false,
  "message": "Not authorized, token failed"
}
```

#### Forbidden Access (403 Forbidden)
```json
{
  "success": false,
  "message": "User role patient is not authorized to access this route"
}
```

#### Server Error (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Error creating patient",
  "error": "Database connection failed"
}
```

## Field Validation Rules

### Required Fields
- All fields marked as "required" in the schema must be provided
- Empty strings or null values will trigger validation errors

### Data Type Validation
- **Dates**: Must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
- **Numbers**: Must be within specified ranges
- **Enums**: Must match exactly one of the allowed values
- **Arrays**: Must be valid JSON arrays
- **Email**: Must be a valid email format
- **Phone**: Must follow E.164 international format

### String Length Limits
- Names: 1-50 characters
- Addresses: No specific limit but reasonable length expected
- Text fields: Reasonable length for medical documentation

### Numeric Ranges
- **Temperature**: 30-50°C
- **Heart Rate**: 30-250 bpm
- **Respiratory Rate**: 5-60 breaths/min
- **Oxygen Saturation**: 70-100%
- **Weight**: 0.5-500 kg
- **Height**: 0.3-3 m

## Security Considerations

1. **Admin-Only Access**: This endpoint is restricted to users with admin role
2. **Token Validation**: JWT tokens are validated for authenticity and expiration
3. **Input Sanitization**: All input data is sanitized to prevent injection attacks
4. **Rate Limiting**: API calls are rate-limited to prevent abuse
5. **Audit Logging**: All patient creation activities are logged with admin user ID

## Error Handling

The API implements comprehensive error handling:
- **Validation Errors**: Detailed field-level validation messages
- **Authentication Errors**: Clear unauthorized access messages
- **Database Errors**: Graceful handling of database connectivity issues
- **Duplicate Prevention**: Checks for existing patients by email address

## Usage Notes

1. **Email Uniqueness**: Each patient must have a unique email address
2. **System Fields**: `createdBy`, `createdAt`, `updatedAt`, and `isActive` are automatically managed
3. **Optional Sections**: Test results, discharge summary, and documents are optional
4. **Date Handling**: All dates are stored in UTC and should be provided in ISO 8601 format
5. **File References**: Document fields should contain file paths or URLs to uploaded files

## Related Endpoints

- `GET /api/admin/patients` - List all patients with filtering
- `GET /api/admin/patients/:id` - Get patient details
- `PUT /api/admin/patients/:id` - Update patient information
- `DELETE /api/admin/patients/:id` - Soft delete patient
- `GET /api/admin/patients/statistics` - Get patient statistics

## Testing

Use the provided admin login script to obtain an admin token:
```bash
node scripts/admin-login.js test-login
```

Then use the token in your API requests:
```bash
curl -X POST http://localhost:8080/api/admin/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d @patient-data.json
```
