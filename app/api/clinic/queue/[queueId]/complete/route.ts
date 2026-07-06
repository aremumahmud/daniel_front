import { NextRequest } from "next/server"
import { proxyToApiGateway } from "../../../_lib/proxy"

// PUT -> completeQueueItem (Doctor)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ queueId: string }> }) {
  const { queueId } = await params
  return proxyToApiGateway(request, `/queue/${encodeURIComponent(queueId)}/complete`)
}
