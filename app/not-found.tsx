import Link from 'next/link';
import { PageTitle, Text } from './components/shared/Typography';
import Button from './components/shared/Button';
import { HomeIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Subtle background gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-blue-500/5 rounded-full filter blur-[120px]"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-[800px] h-[800px] bg-indigo-500/5 rounded-full filter blur-[120px]"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 text-center relative z-10">
        <div className="bg-slate-800/60 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/30 shadow-xl">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
              <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
                404
              </span>
            </div>
            <PageTitle className="mb-2" gradient>Page Not Found</PageTitle>
            <Text className="text-slate-400">
              Sorry, we couldn&apos;t find the page you&apos;re looking for.
            </Text>
          </div>
          <Link href="/">
            <Button 
              variant="primary"
              className="w-full"
              icon={<HomeIcon className="h-5 w-5" />}
            >
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 
