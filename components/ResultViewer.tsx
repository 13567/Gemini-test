import React from 'react';
import { Download, Loader2, Sparkles } from 'lucide-react';

interface ResultViewerProps {
  isLoading: boolean;
  resultImage: string | null;
  onDownload: () => void;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({ isLoading, resultImage, onDownload }) => {
  if (isLoading) {
    return (
      <div className="w-full aspect-[3/4] md:aspect-square rounded-2xl border-2 border-indigo-500/30 bg-slate-900/50 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5 animate-pulse" />
        <Loader2 size={48} className="text-indigo-500 animate-spin mb-4" />
        <p className="text-indigo-200 font-medium animate-pulse">Designing your look...</p>
        <p className="text-slate-500 text-xs mt-2">Powered by Gemini 2.5 Flash</p>
      </div>
    );
  }

  if (!resultImage) {
    return (
      <div className="w-full aspect-[3/4] md:aspect-square rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/30 flex flex-col items-center justify-center text-slate-500">
        <Sparkles size={48} className="mb-4 opacity-20" />
        <p>AI result will appear here</p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[3/4] md:aspect-square rounded-2xl overflow-hidden border-2 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.3)] group bg-slate-900">
      <img 
        src={resultImage} 
        alt="AI Generated" 
        className="w-full h-full object-cover"
      />
      <div className="absolute top-4 left-4 bg-indigo-600/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg flex items-center gap-1 border border-white/10">
        <Sparkles size={12} />
        SuitUp AI
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
        <button 
          onClick={onDownload}
          className="w-full bg-white text-indigo-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-50 transform hover:scale-[1.02] transition-all shadow-xl"
        >
          <Download size={20} />
          Download Image
        </button>
      </div>
    </div>
  );
};