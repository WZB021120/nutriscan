
import React, { useState, useMemo } from 'react';
import { Meal, View, UserStats } from '../types';

interface DiaryProps {
    meals: Meal[];
    stats: UserStats;
    setView: (view: View) => void;
    onDeleteMeal?: (mealId: string) => void;
}

// 生成最近7天的日期列表
const generateDateList = () => {
    const dates = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(date);
    }
    return dates;
};

// 格式化日期为 YYYY-MM-DD
const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
};

// 获取星期几
const getWeekDay = (date: Date) => {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return days[date.getDay()];
};

const Diary: React.FC<DiaryProps> = ({ meals, stats, setView, onDeleteMeal }) => {
    const dateList = useMemo(() => generateDateList(), []);
    const [selectedDate, setSelectedDate] = useState<Date>(dateList[dateList.length - 1]); // 今天
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // 过滤选中日期的餐食
    const selectedDateStr = formatDate(selectedDate);
    const todayStr = formatDate(new Date());

    // 根据 createdAt 筛选历史记录
    const filteredMeals = useMemo(() => {
        return meals.filter(meal => {
            // 如果餐食有 createdAt 字段，使用它进行筛选
            if (meal.createdAt) {
                return meal.createdAt === selectedDateStr;
            }
            // 否则，假定没有 createdAt 的餐食是今天的
            return selectedDateStr === todayStr;
        });
    }, [meals, selectedDateStr, todayStr]);

    // 删除餐食
    const handleDelete = (mealId: string) => {
        if (onDeleteMeal && window.confirm('确定要删除这条记录吗？')) {
            setDeletingId(mealId);
            setTimeout(() => {
                onDeleteMeal(mealId);
                setDeletingId(null);
            }, 300);
        }
    };

    // 计算当日统计
    const dailyStats = useMemo(() => {
        const totalCalories = filteredMeals.reduce((sum, meal) => sum + meal.calories, 0);
        const totalProtein = filteredMeals.reduce((sum, meal) => sum + meal.macros.protein, 0);
        const totalCarbs = filteredMeals.reduce((sum, meal) => sum + meal.macros.carbs, 0);
        const totalFat = filteredMeals.reduce((sum, meal) => sum + meal.macros.fat, 0);
        return { totalCalories, totalProtein, totalCarbs, totalFat };
    }, [filteredMeals]);

    const isToday = (date: Date) => formatDate(date) === todayStr;

    return (
        <div className="relative flex flex-col min-h-screen bg-white pb-28">
            {/* Header */}
            <header className="px-6 pt-10 pb-4 bg-white sticky top-0 z-10 bg-opacity-95 backdrop-blur-sm">
                <h1 className="text-2xl font-extrabold text-text-main">饮食日记</h1>
                <p className="text-sm text-text-muted mt-1">追踪你的每日饮食记录</p>
            </header>

            {/* Date Selector */}
            <div className="px-4 py-3">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {dateList.map((date, idx) => {
                        const isSelected = formatDate(date) === formatDate(selectedDate);
                        const isTodayDate = isToday(date);
                        return (
                            <button
                                key={idx}
                                onClick={() => setSelectedDate(date)}
                                className={`flex flex-col items-center min-w-[56px] py-3 px-3 rounded-2xl transition-all ${isSelected
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'bg-surface-light text-text-main hover:bg-gray-100'
                                    }`}
                            >
                                <span className={`text-xs font-medium ${isSelected ? 'text-white/80' : 'text-text-muted'}`}>
                                    {isTodayDate ? '今天' : `周${getWeekDay(date)}`}
                                </span>
                                <span className={`text-lg font-bold mt-1 ${isSelected ? 'text-white' : 'text-text-main'}`}>
                                    {date.getDate()}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Daily Summary Card */}
            <section className="px-6 py-4">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-5 border border-primary/20">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-medium text-text-muted">
                                {selectedDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
                            </p>
                            <h3 className="text-3xl font-extrabold text-text-main mt-1">
                                {dailyStats.totalCalories} <span className="text-lg font-medium text-text-muted">kcal</span>
                            </h3>
                        </div>
                        <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-soft">
                            <span className="material-symbols-outlined text-primary text-3xl filled">restaurant</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <MacroBadge label="蛋白质" value={dailyStats.totalProtein} color="bg-primary" />
                        <MacroBadge label="碳水" value={dailyStats.totalCarbs} color="bg-secondary" />
                        <MacroBadge label="脂肪" value={dailyStats.totalFat} color="bg-orange-300" />
                    </div>
                </div>
            </section>

            {/* Meals Timeline */}
            <section className="px-6 py-2 flex-1">
                <h3 className="text-lg font-bold text-text-main mb-4">餐食记录</h3>

                {filteredMeals.length === 0 ? (
                    <div className="text-center py-12 bg-surface-light rounded-2xl border border-dashed border-gray-200">
                        <span className="material-symbols-outlined text-5xl text-gray-300 mb-3 block">no_meals</span>
                        <p className="text-text-muted font-medium">这一天还没有记录</p>
                        {isToday(selectedDate) && (
                            <button
                                onClick={() => setView('camera')}
                                className="mt-4 px-5 py-2.5 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary-dark transition"
                            >
                                开始记录
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-[22px] top-8 bottom-8 w-0.5 bg-gray-100"></div>

                        <div className="flex flex-col gap-4">
                            {filteredMeals.map((meal, idx) => (
                                <div
                                    key={meal.id}
                                    className={`flex gap-4 relative transition-all duration-300 ${deletingId === meal.id ? 'opacity-0 translate-x-10 scale-95' : 'opacity-100'
                                        }`}
                                >
                                    {/* Timeline dot */}
                                    <div className="relative z-10 flex-shrink-0">
                                        <div className="w-11 h-11 rounded-full bg-white border-4 border-primary/20 flex items-center justify-center shadow-sm">
                                            <span className="material-symbols-outlined text-primary text-lg filled">
                                                {getMealIcon(meal.type)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Meal Card */}
                                    <div className="flex-1 bg-surface-light rounded-2xl p-4 shadow-soft border border-gray-50 group">
                                        <div className="flex gap-3">
                                            {meal.imageUrl && (
                                                <img
                                                    src={meal.imageUrl}
                                                    alt={meal.name}
                                                    className="w-16 h-16 rounded-xl object-cover shadow-sm"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-bold text-text-main truncate">{meal.name}</p>
                                                        <p className="text-xs text-text-muted mt-0.5">{meal.type} • {meal.time}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-extrabold text-text-main">{meal.calories}</p>
                                                        <p className="text-[10px] text-text-muted uppercase">kcal</p>
                                                    </div>
                                                </div>
                                                {meal.insight && (
                                                    <div className="mt-2 flex items-start gap-1.5 bg-primary/10 rounded-lg px-2.5 py-1.5">
                                                        <span className="material-symbols-outlined text-primary text-sm">tips_and_updates</span>
                                                        <p className="text-xs text-primary-dark">{meal.insight}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* 删除按钮 */}
                                        {onDeleteMeal && (
                                            <button
                                                onClick={() => handleDelete(meal.id)}
                                                className="mt-3 w-full py-2 text-xs font-medium text-red-500 bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity active:bg-red-100"
                                            >
                                                <span className="material-symbols-outlined text-sm align-middle mr-1">delete</span>
                                                删除记录
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

const MacroBadge = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-xl px-3 py-2">
        <div className="flex items-center gap-1.5 mb-1">
            <div className={`w-2 h-2 rounded-full ${color}`}></div>
            <span className="text-[10px] font-medium text-text-muted uppercase">{label}</span>
        </div>
        <p className="text-lg font-bold text-text-main">{Math.round(value)}<span className="text-xs font-normal text-text-muted">g</span></p>
    </div>
);

const getMealIcon = (type: string) => {
    switch (type) {
        case '早餐': return 'egg_alt';
        case '午餐': return 'ramen_dining';
        case '晚餐': return 'dinner_dining';
        default: return 'fastfood';
    }
};

export default Diary;
