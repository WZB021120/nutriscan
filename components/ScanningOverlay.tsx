
import React from 'react';

export const ScanningOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
      <div className="relative w-64 h-64 rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
        {/* Scanning Laser */}
        <div className="absolute top-0 left-0 w-full h-1 bg-secondary shadow-[0_0_15px_#FAD28A] animate-[scan_2s_linear_infinite] z-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent opacity-50 z-10"></div>
        
        {/* Mock grid lines */}
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-0 opacity-20">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="border border-white/30"></div>
          ))}
        </div>
        
        {/* Corner markers */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-secondary"></div>
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-secondary"></div>
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-secondary"></div>
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-secondary"></div>
      </div>
      
      <div className="mt-8 flex flex-col items-center space-y-2">
        <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary animate-spin">cyclone</span>
            <span className="text-white text-lg font-bold tracking-wide">AI 正在分析...</span>
        </div>
        <p className="text-white/60 text-sm">正在识别食物成分与卡路里</p>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
