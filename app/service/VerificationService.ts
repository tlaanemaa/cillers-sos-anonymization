  // service/VerificationService.ts
import { verify } from "@/ai/verify"; // Direct import from the ai folder
import { VerificationResultType, VerificationIssueType } from "@/app/service/types";  

  export default class VerificationService {
    static async checkTextWithAI(issue_id: string, text: string, prompt: string): Promise<VerificationResultType> {
      try {
        console.log(`Running verification with prompt: ${prompt.substring(0, 30)}...`);
        // Direct function call instead of API fetch
        const final_response = await verify(issue_id,text, prompt);
        console.log(`Verification result: ${final_response}`);
        return final_response;
      } catch (error) {
        console.error('Error checking with AI:', error);
        return {
          issue_id: issue_id,
          found: false,
          evidence: []
        };
      }
    }
    
    static getVerificationTypes(): VerificationIssueType[] {
      return [
        {
          id: "age",
          title: "Age",
          prompt: "Analyze the following text and determine if it contains any age information. Only respond with \"true\" if you detect birth dates or age information, otherwise respond with \"false\".",
          issueText: "Detected age information in anonymized text"
        },
        {
          id: "location",
          title: "Location",
          prompt: "Analyze the following text and determine if it contains any specific location information like addresses, cities, or geographic identifiers. Only respond with \"true\" if you detect location information, otherwise respond with \"false\".",
          issueText: "Detected location information in anonymized text"
        },
        {
          id: "names",
          title: "Names",
          prompt: "Analyze the following text and determine if it contains any personal names or identifiers. Only respond with \"true\" if you detect personal names, otherwise respond with \"false\".",
          issueText: "Detected personal names in anonymized text"
        },
        {
          id: "religion",
          title: "Religion",
          prompt: "Analyze the following text and determine if it contains any religion information. Only respond with \"true\" if you detect religion related information, otherwise respond with \"false\".",
          issueText: "Detected religious information in anonymized text"
        },{
          id: "gender",
          title: "Gender",
          prompt: "Analyze the following text and determine if it contains any gender identifiers. Only respond with \"true\" if you detect gender revealing information, otherwise respond with \"false\".",
          issueText: "Detected gender revealing information in anonymized text"
        }
      ];
    }
  }
  
