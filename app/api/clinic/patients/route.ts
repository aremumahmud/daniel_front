import { NextRequest } from "next/server"
import { proxyToApiGateway } from "../_lib/proxy"

// GET  -> searchPatients   (Receptionist)
// POST -> registerPatient  (Receptionist)
export async function GET(request: NextRequest) {
  return proxyToApiGateway(request, "/patients")
}

export async function POST(request: NextRequest) {
  return proxyToApiGateway(request, "/patients")
}
