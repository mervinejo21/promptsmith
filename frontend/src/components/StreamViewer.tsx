import type { SSEEvent } from '../api/client'

type Props = {
  events: SSEEvent[]
  isLoading: boolean
}

export const StreamViewer = ({ events, isLoading }: Props) => {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 text-blue-600 text-sm">
          <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse"/>
          <span>Optimizing your prompt...</span>
        </div>
      )}

      {/* Events */}
      {events.map((event, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white shadow-sm">

          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              Iteration {event.iteration}
            </span>
            <span className={`text-sm font-bold px-2 py-1 rounded-full ${
              event.score >= 80
                ? 'bg-green-100 text-green-700'
                : event.score >= 50
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {event.score}/100
            </span>
          </div>

          {/* Score breakdown */}
          <div className="grid grid-cols-3 gap-2">
            {event.score_breakdown && Object.entries(event.score_breakdown)
              .filter(([key]) => key !== 'weakness')
              .map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-md p-2 text-center">
                <p className="text-xs text-gray-500 capitalize">{key.replace('_', ' ')}</p>
                <p className="text-sm font-medium">{value as number}%</p>
              </div>
            ))}
          </div>

          {/* Thinking */}
          {event.thinking && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-xs text-yellow-700 font-medium mb-1">💭 AI Thinking</p>
              <p className="text-sm text-yellow-800">{event.thinking}</p>
            </div>
          )}

          {/* Current prompt */}
          <div className="bg-gray-50 rounded-md p-3">
            <p className="text-xs text-gray-500 font-medium mb-1">Generated Prompt</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{event.current_prompt}</p>
          </div>

        </div>
      ))}
    </div>
  )
}