
import React from 'react';
import { UserStats, Meal, View } from '../types';

interface DashboardProps {
    stats: UserStats;
    meals: Meal[];
    setView: (view: View) => void;
    userProfile?: { nickname: string; avatarUrl: string };
    isLoggedIn?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, meals, setView, userProfile, isLoggedIn }) => {
    const caloriesRemaining = stats.dailyGoal - stats.consumed;
    const progressPercent = Math.min(100, (stats.consumed / stats.dailyGoal) * 100);
    const circumference = 502; // 2 * pi * 80
    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

    // 根据时间获取问候语
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return '早上好';
        if (hour >= 12 && hour < 18) return '下午好';
        return '晚上好';
    };

    // 动态显示用户名
    const displayName = isLoggedIn && userProfile?.nickname ? userProfile.nickname : '用户';
    const displayAvatar = userProfile?.avatarUrl
        ? userProfile.avatarUrl
        : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(displayName) + '&background=9eb7a5&color=fff&size=200';

    return (
        <div className="relative flex flex-col min-h-screen bg-white pb-28">
            {/* Header */}
            <header className="flex items-center justify-between px-6 pt-10 pb-4 bg-white sticky top-0 z-10 bg-opacity-95 backdrop-blur-sm">
                <div className="flex items-center gap-3" onClick={() => setView('profile')}>
                    <div
                        className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-100 bg-cover bg-center cursor-pointer"
                        style={{ backgroundImage: `url('${displayAvatar}')` }}
                    />
                    <div className="flex flex-col cursor-pointer">
                        <span className="text-xs font-medium text-text-muted">今天, {new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</span>
                        <h1 className="text-lg font-bold leading-tight text-text-main">{getGreeting()}, {displayName}</h1>
                    </div>
                </div>
                <button className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-light hover:bg-gray-100 transition active:scale-95">
                    <span className="material-symbols-outlined text-text-main">notifications</span>
                </button>
            </header>

            {/* Content */}
            <main className="flex-1 px-6 space-y-8 overflow-y-auto scrollbar-hide pt-2">
                {/* Calorie Ring */}
                <section className="flex flex-col items-center justify-center py-4">
                    <div className="relative w-64 h-64 group cursor-default">
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                            <span className={`text-4xl font-extrabold tracking-tight transition-colors ${caloriesRemaining < 0 ? 'text-red-500' : 'text-text-main'}`}>
                                {Math.max(0, caloriesRemaining).toLocaleString()}
                            </span>
                            <span className="text-sm font-medium text-primary-dark mt-1">
                                {caloriesRemaining < 0 ? '超出卡路里' : '剩余卡路里'}
                            </span>
                        </div>
                        <svg className="w-full h-full transform -rotate-90 transition-all duration-1000 ease-out" viewBox="0 0 200 200">
                            {/* Background Circle */}
                            <circle cx="100" cy="100" fill="none" r="80" stroke="#f2f2f2" strokeWidth="12" strokeLinecap="round" />
                            {/* Progress Circle */}
                            <circle
                                cx="100" cy="100"
                                fill="none" r="80"
                                stroke={caloriesRemaining < 0 ? '#ef4444' : '#9eb7a5'}
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute top-0 right-4 bg-[#FAD28A]/20 p-2 rounded-full backdrop-blur-sm shadow-sm animate-bounce [animation-duration:3s]">
                            <span className="material-symbols-outlined text-[#FAD28A] text-lg filled">local_fire_department</span>
                        </div>
                    </div>
                </section>

                {/* Macros */}
                <section className="w-full">
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x">
                        {[
                            { label: '蛋白质', value: stats.macros.protein.current, goal: stats.macros.protein.goal, color: 'bg-primary', text: 'text-primary-dark' },
                            { label: '碳水', value: stats.macros.carbs.current, goal: stats.macros.carbs.goal, color: 'bg-secondary', text: 'text-yellow-700' },
                            { label: '脂肪', value: stats.macros.fat.current, goal: stats.macros.fat.goal, color: 'bg-orange-300', text: 'text-orange-800' },
                        ].map((macro, idx) => (
                            <div key={idx} className="snap-center min-w-[140px] flex-1 flex flex-col gap-3 rounded-3xl bg-surface-light p-5 shadow-soft border border-gray-50 transition-transform active:scale-95">
                                <div className="flex items-center gap-2">
                                    <div className={`h-2.5 w-2.5 rounded-full ${macro.color}`}></div>
                                    <p className="text-sm font-bold text-text-muted">{macro.label}</p>
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-1">
                                        <p className="text-2xl font-extrabold text-text-main">{Math.round(macro.value)}</p>
                                        <p className="text-xs font-semibold text-text-muted">g</p>
                                    </div>
                                    <p className="text-[10px] text-text-muted mt-0.5 font-medium opacity-70">目标 {macro.goal}g</p>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${macro.color} rounded-full transition-all duration-1000`} style={{ width: `${Math.min(100, (macro.value / macro.goal) * 100)}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Recent Meals */}
                <section className="w-full">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="text-lg font-bold text-text-main">今日记录</h3>
                        <button className="text-sm font-bold text-primary-dark hover:opacity-80 transition" onClick={() => setView('diary')}>查看全部</button>
                    </div>
                    <div className="flex flex-col gap-3 pb-4">
                        {meals.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 bg-surface-light rounded-2xl border border-dashed border-gray-200">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">no_food</span>
                                <p className="text-sm">今天还没有记录哦</p>
                            </div>
                        ) : meals.slice(0, 3).map((meal) => (
                            <div key={meal.id} className="group flex items-center p-3 gap-4 rounded-2xl bg-surface-light shadow-soft border border-transparent transition-all hover:shadow-md hover:border-gray-100 active:scale-[0.99]">
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
                                    <img src={meal.imageUrl} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" alt={meal.name} />
                                </div>
                                <div className="flex-1 min-w-0 py-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-base font-bold text-text-main truncate">{meal.name}</p>
                                        {meal.insight && <span className="material-symbols-outlined text-[14px] text-primary" title="AI Insight">verified</span>}
                                    </div>
                                    <p className="text-xs font-medium text-text-muted mt-1">{meal.type} • {meal.time}</p>
                                </div>
                                <div className="text-right pr-1">
                                    <p className="text-base font-extrabold text-text-main">{meal.calories}</p>
                                    <p className="text-[10px] font-bold text-text-muted uppercase">kcal</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
