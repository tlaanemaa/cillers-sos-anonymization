"use client";

import { useDocumentStore } from "@/app/store/documentStore";
import { Redaction } from "@/ai/schemas";
import { TrashIcon, ShieldCheckIcon, IdentificationIcon } from "@heroicons/react/24/outline";
import Card from "../shared/Card";
import { SectionTitle, SmallText, Text } from "../shared/Typography";
import IconWrapper from "../shared/IconWrapper";

export default function DetectionsPanel() {
  const { detections, removeDetection, anonymizedText } = useDocumentStore();

  // Don't show detections if we're viewing the anonymized text
  if (anonymizedText) {
    return null;
  }

  return (
    <Card>
      <SectionTitle className="mb-6 flex items-center">
        <IconWrapper className="text-sky-400">
          <IdentificationIcon className="w-5 h-5" />
        </IconWrapper>
        <span className="ml-3">Detected PII</span>
      </SectionTitle>
      
      {!detections.length ? (
        <Text className="text-gray-400 text-sm">
          No PII detected yet. Click &quot;Detect PII&quot; to scan your document.
        </Text>
      ) : (
        <DetectionsList 
          detections={detections}
          onRemove={removeDetection}
        />
      )}
    </Card>
  );
}

interface DetectionsListProps {
  detections: Redaction[];
  onRemove: (id: string) => void;
}

function DetectionsList({ detections, onRemove }: DetectionsListProps) {
  // Group detections by type
  const groupedDetections = detections.reduce((acc, detection) => {
    const { type } = detection;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(detection);
    return acc;
  }, {} as Record<string, typeof detections>);

  // Get type counts for summary
  const typeCounts = Object.entries(groupedDetections).map(([type, items]) => ({
    type,
    count: items.length
  }));

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="p-4 bg-gray-900/50 border border-gray-700/30 rounded-xl">
        <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
          <IconWrapper>
            <ShieldCheckIcon className="w-4 h-4 text-sky-400" />
          </IconWrapper>
          Summary
        </h3>
        <div className="flex flex-wrap gap-2">
          {typeCounts.map(({ type, count }) => (
            <div 
              key={type}
              className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-300 flex items-center"
            >
              <span className="capitalize">{type}</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-gray-700 text-gray-300">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed list - collapsed by default */}
      <div className="space-y-2">
        {Object.entries(groupedDetections).map(([type, items]) => (
          <details key={type} className="p-3 bg-gray-900/50 border border-gray-700/30 rounded-xl">
            <summary className="text-sm font-medium text-gray-300 cursor-pointer capitalize">
              {type} <span className="text-gray-500">({items.length})</span>
            </summary>
            <ul className="mt-2 space-y-1">
              {items.map((detection) => (
                <li 
                  key={detection.id}
                  className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg text-xs"
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      <SmallText className="text-gray-400">
                        Confidence: {Math.round(detection.confidence * 100)}%
                      </SmallText>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemove(detection.id)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    title="Remove detection"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
} 
