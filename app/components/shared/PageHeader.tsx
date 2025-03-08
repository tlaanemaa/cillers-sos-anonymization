import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export default function PageHeader({ title, subtitle, icon, children }: PageHeaderProps) {
  return (
    <header className="bg-gray-900 border-b border-gray-800 py-6 px-4 md:px-8">
      <div className="container mx-auto flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center">
          {icon && <div className="mr-3 text-sky-400">{icon}</div>}
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
          </div>
        </div>
        
        {children && (
          <div className="mt-4 md:mt-0 flex items-center">
            {children}
          </div>
        )}
      </div>
    </header>
  );
} 
