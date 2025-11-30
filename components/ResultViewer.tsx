import React from 'react';
import { Download, Loader2, Sparkles, LayoutGrid } from 'lucide-react';

interface ResultViewerProps {
  isLoading: boolean;
  resultImage: string | null;
  onDownload: () => void;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({ isLoading, resultImage, onDownload }) => {
  if (isLoading) {
    return (
      <div className="w-full aspect-square rounded-2xl border-2 border-yellow-500/30 bg-slate-900/50 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/5 via-transparent to-orange-500/5 animate-pulse" />
        <Loader2 size={48} className="text-yellow-500 animate-spin mb-4" />
        <p className="text-yellow-200 font-bold animate-pulse comic-font text-lg">Drawing Panels...</p>
        <p className="text-slate-500 text-xs mt-2">Gemini 3 Pro is creating your story</p>
      </div>
    );
  }

  if (!resultImage) {
    return (
      <div className="w-full aspect-square rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/30 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
        <LayoutGrid size={48} className="mb-4 opacity-20" />
        <p className="font-medium">Comic strip will appear here</p>
        <p className="text-xs mt-2 opacity-50">Upload an image to start</p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-4 border-slate-900 shadow-[0_0_30px_rgba(234,179,8,0.2)] group bg-white">
      <img 
        src={resultImage} 
        alt="AI Comic" 
        className="w-full h-full object-contain"
      />
      <div className="absolute top-4 left-4 bg-yellow-500 text-slate-900 px-3 py-1 rounded-md text-xs font-bold shadow-lg border-2 border-slate-900 comic-font transform -rotate-2">
        #ComicStripAI
      </div>
      
      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 backdrop-blur-[2px]">
        <button 
          onClick={onDownload}
          className="w-full bg-yellow-500 text-slate-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 transform hover:scale-[1.02] transition-all shadow-xl border-2 border-slate-900"
        >
          <Download size={20} />
          Download Comic
        </button>
      </div>
    </div>
  );
};