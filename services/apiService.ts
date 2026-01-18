// 后端 API 服务
const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://wangzhibiao-nutriscan-api.hf.space';

// Token 管理
const getToken = (): string | null => {
    return localStorage.getItem('nutriscan_token');
};

const setToken = (token: string): void => {
    localStorage.setItem('nutriscan_token', token);
};

const removeToken = (): void => {
    localStorage.removeItem('nutriscan_token');
};

const getUsername = (): string | null => {
    return localStorage.getItem('nutriscan_username');
};

const setUsername = (username: string): void => {
    localStorage.setItem('nutriscan_username', username);
};

// API 请求封装
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: '请求失败' }));
        throw new Error(error.detail || '请求失败');
    }

    return response.json();
};

// 认证 API
export const authApi = {
    register: async (username: string, password: string) => {
        const result = await apiRequest('/register', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
        setToken(result.token);
        setUsername(result.username);
        return result;
    },

    login: async (username: string, password: string) => {
        const result = await apiRequest('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
        setToken(result.token);
        setUsername(result.username);
        return result;
    },

    logout: () => {
        removeToken();
        localStorage.removeItem('nutriscan_username');
    },

    isLoggedIn: (): boolean => {
        return !!getToken();
    },

    getUsername,
};

// 餐食 API
export const mealsApi = {
    getAll: async () => {
        return apiRequest('/meals');
    },

    create: async (meal: {
        name: string;
        type: string;
        time: string;
        calories: number;
        macros: { protein: number; carbs: number; fat: number };
        imageUrl?: string;
        insight?: string;
    }) => {
        return apiRequest('/meals', {
            method: 'POST',
            body: JSON.stringify(meal),
        });
    },

    delete: async (mealId: string) => {
        return apiRequest(`/meals/${mealId}`, {
            method: 'DELETE',
        });
    },
};

// 统计 API
export const statsApi = {
    get: async () => {
        return apiRequest('/stats');
    },

    update: async (stats: {
        dailyGoal?: number;
        weight?: number;
        streak?: number;
    }) => {
        return apiRequest('/stats', {
            method: 'PUT',
            body: JSON.stringify(stats),
        });
    },
};
