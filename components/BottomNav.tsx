
import React from 'react';
import { View } from '../types';

interface BottomNavProps {
  currentView: View;
  setView: (view: View) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  const navItems: { view: View; icon: string; label: string }[] = [
    { view: 'home', icon: 'home', label: '首页' },
    { view: 'diary', icon: 'book_2', label: '日记' },
    { view: 'reports', icon: 'bar_chart', label: '报告' },
    { view: 'profile', icon: 'person', label: '我的' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none max-w-md mx-auto">
      {/* Floating Camera Button - Pointer events auto enabled on button */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-6 pointer-events-auto">
        <button 
          onClick={() => setView('camera')}
          className="h-16 w-16 rounded-full bg-primary flex items-center justify-center shadow-floating transition-transform active:scale-95 ring-4 ring-white"
        >
          <span className="material-symbols-outlined text-white text-[28px]">photo_camera</span>
        </button>
      </div>

      {/* Nav Bar */}
      <nav className="h-20 w-full bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between px-6 pb-2 rounded-t-3xl pointer-events-auto">
        <div className="flex gap-8">
           <NavButton item={navItems[0]} current={currentView} onClick={() => setView('home')} />
           <NavButton item={navItems[1]} current={currentView} onClick={() => setView('diary')} />
        </div>
        <div className="w-8"></div> {/* Spacer for camera button */}
        <div className="flex gap-8">
           <NavButton item={navItems[2]} current={currentView} onClick={() => setView('reports')} />
           <NavButton item={navItems[3]} current={currentView} onClick={() => setView('profile')} />
        </div>
      </nav>
    </div>
  );
};

const NavButton = ({ item, current, onClick }: { item: any, current: View, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-colors min-w-[40px] ${current === item.view ? 'text-primary' : 'text-gray-300 hover:text-gray-500'}`}
  >
    <span className={`material-symbols-outlined text-[26px] ${current === item.view ? 'filled' : ''}`}>{item.icon}</span>
    <span className={`text-[10px] font-medium ${current === item.view ? 'text-primary' : 'text-gray-400'}`}>{item.label}</span>
  </button>
);
