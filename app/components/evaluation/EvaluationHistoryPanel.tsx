"use client";

import { useState } from "react";
import { 
  ChartBarIcon, 
  TrashIcon, 
  ArrowDownTrayIcon,
  FolderOpenIcon,
  XMarkIcon,
  QuestionMarkCircleIcon
} from "@heroicons/react/24/outline";
import Card from "../shared/Card";
import { useEvaluationStore, EvaluationRun } from "@/app/store/evaluationStore";
import MetricsExplanationPanel from "./MetricsExplanationPanel";
import PerformanceChart from "./PerformanceChart";

export default function EvaluationHistoryPanel() {
  const { history, deleteFromHistory, clearHistory } = useEvaluationStore();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showMetricsExplanation, setShowMetricsExplanation] = useState(false);
  
  // Handle CSV export of evaluation history
  const handleExportCSV = () => {
    if (history.length === 0) return;
    
    const headers = ['Date', 'Run Name', 'Notes', 'Threshold', 'Accuracy', 'Precision', 'Recall', 'F1 Score', 'Processing Time'];
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...history.map(run => [
        new Date(run.date).toLocaleString(),
        `"${run.name}"`,
        `"${run.notes.replace(/"/g, '""')}"`, // Escape quotes for CSV
        (run.riskTolerance * 100).toFixed(0) + '%',
        run.metrics.accuracy.toFixed(2),
        run.metrics.precision.toFixed(2),
        run.metrics.recall.toFixed(2),
        run.metrics.f1Score.toFixed(4),
        run.metrics.processingTime.toFixed(2)
      ].join(','))
    ].join('\n');
    
    // Create and download blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pii-evaluation-history-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (history.length === 0) {
    return (
      <Card title="Evaluation History" icon={<ChartBarIcon className="w-5 h-5" />}>
        <div className="p-6 text-center text-gray-500">
          <FolderOpenIcon className="w-10 h-10 mx-auto mb-2 text-gray-700" />
          <p>No evaluation history yet</p>
          <p className="text-xs mt-1">Run evaluations to track model performance over time</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card
      title="Evaluation History"
      icon={<ChartBarIcon className="w-5 h-5" />}
      action={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMetricsExplanation(!showMetricsExplanation)}
            className="text-xs flex items-center text-gray-400 hover:text-gray-300"
            title="Metrics Explanation"
          >
            <QuestionMarkCircleIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCSV}
            className="text-xs flex items-center text-gray-400 hover:text-gray-300"
            title="Export history as CSV"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="text-xs flex items-center text-gray-400 hover:text-red-400"
            title="Clear history"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      }
    >
      {/* Confirmation modal for clearing history */}
      {showConfirmDelete && (
        <div className="absolute inset-0 bg-gray-900/90 z-10 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 max-w-md">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-medium text-white">Clear Evaluation History?</h3>
              <button 
                onClick={() => setShowConfirmDelete(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-300 mb-4">
              This will permanently delete all {history.length} evaluation records. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearHistory();
                  setShowConfirmDelete(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Metrics explanation modal */}
      {showMetricsExplanation && (
        <div className="absolute inset-0 bg-gray-900/90 z-10 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 max-w-xl w-full">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-medium text-white">Evaluation Metrics Explained</h3>
              <button 
                onClick={() => setShowMetricsExplanation(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              <MetricsExplanationPanel />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowMetricsExplanation(false)}
                className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-3">
        {/* Performance trend chart */}
        <div className="bg-gray-800/30 rounded-lg border border-gray-700/50 p-3">
          <PerformanceChart 
            data={history} 
            height={180} 
          />
        </div>
        
        {/* History table - dynamic max height based on number of items */}
        <div className="mt-4 text-sm">
          <div className="rounded-lg border border-gray-700/30">
            <table className="w-full">
              <thead className="bg-gray-800 shadow-sm">
                <tr className="border-b border-gray-700">
                  <th className="px-2 py-2 text-left text-xs text-gray-400 font-normal">Run</th>
                  <th className="px-2 py-2 text-right text-xs text-gray-400 font-normal">Threshold</th>
                  <th className="px-2 py-2 text-right text-xs text-gray-400 font-normal">Accuracy</th>
                  <th className="px-2 py-2 text-right text-xs text-gray-400 font-normal">Precision</th>
                  <th className="px-2 py-2 text-right text-xs text-gray-400 font-normal">Recall</th>
                  <th className="px-2 py-2 text-right text-xs text-gray-400 font-normal">F1</th>
                  <th className="px-2 py-2 text-right text-xs text-gray-400 font-normal"></th>
                </tr>
              </thead>
              <tbody>
                {history.slice().reverse().map((run) => (
                  <tr key={run.id} className="border-b border-gray-800/60 hover:bg-gray-800/30">
                    <td className="px-2 py-2">
                      <div className="font-medium text-gray-300">{run.name}</div>
                      <div className="text-xs text-gray-500">{new Date(run.date).toLocaleString()}</div>
                      {run.notes && (
                        <div className="text-xs text-gray-400 mt-1 italic">{run.notes}</div>
                      )}
                    </td>
                    <td className="px-2 py-2 text-right text-amber-400">{(run.riskTolerance * 100).toFixed(0)}%</td>
                    <td className="px-2 py-2 text-right text-sky-400">{run.metrics.accuracy.toFixed(1)}%</td>
                    <td className="px-2 py-2 text-right text-pink-400">{run.metrics.precision.toFixed(1)}%</td>
                    <td className="px-2 py-2 text-right text-emerald-400">{run.metrics.recall.toFixed(1)}%</td>
                    <td className="px-2 py-2 text-right text-purple-400">{(run.metrics.f1Score * 100).toFixed(1)}%</td>
                    <td className="px-2 py-2 text-right">
                      <button
                        onClick={() => deleteFromHistory(run.id)}
                        className="text-gray-400 hover:text-red-400"
                        title="Delete this record"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  );
} 
