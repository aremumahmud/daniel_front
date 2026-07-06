import { NextRequest } from "next/server"
import { proxyToApiGateway } from "../_lib/proxy"

// POST -> createEncounter (Doctor)
export async function POST(request: NextRequest) {
  return proxyToApiGateway(request, "/encounters")
}
