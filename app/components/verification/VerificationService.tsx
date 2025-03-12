  // components/verification/VerificationService.ts

    import { VerificationType } from "@/app/components/verification/VerificationType";  
  export default class VerificationService {
    static async checkTextWithAI(text: string, prompt: string): Promise<boolean> {
      try {
        const response = await fetch('/api/verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, prompt }),
        });
        const data = await response.json();
        return data.final_response;
      } catch (error) {
        console.error('Error checking with AI:', error);
        return false;
      }
    }
    
    static getVerificationTypes(): VerificationType[] {
      return [
        {
          id: "religion",
          title: "Religion",
          prompt: "Analyze the following text and determine if it contains any religion information. Only respond with \"true\" if you detect religion related information, otherwise respond with \"false\".",
          issueText: "Detected religious information in anonymized text"
        },
        {
          id: "birthday",
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
        },{
          id: "gender",
          title: "Gender",
          prompt: "Analyze the following text and determine if it contains any gender identifiers. Only respond with \"true\" if you detect gender revealing information, otherwise respond with \"false\".",
          issueText: "Detected gender revealing information in anonymized text"
        }

      ];
    }
  }
  
