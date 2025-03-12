"use client";

import { PII_TYPES, PiiType } from "@/ai/schemas";
import { CheckIcon } from "@heroicons/react/24/solid";

// Map PII types to user-friendly labels
const PII_TYPE_LABELS: Record<string, string> = {
  name: "Names",
  address: "Addresses",
  phone: "Phone Numbers",
  email: "Email Addresses",
  ip: "IP Addresses",
  "credit-card": "Credit Cards",
  other: "Other PII",
};

// Create the UI-ready PII types (excluding MANUAL_PII which is for user-selected text)
const UI_PII_TYPES = PII_TYPES.filter((type) => type !== "MANUAL_PII").map(
  (type) => ({
    id: type,
    label:
      PII_TYPE_LABELS[type] || type.charAt(0).toUpperCase() + type.slice(1),
  })
);

interface PiiTypeSelectorProps {
  selectedTypes: PiiType[];
  onChange: (types: PiiType[]) => void;
}

export default function PiiTypeSelector({
  selectedTypes,
  onChange,
}: PiiTypeSelectorProps) {
  // Toggle PII type selection
  const togglePiiType = (typeId: PiiType) => {
    const newTypes = selectedTypes.includes(typeId)
      ? selectedTypes.filter((id) => id !== typeId)
      : [...selectedTypes, typeId];

    onChange(newTypes);
  };

  return (
    <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700/40 mb-4">
      <label className="text-sm text-gray-300 block mb-2">
        PII Types to Detect
      </label>
      <div className="grid grid-cols-2 gap-2">
        {UI_PII_TYPES.map((type) => (
          <div key={type.id} className="flex items-center">
            <div 
              onClick={() => togglePiiType(type.id)}
              className="relative mr-2 h-4 w-4 flex-shrink-0 cursor-pointer"
            >
              {/* Custom checkbox container */}
              <div className={`
                h-4 w-4 rounded 
                ${selectedTypes.includes(type.id) 
                  ? 'bg-gradient-to-br from-sky-500 to-indigo-500 border-transparent' 
                  : 'bg-gray-700 border border-gray-600'} 
              `}>
                {/* Checkmark icon */}
                {selectedTypes.includes(type.id) && (
                  <CheckIcon className="h-4 w-4 text-white p-px" aria-hidden="true" />
                )}
              </div>
              {/* Hidden real checkbox for accessibility */}
              <input
                type="checkbox"
                id={`pii-type-${type.id}`}
                checked={selectedTypes.includes(type.id)}
                onChange={() => togglePiiType(type.id)}
                className="sr-only"
              />
            </div>
            <label
              htmlFor={`pii-type-${type.id}`}
              className="text-sm text-gray-300 cursor-pointer"
            >
              {type.label}
            </label>
          </div>
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-400">
        <span>Leave all unchecked to detect all types</span>
      </div>
    </div>
  );
}
