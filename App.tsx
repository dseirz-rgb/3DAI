import React, { useState, useRef, useEffect } from 'react';
import { submitTask, queryTask } from './services/tencentService';
import { InputSection } from './components/InputSection';
import { ResultSection } from './components/ResultSection';
import { ApiKeyConfig } from './components/ApiKeyConfig';
import { GenerationState } from './types';
import { Box, Sparkles } from 'lucide-react';

const POLLING_INTERVAL = 3000; // 3 seconds

function App() {
  const [generationState, setGenerationState] = useState<GenerationState>({
    status: 'IDLE',
    jobId: null,
    resultUrl: null,
    error: null,
    progress: 0
  });

  const pollingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, []);

  const handleGenerate = async (prompt: string, image: string | null) => {
    try {
      setGenerationState({
        status: 'SUBMITTING',
        jobId: null,
        resultUrl: null,
        error: null,
        progress: 5
      });

      const response = await submitTask(prompt, image);
      const jobId = response.JobId;

      setGenerationState(prev => ({
        ...prev,
        status: 'POLLING',
        jobId: jobId,
        progress: 10
      }));

      // Start polling
      startPolling(jobId);

    } catch (error: any) {
      setGenerationState(prev => ({
        ...prev,
        status: 'FAILED',
        error: error.message || "Failed to submit task"
      }));
    }
  };

  const startPolling = (jobId: string) => {
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

    let pollCount = 0;

    pollingTimerRef.current = setInterval(async () => {
      try {
        pollCount++;
        // Fake progress increment up to 90%
        setGenerationState(prev => ({
            ...prev,
            progress: Math.min(prev.progress + (Math.random() * 5), 90)
        }));

        const data = await queryTask(jobId);
        console.log("Polling Status:", data.Status, data);

        if (data.Status === 'SUCCESS' || data.Status === 'COMPLETED') { // Covering common status codes
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          
          const modelUrl = data.Result?.ModelUrl || data.Result?.CoverUrl; // Fallback logic
          
          if (!modelUrl) {
              throw new Error("Job completed but no Model URL found in response.");
          }

          setGenerationState(prev => ({
            ...prev,
            status: 'SUCCESS',
            resultUrl: modelUrl,
            progress: 100
          }));
        } else if (data.Status === 'FAILED') {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          setGenerationState(prev => ({
            ...prev,
            status: 'FAILED',
            error: data.Error?.Message || "Generation failed on server side."
          }));
        }
        // If WAITING or RUNNING, continue polling...

      } catch (error: any) {
        // If transient network error, maybe don't fail immediately, but for now we do.
        console.error("Polling error", error);
        // Only stop if critical error
        // setGenerationState(prev => ({ ...prev, status: 'FAILED', error: error.message }));
        // clearInterval(pollingTimerRef.current!);
      }
    }, POLLING_INTERVAL);
  };

  const handleReset = () => {
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    setGenerationState({
      status: 'IDLE',
      jobId: null,
      resultUrl: null,
      error: null,
      progress: 0
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Box size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hunyuan 3D</h1>
              <p className="text-xs text-slate-500 -mt-1 font-medium">Tencent Cloud AI</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <ApiKeyConfig />
             <a 
               href="https://cloud.tencent.com/document/product/1729" 
               target="_blank" 
               rel="noreferrer"
               className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
             >
               Documentation
             </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="prose prose-slate">
              <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
                Turn your ideas into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">3D Reality</span>
              </h2>
              <p className="text-lg text-slate-600">
                Generate high-quality 3D assets for games, AR/VR, and design using the power of Tencent Hunyuan large models.
              </p>
            </div>
            
            <InputSection 
              onGenerate={handleGenerate} 
              isLoading={generationState.status === 'SUBMITTING' || generationState.status === 'POLLING'}
            />

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <Sparkles className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-sm font-semibold text-blue-900">Pro Tip</h4>
                <p className="text-sm text-blue-700 mt-1">
                  For best results with images, use a clear object on a plain background. For text, be descriptive about colors and style.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Result */}
          <div className="lg:col-span-7">
             <ResultSection state={generationState} onReset={handleReset} />
          </div>

        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between text-slate-500 text-sm">
          <p>© 2025 Tencent Cloud. All rights reserved.</p>
          <p>Powered by Hunyuan 3D API</p>
        </div>
      </footer>
    </div>
  );
}

export default App;