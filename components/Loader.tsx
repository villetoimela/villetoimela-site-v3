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
            <h2
              className="text-4xl md:text-6xl lg:text-7xl font-light tracking-wide text-white"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
              }}
            >
              Welcome
            </h2>

            <div className="h-8" />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.8, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-lg md:text-xl text-white/60 font-light tracking-wide"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
              }}
            >
              Get to know me
            </motion.p>

            <div className="h-12" />

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 1.2,
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              className="flex flex-col items-center gap-3 text-gray-400 text-sm font-mono pointer-events-none"
            >
              <span className="text-xs tracking-wider">SCROLL</span>
              <div className="h-16 w-px bg-gray-600 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-blue-400"
                  animate={{
                    y: ['-100%', '100%']
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.section>
      )}
    </>
  );
}
