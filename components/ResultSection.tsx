import React from 'react';
import { GenerationState } from '../types';
import { Download, AlertCircle, RefreshCw, Box } from 'lucide-react';

interface ResultSectionProps {
  state: GenerationState;
  onReset: () => void;
}

export const ResultSection: React.FC<ResultSectionProps> = ({ state, onReset }) => {
  // Use any cast to avoid type issues with custom element without breaking global JSX namespace
  const ModelViewer = 'model-viewer' as any;

  if (state.status === 'IDLE') {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 bg-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200">
        <Box size={48} className="mb-4 opacity-50" />
        <p className="text-lg font-medium">Your 3D model will appear here</p>
        <p className="text-sm">Enter a prompt or upload an image to start</p>
      </div>
    );
  }

  if (state.status === 'FAILED') {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-red-500 bg-red-50 rounded-2xl border border-red-100 p-8 text-center">
        <AlertCircle size={48} className="mb-4" />
        <h3 className="text-xl font-bold mb-2">Generation Failed</h3>
        <p className="text-slate-600 mb-6 max-w-md">{state.error || "An unknown error occurred."}</p>
        <button 
          onClick={onReset}
          className="px-6 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg font-medium hover:bg-slate-50 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (state.status === 'SUBMITTING' || state.status === 'POLLING') {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-xl relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50" />
        
        <div className="relative z-10 flex flex-col items-center max-w-xs w-full">
          <div className="w-16 h-16 mb-6 relative">
             <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
             <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin"></div>
             <Box size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" />
          </div>
          
          <h3 className="text-xl font-bold text-slate-800 mb-2">Generating 3D Asset</h3>
          <p className="text-slate-500 text-sm mb-6 text-center">
            This usually takes about 30-60 seconds. <br/> Please don't close this tab.
          </p>
          
          {/* Progress Bar (Simulated) */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300 rounded-full"
              style={{ width: `${state.progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400 font-mono">Job ID: {state.jobId || 'Initializing...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[500px] bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      <div className="flex-1 relative w-full h-full bg-grid-slate-800">
        <ModelViewer
          src={state.resultUrl}
          camera-controls
          auto-rotate
          shadow-intensity="1"
          style={{ width: '100%', height: '100%', minHeight: '400px' }}
          background-color="#0f172a"
        >
           <div slot="poster" className="flex items-center justify-center w-full h-full text-white">
              Loading Model...
           </div>
        </ModelViewer>
      </div>
      
      <div className="bg-white p-4 border-t border-slate-100 flex items-center justify-between">
        <div>
           <p className="text-sm font-medium text-green-600 flex items-center gap-1">
             <span className="w-2 h-2 rounded-full bg-green-500"></span>
             Generation Complete
           </p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
            >
                <RefreshCw size={16} />
                New Task
            </button>
            <a 
                href={state.resultUrl || '#'} 
                download
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
            >
                <Download size={16} />
                Download GLB
            </a>
        </div>
      </div>
    </div>
  );
};