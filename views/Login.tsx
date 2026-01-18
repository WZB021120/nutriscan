
import React, { useState } from 'react';
import { View } from '../types';

interface LoginProps {
    onLogin: () => void;
    setView: (view: View) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, setView }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !password.trim()) {
            setError('请填写用户名和密码');
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }

        if (password.length < 6) {
            setError('密码长度至少 6 位');
            return;
        }

        setLoading(true);

        try {
            // 动态导入避免循环依赖
            const { authApi } = await import('../services/apiService');

            if (isLogin) {
                await authApi.login(username, password);
            } else {
                await authApi.register(username, password);
            }

            onLogin();
        } catch (err) {
            setError(err instanceof Error ? err.message : '操作失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-secondary/20 flex flex-col">
            {/* Header */}
            <header className="pt-16 pb-8 px-6 text-center">
                <div className="w-20 h-20 mx-auto bg-primary rounded-3xl flex items-center justify-center shadow-lg shadow-primary/30 mb-4">
                    <span className="material-symbols-outlined text-white text-4xl filled">nutrition</span>
                </div>
                <h1 className="text-3xl font-extrabold text-text-main">NutriScan</h1>
                <p className="text-text-muted mt-2">智能营养助手</p>
            </header>

            {/* Form */}
            <main className="flex-1 px-6 pb-8">
                <div className="bg-white rounded-3xl shadow-soft p-6 max-w-sm mx-auto">
                    {/* Tab Switch */}
                    <div className="flex bg-surface-light rounded-2xl p-1.5 mb-6">
                        <button
                            onClick={() => { setIsLogin(true); setError(''); }}
                            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${isLogin ? 'bg-white text-text-main shadow-soft' : 'text-text-muted'
                                }`}
                        >
                            登录
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setError(''); }}
                            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${!isLogin ? 'bg-white text-text-main shadow-soft' : 'text-text-muted'
                                }`}
                        >
                            注册
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">用户名</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-surface-light rounded-xl border-none focus:ring-2 focus:ring-primary outline-none text-text-main"
                                placeholder="请输入用户名"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">密码</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-surface-light rounded-xl border-none focus:ring-2 focus:ring-primary outline-none text-text-main"
                                placeholder="请输入密码"
                            />
                        </div>

                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-2">确认密码</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-surface-light rounded-xl border-none focus:ring-2 focus:ring-primary outline-none text-text-main"
                                    placeholder="请再次输入密码"
                                />
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">error</span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin">⏳</span>
                                    处理中...
                                </span>
                            ) : (
                                isLogin ? '登录' : '注册'
                            )}
                        </button>
                    </form>

                    {/* 跳过登录（本地模式） */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <button
                            onClick={() => setView('home')}
                            className="w-full text-center text-sm text-text-muted hover:text-text-main transition"
                        >
                            暂不登录，使用本地模式 →
                        </button>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-4 text-center text-xs text-text-muted">
                登录后数据将同步到云端，支持多设备访问
            </footer>
        </div>
    );
};

export default Login;
