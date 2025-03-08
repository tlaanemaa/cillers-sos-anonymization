"use client";

interface RiskSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  showLabel?: boolean;
  labelText?: string;
}

export default function RiskSlider({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.05,
  className = "",
  showLabel = true,
  labelText = "Risk Tolerance"
}: RiskSliderProps) {
  // Convert the risk tolerance to a percentage for display
  const percentage = Math.round(value * 100);
  
  // Determine the color gradient based on the value
  const getGradient = () => {
    const lowColor = "from-green-500";
    const medColor = "via-yellow-500";
    const highColor = "to-red-500";
    return `bg-gradient-to-r ${lowColor} ${medColor} ${highColor}`;
  };
  
  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <label className="block text-sm text-gray-400 mb-1">
          {labelText}: {percentage}%
        </label>
      )}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-700"
          style={{
            backgroundImage: 'linear-gradient(to right, #10B981, #F59E0B, #EF4444)',
          }}
        />
        <div className="absolute -top-1 flex justify-between text-xs text-gray-500 w-full px-1">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
} 
