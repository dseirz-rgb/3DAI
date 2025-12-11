import React, { useState, useRef } from 'react';
import { TaskType } from '../types';
import { Type, Image as ImageIcon, Upload, X } from 'lucide-react';

interface InputSectionProps {
  onGenerate: (prompt: string, image: string | null) => void;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onGenerate, isLoading }) => {
  const [activeTab, setActiveTab] = useState<TaskType>(TaskType.TEXT);
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === TaskType.TEXT && !prompt.trim()) return;
    if (activeTab === TaskType.IMAGE && !selectedImage) return;

    onGenerate(
      activeTab === TaskType.TEXT ? prompt : '',
      activeTab === TaskType.IMAGE ? selectedImage : null
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        <button
          onClick={() => setActiveTab(TaskType.TEXT)}
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-all ${
            activeTab === TaskType.TEXT
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`}
        >
          <Type size={18} />
          Text to 3D
        </button>
        <button
          onClick={() => setActiveTab(TaskType.IMAGE)}
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-all ${
            activeTab === TaskType.IMAGE
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`}
        >
          <ImageIcon size={18} />
          Image to 3D
        </button>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit}>
          {activeTab === TaskType.TEXT ? (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Describe your object
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A cute robotic dog sitting on a skateboard..."
                className="w-full h-32 p-4 text-slate-800 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-shadow"
                disabled={isLoading}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Upload reference image
              </label>
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  selectedImage ? 'border-blue-200 bg-blue-50/50' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) {
                     const reader = new FileReader();
                     reader.onloadend = () => setSelectedImage(reader.result as string);
                     reader.readAsDataURL(file);
                  }
                }}
              >
                {!selectedImage ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <Upload size={24} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-700">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-slate-400">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Select File
                    </button>
                  </div>
                ) : (
                  <div className="relative inline-block">
                    <img 
                      src={selectedImage} 
                      alt="Preview" 
                      className="max-h-64 rounded-lg shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-3 -right-3 bg-white text-red-500 p-1.5 rounded-full shadow-md border border-red-100 hover:bg-red-50 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8">
            <button
              type="submit"
              disabled={isLoading || (activeTab === TaskType.TEXT && !prompt) || (activeTab === TaskType.IMAGE && !selectedImage)}
              className={`w-full py-3.5 px-6 rounded-xl text-white font-medium text-lg shadow-lg shadow-blue-500/20 transition-all transform active:scale-[0.98] ${
                isLoading || (activeTab === TaskType.TEXT && !prompt) || (activeTab === TaskType.IMAGE && !selectedImage)
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/30'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                'Generate 3D Model'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
