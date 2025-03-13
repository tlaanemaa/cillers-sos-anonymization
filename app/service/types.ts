
// service//verificationType.ts
export type VerificationIssueType = {
    id: string;
    title: string;
    prompt: string;
    issueText: string;
    evidence?: string[];
  };


export type VerificationResultType = {
    issue_id: string;
    found: boolean;
    evidence: string[];
}


export type VerificationSummaryType = {
  totalChecks: number;
  issuesFound: number;
  isComplete: boolean;
};