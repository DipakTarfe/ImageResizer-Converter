import React from 'react';

export default function Instructions() {
  return (
    <div className="py-16 bg-white dark:bg-gray-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          How to Resize Images?
        </h2>
        <ol className="space-y-4 text-left">
          <li className="flex items-center space-x-3">
            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 font-semibold">1</span>
            <span className="text-gray-700 dark:text-gray-300">Click on the "Select Images" button to select images.</span>
          </li>
          <li className="flex items-center space-x-3">
            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 font-semibold">2</span>
            <span className="text-gray-700 dark:text-gray-300">Enter a new "Target Size" for your images.</span>
          </li>
          <li className="flex items-center space-x-3">
            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 font-semibold">3</span>
            <span className="text-gray-700 dark:text-gray-300">Click the "Process & Download" button to download the resized images.</span>
          </li>
        </ol>
      </div>
    </div>
  );
}