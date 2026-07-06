import { NextRequest } from "next/server"
import { proxyToApiGateway } from "../_lib/proxy"

// GET  -> getPharmacyAlerts (Pharmacist) — e.g. ?status=PENDING
// POST -> createPrescription (Doctor)
export async function GET(request: NextRequest) {
  return proxyToApiGateway(request, "/prescriptions")
}

export async function POST(request: NextRequest) {
  return proxyToApiGateway(request, "/prescriptions")
}
