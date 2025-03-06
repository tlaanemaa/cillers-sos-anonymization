import { motion } from "framer-motion";
import { useState } from "react";

interface HighlightedTextProps {
  text: string;
  onRemove: () => void;
}

export default function HighlightedText({
  text,
  onRemove,
}: HighlightedTextProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
          zIndex: 1,
          backgroundColor: "rgba(56, 189, 248, 0.25)",
          pointerEvents: "none",
          borderRadius: "3px",
          boxShadow: "0 0 2px rgba(56, 189, 248, 0.2)",
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
        className={`absolute -top-4 -right-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full w-5 h-5 flex items-center justify-center 
                  text-xs transition-opacity z-20 shadow-md ${
                    isHovered ? "opacity-100" : "opacity-0"
                  }`}
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
