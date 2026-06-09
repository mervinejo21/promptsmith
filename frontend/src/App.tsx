import { useState, useEffect } from 'react'
import { InputForm } from './components/InputForm'
import { ResultDisplay } from './components/ResultDisplay'
import { useSSE } from './hooks/useSSE'
import type { OptimizeRequest } from './api/client'

export default function App() {

  const [requestData, setRequestData] = useState<OptimizeRequest | null>(null)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const { events, isLoading, isDone } = useSSE(requestData)

  const finalResult = events.find((e: any) => e.type === 'done')
  const streamEvents = events.filter((e: any) => e.type !== 'done')

  // auto expand latest iteration card
  useEffect(() => {
    if (streamEvents.length > 0) {
      setExpandedIndex(streamEvents.length - 1)
    }
  }, [streamEvents.length])

  useEffect(() => {
    if (isDone) {
      setExpandedIndex(null) // collapse all cards when done
    }
  }, [isDone])

  const handleSubmit = (data: OptimizeRequest) => {
    setExpandedIndex(null)
    setRequestData(data)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">🔨 PromptSmith</h1>
          <p className="text-sm text-gray-500">Transform your ideas into optimized prompts</p>
        </div>
      </header>

      {/* Split screen */}
      <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full">

        {/* Left — Input Form */}
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto bg-white">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Your Input</h2>
            <InputForm onSubmit={handleSubmit} />
          </div>
        </div>

        {/* Right — Iterations + Result */}
        <div className="w-1/2 overflow-y-auto bg-gray-50">
          <div className="p-6 space-y-4">

            {/* Empty state */}
            {!isLoading && streamEvents.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <p className="text-4xl mb-3">⚡</p>
                <p className="text-sm">Your optimization results will appear here</p>
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-blue-600 text-sm">
                <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse"/>
                <span>Optimizing your prompt...</span>
              </div>
            )}

            {/* Iteration cards */}
            {streamEvents.map((event: any, index: number) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden"
              >
                {/* Card header — always visible */}
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">
                      Iteration {event.iteration}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      event.score >= 80
                        ? 'bg-green-100 text-green-700'
                        : event.score >= 50
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {event.score}/100
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {expandedIndex === index ? '▲' : '▼'}
                  </span>
                </button>

                {/* Card body — collapsible */}
                {expandedIndex === index && (
                  <div className="p-4 border-t border-gray-100 space-y-3">

                    {/* Score breakdown */}
                    {event.score_breakdown && (
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(event.score_breakdown)
                          .filter(([key]) => key !== 'weakness')
                          .map(([key, value]) => (
                            <div key={key} className="bg-gray-50 rounded-md p-2 text-center">
                              <p className="text-xs text-gray-500 capitalize">
                                {key.replace('_', ' ')}
                              </p>
                              <p className="text-sm font-medium">{value as number}%</p>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Thinking */}
                    {event.thinking && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                        <p className="text-xs text-yellow-700 font-medium mb-1">💭 AI Thinking</p>
                        <p className="text-sm text-yellow-800">{event.thinking}</p>
                      </div>
                    )}

                    {/* Generated prompt */}
                    <div className="bg-gray-50 rounded-md p-3">
                      <p className="text-xs text-gray-500 font-medium mb-1">Generated Prompt</p>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">
                        {event.current_prompt}
                      </p>
                    </div>

                    {/* Token usage */}
                    <p className="text-xs text-gray-400">
                      Tokens used: {event.tokens_used_this_iteration} 
                      (total: {event.total_tokens_so_far})
                    </p>

                  </div>
                )}
              </div>
            ))}

            {/* Final Result */}
            {isDone && finalResult && (
              <ResultDisplay result={finalResult as any} />
            )}

          </div>
        </div>
      </div>
    </div>
  )
}