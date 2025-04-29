import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { CheckCircle } from 'lucide-react';

interface ConnectionSuccessAnimationProps {
  show: boolean;
  onAnimationComplete: () => void;
  serverName?: string;
  country?: string;
}

export function ConnectionSuccessAnimation({
  show,
  onAnimationComplete,
  serverName,
  country
}: ConnectionSuccessAnimationProps) {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onAnimationComplete();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onAnimationComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={400}
            gravity={0.15}
          />
          
          <motion.div
            className="relative z-10 flex flex-col items-center text-center p-8 rounded-xl bg-gradient-to-b from-green-500/20 to-green-700/20 backdrop-blur-md border border-green-500/30 shadow-2xl max-w-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="h-20 w-20 text-green-500 mb-4" />
            </motion.div>
            
            <motion.h2
              className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Connection Successful!
            </motion.h2>
            
            <motion.p
              className="text-xl text-gray-200 mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              You're now securely connected to
            </motion.p>
            
            <motion.div
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600/40 to-emerald-600/40 backdrop-blur-md border border-green-500/40 mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <h3 className="text-xl font-semibold text-white">
                {serverName || 'Unknown'}, {country || 'Unknown'}
              </h3>
            </motion.div>
            
            <motion.p
              className="text-sm text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              Your internet traffic is now encrypted and secure
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}