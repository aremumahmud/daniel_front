import { NextRequest } from "next/server"
import { proxyToApiGateway } from "../../_lib/proxy"

// PUT -> callNextPatient (Doctor)
export async function PUT(request: NextRequest) {
  return proxyToApiGateway(request, "/queue/call-next")
}
