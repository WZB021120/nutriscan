
import React, { useState, useEffect } from 'react';
import { profileApi, authApi } from '../services/apiService';

interface EditProfileProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ isOpen, onClose, onSave }) => {
    const [nickname, setNickname] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 加载当前资料
    useEffect(() => {
        if (isOpen && authApi.isLoggedIn()) {
            loadProfile();
        }
    }, [isOpen]);

    const loadProfile = async () => {
        try {
            const profile = await profileApi.get();
            setNickname(profile.nickname || '');
            setAvatarUrl(profile.avatarUrl || '');
        } catch (err) {
            console.error('加载资料失败:', err);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');

        try {
            await profileApi.update({
                nickname: nickname.trim() || undefined,
                avatarUrl: avatarUrl.trim() || undefined,
            });
            onSave();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : '保存失败');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-3xl p-6 w-[90%] max-w-sm shadow-2xl animate-[slideUp_0.3s_ease-out]">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-text-main">编辑个人资料</h2>
                    <button
                        onClick={onClose}
                        className="size-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
                    >
                        <span className="material-symbols-outlined text-[18px] text-text-muted">close</span>
                    </button>
                </div>

                {/* Avatar Preview */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div
                            className="w-24 h-24 rounded-full bg-gray-200 bg-cover bg-center border-4 border-white shadow-lg"
                            style={{
                                backgroundImage: avatarUrl
                                    ? `url('${avatarUrl}')`
                                    : "url('https://ui-avatars.com/api/?name=User&background=9eb7a5&color=fff&size=200')"
                            }}
                        />
                        <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 border-2 border-white">
                            <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">昵称</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="输入你的昵称"
                            className="w-full px-4 py-3 bg-surface-light rounded-xl border-none focus:ring-2 focus:ring-primary outline-none text-text-main"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">头像 URL</label>
                        <input
                            type="url"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            placeholder="输入头像图片链接"
                            className="w-full px-4 py-3 bg-surface-light rounded-xl border-none focus:ring-2 focus:ring-primary outline-none text-text-main text-sm"
                        />
                        <p className="text-xs text-text-muted mt-1.5 px-1">
                            💡 提示：可以使用任意图片链接作为头像
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-gray-100 text-text-main font-bold rounded-xl hover:bg-gray-200 transition"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition disabled:opacity-50"
                    >
                        {loading ? '保存中...' : '保存'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
