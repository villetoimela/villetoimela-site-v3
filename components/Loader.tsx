'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FLASH_FRAMES = [
  { text: 'Hello there', subtitle: null },
  { text: 'Crafting your experience', subtitle: null },
];

export default function Loader({
  onWelcomeShow,
}: {
  onWelcomeShow?: () => void;
}) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isFlashComplete, setIsFlashComplete] = useState(false);

  useEffect(() => {
    const flashInterval = setInterval(() => {
      setCurrentFrame((prev) => {
        if (prev >= FLASH_FRAMES.length - 1) {
          clearInterval(flashInterval);
          // After frame duration, start crossfade
          setTimeout(() => {
            setIsFlashComplete(true);
            setShowWelcome(true);
            onWelcomeShow?.();
          }, 1400); // Same as frame duration - crossfade starts
          return prev;
        }
        return prev + 1;
      });
    }, 1400); // Each frame shows for 1400ms

    return () => clearInterval(flashInterval);
  }, [onWelcomeShow]);

  return (
    <>
      {/* Flash frames - fixed overlay */}
      <AnimatePresence mode="wait">
        {!isFlashComplete && (
          <motion.div
            key={`flash-${currentFrame}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.1, 0.25, 1]
            }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
          >
            {/* Flash frame content */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-center"
            >
              {/* Main text */}
              <h2
                className="text-4xl md:text-6xl lg:text-7xl font-light tracking-wide text-white"
                style={{
                  fontFamily: 'var(--font-space-grotesk)',
                }}
              >
                {FLASH_FRAMES[currentFrame].text}
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome section - normal section that can be scrolled past */}
      {showWelcome && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.4
          }}
          className="relative min-h-screen flex flex-col items-center justify-center bg-black"
        >
          {/* Welcome content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center"
          >
            {/* Main text */}
            <div className="mb-8">
              <h2
                className="text-4xl md:text-6xl lg:text-7xl font-light tracking-wide text-white mb-6"
                style={{
                  fontFamily: 'var(--font-space-grotesk)',
                }}
              >
                Welcome
              </h2>
            </div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: [0.3, 0.7, 0.3],
                y: [0, 10, 0]
              }}
              transition={{
                delay: 1.0,
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="flex flex-col items-center gap-3"
            >
              <p className="text-sm text-white/40 font-mono tracking-widest uppercase">Scroll</p>
              <svg
                width="24"
                height="40"
                viewBox="0 0 24 40"
                className="text-white/30"
              >
                <rect
                  x="1"
                  y="1"
                  width="22"
                  height="38"
                  rx="11"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <motion.circle
                  cx="12"
                  cy="12"
                  r="3"
                  fill="currentColor"
                  animate={{
                    cy: [12, 24, 12]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              </svg>
            </motion.div>
          </motion.div>
        </motion.section>
      )}
    </>
  );
}
