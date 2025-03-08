# PII Redaction Tool

A comprehensive solution for detecting and redacting personally identifiable information (PII) from text data using AI. This guide will help you get started with the codebase.

## 🔧 Technical Setup

To get the project running on your machine:

### Prerequisites

- Node.js (v18 or later)
- For the AI module with Ollama: Docker or local [Ollama](https://ollama.com/) installation (optional for initial development)

### Quick Start

1. Clone and setup:

   ```bash
   git clone https://github.com/tlaanemaa/cillers-sos-anonymization.git
   cd cillers-sos-anonymization
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view the web application

## 🧪 Sample Data

The `resources/` directory contains data for testing:

- `test-doc.txt`: Text with synthetic PII (names, addresses, phone numbers)
- `example-data.csv`: CSV dataset with various PII types
- `Daganteckning1_processed.pdf`: Sample PDF document

## 💻 Codebase Overview

### AI Module

The AI module in the `/ai` directory handles PII detection and redaction:

- `index.ts`: Main exports and API boundary
- `detect.ts`: PII detection logic
- `redact.ts`: Text redaction implementation
- `schemas.ts`: Data structures for PII entities
- `mock.ts`: Mock implementation for testing

Basic usage:

```typescript
import { detect, redact } from "./ai";

// Detect PII with adjustable risk tolerance (0-1)
const detections = await detect(inputText, 0.5);

// Apply redactions
const redactedText = await redact(inputText, detections);
```

#### Using Real AI Instead of Mocks

Currently, the AI detection uses mock data. To use a real LLM:

1. Install and run Ollama locally ([Ollama documentation](https://ollama.ai/))
2. Edit `ai/detect.ts`:

   ```typescript
   // Change this:
   // const redactions = await callPiiAgent(input);
   const redactions = mockDetectPII(input);

   // To this:
   const redactions = await callPiiAgent(input);
   // const redactions = mockDetectPII(input);
   ```

### Web Application

The Next.js app in the `/app` directory provides the user interface:

- `page.tsx`: Main page with the redaction interface
- `components/`: UI components used throughout the app
- `store/`: State management for the application

The web app lets you upload text, detect PII, adjust sensitivity settings, and view/download redacted content.

### CLI Tool

The command-line interface provides a way to process files directly:

```bash
# Process a sample file
npm run cli -- resources/test-doc.txt

# Save redacted output
npm run cli -- resources/test-doc.txt > redacted_output.txt
```

The CLI code is in `cli/index.ts` and leverages the same AI module as the web application.

## 💡 Development Tips

- The project uses TypeScript throughout for better type safety
- The mock AI module (`ai/mock.ts`) lets you develop without setting up Ollama
- Use the sample files in `/resources` for testing changes
