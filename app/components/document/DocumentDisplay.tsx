import { useDocumentStore } from '@/app/store/documentStore';
import TextHighlighter from './TextHighlighter';
import { DocumentTextIcon, ShieldCheckIcon, InformationCircleIcon, ArrowPathIcon, LightBulbIcon } from '@heroicons/react/24/outline';

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
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 flex items-center">
          {isAnonymized ? (
            <>
              <ShieldCheckIcon className="w-5 h-5 mr-3 text-emerald-400" />
              Anonymized Document
            </>
          ) : (
            <>
              <DocumentTextIcon className="w-5 h-5 mr-3 text-sky-400" />
              Original Document
            </>
          )}
        </h2>
        
        <div className="flex items-center gap-3 text-sm">
          {detections.length > 0 && (
            <span className="bg-sky-900/30 text-sky-300 px-3 py-1 rounded-full border border-sky-800/30 flex items-center">
              <InformationCircleIcon className="w-4 h-4 mr-2" />
              {detections.length} items detected
            </span>
          )}
          
          <button 
            onClick={reset}
            className="text-slate-400 hover:text-slate-200 flex items-center group"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Reset
          </button>
        </div>
      </div>
      
      <div className="bg-gray-900/80 rounded-xl overflow-hidden border border-gray-700/30">
        {isAnonymized ? (
          <div className="whitespace-pre-wrap font-mono text-sm p-4 min-h-[300px] max-h-[600px] overflow-auto text-slate-200">
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
      </div>
      
      {!isAnonymized && (
        <div className="mt-4 flex items-center text-sm text-slate-400">
          <LightBulbIcon className="w-4 h-4 mr-2 text-pink-400" />
          <p>
            <span className="font-medium">Tip:</span> Select any text to add a custom highlight, or click the × 
            on existing highlights to remove them.
          </p>
        </div>
      )}
    </section>
  );
} 