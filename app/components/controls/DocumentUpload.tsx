import { useDocumentStore } from '@/app/store/documentStore';
import { SAMPLE_TEXT } from '@/app/lib/anonymizer';
import { CloudArrowUpIcon, DocumentTextIcon, LightBulbIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

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
    <section className="card p-8 max-w-md w-full">
      <h2 className="text-2xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 flex items-center">
        <CloudArrowUpIcon className="w-6 h-6 mr-3 text-sky-400" />
        Get Started
      </h2>
      <div className="flex flex-col gap-8">
        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700/30">
          <h3 className="text-lg font-medium mb-4 text-slate-100 flex items-center">
            <DocumentTextIcon className="w-5 h-5 mr-3 text-sky-400" />
            Upload a document
          </h3>
          <div className="relative group">
            <input 
              type="file" 
              accept=".txt" 
              onChange={handleDocumentUpload}
              className="block w-full text-sm text-slate-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-xl file:border-0
                    file:text-sm file:font-medium
                    file:bg-gradient-to-r file:from-sky-500 file:to-blue-500
                    file:text-white file:shadow-sm
                    hover:file:from-sky-600 hover:file:to-blue-600 transition-all duration-300 cursor-pointer"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-sky-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity"></div>
          </div>
          <p className="mt-3 text-xs text-slate-400 flex items-center">
            <InformationCircleIcon className="w-3 h-3 mr-2 text-sky-400" />
            Only .txt files are supported for now
          </p>
        </div>
        
        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700/30">
          <h3 className="text-lg font-medium mb-4 text-slate-100 flex items-center">
            <LightBulbIcon className="w-5 h-5 mr-3 text-pink-400" />
            Or try a demo
          </h3>
          <button 
            onClick={loadDemoText}
            className="btn-secondary w-full"
          >
            <DocumentTextIcon className="w-5 h-5 mr-3 hover:scale-110 transition-transform" />
            <span>Load Demo Text</span>
          </button>
        </div>
      </div>
    </section>
  );
} 