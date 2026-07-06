import { NextRequest } from "next/server"
import { proxyToApiGateway } from "../_lib/proxy"

// GET  -> getQueue (Receptionist, Doctor) — e.g. ?status=WAITING or ?doctorId=
// POST -> assignQueue (Receptionist)
export async function GET(request: NextRequest) {
  return proxyToApiGateway(request, "/queue")
}

export async function POST(request: NextRequest) {
  return proxyToApiGateway(request, "/queue")
}
