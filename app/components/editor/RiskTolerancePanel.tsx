"use client";

import RiskSlider from "./RiskSlider";

interface RiskTolerancePanelProps {
  riskTolerance: number;
  onChange: (value: number) => void;
}

export default function RiskTolerancePanel({
  riskTolerance,
  onChange,
}: RiskTolerancePanelProps) {
  return (
    <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700/40 mb-4">
      <div className="mb-2 flex justify-between">
        <label className="text-sm text-gray-300">Risk Tolerance</label>
        <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">
          {Math.round(riskTolerance * 100)}%
        </span>
      </div>
      <RiskSlider value={riskTolerance} onChange={onChange} />
      <div className="mt-2 flex justify-between text-xs text-gray-400">
        <span>Conservative</span>
        <span>Aggressive</span>
      </div>
    </div>
  );
}
