<div align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/AI-Qwen_VL-FF6F00?style=flat-square&logo=openai" alt="AI Powered" />
  <img src="https://img.shields.io/badge/Version-1.0.0-green?style=flat-square" alt="Version" />
</div>

<h1 align="center">🥗 NutriScan - 智能营养助手</h1>

<p align="center">
  <strong>拍照即可获取食物营养信息，AI 驱动的智能饮食追踪应用</strong>
</p>

<p align="center">
  <a href="#功能特点">功能特点</a> •
  <a href="#技术栈">技术栈</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#在线演示">在线演示</a> •
  <a href="#项目结构">项目结构</a>
</p>

---

## 🌐 在线演示

| 服务 | 地址 |
|------|------|
| **前端应用** | [Cloudflare Pages](https://nutriscan.pages.dev) |
| **后端 API** | [Hugging Face Spaces](https://huggingface.co/spaces/WangZhibiao/nutriscan-api) |

---

## ✨ 功能特点

### 📸 智能食物识别
- **实时摄像头拍照** - 支持前后摄像头切换
- **相册图片上传** - 支持从本地选择图片
- **AI 图像分析** - 使用 Qwen-VL 视觉大模型识别食物并估算营养
- **识别结果编辑** - 可对话修正 AI 识别错误，重新分析

### 📊 营养追踪
- **卡路里环形图** - 直观展示每日摄入与目标对比
- **宏量营养素追踪** - 蛋白质、碳水化合物、脂肪分开统计
- **动态用户问候** - 根据时间显示"早上好/下午好/晚上好"
- **动态用户信息** - 显示登录用户的昵称和头像

### 📅 饮食日记
- **日期选择器** - 横向滑动快速切换日期
- **历史记录查看** - 支持查看过去 7 天的饮食记录
- **餐食时间线** - 按时间顺序展示每餐详情和 AI 洞察
- **删除功能** - 支持删除不需要的餐食记录

### 📈 营养报告
- **周报/月报切换** - 查看不同周期的数据趋势
- **真实数据统计** - 基于历史记录生成图表（非模拟数据）
- **营养分布饼图** - 可视化蛋白质、碳水、脂肪占比
- **健康洞察** - 根据实际摄入生成个性化建议

### 👤 个人中心
- **统计卡片** - 连胜天数、平均摄入、当前体重
- **资料编辑** - 支持修改昵称和头像
- **云端同步** - 登录后数据自动同步到后端

### 🤖 智能功能
- **餐食类型自动识别** - 根据时间自动判断早餐(5-10点)/午餐(10-14点)/晚餐(17-21点)/加餐
- **AI 识别结果修正** - 点击"编辑"可对话告诉 AI 正确信息，重新分析

---

## 🛠 技术栈

### 前端
| 技术 | 说明 |
|------|------|
| **React 19** | 前端框架 |
| **TypeScript 5.8** | 类型安全 |
| **Vite 6** | 构建工具 |
| **Tailwind CSS** | 样式框架 |
| **LocalStorage** | 本地数据持久化 |

### 后端
| 技术 | 说明 |
|------|------|
| **FastAPI** | Python Web 框架 |
| **SQLite** | 轻量级数据库 |
| **bcrypt** | 密码加密 |
| **Hugging Face Spaces** | 部署平台 |

### AI
| 模型 | 说明 |
|------|------|
| **Qwen-VL-Plus** | 通义千问视觉大模型，用于食物识别和营养分析 |

---

## 🚀 快速开始

### 前置要求

- Node.js ≥ 18
- Python ≥ 3.10（后端）
- 支持 OpenAI 格式的视觉 AI API

### 前端安装

```bash
# 克隆仓库
git clone https://github.com/WZB021120/nutriscan.git
cd nutriscan

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入 API 配置

# 启动开发服务器
npm run dev
```

### 后端安装

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 启动后端
python app.py
```

### 环境变量配置

创建 `.env.local` 文件：

```env
VITE_API_BASE_URL=http://127.0.0.1:8045/v1
VITE_API_KEY=your-api-key
```

---

## 📁 项目结构

```
nutriscan/
├── components/              # 可复用组件
│   ├── BottomNav.tsx          # 底部导航栏
│   ├── ScanningOverlay.tsx    # 扫描动画遮罩
│   └── EditProfile.tsx        # 编辑资料弹窗
├── views/                   # 页面视图
│   ├── Splash.tsx             # 启动页
│   ├── Dashboard.tsx          # 🏠 首页仪表盘
│   ├── CameraView.tsx         # 📸 拍照页面
│   ├── Analysis.tsx           # 📋 分析结果页（支持编辑修正）
│   ├── Diary.tsx              # 📅 饮食日记（支持历史查看和删除）
│   ├── Reports.tsx            # 📈 营养报告（真实数据统计）
│   ├── Profile.tsx            # 👤 个人中心
│   └── Login.tsx              # 🔐 登录页面
├── services/                # 服务层
│   ├── geminiService.ts       # AI API 调用（识别 + 修正）
│   └── apiService.ts          # 后端 API 调用
├── backend/                 # 后端服务
│   ├── app.py                 # FastAPI 主应用
│   ├── requirements.txt       # Python 依赖
│   └── Dockerfile             # Docker 部署配置
├── App.tsx                  # 应用主入口
├── types.ts                 # TypeScript 类型定义
├── constants.tsx            # 常量配置
└── CHANGELOG.md             # 更新日志
```

---

## 📦 构建部署

### 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

### 部署到 Cloudflare Pages

1. 将代码推送到 GitHub
2. 在 Cloudflare Dashboard 创建 Pages 项目
3. 连接 GitHub 仓库
4. 设置构建命令：`npm run build`
5. 设置输出目录：`dist`
6. 添加环境变量 `VITE_API_BASE_URL` 和 `VITE_API_KEY`

### 后端部署到 Hugging Face Spaces

1. 创建新的 Space，选择 Docker 类型
2. 将 `backend/` 目录内容推送到 Space
3. 确保 `Dockerfile` 在根目录

---

## 📝 更新日志

查看 [CHANGELOG.md](./CHANGELOG.md) 了解版本更新详情。

### v1.0.0 主要新增
- ✨ AI 识别结果编辑功能 - 可对话修正识别错误
- ✨ 餐食类型智能识别 - 根据时间自动判断
- ✨ 历史记录查看 - 支持过去 7 天
- ✨ 餐食删除功能
- ✨ 动态用户问候
- 🐛 修复 Reports 使用模拟数据的问题

---

## 📄 License

MIT License

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/WZB021120">WangZhibiao</a></p>
</div>
