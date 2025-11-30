import React, { useState, useCallback } from 'react';
import { FileUploader } from './components/FileUploader';
import { ResultViewer } from './components/ResultViewer';
import { editImageWithGemini } from './services/geminiService';
import { Briefcase, Wand2, User, Sparkles, Send } from 'lucide-react';

const SUIT_PROMPT = "Identify the person in this image. Change their outfit to a stylish, well-fitted professional business suit. Choose a modern suit style that fits the person's pose perfectly. Keep the background, face, and lighting exactly consistent with the original image.";

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isSuitMode, setIsSuitMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResultImage(null);
    setError(null);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setResultImage(null);
    setError(null);
    setCustomPrompt("");
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
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
      
      // Use the suit prompt if in suit mode, otherwise use the custom prompt
      // If custom prompt is empty in custom mode, default to a generic "enhance" prompt
      const finalPrompt = isSuitMode 
        ? SUIT_PROMPT 
        : (customPrompt || "Enhance the quality of this image and make it look professional.");

      const generatedImageBase64 = await editImageWithGemini(
        base64Data, 
        mimeType, 
        finalPrompt
      );

      if (generatedImageBase64) {
        setResultImage(generatedImageBase64);
      } else {
        setError("Failed to generate image. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during generation. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `suitup-ai-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-indigo-500/30 pb-20">
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
              <Briefcase size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              SuitUp <span className="font-light">AI</span>
            </h1>
          </div>
          <div className="text-xs font-medium px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hidden sm:block">
            Powered by Gemini 2.5
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Intro */}
        <div className="text-center mb-10 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Dress for success, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">instantly.</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Upload your photo and let our AI tailor fit a professional suit for you in seconds. Or use custom prompts to edit your photos creatively.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Input & Controls */}
          <div className="space-y-6">
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User size={18} className="text-indigo-400" />
                  Source Image
                </h3>
              </div>
              <FileUploader 
                onFileSelect={handleFileSelect} 
                selectedFile={selectedFile}
                onClear={handleClear}
              />
            </div>

            {/* Controls */}
            <div className={`bg-slate-800/50 border border-slate-700 rounded-3xl p-6 shadow-xl backdrop-blur-sm transition-opacity duration-300 ${!selectedFile ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Wand2 size={18} className="text-purple-400" />
                Styling Options
              </h3>

              <div className="flex gap-2 p-1 bg-slate-900 rounded-xl mb-6">
                <button
                  onClick={() => setIsSuitMode(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                    isSuitMode 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Briefcase size={16} />
                  Suit Up (Auto)
                </button>
                <button
                  onClick={() => setIsSuitMode(false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                    !isSuitMode 
                      ? 'bg-purple-600 text-white shadow-lg' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Sparkles size={16} />
                  Custom Edit
                </button>
              </div>

              <div className="space-y-4">
                {isSuitMode ? (
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-sm text-indigo-200">
                    <p className="flex gap-2">
                      <span className="font-bold">AI Instruction:</span>
                      "Find the person. Replace clothing with a professional fitted business suit. Maintain face and background."
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Describe your edit
                    </label>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="E.g., Change the background to a beach, Add a retro filter, Remove the glasses..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-32"
                    />
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !selectedFile}
                  className={`
                    w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg
                    ${isLoading 
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                      : isSuitMode
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white transform hover:scale-[1.02]'
                        : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white transform hover:scale-[1.02]'
                    }
                  `}
                >
                  {isLoading ? (
                    <>Processing...</>
                  ) : (
                    <>
                      {isSuitMode ? <Briefcase size={20} /> : <Send size={20} />}
                      {isSuitMode ? 'Generate Business Look' : 'Apply Custom Edit'}
                    </>
                  )}
                </button>
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Result */}
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-6 shadow-xl backdrop-blur-sm h-full">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-yellow-400" />
                AI Transformation
              </h3>
              <ResultViewer 
                isLoading={isLoading} 
                resultImage={resultImage}
                onDownload={handleDownload}
              />
              
              {!resultImage && !isLoading && (
                 <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs text-slate-500">
                    <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800">
                      High Quality
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800">
                      Privacy First
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800">
                      Fast Process
                    </div>
                 </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}