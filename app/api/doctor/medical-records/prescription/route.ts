import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock data storage
const mockMedicalRecords = new Map()
const mockPatients = new Map()
const mockPharmacies = new Map()

// Initialize mock patients
mockPatients.set("550e8400-e29b-41d4-a716-446655440000", {
  id: "550e8400-e29b-41d4-a716-446655440000",
  firstName: "John",
  lastName: "Doe",
  matricNumber: "2024/CS/001",
  email: "john.doe@example.com",
  phone: "+1234567890",
  allergies: ["Penicillin"]
})

mockPatients.set("660f9511-f3ac-52e5-b827-557766551111", {
  id: "660f9511-f3ac-52e5-b827-557766551111",
  firstName: "Jane",
  lastName: "Smith",
  matricNumber: "2024/CS/002",
  email: "jane.smith@example.com",
  phone: "+1234567891",
  allergies: []
})

// Initialize mock pharmacies
mockPharmacies.set("pharmacy-001", {
  id: "pharmacy-001",
  name: "University Pharmacy",
  address: "123 Campus Drive",
  phone: "+1234567800",
  email: "pharmacy@university.edu"
})

mockPharmacies.set("pharmacy-002", {
  id: "pharmacy-002",
  name: "City Medical Pharmacy",
  address: "456 Medical Center Blvd",
  phone: "+1234567801",
  email: "prescriptions@citymedical.com"
})

function extractUserFromToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    return decoded
  } catch (error) {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    // Authenticate user
    const user = extractUserFromToken(authHeader)
    if (!user || user.role !== 'doctor') {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access",
          error: "UNAUTHORIZED"
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      patientId,
      medications,
      sendToPharmacy = false,
      pharmacyId,
      appointmentId,
      diagnosis,
      notes
    } = body

    // Validate required fields
    if (!patientId || !medications || !Array.isArray(medications) || medications.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: patientId, medications array",
          error: "VALIDATION_ERROR"
        },
        { status: 400 }
      )
    }

    // Validate patient exists
    const patient = mockPatients.get(patientId)
    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient not found",
          error: "PATIENT_NOT_FOUND"
        },
        { status: 404 }
      )
    }

    // Validate pharmacy if sending prescription
    let pharmacy = null
    if (sendToPharmacy) {
      if (!pharmacyId) {
        return NextResponse.json(
          {
            success: false,
            message: "Pharmacy ID is required when sending prescription",
            error: "VALIDATION_ERROR"
          },
          { status: 400 }
        )
      }
      
      pharmacy = mockPharmacies.get(pharmacyId)
      if (!pharmacy) {
        return NextResponse.json(
          {
            success: false,
            message: "Pharmacy not found",
            error: "PHARMACY_NOT_FOUND"
          },
          { status: 404 }
        )
      }
    }

    // Validate medications
    const validatedMedications = []
    const warnings = []

    for (let i = 0; i < medications.length; i++) {
      const med = medications[i]
      
      // Check required medication fields
      if (!med.name || !med.strength || !med.quantity || !med.instructions) {
        return NextResponse.json(
          {
            success: false,
            message: `Medication ${i + 1}: Missing required fields (name, strength, quantity, instructions)`,
            error: "MEDICATION_VALIDATION_ERROR"
          },
          { status: 400 }
        )
      }

      // Check for drug allergies
      if (patient.allergies && patient.allergies.length > 0) {
        const allergyMatch = patient.allergies.find(allergy => 
          med.name.toLowerCase().includes(allergy.toLowerCase())
        )
        if (allergyMatch) {
          warnings.push(`ALLERGY WARNING: Patient is allergic to ${allergyMatch}. Prescribed medication: ${med.name}`)
        }
      }

      // Validate dosage format
      const dosagePattern = /^\d+(\.\d+)?\s*(mg|g|ml|units?|mcg|iu)$/i
      if (med.strength && !dosagePattern.test(med.strength)) {
        warnings.push(`Dosage format warning for ${med.name}: ${med.strength}`)
      }

      validatedMedications.push({
        medicationName: med.name,
        strength: med.strength,
        form: med.form || "tablet",
        quantity: med.quantity,
        refills: med.refills || 0,
        instructions: med.instructions,
        route: med.route || "oral",
        frequency: med.frequency || "as directed",
        duration: med.duration || "",
        genericAllowed: med.genericAllowed !== false,
        prescribedAt: new Date().toISOString()
      })
    }

    // Get the doctor's ID from the token
    const doctorId = user.userId || user.id

    // Generate prescription record ID
    const recordId = `prescription-${Date.now()}`
    const now = new Date().toISOString()

    // Create prescription medical record
    const prescriptionRecord = {
      _id: recordId,
      patientId,
      doctorId,
      appointmentId: appointmentId || null,
      recordType: "prescription",
      recordDate: now,
      visitDate: now,

      // Clinical Information
      chiefComplaint: "Prescription request",
      diagnosis: diagnosis ? [diagnosis] : [],
      
      // Treatment Plan with medications
      treatmentPlan: {
        medications: validatedMedications,
        procedures: [],
        therapies: []
      },

      // Prescription-specific data
      prescriptionDetails: {
        prescriptionNumber: `RX-${Date.now()}`,
        prescribedDate: now,
        pharmacy: pharmacy ? {
          id: pharmacy.id,
          name: pharmacy.name,
          address: pharmacy.address,
          phone: pharmacy.phone
        } : null,
        sentToPharmacy: sendToPharmacy,
        sentAt: sendToPharmacy ? now : null,
        status: sendToPharmacy ? "sent" : "pending"
      },

      // Doctor notes
      doctorNotes: {
        assessment: diagnosis || "Prescription issued",
        plan: `Prescribed ${validatedMedications.length} medication(s)`,
        patientEducation: "Take medications as prescribed",
        warningsSigns: warnings.join("; "),
        additionalNotes: notes || ""
      },

      // Warnings and alerts
      warnings: warnings,
      hasAllergies: warnings.length > 0,

      // Record metadata
      status: "completed",
      isPrescriptionRecord: true,
      confidentialityLevel: "normal",

      // Timestamps
      createdAt: now,
      updatedAt: now,
      createdBy: doctorId,
      lastModifiedBy: doctorId,

      // Patient info
      patient: {
        userId: {
          fullName: `${patient.firstName} ${patient.lastName}`
        },
        allergies: patient.allergies
      }
    }

    // Store the record
    mockMedicalRecords.set(recordId, prescriptionRecord)

    // Prepare response
    const response = {
      success: true,
      message: "Prescription created successfully",
      data: {
        prescriptionRecord,
        prescriptionNumber: prescriptionRecord.prescriptionDetails.prescriptionNumber,
        medicationsCount: validatedMedications.length,
        warnings: warnings,
        pharmacyInfo: pharmacy,
        sentToPharmacy: sendToPharmacy
      }
    }

    // Add warnings to response if any
    if (warnings.length > 0) {
      response.message += ` (${warnings.length} warning(s) detected)`
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('Error creating prescription:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create prescription",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// GET method to retrieve available pharmacies and prescription templates
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    // Authenticate user
    const user = extractUserFromToken(authHeader)
    if (!user || user.role !== 'doctor') {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access",
          error: "UNAUTHORIZED"
        },
        { status: 401 }
      )
    }

    // Get available pharmacies
    const pharmacies = Array.from(mockPharmacies.values())

    // Common medication templates
    const medicationTemplates = [
      {
        category: "Pain Management",
        medications: [
          { name: "Ibuprofen", strength: "400mg", form: "tablet", instructions: "Take with food" },
          { name: "Acetaminophen", strength: "500mg", form: "tablet", instructions: "Every 6 hours as needed" }
        ]
      },
      {
        category: "Antibiotics",
        medications: [
          { name: "Amoxicillin", strength: "500mg", form: "capsule", instructions: "Take with or without food" },
          { name: "Azithromycin", strength: "250mg", form: "tablet", instructions: "Take on empty stomach" }
        ]
      },
      {
        category: "Cardiovascular",
        medications: [
          { name: "Lisinopril", strength: "10mg", form: "tablet", instructions: "Take once daily" },
          { name: "Metoprolol", strength: "25mg", form: "tablet", instructions: "Take with food" }
        ]
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        pharmacies,
        medicationTemplates,
        prescriptionGuidelines: {
          requiredFields: ["name", "strength", "quantity", "instructions"],
          dosageFormats: ["mg", "g", "ml", "units", "mcg", "iu"],
          routes: ["oral", "topical", "injection", "inhaled", "sublingual"],
          frequencies: ["once daily", "twice daily", "three times daily", "as needed", "every 4 hours", "every 6 hours"]
        }
      }
    })

  } catch (error) {
    console.error('Error getting prescription data:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get prescription data",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
