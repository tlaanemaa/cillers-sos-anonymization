import { useState } from 'react';
import { useDocumentStore } from '@/app/store/documentStore';
import { detectPII, anonymizeText } from '@/app/lib/anonymizer';

export default function ActionControls() {
  const { 
    originalText, 
    detections, 
    isAnonymized,
    setDetections,
    setAnonymizedText
  } = useDocumentStore();
  
  const [isProcessing, setIsProcessing] = useState(false);

  if (!originalText) return null;
  
  const handleDetectPII = () => {
    setIsProcessing(true);
    
    // Use setTimeout to avoid blocking the UI
    setTimeout(() => {
      const foundDetections = detectPII(originalText);
      setDetections(foundDetections);
      setIsProcessing(false);
    }, 10);
  };
  
  const handleAnonymize = () => {
    setIsProcessing(true);
    
    // Use setTimeout to avoid blocking the UI
    setTimeout(() => {
      const anonymizedText = anonymizeText(originalText, detections);
      setAnonymizedText(anonymizedText);
      setIsProcessing(false);
    }, 800); // Delay to allow for animation
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
    <section className="flex gap-4 justify-center">
      {!isAnonymized ? (
        <>
          <button 
            onClick={handleDetectPII}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Detect PII'}
          </button>
          
          {detections.length > 0 && (
            <button 
              onClick={handleAnonymize}
              className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-6 rounded-md"
              disabled={isProcessing}
            >
              {isProcessing ? 'Anonymizing...' : 'Anonymize Document'}
            </button>
          )}
        </>
      ) : (
        <button 
          onClick={handleDownload}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-md"
        >
          Download Anonymized Document
        </button>
      )}
    </section>
  );
} 