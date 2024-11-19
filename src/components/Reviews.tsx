import React from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const reviews = [
  {
    rating: 5,
    title: 'Nice app',
    text: 'Nice app. No adverts that are located on irritating locations. It\'s an straight forward resizer without fancy things, but it works perfect.',
    author: 'Wilbert Van Zelst'
  },
  {
    rating: 5,
    title: 'VERY VERY efficient to use',
    text: 'very VERY efficient to use, no boring ads, all that annoying stuff there\'s like a million different tools to use, you can resize multiple images at once!',
    author: 'Burnt Noodles'
  },
  {
    rating: 5,
    title: 'Great service',
    text: 'I thought it would be difficult to get the photo to the requirements, but this image resizer quickly and efficiently got the job done.',
    author: 'Thomas Humphreys'
  }
];

export default function Reviews() {
  return (
    <div className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Over 10 Million Users Enjoy Using Our Applications monthly.
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-12">
          Join a thriving community of creators who rely on our ImageResizer.com Tools.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex justify-center mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {review.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {review.text}
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm font-medium">
                {review.author}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center items-center space-x-4">
          <button className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-8">
          <p className="text-gray-900 dark:text-white font-semibold">
            Rated 4.7/5 based on <span className="text-indigo-600 dark:text-indigo-400">400+ reviews</span>
          </p>
        </div>
      </div>
    </div>
  );
}