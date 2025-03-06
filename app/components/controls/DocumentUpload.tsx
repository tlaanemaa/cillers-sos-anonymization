import { useDocumentStore } from '@/app/store/documentStore';
import { SAMPLE_TEXT } from '@/app/lib/anonymizer';

export default function DocumentUpload() {
  const { setOriginalText } = useDocumentStore();
  
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setOriginalText(text);
    };
    
    reader.readAsText(file);
  };
  
  const loadDemoText = () => {
    setOriginalText(SAMPLE_TEXT);
  };

  return (
    <section className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Get Started</h2>
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Upload a document</h3>
          <input 
            type="file" 
            accept=".txt" 
            onChange={handleDocumentUpload}
            className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
          />
          <p className="mt-1 text-xs text-gray-500">Only .txt files are supported for now</p>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-2">Or try a demo</h3>
          <button 
            onClick={loadDemoText}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-md border border-blue-200"
          >
            Load Demo Text
          </button>
        </div>
      </div>
    </section>
  );
} 