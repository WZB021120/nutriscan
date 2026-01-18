
import React from 'react';

const Splash: React.FC = () => {
  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-between p-6 bg-white overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <span className="material-symbols-outlined absolute -top-24 -right-24 text-[600px] text-[#9eb7a5]/5 rotate-12 select-none" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>
          eco
        </span>
        <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-[#FAD28A]/20 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <div className="flex-1"></div>

      <div className="relative z-10 flex flex-col items-center gap-10 w-full max-w-sm">
        <div className="relative group cursor-default">
          <div className="absolute -inset-6 border border-dashed border-[#9eb7a5]/40 rounded-full animate-[spin_12s_linear_infinite] opacity-60"></div>
          <div className="relative w-36 h-36 bg-gradient-to-br from-[#E8F0EA] to-[#F5F9F6] rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_40px_-12px_rgba(158,183,165,0.3)] border border-white">
            <div className="relative z-10 text-[#9eb7a5] drop-shadow-sm">
              <span className="material-symbols-outlined text-[80px]">local_dining</span>
              <span className="material-symbols-outlined absolute -top-2 -right-4 text-[#FAD28A] text-3xl animate-bounce">
                auto_awesome
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center text-center space-y-3">
          <h1 className="text-[#1a1f19] text-4xl font-extrabold tracking-tight">NutriScan</h1>
          <p className="text-[#727974] text-lg font-medium tracking-wide">简单饮食，健康生活</p>
        </div>

        <div className="flex gap-2.5 pt-4">
          <div className="h-1.5 w-1.5 rounded-full bg-[#9eb7a5] animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-[#9eb7a5] animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-[#9eb7a5] animate-bounce"></div>
        </div>
      </div>

      <div className="flex-1"></div>

      <div className="pb-8 opacity-80">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-[#9eb7a5]/10">
          <span className="material-symbols-outlined text-sm text-[#9eb7a5]">temp_preferences_custom</span>
          <p className="text-[#727974] text-xs font-semibold tracking-widest uppercase">Powered by AI</p>
        </div>
      </div>
    </div>
  );
};

export default Splash;
