import { NextRequest } from "next/server"
import { proxyToApiGateway } from "../../_lib/proxy"

// GET -> listDoctorCapacity (Receptionist, Doctor)
// PUT -> updateDoctorCapacity (Doctor, own record only)
export async function GET(request: NextRequest) {
  return proxyToApiGateway(request, "/doctors/capacity")
}

export async function PUT(request: NextRequest) {
  return proxyToApiGateway(request, "/doctors/capacity")
}
