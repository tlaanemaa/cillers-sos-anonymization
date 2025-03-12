"use client";

interface FreeTextInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function FreeTextInput({ value, onChange }: FreeTextInputProps) {
  return (
    <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700/40 mb-4">
      <label
        htmlFor="free-text-input"
        className="text-sm text-gray-300 block mb-2"
      >
        Additional Context (Optional)
      </label>
      <textarea
        id="free-text-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-700 border border-gray-600 rounded-md text-sm text-gray-300 p-2 focus:ring-blue-500 focus:border-blue-500"
        rows={3}
        placeholder="Add any specific instructions or context for PII detection..."
      />
    </div>
  );
}
