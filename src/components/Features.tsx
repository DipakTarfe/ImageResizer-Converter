import React from 'react';
import { ImageIcon, Trophy, Ruler, Book, Shield, Heart } from 'lucide-react';

const features = [
  {
    icon: <ImageIcon className="w-12 h-12" />,
    title: 'Quick and Easy To Use',
    description: 'With just a simple drag and drop, you can bulk resize images within seconds. Simply set a target size and let us handle the rest.'
  },
  {
    icon: <Trophy className="w-12 h-12" />,
    title: 'Best Bulk Image Resizer',
    description: 'Unlike other tools, you can set dimensions in inches as well (for printing). Plus, you can also set a target file size for the images.'
  },
  {
    icon: <Ruler className="w-12 h-12" />,
    title: 'Supported Units',
    description: 'You can bulk resize JPG & PNG images. Resize dimensions can be set in pixels, inches, cm, or mm. You can upload up to 50 images at a time.'
  },
  {
    icon: <Book className="w-12 h-12" />,
    title: 'Reduce File Size',
    description: 'Want to reduce the file size of multiple images at once? Just select a target size in KB for all your images and let our tool take care of the rest.'
  },
  {
    icon: <Shield className="w-12 h-12" />,
    title: 'Your Images Are Safe!',
    description: 'The images you upload, as well as the resized images, are automatically deleted from our cloud servers within 24 hours.'
  },
  {
    icon: <Heart className="w-12 h-12" />,
    title: "It's free",
    description: 'Since 2013 we have resized millions of images online for free! There is no software to install or registrations. Please share this tool if you like it.'
  }
];

export default function Features() {
  return (
    <div className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}