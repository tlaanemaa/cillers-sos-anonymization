  // components/verification/VerificationPanel.tsx
  import { useState } from "react";
  import VerificationButton from "./VerificationButton";
  import VerificationService from "../../service/VerificationService";
  import { VerificationIssueType } from "../../service/types";
  import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
  
  type VerificationPanelProps = {
    anonymizedText: string;
    verification: {
      complete: boolean;
      issues: string[];
    };
    setVerification: React.Dispatch<React.SetStateAction<{
      complete: boolean;
      issues: string[];
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
    
    const verificationTypes = VerificationService.getVerificationTypes();
    
    const updateVerification = (prev: { complete: boolean; issues: string[] }, type: VerificationIssueType, hasIssue: boolean) => {
      // Remove any existing issues of this type
      const filteredIssues = prev.issues.filter(issue => 
        !issue.includes(type.issueText) 
      );
      
      // Add the issue if it was found
      const newIssues = hasIssue 
        ? [...filteredIssues, type.issueText]
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
        const verificationResponse = await VerificationService.checkTextWithAI(type.id,anonymizedText, type.prompt);

        const hasIssue=verificationResponse.found;

        
        // Update verification issues
        setVerification(prev => updateVerification(prev, type, hasIssue));
        
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
      return verification.issues.some(issue => 
        issue.toLowerCase().includes(typeId.toLowerCase())
      );
    };
    
    return (
      <div className="my-8">
        <h3 className="text-lg font-medium mb-4 text-center text-gray-300">Verification Checks</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {verificationTypes.map(type => {
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
                Checking for {verificationTypes.find(t => t.id === activeVerification)?.title} information...
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }