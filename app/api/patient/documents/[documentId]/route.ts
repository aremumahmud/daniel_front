import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock documents data for demonstration (shared with main documents route)
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

mockDocuments.set("doc-deletable-001", {
  _id: "doc-deletable-001",
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  documentType: "prescription",
  fileName: "old_prescription.pdf",
  fileUrl: "https://storage.example.com/documents/old_prescription.pdf",
  fileSize: 512000,
  mimeType: "application/pdf",
  description: "Old prescription that can be deleted",
  tags: ["prescription", "old", "2023"],
  uploadedAt: "2023-12-15T11:00:00.000Z",
  uploadedBy: "550e8400-e29b-41d4-a716-446655440001",
  version: 1,
  isActive: true,
  accessLevel: "patient_doctor"
})

export async function DELETE(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
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

    const { documentId } = params

    // Find the document
    const existingDocument = mockDocuments.get(documentId)
    if (!existingDocument) {
      return NextResponse.json(
        { success: false, message: 'Document not found' },
        { status: 404 }
      )
    }

    // Check if document is already deleted (inactive)
    if (!existingDocument.isActive) {
      return NextResponse.json(
        { success: false, message: 'Document has already been deleted' },
        { status: 400 }
      )
    }

    // Check if user has permission to delete this document
    const userPatientId = decoded.patientId || "550e8400-e29b-41d4-a716-446655440001"
    
    if (decoded.role === 'patient') {
      // Patients can only delete their own documents
      if (existingDocument.patientId !== userPatientId) {
        return NextResponse.json(
          { success: false, message: 'Access denied. You can only delete your own documents.' },
          { status: 403 }
        )
      }
      
      // Patients can only delete documents they uploaded themselves
      if (existingDocument.uploadedBy !== decoded.userId) {
        return NextResponse.json(
          { success: false, message: 'Access denied. You can only delete documents you uploaded.' },
          { status: 403 }
        )
      }
    } else if (decoded.role === 'doctor') {
      // Doctors can delete documents for their patients, but with restrictions
      if (existingDocument.patientId !== userPatientId && !decoded.canAccessAllPatients) {
        return NextResponse.json(
          { success: false, message: 'Access denied. You can only delete documents for your patients.' },
          { status: 403 }
        )
      }
      
      // Doctors cannot delete certain critical document types
      const criticalDocumentTypes = ['insurance', 'id_document']
      if (criticalDocumentTypes.includes(existingDocument.documentType)) {
        return NextResponse.json(
          { success: false, message: 'Access denied. Critical documents cannot be deleted by doctors.' },
          { status: 403 }
        )
      }
    }
    // Admins can delete any document (no additional restrictions)

    // Perform soft delete (mark as inactive instead of actually deleting)
    const updatedDocument = {
      ...existingDocument,
      isActive: false,
      deletedAt: new Date().toISOString(),
      deletedBy: decoded.userId,
      deletedByRole: decoded.role
    }

    // Store updated document
    mockDocuments.set(documentId, updatedDocument)

    // In a real system, you would:
    // 1. Move the file to a "deleted" storage location or mark for cleanup
    // 2. Log the deletion action for audit purposes
    // 3. Notify relevant parties if necessary
    // 4. Update any references to this document in other systems

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully"
    })

  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete document. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
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

    const { documentId } = params

    // Find the document
    const document = mockDocuments.get(documentId)
    if (!document || !document.isActive) {
      return NextResponse.json(
        { success: false, message: 'Document not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to view this document
    const userPatientId = decoded.patientId || "550e8400-e29b-41d4-a716-446655440001"
    
    if (decoded.role === 'patient') {
      // Patients can only view their own documents
      if (document.patientId !== userPatientId) {
        return NextResponse.json(
          { success: false, message: 'Access denied. You can only view your own documents.' },
          { status: 403 }
        )
      }
    } else if (decoded.role === 'doctor') {
      // Doctors can view patient_doctor and public documents for their patients
      if (document.patientId !== userPatientId && !decoded.canAccessAllPatients) {
        return NextResponse.json(
          { success: false, message: 'Access denied. You can only view documents for your patients.' },
          { status: 403 }
        )
      }
      
      if (document.accessLevel === 'patient_only') {
        return NextResponse.json(
          { success: false, message: 'Access denied. This document is private to the patient.' },
          { status: 403 }
        )
      }
    }
    // Admins can view any document

    // Add download URL
    const documentWithDownloadUrl = {
      ...document,
      downloadUrl: `https://api.example.com/patient/documents/${documentId}/download`
    }

    return NextResponse.json({
      success: true,
      data: documentWithDownloadUrl
    })

  } catch (error) {
    console.error('Error getting document:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get document. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
