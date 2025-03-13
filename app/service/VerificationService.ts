// service/VerificationService.ts
import { verify } from "@/ai/verify"; // Direct import from the ai folder
import { VerificationResultType, VerificationIssueType } from "@/app/service/types";

export default class VerificationService {
  static async checkTextWithAI(issue_id: string, text: string, prompt: string): Promise<VerificationResultType> {
    try {
      console.log(`Running verification with prompt: ${prompt.substring(0, 30)}...`);
      // Direct function call instead of API fetch
      const final_response = await verify(issue_id, text, prompt);
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
        prompt: `Analyze this text for ACTUAL age information:
        IMPORTANT: This text contains redacted information shown as █ symbols. These redactions are NOT themselves evidence of age information - they could be hiding anything. Only respond "true" if you see UNREDACTED age information.

        Examples:
        - "I am 35 years old" → true (contains actual age)
        - "I was born in ███" → false (age is redacted, not revealed)
        - "The ██ year old patient" → false (age is redacted, not revealed)
        - "I was born on June 12, 1988" → true (contains actual birthdate)
        - "I was born on █" → false (date is redacted, not revealed)
        - "I am a █" → false (no clear evidence of age)

        Only analyze the visible text. Do NOT speculate about what might be behind redactions.

        Respond with only "true" or "false".`,
        // prompt: `Analyze the text for age information. Return "true" only if age identifiers are present, otherwise "false".
        //   IMPORTANT: This text contains redacted content marked with <█> symbols. Each <█> represents content that is already masked. Do NOT consider the <█> markers themselves as PII - they are just placeholders for redacted text.
        //   Examples:
        //   Text: "Born in 1985, she has extensive experience in the field."
        //   Analysis: This contains birth year "1985" which reveals age
        //   Response: true

        //   Text: "As a Generation X member, she remembers life before smartphones."
        //   Analysis: This mentions a generation but not a specific age
        //   Response: false

        //   Text: "Dr. Johnson is in his seventies and still practicing medicine."
        //   Analysis: This reveals an approximate age range "in his seventies"
        //   Response: true
        //   `,
        issueText: "Detected age information in anonymized text"
      },
      {
        id: "location",
        title: "Location",
        prompt: `Analyze this text for ACTUAL location information:

        IMPORTANT: This text contains redacted information shown as █ symbols. These redactions are NOT themselves evidence of location information. Only respond "true" if you see UNREDACTED location information.

        Examples:
        - "I live in Seattle" → true (contains actual location)
        - "I live in ████" → false (location is redacted, not revealed)
        - "My address is ███" → false (address is redacted, not revealed)
        - "I'm moving to 123 Main Street" → true (contains actual address)
        - "The office is in ███, ██" → false (location is redacted, not revealed)

        Only analyze the visible text. Do NOT speculate about what might be behind redactions.

        Respond with only "true" or "false".`,
        issueText: "Detected location information in anonymized text"
      },
      {
        id: "names",
        title: "Names",
        prompt: `Analyze this text for ACTUAL personal names:

      IMPORTANT: This text contains redacted information shown as █ symbols. These redactions are NOT themselves evidence of names. Only respond "true" if you see UNREDACTED names.

      Examples:
      - "My name is John Smith" → true (contains actual name)
      - "My name is █" → false (name is redacted, not revealed)
      - "Hi, I'm █ █" → false (name is redacted, not revealed)
      - "Dr. Williams will see you now" → true (contains actual name)
      - "Dr. █ will see you now" → false (name is redacted, not revealed)

      Only analyze the visible text. Do NOT speculate about what might be behind redactions.

      Respond with only "true" or "false".`,
        issueText: "Detected personal names in anonymized text"
      },
      {
        id: "religion",
        title: "Religion",
        prompt: `Analyze the provided text for ACTUAL religious information.

        IMPORTANT: This text contains redacted information shown as █ symbols. These redactions are NOT themselves evidence of religious information. Only respond "true" if you see UNREDACTED religious information.

        Examples:
        - "I am a practicing Buddhist" → true (contains actual religious affiliation)
        - "I attend █ church every Sunday" → false (religion is redacted, not revealed)
        - "My faith is █" → false (religion is redacted, not revealed)
        - "We celebrated Hanukkah last month" → true (contains actual religious holiday)
        - "We celebrated █ last month" → false (holiday is redacted, not revealed)
        - "The █ ceremony was beautiful" → false (no clear evidence of religion)

        Only analyze the visible text. Do NOT speculate about what might be behind redactions.

        Respond with only "true" or "false".`,
        issueText: "Detected religious information in anonymized text"
      }, {
        id: "gender",
        title: "Gender",
        prompt: `Analyze the provided text for ACTUAL gender information.

        IMPORTANT: This text contains redacted information shown as █ symbols. These redactions are NOT themselves evidence of gender information. Only respond "true" if you see UNREDACTED gender information.
        
        Examples:
        - "She works as an engineer" → true (contains gender pronoun)
        - "█ works as an engineer" → false (pronoun is redacted, not revealed)
        - "My brother lives in Boston" → true (contains gendered relationship term)
        - "My █ lives in Boston" → false (relationship is redacted, not revealed)
        - "Mr. Johnson will attend" → true (contains gendered honorific)
        - "█. Johnson will attend" → false (honorific is redacted, not revealed)
        - "As a woman in tech..." → true (contains explicit gender reference)
        - "As a █ in tech..." → false (gender is redacted, not revealed)
        
        Only analyze the visible text. Do NOT speculate about what might be behind redactions.
        
        Respond with only "true" or "false".`,
        issueText: "Detected gender revealing information in anonymized text"
      }
    ];
  }
}

