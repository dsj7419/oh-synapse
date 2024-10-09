"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemeLoadingAnimationProps {
  isLoading: boolean;
}

const ThemeLoadingAnimation: React.FC<ThemeLoadingAnimationProps> = ({ isLoading }) => {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(isLoading);
    }, 500);

    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <AnimatePresence>
      {showLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#2D3748',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              times: [0, 0.5, 1],
              repeat: Infinity,
            }}
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              border: '10px solid #A0AEC0',
              borderTopColor: '#63B3ED',
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{
              position: 'absolute',
              bottom: '20%',
              color: '#FFFFFF',
              fontSize: '1.5rem',
              fontWeight: 'bold',
            }}
          >
            Loading Theme...
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ThemeLoadingAnimation;