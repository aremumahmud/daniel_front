import { NextRequest, NextResponse } from "next/server"

const API_GATEWAY_BASE_URL = process.env.API_GATEWAY_BASE_URL!

/**
 * Thin server-side proxy to API Gateway. Forwards the Cognito ID token the
 * client already attached (via lib/api.ts's ApiClient) straight through —
 * API Gateway's Cognito authorizer validates it and RBAC is enforced in
 * each Lambda (see LAMBDA_FUNCTIONS.js). Kept centralized here so the
 * client bundle never needs to know the raw API Gateway URL.
 */
export async function proxyToApiGateway(request: NextRequest, gatewayPath: string) {
  const authorization = request.headers.get("authorization")
  const url = `${API_GATEWAY_BASE_URL}${gatewayPath}${request.nextUrl.search}`

  const init: RequestInit = {
    method: request.method,
    headers: {
      "Content-Type": "application/json",
      ...(authorization && { Authorization: authorization }),
    },
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    const body = await request.text()
    if (body) init.body = body
  }

  const response = await fetch(url, init)
  const data = await response.json().catch(() => ({}))

  return NextResponse.json(data, { status: response.status })
}
