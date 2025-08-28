// src/components/auth/VerificationCodeInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface VerificationCodeInputProps {
  length?: number;
  onComplete: (code: string) => void;
}

const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({ length = 6, onComplete }) => {
  const [code, setCode] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every(digit => digit) && onComplete) {
      onComplete(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, length);
    const newCode = [...code];
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);
    if (newCode.every(digit => digit) && onComplete) {
      onComplete(newCode.join(''));
    }
  };

  return (
    <div className="flex justify-center space-x-2">
      {code.map((digit, index) => (
        <motion.input
          key={index}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          ref={(el: HTMLInputElement | null) => {
            inputRefs.current[index] = el;
          }}
          className="w-12 h-12 text-center text-2xl border-2 border-gray-300 rounded-lg 
                     focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 
                     bg-white text-gray-900" // Dodano bg-white i text-gray-900
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
        />
      ))}
    </div>
  );
};

export default VerificationCodeInput;