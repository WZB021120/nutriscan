
import React, { useState, useEffect } from 'react';
import Splash from './views/Splash';
import Dashboard from './views/Dashboard';
import CameraView from './views/CameraView';
import Analysis from './views/Analysis';
import Profile from './views/Profile';
import Diary from './views/Diary';
import Reports from './views/Reports';
import { BottomNav } from './components/BottomNav';
import { View, Meal, UserStats, AnalysisResult } from './types';
import { INITIAL_STATS, MOCK_MEALS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('splash');
  const [isInitialized, setIsInitialized] = useState(false);

  // Persistence: Load initial state from local storage
  const [meals, setMeals] = useState<Meal[]>(() => {
    try {
      const saved = localStorage.getItem('nutriscan_meals');
      return saved ? JSON.parse(saved) : MOCK_MEALS;
    } catch {
      return MOCK_MEALS;
    }
  });

  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('nutriscan_stats');
      return saved ? JSON.parse(saved) : INITIAL_STATS;
    } catch {
      return INITIAL_STATS;
    }
  });

  const [pendingAnalysis, setPendingAnalysis] = useState<{ result: AnalysisResult; image: string } | null>(null);

  // Persistence: Save state changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('nutriscan_meals', JSON.stringify(meals));
      localStorage.setItem('nutriscan_stats', JSON.stringify(stats));
    }
  }, [meals, stats, isInitialized]);

  useEffect(() => {
    if (currentView === 'splash') {
      const timer = setTimeout(() => {
        setCurrentView('home');
        setIsInitialized(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentView]);

  const addMeal = (result: AnalysisResult, imageUrl: string) => {
    const newMeal: Meal = {
      id: Date.now().toString(),
      name: result.name,
      type: '加餐',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      calories: result.calories,
      macros: result.macros,
      imageUrl: imageUrl,
      insight: result.insight
    };

    setMeals(prev => [newMeal, ...prev]);
    setStats(prev => ({
      ...prev,
      consumed: prev.consumed + result.calories,
      macros: {
        protein: { ...prev.macros.protein, current: prev.macros.protein.current + result.macros.protein },
        carbs: { ...prev.macros.carbs, current: prev.macros.carbs.current + result.macros.carbs },
        fat: { ...prev.macros.fat, current: prev.macros.fat.current + result.macros.fat }
      }
    }));
    setCurrentView('home');
    setPendingAnalysis(null);
  };

  const showNav = ['home', 'profile', 'diary', 'reports'].includes(currentView);

  const renderView = () => {
    switch (currentView) {
      case 'splash':
        return <Splash />;
      case 'home':
        return <Dashboard stats={stats} meals={meals} setView={setCurrentView} />;
      case 'camera':
        return (
          <CameraView
            onCaptured={(result, image) => {
              setPendingAnalysis({ result, image });
              setCurrentView('analysis');
            }}
            onClose={() => setCurrentView('home')}
          />
        );
      case 'analysis':
        return pendingAnalysis ? (
          <Analysis
            result={pendingAnalysis.result}
            imageUrl={pendingAnalysis.image}
            onConfirm={() => addMeal(pendingAnalysis.result, pendingAnalysis.image)}
            onClose={() => setCurrentView('home')}
          />
        ) : <Dashboard stats={stats} meals={meals} setView={setCurrentView} />;
      case 'profile':
        return <Profile stats={stats} meals={meals} setView={setCurrentView} />;
      case 'diary':
        return <Diary meals={meals} stats={stats} setView={setCurrentView} />;
      case 'reports':
        return <Reports meals={meals} stats={stats} setView={setCurrentView} />;
      default:
        return <Dashboard stats={stats} meals={meals} setView={setCurrentView} />;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative overflow-hidden">
      <div className={`h-full transition-opacity duration-300 ${currentView === 'splash' ? 'opacity-100' : 'opacity-100'}`}>
        {renderView()}
      </div>

      {showNav && <BottomNav currentView={currentView} setView={setCurrentView} />}
    </div>
  );
};

export default App;
