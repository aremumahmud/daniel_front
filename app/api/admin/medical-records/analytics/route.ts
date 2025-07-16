import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock data for analytics
const mockMedicalRecords = new Map()
const mockPatients = new Map()
const mockDoctors = new Map()

// Initialize comprehensive mock data for analytics
mockPatients.set("550e8400-e29b-41d4-a716-446655440000", {
  id: "550e8400-e29b-41d4-a716-446655440000",
  firstName: "John",
  lastName: "Doe",
  matricNumber: "2024/CS/001",
  department: "Computer Science"
})

mockPatients.set("660f9511-f3ac-52e5-b827-557766551111", {
  id: "660f9511-f3ac-52e5-b827-557766551111",
  firstName: "Jane",
  lastName: "Smith",
  matricNumber: "2024/ENG/002",
  department: "Engineering"
})

mockDoctors.set("770g0622-g4bd-63f6-c938-668877662222", {
  id: "770g0622-g4bd-63f6-c938-668877662222",
  firstName: "Dr. John",
  lastName: "Smith",
  specialization: "Cardiology",
  department: "Cardiology"
})

mockDoctors.set("880h1733-h5ce-74g7-d049-779988773333", {
  id: "880h1733-h5ce-74g7-d049-779988773333",
  firstName: "Dr. Sarah",
  lastName: "Johnson",
  specialization: "Internal Medicine",
  department: "Internal Medicine"
})

// Initialize sample medical records for analytics
const sampleRecords = [
  {
    _id: "record-001",
    patientId: "550e8400-e29b-41d4-a716-446655440000",
    doctorId: "770g0622-g4bd-63f6-c938-668877662222",
    recordDate: "2024-01-15T10:30:00Z",
    recordType: "consultation",
    diagnosis: {
      primary: { condition: "Hypertension", icdCode: "I10" }
    },
    treatmentPlan: {
      medications: [
        { medicationName: "Lisinopril", dosage: "10mg" },
        { medicationName: "Metformin", dosage: "500mg" }
      ]
    },
    status: "completed"
  },
  {
    _id: "record-002",
    patientId: "660f9511-f3ac-52e5-b827-557766551111",
    doctorId: "880h1733-h5ce-74g7-d049-779988773333",
    recordDate: "2024-01-16T14:00:00Z",
    recordType: "follow-up",
    diagnosis: {
      primary: { condition: "Diabetes Type 2", icdCode: "E11" }
    },
    treatmentPlan: {
      medications: [
        { medicationName: "Metformin", dosage: "1000mg" },
        { medicationName: "Insulin", dosage: "20 units" }
      ]
    },
    status: "completed"
  },
  {
    _id: "record-003",
    patientId: "550e8400-e29b-41d4-a716-446655440000",
    doctorId: "770g0622-g4bd-63f6-c938-668877662222",
    recordDate: "2024-01-20T09:15:00Z",
    recordType: "emergency",
    diagnosis: {
      primary: { condition: "Chest Pain", icdCode: "R06.02" }
    },
    treatmentPlan: {
      medications: [
        { medicationName: "Nitroglycerin", dosage: "0.4mg" }
      ]
    },
    status: "completed"
  }
]

// Initialize records
sampleRecords.forEach(record => {
  mockMedicalRecords.set(record._id, record)
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

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange') || '2024-01-01 to 2024-12-31'
    const groupBy = searchParams.get('groupBy') || 'department'
    const metricsParam = searchParams.get('metrics') || 'total_records,diagnosis_trends,medication_usage'
    const metrics = metricsParam.split(',')

    // Parse date range
    const [startDate, endDate] = dateRange.split(' to ')
    
    // Get all records within date range
    const allRecords = Array.from(mockMedicalRecords.values())
    const filteredRecords = allRecords.filter((record: any) => {
      const recordDate = new Date(record.recordDate)
      return recordDate >= new Date(startDate) && recordDate <= new Date(endDate)
    })

    // Initialize analytics data
    const analytics: any = {
      dateRange: {
        from: startDate,
        to: endDate
      },
      summary: {
        totalRecords: filteredRecords.length,
        totalPatients: new Set(filteredRecords.map((r: any) => r.patientId)).size,
        totalDoctors: new Set(filteredRecords.map((r: any) => r.doctorId)).size,
        averageRecordsPerDay: 0
      },
      metrics: {}
    }

    // Calculate average records per day
    const daysDiff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    analytics.summary.averageRecordsPerDay = Math.round((filteredRecords.length / daysDiff) * 100) / 100

    // Generate requested metrics
    if (metrics.includes('total_records')) {
      analytics.metrics.totalRecords = {
        byRecordType: filteredRecords.reduce((acc: any, record: any) => {
          acc[record.recordType] = (acc[record.recordType] || 0) + 1
          return acc
        }, {}),
        byStatus: filteredRecords.reduce((acc: any, record: any) => {
          acc[record.status] = (acc[record.status] || 0) + 1
          return acc
        }, {}),
        byMonth: filteredRecords.reduce((acc: any, record: any) => {
          const month = new Date(record.recordDate).toISOString().substring(0, 7)
          acc[month] = (acc[month] || 0) + 1
          return acc
        }, {})
      }
    }

    if (metrics.includes('diagnosis_trends')) {
      const diagnosisCount: any = {}
      const icdCodeCount: any = {}
      
      filteredRecords.forEach((record: any) => {
        if (record.diagnosis?.primary?.condition) {
          const condition = record.diagnosis.primary.condition
          diagnosisCount[condition] = (diagnosisCount[condition] || 0) + 1
        }
        
        if (record.diagnosis?.primary?.icdCode) {
          const icdCode = record.diagnosis.primary.icdCode
          icdCodeCount[icdCode] = (icdCodeCount[icdCode] || 0) + 1
        }
      })

      analytics.metrics.diagnosisTrends = {
        topConditions: Object.entries(diagnosisCount)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 10)
          .map(([condition, count]) => ({ condition, count })),
        topIcdCodes: Object.entries(icdCodeCount)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 10)
          .map(([icdCode, count]) => ({ icdCode, count })),
        conditionsByMonth: filteredRecords.reduce((acc: any, record: any) => {
          const month = new Date(record.recordDate).toISOString().substring(0, 7)
          const condition = record.diagnosis?.primary?.condition
          if (condition) {
            if (!acc[month]) acc[month] = {}
            acc[month][condition] = (acc[month][condition] || 0) + 1
          }
          return acc
        }, {})
      }
    }

    if (metrics.includes('medication_usage')) {
      const medicationCount: any = {}
      const medicationByDosage: any = {}
      
      filteredRecords.forEach((record: any) => {
        if (record.treatmentPlan?.medications) {
          record.treatmentPlan.medications.forEach((med: any) => {
            const medName = med.medicationName
            if (medName) {
              medicationCount[medName] = (medicationCount[medName] || 0) + 1
              
              const dosage = med.dosage
              if (dosage) {
                if (!medicationByDosage[medName]) medicationByDosage[medName] = {}
                medicationByDosage[medName][dosage] = (medicationByDosage[medName][dosage] || 0) + 1
              }
            }
          })
        }
      })

      analytics.metrics.medicationUsage = {
        topMedications: Object.entries(medicationCount)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 15)
          .map(([medication, count]) => ({ medication, count })),
        medicationsByDosage: medicationByDosage,
        medicationsByMonth: filteredRecords.reduce((acc: any, record: any) => {
          const month = new Date(record.recordDate).toISOString().substring(0, 7)
          if (record.treatmentPlan?.medications) {
            record.treatmentPlan.medications.forEach((med: any) => {
              const medName = med.medicationName
              if (medName) {
                if (!acc[month]) acc[month] = {}
                acc[month][medName] = (acc[month][medName] || 0) + 1
              }
            })
          }
          return acc
        }, {})
      }
    }

    // Group by department/specialization if requested
    if (groupBy === 'department') {
      const departmentStats: any = {}
      
      filteredRecords.forEach((record: any) => {
        const doctor = mockDoctors.get(record.doctorId)
        const department = doctor?.department || 'Unknown'
        
        if (!departmentStats[department]) {
          departmentStats[department] = {
            totalRecords: 0,
            recordTypes: {},
            topDiagnoses: {},
            topMedications: {}
          }
        }
        
        departmentStats[department].totalRecords++
        
        // Record types by department
        const recordType = record.recordType
        departmentStats[department].recordTypes[recordType] = 
          (departmentStats[department].recordTypes[recordType] || 0) + 1
        
        // Diagnoses by department
        const condition = record.diagnosis?.primary?.condition
        if (condition) {
          departmentStats[department].topDiagnoses[condition] = 
            (departmentStats[department].topDiagnoses[condition] || 0) + 1
        }
        
        // Medications by department
        if (record.treatmentPlan?.medications) {
          record.treatmentPlan.medications.forEach((med: any) => {
            const medName = med.medicationName
            if (medName) {
              departmentStats[department].topMedications[medName] = 
                (departmentStats[department].topMedications[medName] || 0) + 1
            }
          })
        }
      })

      analytics.departmentBreakdown = departmentStats
    }

    // Performance metrics
    analytics.performance = {
      recordsPerDoctor: filteredRecords.reduce((acc: any, record: any) => {
        const doctorId = record.doctorId
        acc[doctorId] = (acc[doctorId] || 0) + 1
        return acc
      }, {}),
      averageRecordsPerDoctor: Math.round((filteredRecords.length / mockDoctors.size) * 100) / 100,
      recordCompletionRate: {
        completed: filteredRecords.filter((r: any) => r.status === 'completed').length,
        pending: filteredRecords.filter((r: any) => r.status === 'pending-review').length,
        draft: filteredRecords.filter((r: any) => r.status === 'draft').length
      }
    }

    return NextResponse.json({
      success: true,
      data: analytics
    })

  } catch (error) {
    console.error('Error generating medical records analytics:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate analytics",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
