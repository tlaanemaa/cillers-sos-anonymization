import { useDocumentStore } from '@/app/store/documentStore';
import DocumentDisplay from './document/DocumentDisplay';
import DocumentUpload from './controls/DocumentUpload';
import ActionControls from './controls/ActionControls';

export default function DocumentAnonymizer() {
  const { originalText } = useDocumentStore();

  return (
    <div className="w-full max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 mb-2 text-center">
        Document Anonymizer
      </h1>
      <p className="text-center text-gray-400 mb-10 max-w-2xl mx-auto">
        Securely detect and anonymize personally identifiable information in your documents
      </p>
      
      {!originalText ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <DocumentUpload />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Document view - left side */}
          <div className="card p-6 lg:flex-1">
            <DocumentDisplay />
          </div>
          
          {/* Controls - right side */}
          <div className="flex flex-col gap-6 lg:w-[320px] lg:flex-shrink-0">
            <div className="card p-6 border-t-4 border-t-sky-500">
              <ActionControls />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 