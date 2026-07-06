import { NextRequest } from "next/server"
import { proxyToApiGateway } from "../_lib/proxy"

// GET  -> listAppointments (Receptionist any matricNumber, Student own only)
// POST -> createAppointment (Receptionist)
export async function GET(request: NextRequest) {
  return proxyToApiGateway(request, "/appointments")
}

export async function POST(request: NextRequest) {
  return proxyToApiGateway(request, "/appointments")
}
