import { useState, useEffect } from 'react'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import type { OptimizeRequest, SSEEvent } from '../api/client'

export const useSSE = (data: OptimizeRequest | null) => {

    const [events, setEvents] = useState<SSEEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isDone, setIsDone] = useState(false)

    useEffect(() => {
        if (!data) return  // don't run if no data yet
        setIsLoading(true)
        setEvents([])      // reset events on new request
        setIsDone(false)   // reset done state

        fetchEventSource('http://localhost:8000/api/optimize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            onmessage(event) {
                const parsed = JSON.parse(event.data)
                setEvents(prev => [...prev, parsed])
            },
            onerror(error) {
                console.error('SSE error:', error)
                setIsLoading(false)
            },
            onclose() {
                setIsDone(true)
                setIsLoading(false)
            }
        })
    }, [data])

    return { events, isLoading, isDone }
}