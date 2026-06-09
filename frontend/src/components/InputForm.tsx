import { useState } from 'react'
import type { OptimizeRequest } from '../api/client'

type Props = {
  onSubmit: (data: OptimizeRequest) => void
}

export const InputForm = ({ onSubmit }: Props) => {

  const [statement, setStatement] = useState('')
  const [examples, setExamples] = useState<{input: string, expected_output: string}[]>([])
  const [edgeCases, setEdgeCases] = useState<{input: string, expected_output: string}[]>([])
  const [weights, setWeights] = useState({ clarity: 34, edge_cases: 33, quality: 33 })

  const addExample = () => setExamples(prev => [...prev, {input: '', expected_output: ''}])
  const removeExample = (index: number) => setExamples(prev => prev.filter((_, i) => i !== index))

  const addEdgeCase = () => setEdgeCases(prev => [...prev, {input: '', expected_output: ''}])
  const removeEdgeCase = (index: number) => setEdgeCases(prev => prev.filter((_, i) => i !== index))

  const handleSubmit = () => {
    onSubmit({ statement, examples, edge_cases: edgeCases, weights })
  }

  const weightsTotal = weights.clarity + weights.edge_cases + weights.quality
  const isWeightsValid = weightsTotal === 100

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">

      {/* Statement */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Statement</label>
        <textarea
          value={statement}
          onChange={e => setStatement(e.target.value)}
          placeholder="Describe what you want your prompt to do..."
          className="w-full h-28 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* Examples */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Examples</label>
          <button
            onClick={addExample}
            className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
          >
            + Add Example
          </button>
        </div>
        {examples.map((ex, i) => (
          <div key={i} className="p-4 border border-gray-200 rounded-lg space-y-2 bg-gray-50">
            <textarea
              value={ex.input}
              onChange={e => setExamples(prev => prev.map((v, j) => j === i ? {...v, input: e.target.value} : v))}
              placeholder="Input"
              className="w-full h-16 p-2 border border-gray-300 rounded-md resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={ex.expected_output}
              onChange={e => setExamples(prev => prev.map((v, j) => j === i ? {...v, expected_output: e.target.value} : v))}
              placeholder="Expected output"
              className="w-full h-16 p-2 border border-gray-300 rounded-md resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => removeExample(i)}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Edge Cases */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Edge Cases</label>
          <button
            onClick={addEdgeCase}
            className="text-sm px-3 py-1 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100"
          >
            + Add Edge Case
          </button>
        </div>
        {edgeCases.map((ec, i) => (
          <div key={i} className="p-4 border border-gray-200 rounded-lg space-y-2 bg-gray-50">
            <textarea
              value={ec.input}
              onChange={e => setEdgeCases(prev => prev.map((v, j) => j === i ? {...v, input: e.target.value} : v))}
              placeholder="Edge case input"
              className="w-full h-16 p-2 border border-gray-300 rounded-md resize-none text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <textarea
              value={ec.expected_output}
              onChange={e => setEdgeCases(prev => prev.map((v, j) => j === i ? {...v, expected_output: e.target.value} : v))}
              placeholder="Expected output"
              className="w-full h-16 p-2 border border-gray-300 rounded-md resize-none text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() => removeEdgeCase(i)}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Weights */}
      <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Scoring Weights</label>
          <span className={`text-sm font-medium ${isWeightsValid ? 'text-green-600' : 'text-red-500'}`}>
            Total: {weightsTotal}/100
          </span>
        </div>
        {!isWeightsValid && (
          <p className="text-xs text-red-500">Weights must sum to 100</p>
        )}
        {[
          { label: 'Clarity', key: 'clarity' as const, color: 'text-blue-600' },
          { label: 'Edge Cases', key: 'edge_cases' as const, color: 'text-purple-600' },
          { label: 'Quality', key: 'quality' as const, color: 'text-green-600' },
        ].map(({ label, key, color }) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className={color}>{label}</span>
              <span className="font-medium">{weights[key]}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights[key]}
              onChange={e => setWeights(prev => ({...prev, [key]: parseInt(e.target.value)}))}
              className="w-full accent-blue-500"
            />
          </div>
        ))}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!isWeightsValid || !statement}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Optimize Prompt
      </button>
    </div>
  )
}