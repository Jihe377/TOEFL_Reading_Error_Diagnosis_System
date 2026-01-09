┌─────────────────────────────────────────────────────────────────┐
│                         用户浏览器                                 │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              React Frontend (Vite)                        │   │
│  │                                                            │   │
│  │  ├─ QuestionPage: 显示题目和选项                           │   │
│  │  ├─ ReflectionPage: 错题复盘问答                           │   │
│  │  ├─ DiagnosisPage: 显示错因诊断                            │   │
│  │  └─ StatsPage: 错误统计图表                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          ↕ HTTP/REST API                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Backend Server                              │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           FastAPI (Python 3.11+)                          │   │
│  │                                                            │   │
│  │  API Endpoints:                                            │   │
│  │  ├─ POST /api/submit-answer      (提交答案)               │   │
│  │  ├─ POST /api/submit-reflection  (提交复盘)               │   │
│  │  ├─ GET  /api/diagnosis/{id}     (获取诊断)               │   │
│  │  └─ GET  /api/stats/{user_id}    (获取统计)               │   │
│  │                                                            │   │
│  │  Core Modules:                                             │   │
│  │  ├─ error_diagnosis.py    (规则引擎)                       │   │
│  │  ├─ gemini_service.py     (LLM调用封装)                    │   │
│  │  └─ models.py             (数据模型)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          ↕ SQLAlchemy ORM                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                  │
│                                                                   │
│  ┌─────────────────┐        ┌────────────────────────────┐      │
│  │   SQLite DB     │        │   Google Gemini API        │      │
│  │   (开发环境)     │        │   (gemini-1.5-flash)       │      │
│  │                 │        │                            │      │
│  │  Tables:        │        │  用途:                      │      │
│  │  - questions    │        │  - 生成错因解释             │      │
│  │  - user_answers │        │  - 长难句分析               │      │
│  │  - reflections  │        │  - 个性化建议               │      │
│  │  - error_types  │        └────────────────────────────┘      │
│  └─────────────────┘                                             │
└─────────────────────────────────────────────────────────────────┘

用户做题流程：
───────────────────────────────────────────────────────────────

1. 显示题目
   Frontend GET /api/question/1
   ↓
   Backend 从数据库读取题目
   ↓
   Frontend 渲染题目 + 4个选项

2. 提交答案
   Frontend POST /api/submit-answer {question_id: 1, option_id: 3}
   ↓
   Backend 判断对错，写入 user_answers 表
   ↓
   if 正确: 返回 {is_correct: true, message: "正确！"}
   if 错误: 返回 {is_correct: false, redirect: "/reflection"}

3. 错题复盘（错误时才触发）
   Frontend 显示复盘问题（根据题型生成）
   ↓
   用户回答 Q1, Q2, Q3...
   ↓
   Frontend POST /api/submit-reflection {
     answer_id: 123,
     responses: {"Q1": "没找到关键词", "Q2": "定位错误"}
   }
   ↓
   Backend 写入 reflections 表

4. 错因诊断
   Backend 规则引擎分析：
   ├─ 读取题目类型
   ├─ 读取用户选择的错误选项
   ├─ 读取复盘回答
   └─ 匹配错误类型（规则 if-else）
   ↓
   调用 Gemini API 生成自然语言解释：
   Prompt: "用户在事实信息题中犯了【原文定位错误】，
           正确答案是 A，但选了 C，请用中英结合解释..."
   ↓
   Backend 返回诊断结果 {
     error_type: "原文定位错误",
     explanation: "...",
     suggestion: "..."
   }
   ↓
   Frontend 显示诊断页面

5. 统计分析（长期积累）
   Frontend GET /api/stats/{user_id}
   ↓
   Backend 聚合查询：
   SELECT error_type, COUNT(*) 
   FROM reflections 
   GROUP BY error_type
   ↓
   Frontend 用 Chart.js 渲染饼图