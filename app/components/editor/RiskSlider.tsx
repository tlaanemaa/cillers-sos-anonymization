"use client";

import { SmallText } from "../shared/Typography";

interface RiskSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function RiskSlider({ value, onChange }: RiskSliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };
  
  return (
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
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
      />
      
      <SmallText className="mt-2 text-center">
        {value <= 0.3 ? "Conservative: detects more potential PII" : 
         value >= 0.7 ? "Aggressive: focuses on high-confidence PII only" : 
         "Balanced: moderate sensitivity to PII"}
      </SmallText>
    </div>
  );
} 
