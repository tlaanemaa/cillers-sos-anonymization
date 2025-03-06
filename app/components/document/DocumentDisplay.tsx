import { useDocumentStore } from '@/app/store/documentStore';
import TextHighlighter from './TextHighlighter';

export default function DocumentDisplay() {
  const { 
    originalText, 
    anonymizedText, 
    detections, 
    isAnonymized,
    addDetection,
    removeDetection,
    reset
  } = useDocumentStore();

  if (!originalText) return null;

  return (
    <section className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {isAnonymized ? 'Anonymized Document' : 'Original Document'}
        </h2>
        
        <div className="flex items-center gap-2 text-sm">
          {detections.length > 0 && (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              {detections.length} items detected
            </span>
          )}
          
          <button 
            onClick={reset}
            className="text-gray-500 hover:text-gray-700 underline"
          >
            Reset
          </button>
        </div>
      </div>
      
      {isAnonymized ? (
        <div className="whitespace-pre-wrap font-mono text-sm p-4 bg-gray-50 rounded min-h-[200px] max-h-[500px] overflow-auto">
          {anonymizedText}
        </div>
      ) : (
        <TextHighlighter
          text={originalText}
          detections={detections}
          isAnonymized={isAnonymized}
          onAddHighlight={(start, end) => {
            addDetection({
              type: 'custom',
              start,
              end,
              id: `custom-${Date.now()}`
            });
          }}
          onRemoveHighlight={removeDetection}
        />
      )}
      
      {!isAnonymized && detections.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          <p>
            <span className="font-semibold">Tip:</span> Select any text to add a custom highlight, or click the × 
            on existing highlights to remove them.
          </p>
        </div>
      )}
    </section>
  );
} 