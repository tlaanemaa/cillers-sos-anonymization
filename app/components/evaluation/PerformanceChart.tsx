"use client";

import React from 'react';
import { EvaluationRun } from '@/app/store/evaluationStore';

interface PerformanceChartProps {
  data: EvaluationRun[];
  height?: number;
}

/**
 * Simple chart for visualizing evaluation metrics with 3 bars per evaluation
 */
export default function PerformanceChart({ data, height = 180 }: PerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-gray-500 text-sm p-4 text-center">
        No performance data available
      </div>
    );
  }

  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Take only the last 8 runs to avoid overcrowding
  const displayData = sortedData.slice(-8);

  // Calculate the maximum height in pixels (subtract some space for labels)
  const maxBarHeight = height - 30;

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-4 mb-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-sky-500 rounded"></div>
          <span className="text-xs text-gray-300">Accuracy</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-pink-500 rounded"></div>
          <span className="text-xs text-gray-300">Precision</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-emerald-500 rounded"></div>
          <span className="text-xs text-gray-300">Recall</span>
        </div>
      </div>
      
      <div className="relative" style={{ height: `${height}px` }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
          <div className="absolute -left-8 -top-2">100%</div>
          <div className="absolute -left-8 top-1/4 -translate-y-1/2">75%</div>
          <div className="absolute -left-8 top-1/2 -translate-y-1/2">50%</div>
          <div className="absolute -left-8 top-3/4 -translate-y-1/2">25%</div>
          <div className="absolute -left-8 bottom-0 -translate-y-1">0%</div>
        </div>
        
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div className="border-b border-dashed border-gray-700/30 h-1/4"></div>
          <div className="border-b border-dashed border-gray-700/30 h-1/4"></div>
          <div className="border-b border-dashed border-gray-700/30 h-1/4"></div>
          <div className="border-b border-dashed border-gray-700/30 h-1/4"></div>
        </div>
        
        {/* Chart container */}
        <div className="absolute inset-0 flex items-end justify-between pl-2 pr-2 pb-6 border-l border-b border-gray-700/50">
          {displayData.map((run, index) => {
            // Ensure we have some default values if metrics are missing
            const accuracy = run.metrics?.accuracy || 0;
            const precision = run.metrics?.precision || 0;
            const recall = run.metrics?.recall || 0;
            
            // Calculate pixel heights (minimum 2px to ensure visibility)
            const accuracyHeight = Math.max(2, (accuracy / 100) * maxBarHeight);
            const precisionHeight = Math.max(2, (precision / 100) * maxBarHeight);
            const recallHeight = Math.max(2, (recall / 100) * maxBarHeight);
            
            return (
              <div key={index} className="flex flex-col items-center group">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 bg-gray-800 text-white text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                  <div className="font-medium">{run.name || `Run ${index + 1}`}</div>
                  <div className="text-gray-300 text-xs">{new Date(run.date).toLocaleDateString()}</div>
                  <div className="mt-1 space-y-1">
                    <div className="flex justify-between gap-2">
                      <span className="text-sky-400">Accuracy:</span>
                      <span>{accuracy.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-pink-400">Precision:</span>
                      <span>{precision.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-emerald-400">Recall:</span>
                      <span>{recall.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                
                {/* Bars container */}
                <div className="flex gap-1 items-end">
                  {/* Accuracy bar */}
                  <div 
                    className="w-4 bg-sky-500 rounded-t transition-all duration-300"
                    style={{ height: `${accuracyHeight}px` }}
                  ></div>
                  
                  {/* Precision bar */}
                  <div 
                    className="w-4 bg-pink-500 rounded-t transition-all duration-300"
                    style={{ height: `${precisionHeight}px` }}
                  ></div>
                  
                  {/* Recall bar */}
                  <div 
                    className="w-4 bg-emerald-500 rounded-t transition-all duration-300"
                    style={{ height: `${recallHeight}px` }}
                  ></div>
                </div>
                
                {/* X-axis label */}
                <div className="mt-1 text-xs text-gray-400 text-center">
                  {new Date(run.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 
