import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, selectedFile, onClear }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Update preview when file changes
  React.useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      } else {
        alert('Please upload an image file.');
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  if (selectedFile && previewUrl) {
    return (
      <div className="relative w-full aspect-[3/4] md:aspect-square rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-900 shadow-xl group">
        <img 
          src={previewUrl} 
          alt="Original" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button 
            onClick={onClear}
            className="bg-red-500/90 hover:bg-red-600 text-white p-3 rounded-full transform hover:scale-105 transition-all shadow-lg backdrop-blur-sm"
          >
            <X size={24} />
          </button>
        </div>
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10">
          Original
        </div>
      </div>
    );
  }

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full aspect-[3/4] md:aspect-square rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-500/10' 
          : 'border-slate-600 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'}
      `}
    >
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      
      <div className="flex flex-col items-center gap-4 p-6 text-center pointer-events-none">
        <div className={`p-4 rounded-full ${isDragging ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
          <Upload size={32} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Upload Photo
          </h3>
          <p className="text-sm text-slate-400">
            Drag & drop or click to browse
          </p>
        </div>
        <div className="text-xs text-slate-500 bg-slate-800/80 px-3 py-1 rounded-full">
          JPG, PNG, WebP
        </div>
      </div>
    </div>
  );
};