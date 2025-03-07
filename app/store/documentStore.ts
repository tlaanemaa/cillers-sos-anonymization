import { create } from "zustand";
import { Redaction } from "@/ai/schemas";

interface DocumentState {
  // UI Controls
  riskTolerance: number;
  setRiskTolerance: (value: number) => void;

  // Document state
  originalText: string;
  setOriginalText: (text: string) => void;
  anonymizedText: string;
  setAnonymizedText: (text: string) => void;

  // Detection state
  detections: Redaction[];
  setDetections: (detections: Redaction[]) => void;
  addDetection: (detection: Redaction) => void;
  removeDetection: (id: string) => void;

  // Actions
  reset: () => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  // UI Controls
  riskTolerance: 0.5,
  setRiskTolerance: (value: number) => set({ riskTolerance: value }),

  // Document state
  originalText: "",
  setOriginalText: (text: string) =>
    set({
      originalText: text,
      detections: [],
      anonymizedText: "",
    }),

  anonymizedText: "",
  setAnonymizedText: (text: string) =>
    set({
      anonymizedText: text,
    }),

  // Detection state
  detections: [],
  setDetections: (detections: Redaction[]) => set({ detections }),

  addDetection: (detection: Redaction) =>
    set((state) => ({
      detections: [...state.detections, detection],
    })),

  removeDetection: (id: string) =>
    set((state) => ({
      detections: state.detections.filter((detection) => detection.id !== id),
    })),

  // Actions
  reset: () =>
    set({
      originalText: "",
      anonymizedText: "",
      detections: [],
    }),
}));
