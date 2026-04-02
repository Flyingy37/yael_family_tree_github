import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLang } from '../app/[lang]/layout';

interface CollapsibleSectionProps {
  title: string;
  icon: string;
  defaultOpen?: boolean;
  variant?: 'default' | 'memory' | 'dna';
  children: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  variant = 'default',
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { t } = useLang();

  const variantStyles = {
    default: 'border-gray-200 bg-white',
    memory: 'border-gray-300 bg-gray-50',
    dna: 'border-purple-300 bg-purple-50',
  };

  return (
    <div className={`border ${variantStyles[variant]} rounded-lg mb-3 overflow-hidden`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 font-medium text-gray-800">
          <span aria-hidden="true">{icon}</span>
          <span>{title}</span>
        </span>
        <ChevronDown 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      {isOpen && (
        <div className="px-3 pb-3">
          {children}
        </div>
      )}
    </div>
  );
}
