import EditorLayout from "../components/editor/EditorLayout";
import DocumentRenderer from "../components/editor/DocumentRenderer";
import ControlPanel from "../components/editor/ControlPanel";
import DetectionsPanel from "../components/editor/DetectionsPanel";
import Container from "../components/shared/Container";
import ResponsiveLayout from "../components/shared/ResponsiveLayout";

export default function EditorPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 md:p-24">
      <Container maxWidth="xl">
        <EditorLayout>
          <ResponsiveLayout
            leftContent={<DocumentRenderer />}
            rightContent={
              <div className="flex flex-col gap-8">
                <ControlPanel />
                <DetectionsPanel />
              </div>
            }
          />
        </EditorLayout>
      </Container>
    </main>
  );
} 
