import { useDocumentStore } from '@/app/store/documentStore';
import DocumentDisplay from './document/DocumentDisplay';
import DocumentUpload from './controls/DocumentUpload';
import ActionControls from './controls/ActionControls';
import InfoSection from './controls/InfoSection';

export default function DocumentAnonymizer() {
  const { originalText } = useDocumentStore();

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto gap-8 p-4">
      {!originalText ? (
        <DocumentUpload />
      ) : (
        <>
          <DocumentDisplay />
          <ActionControls />
          <InfoSection />
        </>
      )}
    </div>
  );
} 