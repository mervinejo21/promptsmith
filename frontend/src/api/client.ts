import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export type Example = {
  input: string;
  expected_output: string;
};

export type Weights = {
  clarity: number;
  edge_cases: number;
  quality: number;
};

export type OptimizeRequest = {
  statement: string;
  examples: Example[];
  edge_cases: Example[];
  weights: Weights;
};

export type SSEEvent = {
  iteration: number
  current_prompt: string
  score: number
  score_breakdown: { clarity: number, edge_cases: number, quality: number }
  thinking: string
  type?: string
}

export const optimizePrompt = (data: OptimizeRequest) => {
  return api.post("/api/optimize", data);
};

export default api;