import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock data storage
const mockMedicalRecords = new Map()
const mockPatients = new Map()
const mockDoctors = new Map()

// Initialize mock data
mockPatients.set("550e8400-e29b-41d4-a716-446655440000", {
  id: "550e8400-e29b-41d4-a716-446655440000",
  firstName: "John",
  lastName: "Doe",
  matricNumber: "2024/CS/001"
})

mockPatients.set("660f9511-f3ac-52e5-b827-557766551111", {
  id: "660f9511-f3ac-52e5-b827-557766551111",
  firstName: "Jane",
  lastName: "Smith",
  matricNumber: "2024/CS/002"
})

mockDoctors.set("770g0622-g4bd-63f6-c938-668877662222", {
  id: "770g0622-g4bd-63f6-c938-668877662222",
  firstName: "Dr. John",
  lastName: "Smith",
  specialization: "Cardiology"
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
    if (!user || user.role !== 'admin') {
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
    const { records } = body

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request: records array is required",
          error: "VALIDATION_ERROR"
        },
        { status: 400 }
      )
    }

    const results = {
      successful: [],
      failed: [],
      summary: {
        total: records.length,
        created: 0,
        failed: 0
      }
    }

    const now = new Date().toISOString()

    // Process each record
    for (let i = 0; i < records.length; i++) {
      const recordData = records[i]
      
      try {
        // Validate required fields
        if (!recordData.patientId || !recordData.doctorId || !recordData.recordType) {
          results.failed.push({
            index: i,
            data: recordData,
            error: "Missing required fields: patientId, doctorId, recordType"
          })
          results.summary.failed++
          continue
        }

        // Validate patient exists
        const patient = mockPatients.get(recordData.patientId)
        if (!patient) {
          results.failed.push({
            index: i,
            data: recordData,
            error: `Patient not found: ${recordData.patientId}`
          })
          results.summary.failed++
          continue
        }

        // Validate doctor exists
        const doctor = mockDoctors.get(recordData.doctorId)
        if (!doctor) {
          results.failed.push({
            index: i,
            data: recordData,
            error: `Doctor not found: ${recordData.doctorId}`
          })
          results.summary.failed++
          continue
        }

        // Generate record ID
        const recordId = `record-bulk-${Date.now()}-${i}`

        // Create comprehensive medical record
        const newRecord = {
          _id: recordId,
          patientId: recordData.patientId,
          doctorId: recordData.doctorId,
          appointmentId: recordData.appointmentId || null,
          recordDate: recordData.recordDate || now,
          recordType: recordData.recordType,
          
          // Clinical Information
          chiefComplaint: recordData.chiefComplaint || "",
          historyOfPresentIllness: recordData.historyOfPresentIllness || "",
          reviewOfSystems: recordData.reviewOfSystems || {},
          physicalExamination: recordData.physicalExamination || {},

          // Vital Signs
          vitalSigns: {
            bloodPressure: recordData.vitalSigns?.bloodPressure || { systolic: 0, diastolic: 0 },
            heartRate: recordData.vitalSigns?.heartRate || 0,
            temperature: recordData.vitalSigns?.temperature || 0,
            respiratoryRate: recordData.vitalSigns?.respiratoryRate || 0,
            oxygenSaturation: recordData.vitalSigns?.oxygenSaturation || 0,
            weight: recordData.vitalSigns?.weight || 0,
            height: recordData.vitalSigns?.height || 0,
            bmi: recordData.vitalSigns?.bmi || 0,
            painScale: recordData.vitalSigns?.painScale || 0
          },

          // Diagnosis
          diagnosis: {
            primary: recordData.diagnosis?.primary || {
              condition: "",
              icdCode: "",
              severity: "mild",
              onset: now,
              status: "active"
            },
            secondary: recordData.diagnosis?.secondary || [],
            differential: recordData.diagnosis?.differential || []
          },

          // Treatment Plan
          treatmentPlan: {
            medications: recordData.treatmentPlan?.medications || [],
            procedures: recordData.treatmentPlan?.procedures || [],
            therapies: recordData.treatmentPlan?.therapies || []
          },

          // Additional data
          labResults: recordData.labResults || [],
          imagingStudies: recordData.imagingStudies || [],
          referrals: recordData.referrals || [],

          // Follow-up
          followUp: {
            required: recordData.followUp?.required || false,
            timeframe: recordData.followUp?.timeframe || "",
            type: recordData.followUp?.type || "office",
            instructions: recordData.followUp?.instructions || "",
            scheduledDate: recordData.followUp?.scheduledDate || null
          },

          // Doctor Notes
          doctorNotes: {
            assessment: recordData.doctorNotes?.assessment || "",
            plan: recordData.doctorNotes?.plan || "",
            patientEducation: recordData.doctorNotes?.patientEducation || "",
            warningsSigns: recordData.doctorNotes?.warningsSigns || "",
            additionalNotes: recordData.doctorNotes?.additionalNotes || ""
          },

          // Billing and Management
          billing: {
            encounterType: recordData.billing?.encounterType || "",
            cptCodes: recordData.billing?.cptCodes || [],
            icdCodes: recordData.billing?.icdCodes || [],
            modifiers: recordData.billing?.modifiers || [],
            levelOfService: recordData.billing?.levelOfService || "1"
          },

          // Record Management
          status: recordData.status || "completed",
          isArchived: false,
          confidentialityLevel: recordData.confidentialityLevel || "normal",

          // Audit Trail
          amendments: [],
          reviewedBy: null,
          reviewedAt: null,
          reviewNotes: "",

          // Timestamps
          createdAt: now,
          updatedAt: now,
          createdBy: user.userId || user.id,
          lastModifiedBy: user.userId || user.id
        }

        // Store the record
        mockMedicalRecords.set(recordId, newRecord)

        // Add to successful results
        results.successful.push({
          index: i,
          recordId: recordId,
          patientId: recordData.patientId,
          doctorId: recordData.doctorId,
          recordType: recordData.recordType,
          status: "created"
        })

        results.summary.created++

      } catch (error) {
        results.failed.push({
          index: i,
          data: recordData,
          error: error instanceof Error ? error.message : "Unknown error"
        })
        results.summary.failed++
      }
    }

    // Determine response status
    const hasFailures = results.summary.failed > 0
    const hasSuccesses = results.summary.created > 0

    let status = 200
    let message = "Bulk operation completed"

    if (hasFailures && !hasSuccesses) {
      status = 400
      message = "All records failed to create"
    } else if (hasFailures && hasSuccesses) {
      status = 207 // Multi-status
      message = "Bulk operation completed with some failures"
    } else {
      message = "All records created successfully"
    }

    return NextResponse.json({
      success: hasSuccesses,
      message,
      data: results
    }, { status })

  } catch (error) {
    console.error('Error in bulk medical records operation:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process bulk medical records",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    // Authenticate user
    const user = extractUserFromToken(authHeader)
    if (!user || user.role !== 'admin') {
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
    const { updates } = body

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request: updates array is required",
          error: "VALIDATION_ERROR"
        },
        { status: 400 }
      )
    }

    const results = {
      successful: [],
      failed: [],
      summary: {
        total: updates.length,
        updated: 0,
        failed: 0
      }
    }

    const now = new Date().toISOString()

    // Process each update
    for (let i = 0; i < updates.length; i++) {
      const updateData = updates[i]
      
      try {
        if (!updateData.recordId) {
          results.failed.push({
            index: i,
            data: updateData,
            error: "Missing recordId"
          })
          results.summary.failed++
          continue
        }

        // Get existing record
        const existingRecord = mockMedicalRecords.get(updateData.recordId)
        if (!existingRecord) {
          results.failed.push({
            index: i,
            data: updateData,
            error: `Record not found: ${updateData.recordId}`
          })
          results.summary.failed++
          continue
        }

        // Create amendment entry
        const amendment = {
          amendedBy: user.userId || user.id,
          amendedAt: now,
          reason: updateData.amendmentReason || "Bulk update",
          changes: "Record updated via bulk operation",
          originalValue: JSON.stringify(existingRecord),
          newValue: JSON.stringify(updateData.data)
        }

        // Update the record
        const updatedRecord = {
          ...existingRecord,
          ...updateData.data,
          _id: updateData.recordId, // Ensure ID doesn't change
          updatedAt: now,
          lastModifiedBy: user.userId || user.id,
          amendments: [...(existingRecord.amendments || []), amendment]
        }

        // Store updated record
        mockMedicalRecords.set(updateData.recordId, updatedRecord)

        results.successful.push({
          index: i,
          recordId: updateData.recordId,
          status: "updated"
        })

        results.summary.updated++

      } catch (error) {
        results.failed.push({
          index: i,
          data: updateData,
          error: error instanceof Error ? error.message : "Unknown error"
        })
        results.summary.failed++
      }
    }

    const hasFailures = results.summary.failed > 0
    const hasSuccesses = results.summary.updated > 0

    let status = 200
    let message = "Bulk update completed"

    if (hasFailures && !hasSuccesses) {
      status = 400
      message = "All updates failed"
    } else if (hasFailures && hasSuccesses) {
      status = 207
      message = "Bulk update completed with some failures"
    } else {
      message = "All records updated successfully"
    }

    return NextResponse.json({
      success: hasSuccesses,
      message,
      data: results
    }, { status })

  } catch (error) {
    console.error('Error in bulk update operation:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process bulk updates",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
