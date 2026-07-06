"use client"

import { useEffect, useRef, useState, useCallback } from "react"

/**
 * Replaces the old Socket.IO-based real-time updates (websocket.service.ts,
 * deleted) — there's no WebSocket/AppSync layer in this AWS Lambda + API
 * Gateway REST setup, so components poll instead. The backend's own
 * DEVELOPER_HANDOVER.md already recommends 30-60s polling for the pharmacy
 * portal; the same pattern is used here for the queue views.
 */
export function usePolling<T>(fetcher: () => Promise<T>, intervalMs = 15000) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const refetch = useCallback(async () => {
    try {
      const result = await fetcherRef.current()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Polling request failed"))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
    const id = setInterval(refetch, intervalMs)
    return () => clearInterval(id)
  }, [refetch, intervalMs])

  return { data, loading, error, refetch }
}
