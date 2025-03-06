import { useState, useEffect } from 'react';
import { useDocumentStore } from '@/app/store/documentStore';
import { detectPII, anonymizeText } from '@/app/lib/anonymizer';
import { MagnifyingGlassIcon, ArchiveBoxIcon, ArrowDownTrayIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

export default function ActionControls() {
  const { 
    originalText, 
    detections, 
    isAnonymized,
    setDetections,
    setAnonymizedText
  } = useDocumentStore();
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Debug log
  useEffect(() => {
    console.log('ActionControls state:', { 
      hasText: !!originalText, 
      detectionsCount: detections.length, 
      isAnonymized 
    });
  }, [originalText, detections, isAnonymized]);

  if (!originalText) return null;
  
  const handleDetectPII = () => {
    console.log('Detecting PII...');
    setIsProcessing(true);
    
    // Use setTimeout to avoid blocking the UI
    setTimeout(() => {
      const foundDetections = detectPII(originalText);
      console.log('Found detections:', foundDetections);
      setDetections(foundDetections);
      setIsProcessing(false);
    }, 10);
  };
  
  const handleAnonymize = () => {
    console.log('Anonymizing text...');
    setIsProcessing(true);
    
    // Use setTimeout to allow for animation to complete
    setTimeout(() => {
      const anonymizedText = anonymizeText(originalText, detections);
      setAnonymizedText(anonymizedText);
      setIsProcessing(false);
    }, 800);
  };
  
  const handleDownload = () => {
    if (!isAnonymized) return;
    
    const blob = new Blob([anonymizeText(originalText, detections)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anonymized_document.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section>
      <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 mb-6 flex items-center">
        <AdjustmentsHorizontalIcon className="w-5 h-5 mr-3 text-sky-400" />
        Controls
      </h2>
      <div className="flex flex-col gap-4">
        {!isAnonymized ? (
          <>
            <button 
              onClick={handleDetectPII}
              className="btn-primary"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="w-5 h-5 mr-3 hover:scale-110 transition-transform" />
                  <span>Detect PII</span>
                </>
              )}
            </button>
            
            {detections.length > 0 && (
              <button 
                onClick={handleAnonymize}
                className="btn-secondary"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Anonymizing...
                  </>
                ) : (
                  <>
                    <ArchiveBoxIcon className="w-5 h-5 mr-3 hover:scale-110 transition-transform" />
                    <span>Anonymize Document</span>
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          <button 
            onClick={handleDownload}
            className="btn-success"
          >
            <ArrowDownTrayIcon className="w-5 h-5 mr-3 hover:scale-110 transition-transform" />
            <span>Download Anonymized Document</span>
          </button>
        )}
      </div>
    </section>
  );
} 