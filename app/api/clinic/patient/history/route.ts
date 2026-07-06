import { NextRequest } from "next/server"
import { proxyToApiGateway } from "../../_lib/proxy"

// GET -> getPatientHistory (Receptionist, Doctor, Pharmacist), ?matricNumber=
export async function GET(request: NextRequest) {
  return proxyToApiGateway(request, "/patient/history")
}
