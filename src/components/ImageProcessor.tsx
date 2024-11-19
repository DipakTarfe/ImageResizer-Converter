import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Lock, Unlock, X, FileWarningIcon, InfoIcon } from 'lucide-react';
import { jsPDF } from 'jspdf';


interface FileDetails {
  file: File;
  preview: string;
  width?: number;
  height?: number;
  type: string;
}

interface CompressionResult {
  blob: Blob;
  quality: number;
}

function ImageProcessor() {
  const [files, setFiles] = useState<FileDetails[]>([]);
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [targetSize, setTargetSize] = useState<string>('');
  const [format, setFormat] = useState<string>('image/jpeg');
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number>(1);

  useEffect(() => {
    const currentFile = files[selectedFileIndex];
    if (currentFile?.width && currentFile?.height) {
      setAspectRatio(currentFile.width / currentFile.height);
      setWidth(currentFile.width.toString());
      setHeight(currentFile.height.toString());
    }
  }, [selectedFileIndex, files]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const processFiles = async (fileList: File[]) => {
    const validFiles = fileList.filter(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );

    const processedFiles = await Promise.all(
      validFiles.map(async (file) => {
        const preview = await createPreview(file);
        const details: FileDetails = {
          file,
          preview,
          type: file.type
        };

        if (file.type.startsWith('image/')) {
          const dimensions = await getImageDimensions(preview);
          details.width = dimensions.width;
          details.height = dimensions.height;
        }

        return details;
      })
    );

    setFiles(prev => [...prev, ...processedFiles]);
    if (processedFiles.length > 0 && files.length === 0) {
      setSelectedFileIndex(0);
    }
  };

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type === 'application/pdf') {
        resolve('/pdf-icon.png'); // You can replace this with an actual PDF icon
      } else {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    });
  };

  const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.src = src;
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      processFiles(Array.from(e.target.files));
    }
  };

  const handleWidthChange = (newWidth: string) => {
    setWidth(newWidth);
    if (lockAspectRatio && newWidth && files[selectedFileIndex]?.width) {
      const numWidth = parseInt(newWidth);
      if (!isNaN(numWidth)) {
        setHeight(Math.round(numWidth / aspectRatio).toString());
      }
    }
  };

  const handleHeightChange = (newHeight: string) => {
    setHeight(newHeight);
    if (lockAspectRatio && newHeight && files[selectedFileIndex]?.height) {
      const numHeight = parseInt(newHeight);
      if (!isNaN(numHeight)) {
        setWidth(Math.round(numHeight * aspectRatio).toString());
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (selectedFileIndex >= index) {
      setSelectedFileIndex(Math.max(0, selectedFileIndex - 1));
    }
  };

  const binarySearchCompression = async (
    canvas: HTMLCanvasElement,
    format: string,
    targetSizeKB: number,
    minQuality: number = 0.01,
    maxQuality: number = 1,
    tolerance: number = 0.01
  ): Promise<CompressionResult> => {
    let low = minQuality;
    let high = maxQuality;
    let bestResult: CompressionResult | null = null;
    let bestSizeDiff = Infinity;
    let attempts = 0;
    const maxAttempts = 20;

    while (high - low > tolerance && attempts < maxAttempts) {
      attempts++;
      const mid = (low + high) / 2;
      const blob = await new Promise<Blob>(resolve => {
        canvas.toBlob(blob => resolve(blob!), format, mid);
      });

      const sizeDiff = Math.abs(blob.size - targetSizeKB * 1024);

      if (sizeDiff < bestSizeDiff) {
        bestResult = { blob, quality: mid };
        bestSizeDiff = sizeDiff;
      }

      if (blob.size > targetSizeKB * 1024) {
        high = mid;
      } else {
        low = mid;
      }
    }

    return bestResult!;
  };

  const createPDF = async (fileData: string, targetSizeKB: number): Promise<Blob> => {
    if (files[selectedFileIndex].type === 'application/pdf') {
      // Convert PDF to image first
      // This is a placeholder - you'd need a PDF.js implementation here
      return new Blob(); // Placeholder
    }

    const img = new Image();
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = fileData;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    let currentWidth = img.width;
    let currentHeight = img.height;
    let scale = 1;
    
    let minScale = 0.1;
    let maxScale = 1;
    let bestResult: Blob | null = null;
    let bestSizeDiff = Infinity;
    
    while (maxScale - minScale > 0.05) {
      scale = (minScale + maxScale) / 2;
      currentWidth = Math.round(img.width * scale);
      currentHeight = Math.round(img.height * scale);
      
      canvas.width = currentWidth;
      canvas.height = currentHeight;
      ctx.drawImage(img, 0, 0, currentWidth, currentHeight);
      
      const { blob: compressedImage } = await binarySearchCompression(
        canvas,
        'image/jpeg',
        targetSizeKB,
        0.1,
        1,
        0.01
      );

      const pdf = new jsPDF({
        orientation: currentWidth > currentHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [currentWidth, currentHeight]
      });

      const compressedDataUrl = await new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(compressedImage);
      });

      pdf.addImage(compressedDataUrl, 'JPEG', 0, 0, currentWidth, currentHeight);
      const result = pdf.output('blob');
      
      const sizeDiff = Math.abs(result.size - targetSizeKB * 1024);
      if (sizeDiff < bestSizeDiff) {
        bestResult = result;
        bestSizeDiff = sizeDiff;
      }

      if (result.size > targetSizeKB * 1024) {
        maxScale = scale;
      } else {
        minScale = scale;
      }
    }

    return bestResult!;
  };

  const processFile = async () => {
    const currentFile = files[selectedFileIndex];
    if (!currentFile || !targetSize) return;

    const targetSizeKB = parseInt(targetSize);
    if (isNaN(targetSizeKB) || targetSizeKB <= 0) return;

    let result: Blob;
    
    if (format === 'application/pdf') {
      result = await createPDF(currentFile.preview, targetSizeKB);
    } else if (currentFile.type === 'application/pdf') {
      // Handle PDF to image conversion
      // This is a placeholder - you'd need a PDF.js implementation here
      return;
    } else {
      const canvas = document.createElement('canvas');
      const outputWidth = parseInt(width) || currentFile.width!;
      const outputHeight = parseInt(height) || currentFile.height!;
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = currentFile.preview;
      });
      
      ctx.drawImage(img, 0, 0, outputWidth, outputHeight);
      const compressionResult = await binarySearchCompression(canvas, format, targetSizeKB);
      result = compressionResult.blob;
    }

    const url = URL.createObjectURL(result);
    const a = document.createElement('a');
    const extension = format === 'application/pdf' ? 'pdf' : format.split('/')[1];
    const originalFileName = currentFile.file.name.replace(/\.[^/.]+$/, '');
    a.href = url;
    a.download = `ImageResizer_${originalFileName}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentFile = files[selectedFileIndex];
  const isPDF = format === 'application/pdf';

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Image & PDF Resizer
        </h1>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-8 mb-8 text-center transition-colors
            ${isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-700'}
            ${files.length > 0 ? 'border-green-500 dark:border-green-600' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {files.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 justify-center mb-4">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className={`relative group cursor-pointer ${
                      index === selectedFileIndex ? 'ring-2 ring-indigo-500' : ''
                    }`}
                    onClick={() => setSelectedFileIndex(index)}
                  >
                    <img 
                      src={file.preview}
                      alt={`Preview ${index + 1}`}
                      className="h-24 w-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="absolute -top-2 -right--1 bg-green-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              {currentFile && (
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>Original size: {Math.round(currentFile.file.size / 1024)} KB</p>
                  {currentFile.width && currentFile.height && (
                    <p>Dimensions: {currentFile.width} × {currentFile.height} px</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <Upload className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600" />
              <p className="text-gray-600 dark:text-gray-400">
                Drag and drop images or PDFs here, or
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Choose Files
              </button>
              <div className="flex items-center justify-center space-x-1">
              <InfoIcon className="w-4 h-4 text-red-400 dark:text-red-600" />
              <p className="text-gray-600 dark:text-gray-400">
                If your file size is more than 2MB it may take some time to processing
              </p>
            </div>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,application/pdf"
            multiple
            className="hidden"
          />
        </div>

        <div className="max-w-lg mx-auto space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className={`space-y-2 ${isPDF ? 'opacity-50' : ''}`}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Width (px)
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => handleWidthChange(e.target.value)}
                placeholder={currentFile?.width ? `Original: ${currentFile.width}` : "Enter width"}
                disabled={isPDF}
                className="block w-full px-3 py-2 text-sm rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
              />
            </div>
            <div className={`space-y-2 ${isPDF ? 'opacity-50' : ''}`}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Height (px)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => handleHeightChange(e.target.value)}
                placeholder={currentFile?.height ? `Original: ${currentFile.height}` : "Enter height"}
                disabled={isPDF}
                className="block w-full px-3 py-2 text-sm rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
              />
            </div>
          </div>

          <div className={`flex items-center justify-end space-x-2 ${isPDF ? 'opacity-50' : ''}`}>
            <button
              onClick={() => setLockAspectRatio(!lockAspectRatio)}
              disabled={isPDF}
              className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {lockAspectRatio ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Unlock className="w-4 h-4" />
              )}
              <span>Aspect Ratio</span>
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Target Size (KB)
            </label>
            <input
              type="number"
              value={targetSize}
              onChange={(e) => setTargetSize(e.target.value)}
              placeholder="Enter target size in KB"
              className="block w-full px-3 py-2 text-sm rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Output Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="block w-full px-3 py-2 text-sm rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="image/jpeg">JPEG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WebP</option>
              <option value="application/pdf">PDF</option>
            </select>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={processFile}
            disabled={!currentFile || !targetSize}
            className={`px-8 py-3 rounded-lg text-white font-medium flex items-center justify-center mx-auto space-x-2
              ${currentFile && targetSize
                ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600' 
                : 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed'
              } transition-colors`}
          >
            <Download className="w-5 h-5" />
            <span>Process & Download</span>
          </button>
          {isPDF && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Note: Width and height settings are not applicable for PDF output
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImageProcessor;