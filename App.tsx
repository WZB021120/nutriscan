
import React, { useState, useEffect } from 'react';
import Splash from './views/Splash';
import Dashboard from './views/Dashboard';
import CameraView from './views/CameraView';
import Analysis from './views/Analysis';
import Profile from './views/Profile';
import Diary from './views/Diary';
import Reports from './views/Reports';
import Login from './views/Login';
import { BottomNav } from './components/BottomNav';
import { View, Meal, UserStats, AnalysisResult } from './types';
import { INITIAL_STATS, MOCK_MEALS } from './constants';
import { authApi, mealsApi, statsApi, profileApi } from './services/apiService';

// 用户资料类型
interface UserProfile {
  nickname: string;
  avatarUrl: string;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('splash');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(authApi.isLoggedIn());

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
  const [userProfile, setUserProfile] = useState<UserProfile>({ nickname: '', avatarUrl: '' });

  // 从后端同步数据
  const syncFromBackend = async () => {
    if (!authApi.isLoggedIn()) return;

    try {
      // 同步餐食数据
      const backendMeals = await mealsApi.getAll();
      // 确保每条餐食都有 createdAt 字段
      const mealsWithDate = backendMeals.map((meal: Meal) => ({
        ...meal,
        createdAt: meal.createdAt || new Date().toISOString().split('T')[0]
      }));
      setMeals(mealsWithDate);

      // 同步统计数据
      const backendStats = await statsApi.get();
      setStats(backendStats);

      // 同步用户资料
      try {
        const profile = await profileApi.get();
        setUserProfile({
          nickname: profile.nickname || authApi.getUsername() || '',
          avatarUrl: profile.avatarUrl || ''
        });
      } catch {
        setUserProfile({ nickname: authApi.getUsername() || '', avatarUrl: '' });
      }
    } catch (error) {
      console.error('后端数据同步失败:', error);
      // 失败时使用本地数据
    }
  };

  // 登录后同步数据
  const handleLogin = async () => {
    setIsLoggedIn(true);
    await syncFromBackend();
    setCurrentView('home');
  };

  // 登出
  const handleLogout = () => {
    authApi.logout();
    setIsLoggedIn(false);
    setCurrentView('home');
  };

  // Persistence: Save state changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('nutriscan_meals', JSON.stringify(meals));
      localStorage.setItem('nutriscan_stats', JSON.stringify(stats));
    }
  }, [meals, stats, isInitialized]);

  // 启动时同步后端数据
  useEffect(() => {
    if (currentView === 'splash') {
      const timer = setTimeout(async () => {
        if (authApi.isLoggedIn()) {
          await syncFromBackend();
        }
        setCurrentView('home');
        setIsInitialized(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentView]);

  // 根据时间智能判断餐食类型
  const getMealType = (): '早餐' | '午餐' | '晚餐' | '加餐' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 10) return '早餐';
    if (hour >= 10 && hour < 14) return '午餐';
    if (hour >= 17 && hour < 21) return '晚餐';
    return '加餐';
  };

  const addMeal = async (result: AnalysisResult, imageUrl: string) => {
    const newMeal: Meal = {
      id: Date.now().toString(),
      name: result.name,
      type: getMealType(),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      calories: result.calories,
      macros: result.macros,
      imageUrl: imageUrl,
      insight: result.insight,
      createdAt: new Date().toISOString().split('T')[0] // 添加日期字段
    };

    // 本地更新
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

    // 同步到后端
    if (isLoggedIn) {
      try {
        await mealsApi.create({
          name: result.name,
          type: '加餐',
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          calories: result.calories,
          macros: result.macros,
          imageUrl: imageUrl,
          insight: result.insight
        });
      } catch (error) {
        console.error('餐食同步到后端失败:', error);
      }
    }

    setCurrentView('home');
    setPendingAnalysis(null);
  };

  // 删除餐食
  const deleteMeal = async (mealId: string) => {
    // 本地删除
    const mealToDelete = meals.find(m => m.id === mealId);
    if (!mealToDelete) return;

    setMeals(prev => prev.filter(m => m.id !== mealId));
    setStats(prev => ({
      ...prev,
      consumed: Math.max(0, prev.consumed - mealToDelete.calories),
      macros: {
        protein: { ...prev.macros.protein, current: Math.max(0, prev.macros.protein.current - mealToDelete.macros.protein) },
        carbs: { ...prev.macros.carbs, current: Math.max(0, prev.macros.carbs.current - mealToDelete.macros.carbs) },
        fat: { ...prev.macros.fat, current: Math.max(0, prev.macros.fat.current - mealToDelete.macros.fat) }
      }
    }));

    // 同步到后端
    if (isLoggedIn) {
      try {
        await mealsApi.delete(mealId);
      } catch (error) {
        console.error('删除餐食失败:', error);
      }
    }
  };

  const showNav = ['home', 'profile', 'diary', 'reports'].includes(currentView);

  const renderView = () => {
    switch (currentView) {
      case 'splash':
        return <Splash />;
      case 'login':
        return <Login onLogin={handleLogin} setView={setCurrentView} />;
      case 'home':
        return <Dashboard stats={stats} meals={meals} setView={setCurrentView} userProfile={userProfile} isLoggedIn={isLoggedIn} />;
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
        return <Profile stats={stats} meals={meals} setView={setCurrentView} isLoggedIn={isLoggedIn} onLogout={handleLogout} onLoginClick={() => setCurrentView('login')} />;
      case 'diary':
        return <Diary meals={meals} stats={stats} setView={setCurrentView} onDeleteMeal={deleteMeal} />;
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

