import { apiClient } from "@/lib/api"

export interface UploadResponse {
  url: string
  filename?: string
  size?: number
}

export interface UploadMedicalDocumentData {
  category?: string
  description?: string
}

export interface UploadLabReportData {
  testName: string
  testDate: string
  notes?: string
}

export interface UploadPrescriptionData {
  prescribedBy: string
  medications: Array<{
    name: string
    dosage: string
    frequency: string
  }>
  instructions?: string
}

class UploadService {
  async uploadAvatar(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append("avatar", file)

    const response = await apiClient.upload<UploadResponse>("/upload/avatar", formData)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to upload avatar")
  }

  async uploadMedicalDocument(file: File, data?: UploadMedicalDocumentData): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append("document", file)

    if (data?.category) {
      formData.append("category", data.category)
    }

    if (data?.description) {
      formData.append("description", data.description)
    }

    const response = await apiClient.upload<UploadResponse>("/upload/medical-document", formData)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to upload medical document")
  }

  async uploadLabReport(file: File, data: UploadLabReportData): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append("report", file)
    formData.append("testName", data.testName)
    formData.append("testDate", data.testDate)

    if (data.notes) {
      formData.append("notes", data.notes)
    }

    const response = await apiClient.upload<UploadResponse>("/upload/lab-report", formData)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to upload lab report")
  }

  async uploadPrescription(file: File, data: UploadPrescriptionData): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append("prescription", file)
    formData.append("prescribedBy", data.prescribedBy)
    formData.append("medications", JSON.stringify(data.medications))

    if (data.instructions) {
      formData.append("instructions", data.instructions)
    }

    const response = await apiClient.upload<UploadResponse>("/upload/prescription", formData)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to upload prescription")
  }

  async getUserFiles(params?: {
    category?: string
    limit?: number
    offset?: number
  }): Promise<any[]> {
    const response = await apiClient.get("/upload/files", params)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get files")
  }

  async deleteFile(fileId: string): Promise<void> {
    const response = await apiClient.delete(`/upload/files/${fileId}`)

    if (!response.success) {
      throw new Error(response.message || "Failed to delete file")
    }
  }
}

export const uploadService = new UploadService()
