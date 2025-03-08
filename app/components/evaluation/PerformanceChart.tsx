"use client";

import React, { useState } from 'react';
import { EvaluationRun } from '@/app/store/evaluationStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';

interface PerformanceChartProps {
  data: EvaluationRun[];
  height?: number;
}

/**
 * Performance chart component using Recharts library
 * Displays accuracy, precision, and recall for each evaluation run
 */
export default function PerformanceChart({ data, height = 220 }: PerformanceChartProps) {
  // Handle empty data case
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-gray-900/50 border border-gray-800 rounded-lg">
        <div className="text-gray-400 text-sm">
          No performance data available
        </div>
      </div>
    );
  }

  // Sort data by date
  const sortedData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(run => ({
      name: new Date(run.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
      fullDate: new Date(run.date).toLocaleDateString(),
      runName: run.name || 'Evaluation Run',
      accuracy: run.metrics?.accuracy || 0,
      precision: run.metrics?.precision || 0,
      recall: run.metrics?.recall || 0,
      threshold: (run.riskTolerance * 100).toFixed(0)
    }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 text-white text-xs p-3 rounded-lg shadow-lg border border-gray-700">
          <div className="font-medium text-gray-100">
            {payload[0]?.payload.runName}
          </div>
          <div className="text-gray-400 text-xs">{payload[0]?.payload.fullDate}</div>
          <div className="text-gray-400 text-xs">Threshold: {payload[0]?.payload.threshold}%</div>
          <div className="mt-2 space-y-1.5">
            <div className="flex justify-between gap-4">
              <span className="text-sky-400">Accuracy:</span>
              <span className="font-medium">{payload[0]?.value?.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-pink-400">Precision:</span>
              <span className="font-medium">{payload[1]?.value?.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-emerald-400">Recall:</span>
              <span className="font-medium">{payload[2]?.value?.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom legend styles
  const renderLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <div className="flex justify-center items-center gap-4 mt-1">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-1">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-gray-400">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full bg-gray-900/50 border border-gray-800 rounded-lg p-4">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={sortedData}
          margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
          barGap={2}
          barSize={sortedData.length > 8 ? 8 : 12}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="rgba(55, 65, 81, 0.3)" 
          />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickLine={{ stroke: 'rgba(55, 65, 81, 0.5)' }}
            axisLine={{ stroke: 'rgba(55, 65, 81, 0.5)' }}
            interval={sortedData.length > 12 ? 1 : 0}
          />
          <YAxis 
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickLine={{ stroke: 'rgba(55, 65, 81, 0.5)' }}
            axisLine={{ stroke: 'rgba(55, 65, 81, 0.5)' }}
            domain={[0, 100]}
            tickCount={5}
            unit="%"
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(55, 65, 81, 0.2)' }}
          />
          <Legend 
            content={renderLegend}
            height={20}
          />
          <Bar 
            dataKey="accuracy" 
            name="Accuracy" 
            fill="#0ea5e9" 
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            dataKey="precision" 
            name="Precision" 
            fill="#ec4899" 
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            dataKey="recall" 
            name="Recall" 
            fill="#10b981" 
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 
