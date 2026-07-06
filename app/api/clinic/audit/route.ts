import { NextRequest } from "next/server"
import { proxyToApiGateway } from "../_lib/proxy"

// GET -> getAuditLog (Pharmacist, Receptionist) — e.g. ?matricNumber=
export async function GET(request: NextRequest) {
  return proxyToApiGateway(request, "/audit")
}
