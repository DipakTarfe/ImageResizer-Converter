import React from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <img
              src="https://img.icons8.com/water-color/50/send-backward.png"
              alt="Logo"
              className="w-8 h-8"
            />
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              ImageResizer
            </span>
          </div>
          <div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}