// src/components/layout/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X, ChevronDown, Moon, Sun } from 'lucide-react';

const Header: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (previous !== undefined && latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [


    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Kontakt' },
  ];

  const renderContent = () => (
    <>
      <Link href="/" className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} hover:text-primary transition duration-300`}>
        eCopywriting.pl
      </Link>
      <div className="hidden md:flex space-x-4 items-center">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} hover:text-primary transition duration-300`}
          >
            {item.label}
          </Link>
        ))}
        {user && user.role === 'admin' && (
          <Link
            href="/admin/dashboard"
            className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} hover:text-primary transition duration-300`}
          >
            Panel Admina
          </Link>
        )}
        {user ? (
          <Link
            href="/dashboard"
            className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark transition duration-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Panel klienta
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className={`bg-gray-200 text-gray-800 px-4 py-2 rounded-full transition duration-300 ${theme === 'dark'
                ? 'dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                : 'hover:bg-gray-300'
                }`}
            >
              Zaloguj się
            </Link>
            <Link
              href="/register"
              className={`bg-primary text-white px-4 py-2 rounded-full transition duration-300 ${theme === 'dark'
                ? 'hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500'
                : 'hover:bg-gray-700'
                }`}
            >
              Załóż konto
            </Link>

          </>
        )}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-800 text-yellow-400' : 'bg-gray-200 text-gray-800'}`}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </>
  );

  return (
    <motion.header
      className={`fixed w-full z-50 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} shadow-md mb-8`}
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-between items-center">
          {renderContent()}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full mr-2 ${theme === 'dark' ? 'bg-gray-800 text-yellow-400' : 'bg-gray-200 text-gray-800'}`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={toggleMenu} className={`${theme === 'dark' ? 'text-white' : 'text-gray-600'} hover:text-primary transition duration-300`}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>
      {/* Mobile menu */}
      <motion.div
        className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-base font-medium ${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-primary hover:bg-gray-50'} transition duration-300`}
            >
              {item.label}
            </Link>
          ))}
          {user && user.role === 'admin' && (
            <Link
              href="/admin/dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-primary hover:bg-gray-50'} transition duration-300`}
            >
              Panel Admina
            </Link>
          )}
          {user ? (
            <Link
              href="/dashboard"
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-primary hover:bg-gray-50'} transition duration-300`}
            >
              Panel klienta
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={`block px-3 py-2 rounded-md text-base font-medium ${theme === 'dark'
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-white bg-primary hover:bg-blue-700'
                  } transition duration-300`}
              >
                Zaloguj się
              </Link>
              <Link
                href="/register"
                className={`block px-3 py-2 rounded-md text-base font-medium ${theme === 'dark'
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                  } transition duration-300`}
              >
                Załóż konto
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </motion.header>
  );
};

export default Header;