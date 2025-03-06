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
    <section className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold dark:text-white">
          {isAnonymized ? 'Anonymized Document' : 'Original Document'}
        </h2>
        
        <div className="flex items-center gap-2 text-sm">
          {detections.length > 0 && (
            <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
              {detections.length} items detected
            </span>
          )}
          
          <button 
            onClick={reset}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
          >
            Reset
          </button>
        </div>
      </div>
      
      {isAnonymized ? (
        <div className="whitespace-pre-wrap font-mono text-sm p-4 bg-gray-50 dark:bg-gray-800 rounded min-h-[200px] max-h-[500px] overflow-auto dark:text-gray-200">
          {anonymizedText}
        </div>
      ) : (
        <TextHighlighter
          text={originalText}
          detections={detections}
          isAnonymized={isAnonymized}
          onAddHighlight={(start, end) => {
            console.log('Adding custom highlight:', { start, end });
            addDetection({
              type: 'custom',
              start,
              end,
              id: `custom-${Date.now()}`
            });
          }}
          onRemoveHighlight={(id) => {
            console.log('Removing highlight:', id);
            removeDetection(id);
          }}
        />
      )}
      
      {!isAnonymized && detections.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <span className="font-semibold">Tip:</span> Select any text to add a custom highlight, or click the × 
            on existing highlights to remove them.
          </p>
        </div>
      )}
    </section>
  );
} 