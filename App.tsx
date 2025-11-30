import React, { useState, useEffect } from 'react';
import { FileUploader } from './components/FileUploader';
import { ResultViewer } from './components/ResultViewer';
import { generateComicWithGemini } from './services/geminiService';
import { Palette, Sparkles, Send, LayoutGrid, KeyRound, MessageSquareText } from 'lucide-react';

const COMIC_STYLES = [
  { id: 'manga', label: 'Manga / Anime', desc: 'Black & white, dynamic lines' },
  { id: 'superhero', label: 'US Superhero', desc: 'Bold colors, dramatic shading' },
  { id: 'cartoon', label: 'Sunday Cartoon', desc: 'Flat colors, playful style' },
  { id: 'sketch', label: 'Hand Drawn', desc: 'Pencil sketch aesthetic' },
  { id: 'pixel', label: 'Pixel Art', desc: 'Retro 8-bit game style' },
  { id: 'noir', label: 'Film Noir', desc: 'Dark, moody, high contrast' },
];

export default function App() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [storyHint, setStoryHint] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(COMIC_STYLES[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      const aistudio = (window as any).aistudio;
      if (aistudio && aistudio.hasSelectedApiKey) {
        const hasKey = await aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        // Fallback for dev environments without the AI Studio wrapper
        setHasApiKey(true);
      }
    } catch (e) {
      console.error("Error checking API key:", e);
      setHasApiKey(false);
    }
  };

  const handleSelectKey = async () => {
    try {
      const aistudio = (window as any).aistudio;
      if (aistudio && aistudio.openSelectKey) {
        await aistudio.openSelectKey();
        // Assume success after dialog closes (race condition mitigation)
        setHasApiKey(true);
      }
    } catch (e) {
      console.error("Error selecting API key:", e);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResultImage(null);
    setError(null);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setResultImage(null);
    setError(null);
    setStoryHint("");
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const base64Data = await fileToBase64(selectedFile);
      const mimeType = selectedFile.type;
      
      const styleLabel = COMIC_STYLES.find(s => s.id === selectedStyle)?.label || "Comic Book";
      const finalPrompt = storyHint.trim() 
        ? storyHint 
        : "A funny and interesting sequence of events involving the main character.";

      const generatedImageBase64 = await generateComicWithGemini(
        base64Data, 
        mimeType, 
        finalPrompt,
        styleLabel
      );

      if (generatedImageBase64) {
        setResultImage(generatedImageBase64);
      } else {
        // If failed, it might be an auth issue, let's reset key state just in case, 
        // but showing error message is better UX than forcefully logging out.
        setError("Failed to generate comic. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("Requested entity was not found")) {
        setHasApiKey(false); // Reset key state to force re-selection
        setError("API Key issue detected. Please select your key again.");
      } else {
        setError("An error occurred during generation. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `comic-strip-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // API Key Selection Screen
  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="inline-flex items-center justify-center p-4 bg-yellow-500/10 rounded-full mb-4">
            <LayoutGrid size={64} className="text-yellow-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white comic-font tracking-wide">
            ComicStrip <span className="text-yellow-400">AI</span>
          </h1>
          <p className="text-slate-400 text-lg">
            To create high-quality comics with Gemini 3 Pro (Nano Banana Pro), you need to select a paid API key.
          </p>
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
            <button
              onClick={handleSelectKey}
              className="w-full py-4 px-6 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold text-lg rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] shadow-lg"
            >
              <KeyRound size={24} />
              Connect API Key
            </button>
            <p className="mt-4 text-xs text-slate-500">
              Check billing details at <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-yellow-500 hover:underline">ai.google.dev</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-yellow-500/30 pb-20">
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0f172a]/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg">
              <LayoutGrid size={20} className="text-slate-900" />
            </div>
            <h1 className="text-xl font-bold comic-font tracking-wide text-white">
              ComicStrip <span className="text-yellow-400">AI</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-yellow-400 hidden sm:block">
              Gemini 3 Pro
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Intro */}
        <div className="text-center mb-10 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white comic-font tracking-wider">
            Turn your life into a <span className="text-yellow-400 decoration-wavy underline decoration-yellow-400/30">Comic Strip</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Upload a photo, choose a style, and let AI generate a hilarious 4-panel comic story instantly.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Input & Controls */}
          <div className="space-y-6">
            
            {/* 1. Upload */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 comic-font">
                  <div className="bg-slate-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</div>
                  Upload Character/Scene
                </h3>
              </div>
              <FileUploader 
                onFileSelect={handleFileSelect} 
                selectedFile={selectedFile}
                onClear={handleClear}
              />
            </div>

            {/* 2. Controls */}
            <div className={`bg-slate-800/50 border border-slate-700 rounded-3xl p-6 shadow-xl backdrop-blur-sm transition-all duration-300 ${!selectedFile ? 'opacity-60 pointer-events-none grayscale' : 'opacity-100'}`}>
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 comic-font">
                <div className="bg-slate-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</div>
                Creative Direction
              </h3>

              {/* Style Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                  <Palette size={16} /> Choose Art Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COMIC_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`
                        p-3 rounded-xl border text-left transition-all
                        ${selectedStyle === style.id 
                          ? 'bg-yellow-500/10 border-yellow-500/50 ring-1 ring-yellow-500/50' 
                          : 'bg-slate-900 border-slate-700 hover:border-slate-600'}
                      `}
                    >
                      <div className={`font-bold text-sm ${selectedStyle === style.id ? 'text-yellow-400' : 'text-slate-200'}`}>
                        {style.label}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 truncate">
                        {style.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Story Hint */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                  <MessageSquareText size={16} /> Story Hint (Optional)
                </label>
                <textarea
                  value={storyHint}
                  onChange={(e) => setStoryHint(e.target.value)}
                  placeholder="E.g., The cat plans world domination, but gets distracted by a laser pointer..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 resize-none h-24 text-sm"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isLoading || !selectedFile}
                className={`
                  w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg
                  ${isLoading 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-slate-900 transform hover:scale-[1.02]'
                  }
                `}
              >
                {isLoading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Comic Strip
                  </>
                )}
              </button>
              
              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                  {error}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Result */}
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-6 shadow-xl backdrop-blur-sm h-full flex flex-col">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 comic-font">
                <LayoutGrid size={18} className="text-yellow-400" />
                Your Comic
              </h3>
              <ResultViewer 
                isLoading={isLoading} 
                resultImage={resultImage}
                onDownload={handleDownload}
              />
              
              {!resultImage && !isLoading && (
                 <div className="mt-6 text-center space-y-2">
                    <p className="text-slate-500 text-sm">
                      Pro Tip: Try the <span className="text-yellow-500">Manga</span> style for dramatic effects!
                    </p>
                 </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}