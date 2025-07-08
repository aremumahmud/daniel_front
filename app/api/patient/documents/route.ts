import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock documents data for demonstration
const mockDocuments = new Map()

// Initialize some mock documents
mockDocuments.set("550e8400-e29b-41d4-a716-446655440005", {
  _id: "550e8400-e29b-41d4-a716-446655440005",
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  documentType: "lab_result",
  fileName: "blood_test_results.pdf",
  fileUrl: "https://storage.example.com/documents/blood_test_results.pdf",
  fileSize: 2048576,
  mimeType: "application/pdf",
  description: "Complete blood count results from January 2024",
  tags: ["blood_test", "routine", "2024"],
  uploadedAt: "2024-01-15T11:00:00.000Z",
  uploadedBy: "550e8400-e29b-41d4-a716-446655440001",
  version: 1,
  isActive: true,
  accessLevel: "patient_doctor",
  metadata: {
    dateOfDocument: "2024-01-14",
    issuingOrganization: "City Medical Lab",
    documentNumber: "LAB-2024-001234"
  },
  expiryDate: "2025-01-14"
})

mockDocuments.set("doc-002", {
  _id: "doc-002",
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  documentType: "prescription",
  fileName: "prescription_vitamin_d3.pdf",
  fileUrl: "https://storage.example.com/documents/prescription_vitamin_d3.pdf",
  fileSize: 512000,
  mimeType: "application/pdf",
  description: "Vitamin D3 prescription from Dr. Jane Smith",
  tags: ["prescription", "vitamin", "2024"],
  uploadedAt: "2024-01-15T12:00:00.000Z",
  uploadedBy: "550e8400-e29b-41d4-a716-446655440003",
  version: 1,
  isActive: true,
  accessLevel: "patient_doctor",
  metadata: {
    dateOfDocument: "2024-01-15",
    issuingOrganization: "University of Ilorin Clinic",
    prescribedBy: "Dr. Jane Smith"
  }
})

mockDocuments.set("doc-003", {
  _id: "doc-003",
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  documentType: "insurance",
  fileName: "insurance_card.jpg",
  fileUrl: "https://storage.example.com/documents/insurance_card.jpg",
  fileSize: 1024000,
  mimeType: "image/jpeg",
  description: "Health insurance card",
  tags: ["insurance", "card", "2024"],
  uploadedAt: "2024-01-10T09:00:00.000Z",
  uploadedBy: "550e8400-e29b-41d4-a716-446655440001",
  version: 1,
  isActive: true,
  accessLevel: "patient_only",
  metadata: {
    dateOfDocument: "2024-01-01",
    issuingOrganization: "Health Insurance Corp",
    policyNumber: "HIC-2024-789456"
  },
  expiryDate: "2024-12-31"
})

export async function POST(request: NextRequest) {
  try {
    // Extract JWT token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: any

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check if user has appropriate role (Patient, Doctor, or Admin)
    if (!['patient', 'doctor', 'admin'].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Valid role required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      documentType,
      fileName,
      fileUrl,
      fileSize,
      mimeType,
      description,
      tags,
      metadata,
      accessLevel,
      expiryDate
    } = body

    // Validate required fields
    if (!documentType || !fileName || !fileUrl || !fileSize || !mimeType) {
      return NextResponse.json(
        { success: false, message: 'Document type, file name, file URL, file size, and MIME type are required' },
        { status: 400 }
      )
    }

    // Validate document type
    const validDocumentTypes = ["lab_result", "prescription", "insurance", "id_document", "medical_image", "report"]
    if (!validDocumentTypes.includes(documentType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid document type. Must be: lab_result, prescription, insurance, id_document, medical_image, or report' },
        { status: 400 }
      )
    }

    // Validate access level
    const validAccessLevels = ["patient_only", "patient_doctor", "public"]
    if (accessLevel && !validAccessLevels.includes(accessLevel)) {
      return NextResponse.json(
        { success: false, message: 'Invalid access level. Must be: patient_only, patient_doctor, or public' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB for demo)
    if (fileSize > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File size exceeds maximum limit of 10MB' },
        { status: 413 }
      )
    }

    // Determine patient ID based on role
    let patientId = decoded.patientId || "550e8400-e29b-41d4-a716-446655440001"
    if (decoded.role === 'doctor' || decoded.role === 'admin') {
      // For doctors/admins, they might be uploading documents for a specific patient
      patientId = body.patientId || patientId
    }

    // Create document entry
    const documentId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const document = {
      _id: documentId,
      patientId: patientId,
      documentType: documentType,
      fileName: fileName,
      fileUrl: fileUrl,
      fileSize: fileSize,
      mimeType: mimeType,
      description: description || null,
      tags: tags || [],
      uploadedAt: new Date().toISOString(),
      uploadedBy: decoded.userId,
      version: 1,
      isActive: true,
      accessLevel: accessLevel || "patient_doctor",
      metadata: metadata || {},
      expiryDate: expiryDate || null
    }

    // Store document
    mockDocuments.set(documentId, document)

    return NextResponse.json({
      success: true,
      message: "Document uploaded successfully",
      data: document
    })

  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload document. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Extract JWT token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: any

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check if user has appropriate role (Patient, Doctor, or Admin)
    if (!['patient', 'doctor', 'admin'].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Valid role required.' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const documentType = searchParams.get('documentType')
    const tags = searchParams.get('tags')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    // Determine patient ID based on role
    let patientId = decoded.patientId || "550e8400-e29b-41d4-a716-446655440001"
    if (decoded.role === 'doctor' || decoded.role === 'admin') {
      patientId = searchParams.get('patientId') || patientId
    }

    // Filter documents by patient and active status
    let filteredDocuments = Array.from(mockDocuments.values())
      .filter((document: any) => document.patientId === patientId && document.isActive)

    // Apply access level filtering based on user role
    if (decoded.role === 'patient') {
      // Patients can see all their documents
    } else if (decoded.role === 'doctor') {
      // Doctors can see patient_doctor and public documents
      filteredDocuments = filteredDocuments.filter((document: any) => 
        document.accessLevel === 'patient_doctor' || document.accessLevel === 'public'
      )
    }
    // Admins can see all documents

    // Apply filters
    if (documentType) {
      filteredDocuments = filteredDocuments.filter((document: any) => document.documentType === documentType)
    }

    if (tags) {
      const tagList = tags.split(',').map(tag => tag.trim())
      filteredDocuments = filteredDocuments.filter((document: any) => 
        tagList.some(tag => document.tags.includes(tag))
      )
    }

    if (startDate) {
      filteredDocuments = filteredDocuments.filter((document: any) => 
        new Date(document.uploadedAt) >= new Date(startDate)
      )
    }

    if (endDate) {
      filteredDocuments = filteredDocuments.filter((document: any) => 
        new Date(document.uploadedAt) <= new Date(endDate)
      )
    }

    // Sort documents by upload date (most recent first)
    filteredDocuments.sort((a: any, b: any) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )

    // Calculate pagination
    const totalRecords = filteredDocuments.length
    const totalPages = Math.ceil(totalRecords / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex)

    // Add download URL to each document
    const documentsWithDownloadUrl = paginatedDocuments.map((document: any) => ({
      ...document,
      downloadUrl: `https://api.example.com/patient/documents/${document._id}/download`
    }))

    // Calculate summary statistics
    const documentTypes = {}
    filteredDocuments.forEach((document: any) => {
      documentTypes[document.documentType] = (documentTypes[document.documentType] || 0) + 1
    })

    return NextResponse.json({
      success: true,
      data: {
        documents: documentsWithDownloadUrl,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalRecords: totalRecords
        },
        summary: {
          totalDocuments: totalRecords,
          documentTypes: documentTypes
        }
      }
    })

  } catch (error) {
    console.error('Error getting documents:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get documents. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
