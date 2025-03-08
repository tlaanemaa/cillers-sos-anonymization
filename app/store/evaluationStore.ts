import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Redaction } from "@/ai/schemas";

/**
 * Metrics from evaluation
 */
export interface EvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  processingTime: number;
}

/**
 * A single evaluation run for history
 */
export interface EvaluationRun {
  id: string;
  date: string;
  name: string;
  notes: string;
  riskTolerance: number;
  metrics: EvaluationMetrics;
}

/**
 * Default metrics values
 */
const DEFAULT_METRICS: EvaluationMetrics = {
  accuracy: 0,
  precision: 0,
  recall: 0,
  f1Score: 0,
  processingTime: 0
};

/**
 * Main store interface
 */
interface EvaluationState {
  // Document data
  document: string;
  groundTruth: Redaction[];
  detections: Redaction[];
  
  // Settings
  riskTolerance: number;
  
  // Results
  metrics: EvaluationMetrics;
  history: EvaluationRun[];
  isLoading: boolean;
  
  // Actions
  setDocument: (document: string) => void;
  setGroundTruth: (groundTruth: Redaction[]) => void;
  setDetections: (detections: Redaction[]) => void;
  setRiskTolerance: (riskTolerance: number) => void;
  setMetrics: (metrics: EvaluationMetrics) => void;
  setIsLoading: (isLoading: boolean) => void;
  addToHistory: (run: Omit<EvaluationRun, "id" | "date">) => void;
  deleteFromHistory: (id: string) => void;
  clearHistory: () => void;
  reset: () => void;
  clearAll: () => void;
}

/**
 * Create the evaluation store
 */
export const useEvaluationStore = create<EvaluationState>()(
  persist(
    (set) => ({
      // Initial state
      document: "",
      groundTruth: [],
      detections: [],
      riskTolerance: 0.5,
      metrics: { ...DEFAULT_METRICS },
      history: [],
      isLoading: false,
      
      // Actions
      setDocument: (document) => set({ document }),
      setGroundTruth: (groundTruth) => set({ groundTruth }),
      setDetections: (detections) => set({ detections }),
      setRiskTolerance: (riskTolerance) => set({ riskTolerance }),
      setMetrics: (metrics) => set({ metrics }),
      setIsLoading: (isLoading) => set({ isLoading }),
      
      addToHistory: (run) => set((state) => ({
        history: [
          ...state.history,
          {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            ...run
          }
        ]
      })),
      
      deleteFromHistory: (id) => set((state) => ({
        history: state.history.filter((item) => item.id !== id)
      })),
      
      clearHistory: () => set({ history: [] }),
      
      reset: () => set({
        detections: [],
        metrics: { ...DEFAULT_METRICS }
      }),
      
      clearAll: () => set({
        document: "",
        groundTruth: [],
        detections: [],
        metrics: { ...DEFAULT_METRICS }
      })
    }),
    {
      name: "evaluation-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        riskTolerance: state.riskTolerance,
        history: state.history
      })
    }
  )
); 
