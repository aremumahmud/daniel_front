import { NextRequest } from "next/server"
import { proxyToApiGateway } from "../_lib/proxy"

// GET -> getPatient (Receptionist, Doctor, Pharmacist), ?matricNumber=
// Query param, not path param — see AWS_INFRA_SETUP.md §7 (matric numbers
// contain "/", which breaks path-parameter routing in API Gateway).
export async function GET(request: NextRequest) {
  return proxyToApiGateway(request, "/patient")
}
