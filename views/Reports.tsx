
import React, { useState, useMemo } from 'react';
import { Meal, View, UserStats } from '../types';

interface ReportsProps {
    meals: Meal[];
    stats: UserStats;
    setView: (view: View) => void;
}

type Period = 'week' | 'month';

const Reports: React.FC<ReportsProps> = ({ meals, stats, setView }) => {
    const [period, setPeriod] = useState<Period>('week');

    // 根据真实餐食数据生成图表数据
    const chartData = useMemo(() => {
        const days = period === 'week' ? 7 : 30;
        const data = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // 根据 createdAt 筛选当天的餐食
            const dayMeals = meals.filter(meal => {
                if (meal.createdAt) {
                    return meal.createdAt === dateStr;
                }
                // 没有 createdAt 的餐食，假定是今天的
                const todayStr = new Date().toISOString().split('T')[0];
                return dateStr === todayStr;
            });

            // 计算当天总卡路里
            const calories = dayMeals.reduce((sum, meal) => sum + meal.calories, 0);

            data.push({
                date,
                calories,
                hasMeals: dayMeals.length > 0,
                label: period === 'week'
                    ? ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
                    : date.getDate().toString(),
            });
        }
        return data;
    }, [period, meals]);

    // 计算统计数据（只计算有记录的天数）
    const statistics = useMemo(() => {
        const daysWithMeals = chartData.filter(d => d.hasMeals && d.calories > 0);
        const calories = daysWithMeals.map(d => d.calories);

        if (calories.length === 0) {
            return { avg: 0, max: 0, min: 0, goalReachedDays: 0, totalDays: chartData.length, recordedDays: 0 };
        }

        const avg = Math.round(calories.reduce((a, b) => a + b, 0) / calories.length);
        const max = Math.max(...calories);
        const min = Math.min(...calories);
        const goalReachedDays = calories.filter(c => c >= stats.dailyGoal * 0.9 && c <= stats.dailyGoal * 1.1).length;

        return { avg, max, min, goalReachedDays, totalDays: chartData.length, recordedDays: calories.length };
    }, [chartData, stats.dailyGoal]);

    // 计算营养素分布
    const macroDistribution = useMemo(() => {
        const protein = stats.macros.protein.current * 4; // 4 kcal per gram
        const carbs = stats.macros.carbs.current * 4;
        const fat = stats.macros.fat.current * 9; // 9 kcal per gram
        const total = protein + carbs + fat || 1;

        return {
            protein: Math.round((protein / total) * 100),
            carbs: Math.round((carbs / total) * 100),
            fat: Math.round((fat / total) * 100),
        };
    }, [stats.macros]);

    const maxCalories = Math.max(...chartData.map(d => d.calories), stats.dailyGoal);

    return (
        <div className="relative flex flex-col min-h-screen bg-white pb-28">
            {/* Header */}
            <header className="px-6 pt-10 pb-4 bg-white sticky top-0 z-10 bg-opacity-95 backdrop-blur-sm">
                <h1 className="text-2xl font-extrabold text-text-main">营养报告</h1>
                <p className="text-sm text-text-muted mt-1">了解你的饮食趋势</p>
            </header>

            {/* Period Selector */}
            <div className="px-6 py-3">
                <div className="flex bg-surface-light rounded-2xl p-1.5">
                    <button
                        onClick={() => setPeriod('week')}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${period === 'week'
                            ? 'bg-white text-text-main shadow-soft'
                            : 'text-text-muted hover:text-text-main'
                            }`}
                    >
                        周报
                    </button>
                    <button
                        onClick={() => setPeriod('month')}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${period === 'month'
                            ? 'bg-white text-text-main shadow-soft'
                            : 'text-text-muted hover:text-text-main'
                            }`}
                    >
                        月报
                    </button>
                </div>
            </div>

            <main className="flex-1 px-6 space-y-6 overflow-y-auto scrollbar-hide">
                {/* Calorie Trend Chart */}
                <section className="bg-surface-light rounded-3xl p-5 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-text-main">卡路里趋势</h3>
                        <div className="flex items-center gap-2 text-xs">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                <span className="text-text-muted">摄入</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-0.5 bg-gray-300"></div>
                                <span className="text-text-muted">目标</span>
                            </div>
                        </div>
                    </div>

                    {/* Simple Bar Chart */}
                    <div className="relative h-40">
                        {/* Goal line */}
                        <div
                            className="absolute left-0 right-0 border-t-2 border-dashed border-gray-200 z-10"
                            style={{ bottom: `${(stats.dailyGoal / maxCalories) * 100}%` }}
                        >
                            <span className="absolute -top-3 right-0 text-[10px] text-text-muted">{stats.dailyGoal}</span>
                        </div>

                        <div className="flex items-end justify-between h-full gap-1">
                            {chartData.slice(period === 'week' ? 0 : -14).map((day, idx) => {
                                const height = day.calories > 0 ? (day.calories / maxCalories) * 100 : 0;
                                const isAboveGoal = day.calories > stats.dailyGoal;
                                const hasData = day.hasMeals && day.calories > 0;
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                        <div
                                            className={`w-full rounded-t-lg transition-all ${!hasData ? 'bg-gray-100' :
                                                    isAboveGoal ? 'bg-red-300' : 'bg-primary'
                                                }`}
                                            style={{ height: `${Math.max(height, hasData ? 4 : 2)}%`, minHeight: hasData ? '4px' : '2px' }}
                                        ></div>
                                        <span className="text-[10px] text-text-muted">{day.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Macro Distribution */}
                <section className="bg-surface-light rounded-3xl p-5 border border-gray-100">
                    <h3 className="font-bold text-text-main mb-4">营养素分布</h3>

                    <div className="flex items-center gap-6">
                        {/* Pie Chart (simplified as stacked bar) */}
                        <div className="w-24 h-24 relative">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
                                <circle
                                    cx="16" cy="16" r="12"
                                    fill="none"
                                    stroke="#9eb7a5"
                                    strokeWidth="6"
                                    strokeDasharray={`${macroDistribution.protein * 0.754} 75.4`}
                                />
                                <circle
                                    cx="16" cy="16" r="12"
                                    fill="none"
                                    stroke="#FAD28A"
                                    strokeWidth="6"
                                    strokeDasharray={`${macroDistribution.carbs * 0.754} 75.4`}
                                    strokeDashoffset={`${-macroDistribution.protein * 0.754}`}
                                />
                                <circle
                                    cx="16" cy="16" r="12"
                                    fill="none"
                                    stroke="#fdba74"
                                    strokeWidth="6"
                                    strokeDasharray={`${macroDistribution.fat * 0.754} 75.4`}
                                    strokeDashoffset={`${-(macroDistribution.protein + macroDistribution.carbs) * 0.754}`}
                                />
                            </svg>
                        </div>

                        {/* Legend */}
                        <div className="flex-1 flex flex-col gap-3">
                            <MacroLegend label="蛋白质" value={macroDistribution.protein} color="bg-primary" />
                            <MacroLegend label="碳水化合物" value={macroDistribution.carbs} color="bg-secondary" />
                            <MacroLegend label="脂肪" value={macroDistribution.fat} color="bg-orange-300" />
                        </div>
                    </div>
                </section>

                {/* Statistics Cards */}
                <section>
                    <h3 className="font-bold text-text-main mb-4">统计摘要</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard
                            icon="timeline"
                            label="平均摄入"
                            value={`${statistics.avg}`}
                            unit="kcal"
                            color="text-primary"
                            bg="bg-primary/10"
                        />
                        <StatCard
                            icon="arrow_upward"
                            label="最高摄入"
                            value={`${statistics.max}`}
                            unit="kcal"
                            color="text-red-500"
                            bg="bg-red-50"
                        />
                        <StatCard
                            icon="arrow_downward"
                            label="最低摄入"
                            value={`${statistics.min}`}
                            unit="kcal"
                            color="text-blue-500"
                            bg="bg-blue-50"
                        />
                        <StatCard
                            icon="check_circle"
                            label="达标天数"
                            value={`${statistics.goalReachedDays}/${statistics.recordedDays || statistics.totalDays}`}
                            unit="天"
                            color="text-green-500"
                            bg="bg-green-50"
                        />
                    </div>
                </section>

                {/* Health Insight */}
                <section className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-5 border border-primary/20 mb-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                            <span className="material-symbols-outlined text-primary filled">psychology</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-text-main mb-1">健康洞察</h4>
                            <p className="text-sm text-text-muted leading-relaxed">
                                {statistics.recordedDays === 0
                                    ? '开始记录你的饮食吧！拍照输入食物即可获取营养分析。📸'
                                    : statistics.avg > stats.dailyGoal
                                        ? `你的平均摄入高于目标 ${statistics.avg - stats.dailyGoal} kcal，建议适当控制饮食量。`
                                        : statistics.avg < stats.dailyGoal * 0.8
                                            ? `你的平均摄入偏低，建议增加营养摄入以保持健康。`
                                            : `做得棒！你的饮食控制得很好，继续保持！ 🎉`}
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

const MacroLegend = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`}></div>
            <span className="text-sm text-text-muted">{label}</span>
        </div>
        <span className="font-bold text-text-main">{value}%</span>
    </div>
);

const StatCard = ({ icon, label, value, unit, color, bg }: any) => (
    <div className="bg-white rounded-2xl p-4 shadow-soft border border-gray-100">
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
            <span className={`material-symbols-outlined ${color} filled`}>{icon}</span>
        </div>
        <p className="text-[10px] font-medium text-text-muted uppercase tracking-wide">{label}</p>
        <p className="text-xl font-extrabold text-text-main mt-1">
            {value}<span className="text-xs font-normal text-text-muted ml-1">{unit}</span>
        </p>
    </div>
);

export default Reports;
