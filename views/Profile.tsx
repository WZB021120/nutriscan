
import React, { useState, useEffect } from 'react';
import { UserStats, View, Meal } from '../types';
import { authApi, profileApi } from '../services/apiService';
import EditProfile from '../components/EditProfile';

interface ProfileProps {
  stats: UserStats;
  meals: Meal[];
  setView: (view: View) => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
  onLoginClick?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ stats, meals, setView, isLoggedIn = false, onLogout, onLoginClick }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // 加载用户资料
  useEffect(() => {
    if (isLoggedIn) {
      loadProfile();
    }
  }, [isLoggedIn]);

  const loadProfile = async () => {
    try {
      const profile = await profileApi.get();
      setNickname(profile.nickname || authApi.getUsername() || '用户');
      setAvatarUrl(profile.avatarUrl || '');
    } catch (err) {
      console.error('加载资料失败:', err);
      setNickname(authApi.getUsername() || '用户');
    }
  };

  const displayName = isLoggedIn ? nickname : '访客用户';
  const displayAvatar = avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(displayName) + '&background=9eb7a5&color=fff&size=200';

  // Simple calculation for average calories based on history (mocked logic)
  const avgCalories = meals.length > 0
    ? Math.round(meals.reduce((acc, curr) => acc + curr.calories, 0) / (meals.length || 1))
    : 0;

  return (
    <div className="bg-surface-light min-h-screen pb-28">
      {/* Edit Profile Modal */}
      <EditProfile
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={loadProfile}
      />

      <header className="bg-[#FFF9E6] rounded-b-[2.5rem] shadow-soft pt-14 pb-8 px-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-3">
            <div
              className="relative group cursor-pointer active:scale-95 transition-transform"
              onClick={() => isLoggedIn && setShowEditModal(true)}
            >
              <div
                className="w-28 h-28 rounded-full border-[6px] border-white shadow-lg bg-cover bg-center"
                style={{ backgroundImage: `url('${displayAvatar}')` }}
              />
              {isLoggedIn && (
                <div className="absolute bottom-1 right-1 bg-primary text-white rounded-full p-2 border-4 border-white shadow-sm">
                  <span className="material-symbols-outlined text-[16px] font-bold">edit</span>
                </div>
              )}
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-extrabold text-text-main">{displayName}</h1>
              <div className="flex items-center gap-2 justify-center mt-1">
                {isLoggedIn ? (
                  <span className="px-2 py-0.5 bg-primary/20 text-primary-dark text-[10px] font-bold rounded-full uppercase tracking-wider">已登录</span>
                ) : (
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-bold rounded-full uppercase tracking-wider">未登录</span>
                )}
                <p className="text-text-muted text-sm font-medium">健康达人</p>
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-sm">
            <div className="flex items-center justify-between mb-4 px-2">
              <button className="p-1 hover:bg-black/5 rounded-full"><span className="material-symbols-outlined text-text-main text-[20px]">chevron_left</span></button>
              <span className="text-sm font-bold text-text-main">2024年 4月</span>
              <button className="p-1 hover:bg-black/5 rounded-full"><span className="material-symbols-outlined text-text-main text-[20px]">chevron_right</span></button>
            </div>
            <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
              {['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d} className="font-bold text-text-muted uppercase mb-2 opacity-50">{d}</div>)}
              {Array.from({ length: 14 }, (_, i) => (
                <button key={i} className={`h-8 w-8 mx-auto flex items-center justify-center rounded-full text-[13px] font-medium transition-all ${i === 6 ? 'bg-primary text-white font-bold shadow-lg shadow-primary/30 scale-110' : 'text-text-main hover:bg-black/5'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="px-5 -mt-6 relative z-20 flex flex-col gap-6">
        <section className="flex gap-3 overflow-x-auto scrollbar-hide py-2 pb-4">
          <StatCard
            icon="local_fire_department"
            iconColor="text-orange-500"
            bg="bg-orange-50"
            value={stats.streak.toString()}
            label="连胜天数"
          />
          <StatCard
            icon="nutrition"
            iconColor="text-primary"
            bg="bg-primary/10"
            value={avgCalories.toString()}
            label="平均摄入"
          />
          <StatCard
            icon="monitor_weight"
            iconColor="text-blue-500"
            bg="bg-blue-50"
            value={`${stats.weight}`}
            unit="kg"
            label="当前体重"
          />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold px-1 text-text-main">应用设置</h2>
          <div className="bg-white rounded-3xl shadow-soft overflow-hidden border border-gray-100">
            <SettingItem icon="accessibility_new" label="我的身体数据" />
            <div className="h-px bg-gray-50 mx-4"></div>
            <SettingItem icon="restaurant_menu" label="饮食偏好" />
            <div className="h-px bg-gray-50 mx-4"></div>
            <SettingItem icon="notifications" label="消息通知" badge="2" />
            <div className="h-px bg-gray-50 mx-4"></div>
            <SettingItem icon="lock" label="隐私与安全" />
          </div>
        </section>

        {isLoggedIn ? (
          <button
            onClick={onLogout}
            className="mx-2 py-4 rounded-2xl bg-red-50 text-red-500 font-bold text-sm hover:bg-red-100 transition mb-4"
          >
            退出登录 ({displayName})
          </button>
        ) : (
          <button
            onClick={onLoginClick}
            className="mx-2 py-4 rounded-2xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition mb-4"
          >
            登录 / 注册 →
          </button>
        )}
      </main>
    </div>
  );
};

const StatCard = ({ icon, iconColor, bg, value, label, unit }: any) => (
  <div className="min-w-[110px] flex-1 bg-white rounded-2xl p-4 shadow-soft flex flex-col items-center justify-center border border-gray-100 transition-transform active:scale-95">
    <div className={`p-2.5 ${bg} rounded-full mb-2 ${iconColor}`}>
      <span className="material-symbols-outlined filled text-[22px]">{icon}</span>
    </div>
    <h3 className="text-lg font-extrabold text-text-main">{value}<span className="text-xs font-medium ml-0.5 text-text-muted">{unit}</span></h3>
    <p className="text-[10px] font-bold text-text-muted mt-0.5 uppercase tracking-wide">{label}</p>
  </div>
);

const SettingItem = ({ icon, label, badge }: any) => (
  <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition active:bg-gray-100">
    <div className="flex items-center gap-4">
      <div className="size-10 rounded-full bg-surface-light flex items-center justify-center text-text-muted">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <span className="text-sm font-bold text-text-main">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {badge && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
      <span className="material-symbols-outlined text-gray-300 text-[20px]">chevron_right</span>
    </div>
  </button>
);

export default Profile;
