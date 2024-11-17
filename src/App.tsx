import React from 'react';
import Navbar from './components/Navbar';
import ImageProcessor from './components/ImageProcessor';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />
      <div className="border-t border-gray-200 dark:border-gray-800">
        <ImageProcessor />
      </div>
      <Footer />
    </div>
  );
}

export default App;