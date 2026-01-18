
import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { correctFoodAnalysis } from '../services/geminiService';

interface AnalysisProps {
  result: AnalysisResult;
  imageUrl: string;
  imageBase64?: string; // 用于修正分析
  onConfirm: (result: AnalysisResult) => void; // 接收最终结果
  onClose: () => void;
}

const Analysis: React.FC<AnalysisProps> = ({ result, imageUrl, imageBase64, onConfirm, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState(result);
  const [error, setError] = useState<string | null>(null);

  // 处理修正请求
  const handleCorrection = async () => {
    if (!userInput.trim()) return;
    if (!imageBase64) {
      setError('无法修正：图片数据不可用');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const correctedResult = await correctFoodAnalysis(imageBase64, userInput, currentResult);
      setCurrentResult(correctedResult);
      setIsEditing(false);
      setUserInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '修正失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto scrollbar-hide">
      <div className="flex items-center justify-between px-6 py-5 sticky top-0 z-50 bg-white/90 backdrop-blur-md">
        <button onClick={onClose} className="size-10 flex items-center justify-center rounded-full bg-surface-light">
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`font-bold text-sm px-4 py-2 rounded-full transition-all ${isEditing ? 'bg-gray-100 text-gray-600' : 'text-primary hover:bg-primary/10'
            }`}
        >
          {isEditing ? '取消' : '编辑'}
        </button>
      </div>

      <div className="flex-1 px-6 pb-32">
        <div className="w-full relative">
          <div className="w-full aspect-[4/3] bg-gray-100 rounded-3xl overflow-hidden shadow-soft">
            <img src={imageUrl} className="w-full h-full object-cover" alt="Captured Food" />
          </div>
          <div className="absolute -bottom-4 right-6 bg-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 border border-gray-100">
            <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-bold text-text-main uppercase">AI 实时捕获</span>
          </div>
        </div>

        {/* 编辑对话框 */}
        {isEditing && (
          <div className="mt-8 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-5 border border-primary/20">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-xl">
                <span className="material-symbols-outlined text-primary">chat</span>
              </div>
              <div>
                <h3 className="font-bold text-text-main mb-1">告诉我正确的信息</h3>
                <p className="text-xs text-text-muted">例如："这是红烧肉，不是炒肉" 或 "份量只有一半"</p>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="描述这道菜的正确信息..."
                className="w-full h-24 p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm"
                disabled={isLoading}
              />
              {error && (
                <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {error}
                </p>
              )}
            </div>

            <button
              onClick={handleCorrection}
              disabled={isLoading || !userInput.trim()}
              className="mt-4 w-full h-12 bg-primary text-white rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-primary-dark active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  <span>AI 重新分析中...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">auto_fix_high</span>
                  <span>让 AI 重新分析</span>
                </>
              )}
            </button>
          </div>
        )}

        <div className="mt-10 flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold tracking-tight text-text-main mb-1 flex items-center gap-2">
            {currentResult.name}
            <span className="material-symbols-outlined text-primary text-xl">verified</span>
          </h1>
          <p className="text-text-light text-sm font-medium mb-6">分析时间 • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>

          <div className="relative mb-8">
            <div className="flex flex-col items-center">
              <span className="text-[64px] font-extrabold text-primary tracking-tighter">{currentResult.calories}</span>
              <span className="text-[10px] font-bold text-text-light uppercase tracking-widest mt-1">总卡路里 (KCAL)</span>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>

        <div className="w-full bg-surface-light rounded-3xl p-6 shadow-sm border border-gray-100/50">
          <div className="flex items-center justify-between gap-6">
            <div className="relative size-32 shrink-0">
              <svg className="size-full -rotate-90 transform" viewBox="0 0 36 36">
                <path className="text-gray-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="100, 100" strokeWidth="3" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">pie_chart</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-4">
              {[
                { label: '蛋白质', value: currentResult.macros.protein, color: 'bg-primary' },
                { label: '碳水', value: currentResult.macros.carbs, color: 'bg-secondary' },
                { label: '脂肪', value: currentResult.macros.fat, color: 'bg-gray-400' },
              ].map((macro, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`size-2.5 rounded-full ${macro.color}`}></div>
                    <span className="text-sm font-semibold">{macro.label}</span>
                  </div>
                  <span className="text-sm font-bold">{macro.value}g</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full mt-6 bg-secondary/10 border border-secondary/20 rounded-2xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-secondary shrink-0 mt-0.5">emoji_nature</span>
          <div>
            <h3 className="text-sm font-bold text-text-main mb-0.5">健康洞察</h3>
            <p className="text-xs text-text-light leading-relaxed">{currentResult.insight}</p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full z-40 px-6 py-6 bg-white/80 backdrop-blur-sm flex justify-center">
        <button
          onClick={() => onConfirm(currentResult)}
          className="w-full max-w-md h-14 bg-primary text-white rounded-2xl font-bold text-lg shadow-float flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          <span>记录到日记</span>
        </button>
      </div>
    </div>
  );
};

export default Analysis;
