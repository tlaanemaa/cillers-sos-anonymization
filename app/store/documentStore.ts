import { create } from 'zustand';

export interface PIIDetection {
  type: string;
  start: number;
  end: number;
  id: string;
}

interface DocumentState {
  // Document state
  originalText: string;
  anonymizedText: string;
  
  // Detection state
  detections: PIIDetection[];
  
  // UI state
  isAnonymized: boolean;
  
  // Actions
  setOriginalText: (text: string) => void;
  setDetections: (detections: PIIDetection[]) => void;
  setAnonymizedText: (text: string) => void;
  addDetection: (detection: PIIDetection) => void;
  removeDetection: (id: string) => void;
  reset: () => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  // Initial state
  originalText: '',
  anonymizedText: '',
  detections: [],
  isAnonymized: false,
  
  // Actions
  setOriginalText: (text: string) => set({
    originalText: text,
    detections: [],
    anonymizedText: '',
    isAnonymized: false
  }),
  
  setDetections: (detections: PIIDetection[]) => set({ detections }),
  
  setAnonymizedText: (text: string) => set({ 
    anonymizedText: text,
    isAnonymized: true
  }),
  
  addDetection: (detection: PIIDetection) => set(state => ({
    detections: [...state.detections, detection]
  })),
  
  removeDetection: (id: string) => set(state => ({
    detections: state.detections.filter(detection => detection.id !== id)
  })),
  
  reset: () => set({
    originalText: '',
    anonymizedText: '',
    detections: [],
    isAnonymized: false
  })
})); 