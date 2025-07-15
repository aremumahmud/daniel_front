# Patient Registration System Changes

## Overview
This document outlines the changes made to the patient registration system to simplify the process and accommodate student patients.

## Changes Made

### 1. Simplified Registration Process
**Previous State:** The patient registration process had 9 stages:
1. Patient Demographics
2. Contact Information
3. Insurance & Billing
4. Medical History
5. Admission & Visits
6. Vital Signs
7. Test Results & Reports
8. Discharge Summary
9. Digital Documents & Attachments

**Current State:** The registration process now has only 2 stages:
1. Patient Demographics
2. Contact Information

### 2. Added Matric Number Field
Since patients are students, a new required field has been added to the Patient Demographics section:
- **Field Name:** Matric Number
- **Type:** Text input
- **Required:** Yes
- **Placeholder:** e.g., 2023/CS/001
- **Purpose:** To uniquely identify student patients within the academic institution

### 3. Technical Changes

#### Files Modified:
1. **`components/add-new-patient-page.tsx`**
   - Reduced sections array from 9 to 2 stages
   - Added matricNumber field to initialFormData
   - Updated validation logic to only validate Demographics and Contact Information stages
   - Simplified form submission logic
   - Added matric number input field to PatientDemographics component
   - Removed unused component functions (InsuranceAndBilling, MedicalHistory, AdmissionAndVisits, VitalSigns, TestResultsAndReports, DischargeSummary, DigitalDocumentsAndAttachments)

2. **`services/admin.service.ts`**
   - Added matricNumber field to CreatePatientData interface as a required string field

#### Validation Changes:
- **Demographics Stage:** Now validates firstName, lastName, matricNumber, dateOfBirth, nationality, and languageSpoken
- **Contact Information Stage:** Validates phoneNumber, emailAddress, homeAddress, emergencyContact.name, and emergencyContact.phone
- **Removed Validations:** No longer validates insurance, medical history, admission, or vital signs data

#### Data Structure:
- The CreatePatientData interface still includes all optional sections for backward compatibility
- Default values are provided for removed sections to prevent API errors
- The matricNumber field is now required in the patient demographics

### 4. Benefits of Changes

1. **Simplified User Experience:** Reduced registration time from 9 steps to 2 steps
2. **Student-Focused:** Added matric number field specifically for student identification
3. **Faster Onboarding:** Essential information only, reducing form abandonment
4. **Maintainability:** Removed unused code and simplified validation logic

### 5. Backward Compatibility

The changes maintain backward compatibility by:
- Keeping the full CreatePatientData interface structure
- Providing default values for removed sections
- Maintaining the same API endpoint structure

### 6. Future Considerations

If additional information is needed in the future, the removed sections can be:
- Re-enabled as optional stages
- Added as separate forms after initial registration
- Integrated into patient profile management

## Impact Assessment

- **User Impact:** Significantly improved registration experience
- **System Impact:** Reduced complexity and improved performance
- **Data Impact:** Essential patient data still captured, non-essential data can be added later
- **API Impact:** No breaking changes to existing API endpoints

## Testing Recommendations

1. Test patient registration with valid matric numbers
2. Verify validation works for both stages
3. Confirm form submission creates patients successfully
4. Test backward compatibility with existing patient data
5. Verify the simplified UI flow works correctly

---

**Date:** 2025-07-15  
**Author:** System Administrator  
**Version:** 1.0
