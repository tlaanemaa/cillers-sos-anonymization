import { motion, AnimatePresence } from "framer-motion";

interface HighlightedTextProps {
  text: string;
  onRemove: () => void;
}

export default function HighlightedText({
  text,
  onRemove,
}: HighlightedTextProps) {
  return (
    <span className="relative group inline-block">
      {/* The actual text - always visible and stable */}
      <span className="relative z-10">{text}</span>

      {/* The highlight overlay - animated */}
      <motion.span
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: -10,
          backgroundColor: "rgba(255, 255, 0, 0.7)",
          pointerEvents: "none",
        }}
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
        }}
      />

      {/* Delete button - only visible when highlighted */}
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
