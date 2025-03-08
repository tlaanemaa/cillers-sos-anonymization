import { useState } from "react";
import { useEvaluationStore } from "@/app/store/evaluationStore";
import Card from "../shared/Card";
import { ChartBarSquareIcon, BoltIcon } from "@heroicons/react/24/outline";

/**
 * Check if two spans overlap significantly (80% or more)
 */
function hasSignificantOverlap(a: any, b: any) {
  if (!a || !b) return false;
  
  const overlap = Math.max(0, Math.min(a.end, b.end) - Math.max(a.start, b.start));
  const aLength = a.end - a.start;
  const bLength = b.end - b.start;
  return overlap >= 0.8 * Math.min(aLength, bLength);
}

/**
 * Find true positive detections (those that match ground truth)
 */
function findTruePositives(detections: any[], groundTruth: any[]) {
  return groundTruth.filter(gt => 
    detections.some(d => hasSignificantOverlap(d, gt))
  );
}

/**
 * Component for individual metric display
 */
interface MetricSummaryProps {
  title: string;
  value: number;
  color?: string;
  formatter?: (value: number) => string;
  tooltip?: string;
}

function MetricSummary({ 
  title, 
  value, 
  color = "text-sky-400", 
  formatter = (v) => `${v.toFixed(2)}%`,
  tooltip
}: MetricSummaryProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-2 relative group">
      <div className="flex flex-col">
        <div className="text-xs text-gray-400 mb-1">{title}</div>
        <div className={`text-lg font-bold ${color}`}>
          {formatter(value)}
        </div>
        {tooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 p-2 bg-gray-900 rounded shadow-lg text-xs text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-30">
            {tooltip}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Main metrics overview component
 */
export default function MetricsOverview() {
  const {
    metrics,
    detections,
    groundTruth
  } = useEvaluationStore();

  const [showDetailed, setShowDetailed] = useState(false);

  // If no detection has been run, don't show metrics
  if (!detections || detections.length === 0) {
    return null;
  }

  // Calculate detection counts for detailed view
  const truePositives = findTruePositives(detections, groundTruth).length;
  const falseNegatives = groundTruth.length - truePositives;
  const falsePositives = detections.length - truePositives;

  return (
    <Card 
      title="Evaluation Results" 
      icon={<ChartBarSquareIcon className="w-5 h-5" />}
      action={
        <button 
          onClick={() => setShowDetailed(!showDetailed)}
          className="text-xs flex items-center text-sky-400 hover:text-sky-300"
          title={showDetailed ? "Show Basic View" : "Show Detailed View"}
        >
          <BoltIcon className="w-3 h-3 mr-1" />
          {showDetailed ? "Basic View" : "Detailed View"}
        </button>
      }
    >
      <div className="p-3">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <MetricSummary 
            title="Accuracy" 
            value={metrics.accuracy} 
            color="text-sky-400" 
            tooltip="Percentage of all PII entities that were correctly handled."
          />
          <MetricSummary 
            title="Precision" 
            value={metrics.precision} 
            color="text-pink-400"
            tooltip="Percentage of detected PII entities that are actually PII."
          />
          <MetricSummary 
            title="Recall" 
            value={metrics.recall} 
            color="text-emerald-400"
            tooltip="Percentage of actual PII entities that were successfully detected."
          />
          <MetricSummary 
            title="F1 Score" 
            value={metrics.f1Score * 100} 
            color="text-purple-400"
            tooltip="Harmonic mean of precision and recall."
          />
        </div>

        <div className="bg-gray-800/50 rounded-lg p-2 mb-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400">Processing Time:</div>
            <div className="text-sm font-medium text-blue-400">
              {metrics.processingTime.toFixed(2)}s
            </div>
          </div>
        </div>
        
        {showDetailed && (
          <div className="mt-4 pt-3 border-t border-gray-700 space-y-4">
            {/* Detection counts */}
            <div className="bg-gray-800/50 rounded-lg p-3">
              <h3 className="text-sm text-gray-400 mb-2">PII Detection Breakdown</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-sm font-medium text-green-400">
                    {truePositives}
                  </div>
                  <div className="text-xs text-gray-500">True Positives</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-red-400">
                    {falseNegatives}
                  </div>
                  <div className="text-xs text-gray-500">False Negatives</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-yellow-400">
                    {falsePositives}
                  </div>
                  <div className="text-xs text-gray-500">False Positives</div>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="bg-gray-800/50 rounded-lg p-3">
              <h3 className="text-sm text-gray-400 mb-2">Detection Legend</h3>
              <div className="grid grid-cols-1 gap-1">
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-green-500/20 border border-green-700/30 rounded-sm mr-2"></span>
                  <span className="text-xs text-gray-300">True Positives - correctly identified PII</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-red-500/20 border border-red-700/30 rounded-sm mr-2"></span>
                  <span className="text-xs text-gray-300">False Negatives - missed PII</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-yellow-500/20 border border-yellow-700/30 rounded-sm mr-2"></span>
                  <span className="text-xs text-gray-300">False Positives - incorrectly flagged</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 
