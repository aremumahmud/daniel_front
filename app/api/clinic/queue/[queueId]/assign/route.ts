import { NextRequest } from "next/server"
import { proxyToApiGateway } from "../../../_lib/proxy"

// POST -> assignDoctorToQueue (Receptionist)
export async function POST(request: NextRequest, { params }: { params: Promise<{ queueId: string }> }) {
  const { queueId } = await params
  return proxyToApiGateway(request, `/queue/${encodeURIComponent(queueId)}/assign`)
}
