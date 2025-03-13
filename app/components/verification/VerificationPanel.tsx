// components/verification/VerificationPanel.tsx
import { useState } from "react";
import VerificationButton from "./VerificationButton";
import VerificationService from "../../service/VerificationService";
import { VerificationIssueType, VerificationResultType } from "../../service/types";
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/solid";

type VerificationPanelProps = {
  anonymizedText: string;
  verification: {
    complete: boolean;
    issues: VerificationIssueType[];
  };
  setVerification: React.Dispatch<React.SetStateAction<{
    complete: boolean;
    issues: VerificationIssueType[];
  }>>;
};

export default function VerificationPanel({
  anonymizedText,
  verification,
  setVerification
}: VerificationPanelProps) {
  const [loading, setLoading] = useState(false);
  const [checkedTypes, setCheckedTypes] = useState<Record<string, boolean>>({});
  const [activeVerification, setActiveVerification] = useState<string | null>(null);
  
  const verificationIssueTypes = VerificationService.getVerificationTypes();
  
  const updateVerification = (
    prev: { complete: boolean; issues: VerificationIssueType[] }, 
    type: VerificationIssueType, 
    result: VerificationResultType
  ) => {
    // Remove any existing issues of this type
    const filteredIssues = prev.issues.filter(issue => issue.id !== type.id);
    
    // Add the issue if it was found
    const newIssues = result.found 
      ? [...filteredIssues, {
          ...type,
          evidence: result.evidence
        }]
      : filteredIssues;
      
    return {
      complete: newIssues.length === 0,
      issues: newIssues
    };
  };

  const runVerification = async (type: VerificationIssueType) => {
    if (loading) return;
    
    setLoading(true);
    setActiveVerification(type.id);
    console.log(`Running ${type.title} verification...`);
    try {
      const result = await VerificationService.checkTextWithAI(type.id, anonymizedText, type.prompt);
      
      // Update verification issues with evidence
      setVerification(prev => updateVerification(prev, type, result));
      
      // Mark as checked
      setCheckedTypes(prev => ({
        ...prev,
        [type.id]: true
      }));
      
    } catch (error) {
      console.error(`Error running ${type.title} verification:`, error);
    } finally {
      setLoading(false);
      setActiveVerification(null);
    }
  };
  
  // Check if a specific verification type has an issue
  const hasIssue = (typeId: string) => {
    return verification.issues.some(issue => issue.id === typeId);
  };
  
  return (
    <div className="my-8">
      <h3 className="text-lg font-medium mb-4 text-center text-gray-300">Verification Checks</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {verificationIssueTypes.map(type => {
          const isChecked = checkedTypes[type.id];
          const hasTypeIssue = hasIssue(type.id);
          
          let icon = null;
          if (isChecked) {
            icon = hasTypeIssue 
              ? <XCircleIcon className="h-4 w-4 text-red-500" /> 
              : <CheckCircleIcon className="h-4 w-4 text-green-500" />;
          }
          
          return (
            <VerificationButton
              key={type.id}
              title={type.title}
              onClick={() => runVerification(type)}
              isDetected={hasTypeIssue}
              isLoading={loading && activeVerification === type.id}
              icon={icon}
              variant={hasTypeIssue ? "outline" : "primary"}
            />
          );
        })}
      </div>
      
      {/* Active verification indicator */}
      {loading && activeVerification && (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-400 mr-2"></div>
            <span className="text-sm text-gray-300">
              Checking for {verificationIssueTypes.find(t => t.id === activeVerification)?.title} information...
            </span>
          </div>
        </div>
      )}

      {/* Evidence Panels - Show for issues found */}
      {verification.issues.length > 0 && (
        <div className="mt-6 space-y-4">
          <h4 className="font-medium text-red-400 flex items-center">
            <InformationCircleIcon className="h-5 w-5 mr-2" />
            Detected Issues with Evidence
          </h4>
          
          {verification.issues.map((issue) => (
            <div key={issue.id} className="bg-red-900/20 border border-red-800/40 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                <h5 className="font-medium text-red-300">{issue.title}: {issue.issueText}</h5>
              </div>
              
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-300 flex items-center">
                  <QuestionMarkCircleIcon className="h-4 w-4 mr-2 text-gray-400" />
                  View Detection Evidence
                </summary>
                <div className="mt-2 p-3 bg-gray-800/60 rounded-lg text-sm text-gray-300 whitespace-pre-wrap">
                <div className="mt-2 p-3 bg-gray-800/60 rounded-lg text-sm text-gray-300">
                {issue.evidence ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {issue.evidence.map((item, index) => (
                      item.trim() && <li key={index}>{item.trim()}</li>
                    ))}
                  </ul>
                ) : (
                  "No detailed evidence provided"
                )}
              </div>
                </div>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}