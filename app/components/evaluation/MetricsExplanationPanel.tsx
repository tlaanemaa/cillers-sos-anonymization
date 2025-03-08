import React from 'react';

/**
 * Component that explains the evaluation metrics
 */
export default function MetricsExplanationPanel() {
  return (
    <div className="space-y-6 text-gray-300 text-sm">
      <div>
        <h3 className="text-lg font-medium text-white mb-2">Understanding Evaluation Metrics</h3>
        <p className="mb-2">
          When evaluating PII detection, we use several metrics to measure performance. 
          Here's what each of them means:
        </p>
      </div>

      <div className="space-y-4">
        <MetricExplanation 
          title="Accuracy" 
          color="bg-sky-500/20" 
          description="The percentage of all PII entities that were correctly handled (true positives divided by the sum of true positives, false positives, and false negatives). This provides an overall performance measure."
          formula="Accuracy = TP / (TP + FP + FN) × 100%"
        />

        <MetricExplanation 
          title="Precision" 
          color="bg-pink-500/20" 
          description="The percentage of detected PII entities that are actually PII. This measures how reliable the positive detections are. Higher precision means fewer false alarms."
          formula="Precision = TP / (TP + FP) × 100%"
        />

        <MetricExplanation 
          title="Recall (Sensitivity)" 
          color="bg-emerald-500/20" 
          description="The percentage of actual PII entities that were successfully detected. This measures how comprehensive the detection is. Higher recall means fewer missed PII items."
          formula="Recall = TP / (TP + FN) × 100%"
        />

        <MetricExplanation 
          title="F1 Score" 
          color="bg-purple-500/20" 
          description="The harmonic mean of precision and recall, providing a balanced measure of both. This is useful when you need a single metric that balances precision and recall."
          formula="F1 Score = 2 × (Precision × Recall) / (Precision + Recall)"
        />

        <MetricExplanation 
          title="Processing Time" 
          color="bg-blue-500/20" 
          description="The time taken to process the document, in seconds. This measures the efficiency of the detection algorithm."
        />
      </div>

      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 mt-4">
        <h4 className="font-medium text-white mb-2">Types of Detections:</h4>
        <ul className="space-y-2">
          <li className="flex items-start">
            <span className="inline-block w-3 h-3 bg-green-500/20 border border-green-700/30 rounded-sm mr-2 mt-1"></span>
            <span><strong className="text-green-400">True Positives (TP):</strong> PII entities that were correctly identified by the system.</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-3 h-3 bg-red-500/20 border border-red-700/30 rounded-sm mr-2 mt-1"></span>
            <span><strong className="text-red-400">False Negatives (FN):</strong> PII entities that were missed by the system (missed PII).</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-3 h-3 bg-yellow-500/20 border border-yellow-700/30 rounded-sm mr-2 mt-1"></span>
            <span><strong className="text-yellow-400">False Positives (FP):</strong> Non-PII text incorrectly flagged as PII by the system.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

// Sub-component for individual metric explanations
function MetricExplanation({ 
  title, 
  color, 
  description, 
  formula 
}: { 
  title: string;
  color: string;
  description: string;
  formula?: string;
}) {
  return (
    <div className={`p-3 rounded-lg ${color} border border-gray-700`}>
      <h4 className="font-medium text-white mb-1">{title}</h4>
      <p className="mb-1">{description}</p>
      {formula && (
        <div className="font-mono text-xs bg-black/20 py-1 px-2 rounded">
          {formula}
        </div>
      )}
    </div>
  );
} 
