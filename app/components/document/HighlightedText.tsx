import { motion } from 'framer-motion';

interface HighlightedTextProps {
  text: string;
  isNew: boolean;
  onRemove: () => void;
}

export default function HighlightedText({ text, isNew, onRemove }: HighlightedTextProps) {
  return (
    <span className="relative group inline-block">
      {/* The actual text - always visible and stable */}
      <span className="relative z-10">{text}</span>
      
      {/* The highlight overlay - animated */}
      <motion.span
        className="absolute inset-0 bg-yellow-200 rounded-sm -z-10"
        initial={isNew ? { scaleX: 0, originX: 0 } : { scaleX: 1 }}
        animate={{ scaleX: 1 }}
        transition={{ 
          duration: 0.5, 
          ease: "easeOut"
        }}
      />
      
      {/* Delete button */}
      <button
        className="absolute -top-4 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center 
                  text-xs opacity-0 group-hover:opacity-100 transition-opacity z-20"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        title="Remove highlight"
      >
        ×
      </button>
    </span>
  );
} 