"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon, BeakerIcon } from "@heroicons/react/24/outline";
import PageHeader from "@/app/components/shared/PageHeader";
import { useEvaluationStore } from "@/app/store/evaluationStore";
import EvaluationDocumentRenderer from "@/app/components/evaluation/EvaluationDocumentRenderer";
import EvaluationControlPanel from "@/app/components/evaluation/EvaluationControlPanel";
import EvaluationHistoryPanel from "@/app/components/evaluation/EvaluationHistoryPanel";
import EvaluationFileUpload from "@/app/components/evaluation/EvaluationFileUpload";
import MetricsOverview from "@/app/components/evaluation/MetricsOverview";
import Container from "@/app/components/shared/Container";
import FixedLayout from "@/app/components/shared/FixedLayout";

export default function EvaluationPage() {
  const {
    document,
    groundTruth,
    detections,
    clearAll
  } = useEvaluationStore();

  // Reset on first load to avoid seeing stale data
  useEffect(() => {
    clearAll();
  }, [clearAll]);

  // Check if we should display results section (only when we have current detections)
  const hasResults = detections.length > 0;
  const hasDocument = document && document.length > 0;

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-gray-900 to-slate-950">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-blue-500/5 rounded-full filter blur-[120px]"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-[800px] h-[800px] bg-pink-500/5 rounded-full filter blur-[120px]"></div>
      </div>
      
      {/* Page header */}
      <PageHeader title="PII Detection Evaluation Workbench" icon={<BeakerIcon className="w-6 h-6" />}>
        <Link 
          href="/"
          className="inline-flex items-center text-sm text-sky-400 hover:text-sky-300 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Back to Home
        </Link>
      </PageHeader>

      {/* Main content area - always show the full layout */}
      <Container maxWidth="full" className="px-4 py-3 flex-1 flex flex-col relative z-10">
        <div className="flex-grow h-full">
          <FixedLayout
            documentContent={
              hasDocument ? (
                <EvaluationDocumentRenderer
                  document={document}
                  groundTruth={groundTruth}
                  aiDetections={detections}
                  showComparison={hasResults}
                  height="100%"
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="w-full max-w-3xl">
                    <EvaluationFileUpload />
                  </div>
                </div>
              )
            }
            controlsContent={
              <EvaluationControlPanel />
            }
            resultsContent={hasResults ? <MetricsOverview /> : undefined}
            historyContent={
              <EvaluationHistoryPanel />
            }
          />
        </div>
      </Container>
    </main>
  );
} 
