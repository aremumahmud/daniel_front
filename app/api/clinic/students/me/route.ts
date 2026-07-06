import { NextRequest } from "next/server"
import { proxyToApiGateway } from "../../_lib/proxy"

// GET -> getStudentProfile (Student, own record only)
export async function GET(request: NextRequest) {
  return proxyToApiGateway(request, "/students/me")
}
