import { CloudArrowUpIcon, DocumentTextIcon, LightBulbIcon } from "@heroicons/react/24/outline";
import FileUpload from "./components/landing/FileUpload";
import SampleFile from "./components/landing/SampleFile";
import { PageTitle, SubsectionTitle } from "./components/shared/Typography";
import Container from "./components/shared/Container";
import Card from "./components/shared/Card";
import IconWrapper from "./components/shared/IconWrapper";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 md:p-24">
      <Container maxWidth="xl">
        <PageTitle className="mb-8">Document Anonymizer</PageTitle>
        
        <Card className="p-8 max-w-md w-full mx-auto">
          <SubsectionTitle className="mb-8 flex items-center">
            <IconWrapper className="text-sky-400">
              <CloudArrowUpIcon className="w-6 h-6" />
            </IconWrapper>
            Get Started
          </SubsectionTitle>
          
          <div className="flex flex-col gap-8">
            <Card>
              <SubsectionTitle className="mb-4 flex items-center">
                <IconWrapper className="text-sky-400">
                  <DocumentTextIcon className="w-5 h-5" />
                </IconWrapper>
                Upload a document
              </SubsectionTitle>
              
              <FileUpload />
            </Card>
            
            <Card>
              <SubsectionTitle className="mb-4 flex items-center">
                <IconWrapper className="text-pink-400">
                  <LightBulbIcon className="w-5 h-5" />
                </IconWrapper>
                Or try a demo
              </SubsectionTitle>
              
              <SampleFile />
            </Card>
          </div>
        </Card>
      </Container>
    </main>
  );
}
