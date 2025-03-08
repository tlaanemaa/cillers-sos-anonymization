"use client";

import { useState, useEffect } from "react";
import { 
  PlayIcon,
  XMarkIcon,
  DocumentChartBarIcon
} from "@heroicons/react/24/outline";
import { SmallText } from "../shared/Typography";
import Card from "../shared/Card";
import { useEvaluationStore } from "@/app/store/evaluationStore";
import { evaluateDetection } from "@/app/services/evaluationService";

// Simple loading spinner component
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 mr-3 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// Metric card with tooltip
export interface MetricCardProps {
  title: string;
  value: number;
  description?: string;
  color?: string;
  formatter?: (value: number) => string;
}

function MetricCard({ 
  title, 
  value, 
  description, 
  color = "text-sky-400", 
  formatter = (v) => `${v.toFixed(2)}%`
}: MetricCardProps) {
  const tooltips = {
    "Accuracy": "Percentage of all PII entities that were correctly handled. Higher is better.",
    "Precision": "Percentage of detected PII entities that are actually PII. Measures false positives.",
    "Recall": "Percentage of actual PII entities that were successfully detected. Measures false negatives.",
    "F1 Score": "Harmonic mean of precision and recall. A balanced measure of overall performance.",
    "Processing Time": "Time taken to process the document, in seconds."
  };
  
  const tooltip = tooltips[title as keyof typeof tooltips] || "";

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 relative group">
      <h3 className="text-sm text-gray-400 mb-1 flex items-center">
        {title}
        {tooltip && (
          <span className="ml-1 inline-flex items-center">
            <span className="relative">
              <span className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center text-xs cursor-help">
                ?
              </span>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 rounded shadow-lg text-xs text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
                {tooltip}
              </div>
            </span>
          </span>
        )}
      </h3>
      <div className={`text-2xl font-bold ${color}`}>
        {formatter(value)}
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
  );
}

export default function EvaluationControlPanel() {
  const {
    document,
    groundTruth,
    detections,
    riskTolerance,
    metrics,
    isLoading,
    setDetections,
    setMetrics,
    setRiskTolerance,
    setIsLoading,
    addToHistory
  } = useEvaluationStore();

  const [localRiskTolerance, setLocalRiskTolerance] = useState(riskTolerance);
  const [evaluationNotes, setEvaluationNotes] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Sync local risk tolerance with store
  useEffect(() => {
    setLocalRiskTolerance(riskTolerance);
  }, [riskTolerance]);

  const handleRiskToleranceChange = (value: number) => {
    setLocalRiskTolerance(value);
    setRiskTolerance(value);
  };

  const handleRunEvaluation = async () => {
    if (!document || !groundTruth.length) {
      setError("Please load a document with ground truth PII first");
      return;
    }
    
    setError(null);
    setIsRunning(true);
    setIsLoading(true);
    
    try {
      const result = await evaluateDetection(
        document,
        groundTruth,
        localRiskTolerance
      );
      
      setDetections(result.detections);
      setMetrics(result.metrics);
      
      addToHistory({
        name: `Threshold: ${(localRiskTolerance * 100).toFixed(0)}%`,
        notes: evaluationNotes,
        riskTolerance: localRiskTolerance,
        metrics: result.metrics
      });
    } catch (error) {
      console.error("Error running evaluation:", error);
      setError(error instanceof Error ? error.message : "Error running evaluation");
    } finally {
      setIsLoading(false);
      setIsRunning(false);
    }
  };

  const handleClearResults = () => {
    setDetections([]);
    setError(null);
  };

  // If no document is loaded yet, show guidance
  if (!document) {
    return (
      <Card title="Evaluation Controls" icon={<DocumentChartBarIcon className="w-5 h-5" />}>
        <div className="p-4 bg-gray-800/40 rounded-lg text-center">
          <p className="text-gray-400 mb-4">
            Please upload a text file with tagged PII to begin evaluation.
          </p>
          <p className="text-xs text-gray-500">
            Files should use <code className="bg-gray-700 px-1 rounded">&lt;|PII content|&gt;</code> format to mark ground truth.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card title="Evaluation Controls" icon={<DocumentChartBarIcon className="w-5 h-5" />}>
        <div className="p-4 space-y-4">          
          {/* Evaluation notes field */}
          <div>
            <label htmlFor="evaluation-notes" className="block text-sm text-gray-400 mb-1">
              Evaluation Notes (optional)
            </label>
            <textarea
              id="evaluation-notes"
              value={evaluationNotes}
              onChange={(e) => setEvaluationNotes(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-300 h-20 resize-none"
              placeholder="Add notes about this evaluation..."
            />
          </div>
          
          {/* Risk tolerance slider */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Confidence Threshold: {(localRiskTolerance * 100).toFixed(0)}%
            </label>
            <div className="mb-3">
              <div className="flex justify-between mb-1 text-xs text-slate-400">
                <span>Low Risk Tolerance</span>
                <span>High Risk Tolerance</span>
              </div>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={localRiskTolerance}
                onChange={(e) => handleRiskToleranceChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              
              <SmallText className="mt-2 text-center">
                {localRiskTolerance <= 0.3 ? "Conservative: detects more potential PII" : 
                 localRiskTolerance >= 0.7 ? "Aggressive: focuses on high-confidence PII only" : 
                 "Balanced: moderate sensitivity to PII"}
              </SmallText>
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-800/30 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleRunEvaluation}
              disabled={isLoading || isRunning}
              className={`flex-1 flex items-center justify-center text-white px-4 py-2 rounded-lg transition-colors ${
                isLoading || isRunning 
                  ? 'bg-sky-700 cursor-not-allowed' 
                  : 'bg-sky-600 hover:bg-sky-500'
              }`}
            >
              {isLoading || isRunning ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner />
                  Running...
                </div>
              ) : (
                <>
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Run Evaluation
                </>
              )}
            </button>
            
            {detections.length > 0 && (
              <button
                onClick={handleClearResults}
                disabled={isLoading || isRunning}
                className="flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                title="Clear current results"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
} 
