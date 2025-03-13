import { Redaction } from "./schemas";
import { v4 as uuidv4 } from "uuid";

// Sample text for demonstration
export const SAMPLE_TEXT = `Family 1
2024-10-18 fredag
Monthly report: September
Long-term goals you are working towards: independence and self-sufficiency, support for the father, and indirectly for siblings who are also newly arrived.
What have you worked on together during the past month, and how has it gone? (For example, based on different life areas, you can split meetings or use separate headings):
Economy
CSN repayment At the end of May, Tim received a letter from CSN stating that he is obligated to repay money due to incorrect payments made during 2023. In total, Tim received around 20,000 SEK from CSN over a period of 4 months in 2023. It was later found that Tim earned too much from his part-time job during the same period, making him technically ineligible for these payments. With assistance from Matilda, we composed an email and argued that he should still be entitled to the support, considering his circumstances. This same argument could be used for an appeal later if needed. I have contacted "Advokatjouren" (legal aid services) and asked the "Stadsmissionen" if they have anyone who can assist with appealing a potential repayment decision. I received some contacts that I will follow up with.
The Swedish Pensions Agency (Pensionsmyndigheten) I called the caseworker at the Swedish Pensions Agency about the father's situation. The father's pension age is 65, and he is currently 63, so he cannot apply for pension yet. However, it's uncertain whether he'll be eligible for what is called "guaranteed pension" when the time comes, as he hasn't lived in Sweden long enough. Nevertheless, we recommend that he submits an application anyway. If he isn't eligible for "guaranteed pension," then applying for elderly maintenance support ("Äldreförsörjningsstöd") will become relevant. This support is also administered by the Swedish Pensions Agency.
Are there any life areas you aren't currently working on? Why?
(For example, describe what has been prioritized in your work, what's planned for the future, or if anything in the action plan is no longer relevant or is temporarily postponed):
Tim has a heavy workload at school and wants to invest more in his future plans, but due to needing to work and support his parents simultaneously, there's a strong feeling of insufficient time. He feels that SOS already significantly relieves him in terms of supporting his parents, enabling him to focus more on himself. He has had discussions with the school regarding future planning, which will be followed up regularly by Anna, and has also recently begun applying for jobs, submitting applications to three potential workplaces. These efforts are aimed at enabling him to prioritize school more clearly once the financial situation stabilizes.
Challenges in your work:
The Father occasionally struggles to grasp the context, even though we've booked interpreters in Arabic. It would be better if comprehension could improve through an adjusted approach. Ideally, we'd find ways to enhance communication and understanding. Moreover, The father expressed that having a more stable, long-term housing situation and exploring leisure activities to meet new people are long-term priorities, once immediate needs are managed effectively.
Youth 1
2024-10-17 torsdag
Monthly report: September
Lisa is on sick leave for another week due to sleep difficulties and fatigue. She will soon have a follow-up meeting with her doctor to assess her current state and evaluate whether the medication has been effective, after which it will be decided if the sick leave needs to be extended. She feels that her condition has improved somewhat.
She has also been cleared to resume physical activity gradually. She has been given the green light from her doctor to start training sessions again, though shorter sessions initially due to ongoing sleep difficulties and fatigue.
She continues discussions with her doctor regarding stress and anxiety and will continue with CBT for some additional time. At intake, we considered PM+ support, but Lisa now feels that the support provided by healthcare services and her social network is sufficient. She believes this current support is adequate, and thus does not need further psychosocial support from UP.
Lisa plans to move from Stockholm to Örebro after the summer for study purposes. Consequently, she intends to leave the program around summer but wishes to remain in contact with the coordinator should occasional needs arise.
`;

/**
 * Detects personally identifiable information (PII) in the provided text
 *
 * @param text - The text to analyze for PII
 * @returns Array of detected PII elements
 */
export function mockDetectPII(text: string): Redaction[] {
  if (!text) return [];

  // Collection of patterns to detect
  const patterns = [
    { type: "name", regex: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g },
    {
      type: "address",
      regex: /\b\d+ [A-Za-z]+ St[\.,]? [A-Za-z]+, [A-Z]{2} \d{5}\b/g,
    },
    { type: "phone", regex: /\b\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g },
    { type: "email", regex: /\b[\w.-]+@[\w.-]+\.\w+\b/g },
    { type: "ip", regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g },
    {
      type: "credit-card",
      regex: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    },
    { type: "other", regex: /\b\d{3}-\d{2}-\d{4}\b/g }, // SSN as "other" type
  ] as const;

  // Find matches for each pattern
  const detections: Redaction[] = [];

  patterns.forEach((pattern) => {
    // Create a new regex for each pattern to avoid lastIndex issues
    const regex = new RegExp(pattern.regex);
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Ensure we don't get stuck in an infinite loop
      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
        continue;
      }

      // Validate match boundaries
      if (match.index < 0 || match.index + match[0].length > text.length) {
        continue;
      }

      detections.push({
        id: uuidv4(),
        type: pattern.type,
        confidence: Math.random() * 0.5 + 0.5,
        start: match.index,
        end: match.index + match[0].length,
        replacement: "█".repeat(match[0].length)
      });
    }
  });

  return detections;
}
