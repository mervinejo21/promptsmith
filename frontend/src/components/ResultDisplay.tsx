import { useState } from "react";

type Result = {
  type: string;
  final_prompt: string;
  final_score: number;
  iterations_taken: number;
  total_tokens_used: number;
};

export const ResultDisplay = ({ result }: { result: Result }) => {
  
  // ✅ hooks must be INSIDE the component
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.final_prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-green-50 border border-green-200 rounded-lg space-y-4">
      <h2 className="text-xl font-bold text-green-700">🎉 Optimization Complete!</h2>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-green-600">Final Prompt</h2>
        <button
          onClick={handleCopy}
          className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
        >
          {copied ? "✅ Copied!" : "📋 Copy"}
        </button>
      </div>
      <pre className="bg-white p-4 rounded-md border border-gray-200 overflow-x-auto text-sm">
        {result.final_prompt}
      </pre>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-100 p-4 rounded-md">
          <p className="text-lg font-bold text-green-700">{result.final_score}/100</p>
          <p className="text-sm text-green-600">Final Score</p>
        </div>
        <div className="bg-green-100 p-4 rounded-md">
          <p className="text-lg font-bold text-green-700">{result.iterations_taken}</p>
          <p className="text-sm text-green-600">Iterations Taken</p>
        </div>
        <div className="bg-green-100 p-4 rounded-md">
          <p className="text-lg font-bold text-green-700">{result.total_tokens_used}</p>
          <p className="text-sm text-green-600">Total Tokens Used</p>
        </div>
      </div>
    </div>
  );
};