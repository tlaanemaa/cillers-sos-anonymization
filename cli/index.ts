import { promises as fs } from "fs";
import { detect, redact } from "@/ai";

const RISK_TOLERANCE = 0.5;

/**
 * Main CLI function that processes command line arguments and runs the PII detection and redaction.
 */
async function main() {
  const inputFile = process.argv[2];
  if (!inputFile) throw new Error("No input file provided");

  // Read input text
  const inputText = await fs.readFile(inputFile, "utf-8");
  const detections = await detect(inputText, RISK_TOLERANCE);
  const redactedText = await redact(inputText, detections);
  console.log(redactedText);
}

// Run the main function
main().catch(console.error);
