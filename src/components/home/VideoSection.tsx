// src/components/home/VideoSection.tsx
'use client';
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Play, Pause } from 'lucide-react';

const VideoSection = () => {
    const { theme } = useTheme();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <section className={`py-20 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="container mx-auto px-4">
                <motion.h2
                    className={`text-3xl md:text-4xl font-bold text-center mb-12 ${theme === 'dark' ? 'text-white' : 'text-[#1f2937]'
                        }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Zobacz, jak to działa
                </motion.h2>
                <motion.div
                    className="aspect-w-16 aspect-h-9 max-w-4xl mx-auto relative"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <video
                        ref={videoRef}
                        className="w-full h-full rounded-lg shadow-xl object-cover"
                        src="/path-to-your-video.mp4"
                        onClick={togglePlay}
                    />
                    <button
                        onClick={togglePlay}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 opacity-0 hover:opacity-100"
                    >
                        {isPlaying ? (
                            <Pause className="w-16 h-16 text-white" />
                        ) : (
                            <Play className="w-16 h-16 text-white" />
                        )}
                    </button>
                </motion.div>

            </div>
        </section>
    );
};

export default VideoSection;