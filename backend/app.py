from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import sqlite3
import hashlib
import secrets
import json
import os

app = FastAPI(title="NutriScan API", version="1.0.0")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# 数据库路径
DB_PATH = os.environ.get("DB_PATH", "nutriscan.db")

# 初始化数据库
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # 用户表
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            token TEXT,
            nickname TEXT,
            avatar_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 检查是否需要迁移（添加 nickname 和 avatar_url 列）
    c.execute("PRAGMA table_info(users)")
    columns = [col[1] for col in c.fetchall()]
    if 'nickname' not in columns:
        c.execute("ALTER TABLE users ADD COLUMN nickname TEXT")
    if 'avatar_url' not in columns:
        c.execute("ALTER TABLE users ADD COLUMN avatar_url TEXT")
    
    # 餐食表
    c.execute('''
        CREATE TABLE IF NOT EXISTS meals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            time TEXT NOT NULL,
            calories INTEGER NOT NULL,
            protein REAL NOT NULL,
            carbs REAL NOT NULL,
            fat REAL NOT NULL,
            image_url TEXT,
            insight TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    # 用户统计表
    c.execute('''
        CREATE TABLE IF NOT EXISTS user_stats (
            user_id INTEGER PRIMARY KEY,
            daily_goal INTEGER DEFAULT 2000,
            consumed INTEGER DEFAULT 0,
            protein_current REAL DEFAULT 0,
            protein_goal REAL DEFAULT 120,
            carbs_current REAL DEFAULT 0,
            carbs_goal REAL DEFAULT 250,
            fat_current REAL DEFAULT 0,
            fat_goal REAL DEFAULT 65,
            streak INTEGER DEFAULT 0,
            weight REAL DEFAULT 60,
            last_updated DATE,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    conn.commit()
    conn.close()

init_db()

# Pydantic 模型
class UserRegister(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Macros(BaseModel):
    protein: float
    carbs: float
    fat: float

class MealCreate(BaseModel):
    name: str
    type: str
    time: str
    calories: int
    macros: Macros
    imageUrl: Optional[str] = None
    insight: Optional[str] = None

class MealResponse(BaseModel):
    id: str
    name: str
    type: str
    time: str
    calories: int
    macros: Macros
    imageUrl: Optional[str] = None
    insight: Optional[str] = None
    createdAt: Optional[str] = None  # ISO 日期字符串

class StatsUpdate(BaseModel):
    dailyGoal: Optional[int] = None
    consumed: Optional[int] = None
    macros: Optional[dict] = None
    streak: Optional[int] = None
    weight: Optional[float] = None

class ProfileUpdate(BaseModel):
    nickname: Optional[str] = None
    avatarUrl: Optional[str] = None

# 工具函数
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    return secrets.token_hex(32)

def get_user_by_token(token: str):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, username FROM users WHERE token = ?", (token,))
    user = c.fetchone()
    conn.close()
    return user

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = get_user_by_token(credentials.credentials)
    if not user:
        raise HTTPException(status_code=401, detail="无效的认证令牌")
    return {"id": user[0], "username": user[1]}

# API 路由
@app.get("/")
def root():
    return {"message": "NutriScan API 运行中", "version": "1.0.0"}

@app.post("/register")
def register(user: UserRegister):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # 检查用户名是否存在
    c.execute("SELECT id FROM users WHERE username = ?", (user.username,))
    if c.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="用户名已存在")
    
    # 创建用户
    token = generate_token()
    c.execute(
        "INSERT INTO users (username, password_hash, token) VALUES (?, ?, ?)",
        (user.username, hash_password(user.password), token)
    )
    user_id = c.lastrowid
    
    # 初始化用户统计
    c.execute(
        "INSERT INTO user_stats (user_id) VALUES (?)",
        (user_id,)
    )
    
    conn.commit()
    conn.close()
    
    return {"token": token, "username": user.username}

@app.post("/login")
def login(user: UserLogin):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute(
        "SELECT id, token FROM users WHERE username = ? AND password_hash = ?",
        (user.username, hash_password(user.password))
    )
    result = c.fetchone()
    
    if not result:
        conn.close()
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    
    # 更新 token
    new_token = generate_token()
    c.execute("UPDATE users SET token = ? WHERE id = ?", (new_token, result[0]))
    conn.commit()
    conn.close()
    
    return {"token": new_token, "username": user.username}

@app.get("/meals", response_model=List[MealResponse])
def get_meals(user: dict = Depends(verify_token)):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute('''
        SELECT id, name, type, time, calories, protein, carbs, fat, image_url, insight, created_at
        FROM meals WHERE user_id = ? ORDER BY created_at DESC
    ''', (user["id"],))
    
    meals = []
    for row in c.fetchall():
        meals.append(MealResponse(
            id=str(row[0]),
            name=row[1],
            type=row[2],
            time=row[3],
            calories=row[4],
            macros=Macros(protein=row[5], carbs=row[6], fat=row[7]),
            imageUrl=row[8],
            insight=row[9],
            createdAt=str(row[10]).split(' ')[0] if row[10] else None  # 返回日期部分
        ))
    
    conn.close()
    return meals

@app.post("/meals", response_model=MealResponse)
def create_meal(meal: MealCreate, user: dict = Depends(verify_token)):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute('''
        INSERT INTO meals (user_id, name, type, time, calories, protein, carbs, fat, image_url, insight)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        user["id"], meal.name, meal.type, meal.time, meal.calories,
        meal.macros.protein, meal.macros.carbs, meal.macros.fat,
        meal.imageUrl, meal.insight
    ))
    
    meal_id = c.lastrowid
    
    # 更新用户统计
    today = datetime.now().date().isoformat()
    c.execute("SELECT last_updated FROM user_stats WHERE user_id = ?", (user["id"],))
    result = c.fetchone()
    
    if result and result[0] != today:
        # 新的一天，重置统计
        c.execute('''
            UPDATE user_stats SET consumed = ?, protein_current = ?, carbs_current = ?, fat_current = ?, last_updated = ?
            WHERE user_id = ?
        ''', (meal.calories, meal.macros.protein, meal.macros.carbs, meal.macros.fat, today, user["id"]))
    else:
        # 同一天，累加统计
        c.execute('''
            UPDATE user_stats SET 
                consumed = consumed + ?,
                protein_current = protein_current + ?,
                carbs_current = carbs_current + ?,
                fat_current = fat_current + ?,
                last_updated = ?
            WHERE user_id = ?
        ''', (meal.calories, meal.macros.protein, meal.macros.carbs, meal.macros.fat, today, user["id"]))
    
    conn.commit()
    conn.close()
    
    return MealResponse(
        id=str(meal_id),
        name=meal.name,
        type=meal.type,
        time=meal.time,
        calories=meal.calories,
        macros=meal.macros,
        imageUrl=meal.imageUrl,
        insight=meal.insight,
        createdAt=today
    )

@app.delete("/meals/{meal_id}")
def delete_meal(meal_id: int, user: dict = Depends(verify_token)):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute("DELETE FROM meals WHERE id = ? AND user_id = ?", (meal_id, user["id"]))
    
    if c.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="餐食记录不存在")
    
    conn.commit()
    conn.close()
    
    return {"message": "删除成功"}

@app.get("/stats")
def get_stats(user: dict = Depends(verify_token)):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute('''
        SELECT daily_goal, consumed, protein_current, protein_goal, carbs_current, carbs_goal, 
               fat_current, fat_goal, streak, weight, last_updated
        FROM user_stats WHERE user_id = ?
    ''', (user["id"],))
    
    row = c.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="用户统计不存在")
    
    # 检查是否是新的一天
    today = datetime.now().date().isoformat()
    if row[10] != today:
        # 新的一天，返回重置后的数据
        return {
            "dailyGoal": row[0],
            "consumed": 0,
            "macros": {
                "protein": {"current": 0, "goal": row[3]},
                "carbs": {"current": 0, "goal": row[5]},
                "fat": {"current": 0, "goal": row[7]}
            },
            "streak": row[8],
            "weight": row[9]
        }
    
    return {
        "dailyGoal": row[0],
        "consumed": row[1],
        "macros": {
            "protein": {"current": row[2], "goal": row[3]},
            "carbs": {"current": row[4], "goal": row[5]},
            "fat": {"current": row[6], "goal": row[7]}
        },
        "streak": row[8],
        "weight": row[9]
    }

@app.put("/stats")
def update_stats(stats: StatsUpdate, user: dict = Depends(verify_token)):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    updates = []
    values = []
    
    if stats.dailyGoal is not None:
        updates.append("daily_goal = ?")
        values.append(stats.dailyGoal)
    if stats.weight is not None:
        updates.append("weight = ?")
        values.append(stats.weight)
    if stats.streak is not None:
        updates.append("streak = ?")
        values.append(stats.streak)
    
    if updates:
        values.append(user["id"])
        c.execute(f"UPDATE user_stats SET {', '.join(updates)} WHERE user_id = ?", values)
        conn.commit()
    
    conn.close()
    return {"message": "更新成功"}

@app.get("/profile")
def get_profile(user: dict = Depends(verify_token)):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute("SELECT username, nickname, avatar_url FROM users WHERE id = ?", (user["id"],))
    row = c.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    return {
        "username": row[0],
        "nickname": row[1] or row[0],  # 如果没有昵称，返回用户名
        "avatarUrl": row[2]
    }

@app.put("/profile")
def update_profile(profile: ProfileUpdate, user: dict = Depends(verify_token)):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    updates = []
    values = []
    
    if profile.nickname is not None:
        updates.append("nickname = ?")
        values.append(profile.nickname)
    if profile.avatarUrl is not None:
        updates.append("avatar_url = ?")
        values.append(profile.avatarUrl)
    
    if updates:
        values.append(user["id"])
        c.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = ?", values)
        conn.commit()
    
    conn.close()
    return {"message": "更新成功"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)

