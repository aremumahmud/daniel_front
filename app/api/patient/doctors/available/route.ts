import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock doctors data for demonstration
const mockDoctors = new Map()

// Initialize some mock doctors with availability
mockDoctors.set("550e8400-e29b-41d4-a716-446655440003", {
  _id: "550e8400-e29b-41d4-a716-446655440003",
  firstName: "Dr. Jane",
  lastName: "Smith",
  specialization: "General Medicine",
  consultationFee: 100,
  rating: 4.8,
  experience: 10,
  consultationTypes: ["in-person", "video"],
  languages: ["English", "Spanish"],
  workingHours: {
    monday: ["09:00-12:00", "14:00-17:00"],
    tuesday: ["09:00-12:00", "14:00-17:00"],
    wednesday: ["09:00-12:00", "14:00-17:00"],
    thursday: ["09:00-12:00", "14:00-17:00"],
    friday: ["09:00-12:00", "14:00-16:00"],
    saturday: ["09:00-12:00"],
    sunday: []
  },
  isActive: true,
  isAvailable: true
})

mockDoctors.set("550e8400-e29b-41d4-a716-446655440005", {
  _id: "550e8400-e29b-41d4-a716-446655440005",
  firstName: "Dr. Michael",
  lastName: "Johnson",
  specialization: "Cardiology",
  consultationFee: 150,
  rating: 4.9,
  experience: 15,
  consultationTypes: ["in-person", "video", "phone"],
  languages: ["English"],
  workingHours: {
    monday: ["08:00-12:00", "13:00-17:00"],
    tuesday: ["08:00-12:00", "13:00-17:00"],
    wednesday: ["08:00-12:00", "13:00-17:00"],
    thursday: ["08:00-12:00", "13:00-17:00"],
    friday: ["08:00-12:00"],
    saturday: [],
    sunday: []
  },
  isActive: true,
  isAvailable: true
})

mockDoctors.set("550e8400-e29b-41d4-a716-446655440006", {
  _id: "550e8400-e29b-41d4-a716-446655440006",
  firstName: "Dr. Sarah",
  lastName: "Williams",
  specialization: "Dermatology",
  consultationFee: 120,
  rating: 4.7,
  experience: 8,
  consultationTypes: ["in-person", "video"],
  languages: ["English", "French"],
  workingHours: {
    monday: ["10:00-13:00", "14:00-18:00"],
    tuesday: ["10:00-13:00", "14:00-18:00"],
    wednesday: ["10:00-13:00", "14:00-18:00"],
    thursday: ["10:00-13:00", "14:00-18:00"],
    friday: ["10:00-13:00", "14:00-17:00"],
    saturday: ["10:00-14:00"],
    sunday: []
  },
  isActive: true,
  isAvailable: true
})

mockDoctors.set("550e8400-e29b-41d4-a716-446655440007", {
  _id: "550e8400-e29b-41d4-a716-446655440007",
  firstName: "Dr. Robert",
  lastName: "Brown",
  specialization: "General Medicine",
  consultationFee: 90,
  rating: 4.6,
  experience: 12,
  consultationTypes: ["in-person"],
  languages: ["English"],
  workingHours: {
    monday: ["09:00-12:00", "15:00-18:00"],
    tuesday: ["09:00-12:00", "15:00-18:00"],
    wednesday: ["09:00-12:00", "15:00-18:00"],
    thursday: ["09:00-12:00", "15:00-18:00"],
    friday: ["09:00-12:00"],
    saturday: [],
    sunday: []
  },
  isActive: true,
  isAvailable: false // Currently unavailable
})

// Function to generate available slots for a doctor
function generateAvailableSlots(doctor: any, requestedDate?: string, requestedTime?: string) {
  const slots = []
  const today = new Date()
  
  // Generate slots for the next 7 days
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    
    // Skip if specific date requested and this isn't it
    if (requestedDate && dateStr !== requestedDate) continue
    
    const dayName = date.toLocaleLowerCase().split(' ')[0] // Get day name
    const dayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()]
    
    const workingHours = doctor.workingHours[dayKey] || []
    const daySlots = []
    
    workingHours.forEach((timeRange: string) => {
      const [start, end] = timeRange.split('-')
      const startHour = parseInt(start.split(':')[0])
      const startMin = parseInt(start.split(':')[1])
      const endHour = parseInt(end.split(':')[0])
      const endMin = parseInt(end.split(':')[1])
      
      // Generate 30-minute slots
      for (let hour = startHour; hour < endHour || (hour === endHour && startMin < endMin); hour++) {
        for (let min = (hour === startHour ? startMin : 0); min < 60; min += 30) {
          if (hour === endHour && min >= endMin) break
          
          const timeSlot = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
          
          // Skip if specific time requested and this isn't it
          if (requestedTime && timeSlot !== requestedTime) continue
          
          daySlots.push(timeSlot)
        }
      }
    })
    
    if (daySlots.length > 0) {
      slots.push({
        date: dateStr,
        slots: daySlots
      })
    }
  }
  
  return slots
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
    const specialization = searchParams.get('specialization')
    const date = searchParams.get('date')
    const time = searchParams.get('time')
    const consultationType = searchParams.get('consultationType')

    // Filter doctors based on criteria
    let availableDoctors = Array.from(mockDoctors.values())
      .filter((doctor: any) => doctor.isActive && doctor.isAvailable)

    // Filter by specialization
    if (specialization) {
      availableDoctors = availableDoctors.filter((doctor: any) => 
        doctor.specialization.toLowerCase().includes(specialization.toLowerCase())
      )
    }

    // Filter by consultation type
    if (consultationType) {
      availableDoctors = availableDoctors.filter((doctor: any) => 
        doctor.consultationTypes.includes(consultationType)
      )
    }

    // Generate available slots for each doctor
    const doctorsWithSlots = availableDoctors.map((doctor: any) => {
      const availableSlots = generateAvailableSlots(doctor, date, time)
      
      // If specific date/time requested, only include doctors with that slot
      if ((date || time) && availableSlots.length === 0) {
        return null
      }
      
      return {
        _id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization,
        consultationFee: doctor.consultationFee,
        rating: doctor.rating,
        experience: doctor.experience,
        availableSlots: availableSlots,
        consultationTypes: doctor.consultationTypes,
        languages: doctor.languages
      }
    }).filter(doctor => doctor !== null)

    // Sort by rating (highest first)
    doctorsWithSlots.sort((a: any, b: any) => b.rating - a.rating)

    return NextResponse.json({
      success: true,
      data: doctorsWithSlots
    })

  } catch (error) {
    console.error('Error getting available doctors:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get available doctors. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
