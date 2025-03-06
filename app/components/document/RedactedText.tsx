import { motion } from 'framer-motion';

interface RedactedTextProps {
  length: number;
}

export default function RedactedText({ length }: RedactedTextProps) {
  return (
    <motion.span
      className="inline-block font-bold text-black dark:text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {'█'.repeat(length)}
    </motion.span>
  );
} 