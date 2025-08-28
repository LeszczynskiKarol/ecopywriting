// src/components/layout/Footer.tsx
'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import CalendarModal from '../../app/contact/CalendarModal';
import { Mail, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  const [isCalendarModalOpen, setCalendarModalOpen] = useState(false);

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">eCopywriting.pl</h3>
            <p>Profesjonalne usługi copywriterskie dla Twojego biznesu</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Szybkie linki</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <Link href="/blog" className="hover:text-gray-300">
                Blog
              </Link>
              <Link href="/contact" className="hover:text-gray-300">
                Kontakt
              </Link>
              <Link href="/register" className="hover:text-gray-300">
                Rejestracja
              </Link>
              <Link href="/login" className="hover:text-gray-300">
                Logowanie
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
            <ul className="space-y-2">
              <li className="flex items-center transition-colors duration-200 ease-in-out hover:text-gray-300">
                <Mail className="w-4 h-4 mr-2" />
                <span>kontakt@ecopywriting.pl</span>
              </li>
              <li
                onClick={() => setCalendarModalOpen(true)}
                className="flex items-center cursor-pointer transition-colors duration-200 ease-in-out hover:text-gray-300"
              >
                <Phone className="w-4 h-4 mr-2" />
                <span>Umów rozmowę telefoniczną</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p>
            &copy; {new Date().getFullYear()} eCopywriting.pl. Wszelkie prawa
            zastrzeżone.
          </p>
        </div>
      </div>
      <CalendarModal isOpen={isCalendarModalOpen} onClose={() => setCalendarModalOpen(false)} />
    </footer>
  );
};

export default Footer;