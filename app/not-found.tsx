import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
          404
        </h1>
        <h2 className="mt-2 text-3xl font-bold">Page Not Found</h2>
        <p className="mt-4 text-gray-400">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <div className="mt-8">
          <Link 
            href="/"
            className="px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-sky-500 hover:bg-sky-600 transition"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
} 
