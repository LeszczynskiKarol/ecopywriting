// src/components/ui/Loader.tsx
import React from 'react';
import { motion } from 'framer-motion';

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm">
      <motion.div
        className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col items-center">
          <motion.div
            className="w-16 h-16 border-t-4 border-b-4 border-primary dark:border-primary-dark rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p
            className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Ładowanie...
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default Loader;