import { NextRequest } from "next/server"
import { proxyToApiGateway } from "../../_lib/proxy"

// PUT -> updatePrescriptionStatus (Pharmacist)
export async function PUT(request: NextRequest) {
  return proxyToApiGateway(request, "/prescriptions/status")
}
