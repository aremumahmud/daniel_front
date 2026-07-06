import { NextRequest } from "next/server"
import { proxyToApiGateway } from "../../_lib/proxy"

// GET -> getPrescriptionByMatric (Pharmacist), ?matricNumber=
// Query param, not path param — see AWS_INFRA_SETUP.md §7.
export async function GET(request: NextRequest) {
  return proxyToApiGateway(request, "/prescriptions/lookup")
}
