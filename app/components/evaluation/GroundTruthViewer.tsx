"use client";

import { useState } from "react";
import { GroundTruthPII } from "@/app/store/evaluationStore";
import { DocumentTextIcon, EyeIcon, PencilIcon } from "@heroicons/react/24/outline";

interface GroundTruthViewerProps {
  document: string;
  annotations: GroundTruthPII[];
  onAnnotationAdded?: (annotation: GroundTruthPII) => void;
  onAnnotationRemoved?: (id: string) => void;
  isEditable?: boolean;
}

export default function GroundTruthViewer({
  document,
  annotations,
  onAnnotationAdded,
  onAnnotationRemoved,
  isEditable = false,
}: GroundTruthViewerProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!document || document.trim() === '') {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-700" />
            <p>No document loaded</p>
            <p className="text-sm mt-2">Upload a text file with tagged PII to start evaluation.</p>
          </div>
        </div>
      </div>
    );
  }

  const highlightDocument = () => {
    if (!document) return document;

    // Sort annotations by start position to handle overlapping annotations
    const sortedAnnotations = [...annotations].sort((a, b) => a.start - b.start);
    
    // Build the highlighted text
    const result = [];
    let lastIndex = 0;
    
    for (const annotation of sortedAnnotations) {
      // Add text before this annotation
      if (lastIndex < annotation.start) {
        result.push(document.substring(lastIndex, annotation.start));
      }
      
      // Add the highlighted annotation
      const annotatedText = document.substring(annotation.start, annotation.end);
      result.push(
        `<mark class="bg-yellow-500/30 text-yellow-200 px-1 rounded relative group">
          ${annotatedText}
          <span class="absolute top-0 -translate-y-full left-0 bg-gray-800 text-xs px-2 py-1 rounded 
            text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
            ${annotation.type}
          </span>
          ${isEditing ? 
            `<button class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 
              flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
              data-id="${annotation.id}">
              ×
            </button>` 
            : ''
          }
        </mark>`
      );
      
      lastIndex = annotation.end;
    }
    
    // Add any remaining text
    if (lastIndex < document.length) {
      result.push(document.substring(lastIndex));
    }
    
    return result.join('');
  };

  const handleDocumentClick = (e: React.MouseEvent) => {
    if (!isEditing || !onAnnotationRemoved) return;
    
    // Check if clicked on a remove button
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' && target.hasAttribute('data-id')) {
      const id = target.getAttribute('data-id');
      if (id) {
        onAnnotationRemoved(id);
      }
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white flex items-center">
          <DocumentTextIcon className="w-5 h-5 mr-2 text-yellow-500" />
          Ground Truth Document
        </h3>
        
        {isEditable && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center text-sm px-3 py-1 rounded transition-colors ${
              isEditing 
                ? 'bg-pink-600 hover:bg-pink-700 text-white' 
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            {isEditing ? (
              <>
                <EyeIcon className="w-4 h-4 mr-1" />
                View Mode
              </>
            ) : (
              <>
                <PencilIcon className="w-4 h-4 mr-1" />
                Edit Mode
              </>
            )}
          </button>
        )}
      </div>
      
      <div 
        className="bg-gray-950 rounded p-4 border border-gray-800 max-h-[600px] overflow-auto"
        onClick={handleDocumentClick}
      >
        <div 
          className="whitespace-pre-wrap font-mono text-sm text-gray-300"
          dangerouslySetInnerHTML={{ __html: highlightDocument() }}
        ></div>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="text-gray-400">
          <span className="text-yellow-500 font-medium">{annotations.length}</span> PII entities marked
        </div>
        
        {isEditing && (
          <div className="text-gray-400">
            Click on × to remove an annotation
          </div>
        )}
      </div>
    </div>
  );
} 
