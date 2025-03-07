"use client";

import { useEffect, useState } from "react";

export default function AnimatedParticles() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return (
    <div className="absolute inset-0 z-0">
      <div className="relative h-full w-full">
        {Array.from({ length: 35 }).map((_, index) => (
          <div
            key={index}
            className="absolute rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 5 + 2}px`,
              height: `${Math.random() * 5 + 2}px`,
              background:
                index % 4 === 0
                  ? "rgba(56, 189, 248, 0.35)"
                  : index % 4 === 1
                  ? "rgba(244, 114, 182, 0.35)"
                  : index % 4 === 2
                  ? "rgba(99, 102, 241, 0.35)"
                  : "rgba(234, 179, 8, 0.35)",
              filter: "blur(1px)",
              animation: `float ${Math.random() * 10 + 15}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
