import { useDocumentStore } from '@/app/store/documentStore';

export default function InfoSection() {
  const { originalText, isAnonymized, detections } = useDocumentStore();

  if (!originalText || isAnonymized || detections.length === 0) return null;

  return (
    <section className="bg-blue-50 p-6 rounded-lg border border-blue-100">
      <h2 className="text-lg font-semibold mb-2 text-blue-800">How It Works</h2>
      <ol className="list-decimal list-inside text-sm text-blue-700 space-y-2">
        <li>Click <strong>Detect PII</strong> to automatically find personally identifiable information.</li>
        <li>Review the highlighted sections, add or remove highlights as needed.</li>
        <li>Click <strong>Anonymize Document</strong> to replace highlighted text with black boxes.</li>
        <li>Download your anonymized document.</li>
      </ol>
    </section>
  );
} 