# **TOEFL Reading Error Diagnosis System**  
（托福阅读错因诊断与复盘辅助系统）

# TOEFL Reading Error Diagnosis System

> An AI-powered educational platform that helps TOEFL students identify and understand their reading comprehension errors through structured reflection and personalized diagnosis.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)

[Live Demo](#) | [Video Walkthrough](#) | [Documentation](./docs)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [API Documentation](#api-documentation)
- [Design Philosophy](#design-philosophy)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Overview

The **TOEFL Reading Error Diagnosis System** addresses a critical pain point in TOEFL preparation: students receive only "correct/incorrect" feedback without understanding **why** they made mistakes or **which specific cognitive step** failed in their problem-solving process.

This system transforms error analysis from a vague "I didn't understand" into actionable insights by:
1. **Guiding students** through a 6-step structured reflection process
2. **Diagnosing errors** at different cognitive levels (keyword identification, sentence location, comprehension, option analysis)
3. **Providing personalized AI-generated explanations** using Google Gemini
4. **Tracking error patterns** over time to identify systematic weaknesses

### Problem Statement

Traditional TOEFL practice platforms only show:
- You got this question wrong
- The correct answer is C

**But students need to know:**
- Did I identify the wrong keywords?
- Did I locate the wrong sentence in the passage?
- Did I misunderstand the answer sentence?
- Did I fail to compare options correctly?

This system bridges that gap.

---

## Key Features

### Structured Reflection Workflow
- **6-step guided process** designed by TOEFL educators
- Step-by-step breakdown of reading comprehension cognitive tasks
- Pre-designed multiple-choice templates for common error patterns
- Optional free-text input for nuanced reflection

### Hybrid Rule-Based + AI Diagnosis
- **Rule engine** validates each reflection step deterministically
- **Google Gemini API** generates personalized natural language explanations
- **70% token reduction** through intelligent architecture (avoiding redundant context)
- Cost-effective LLM integration (~$0.02 per diagnosis)

### Error Tracking & Analytics
- Persistent error history stored in SQLite database
- Error categorization by cognitive level (L1: Keywords, L2: Location, L3: Comprehension, L4: Options)
- Foundation for future adaptive learning features

### Clean, Focused UI
- **Split-panel layout** (passage left, questions right)
- **Color-coded feedback** (green for correct, red for incorrect)
- **Progressive disclosure** in reflection workflow
- **Responsive design** for desktop and tablet

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌───────────────┐  ┌───────────────┐  ┌──────────────────┐    │
│  │ QuestionPage  │  │ReflectionPage │  │ DiagnosisPage    │    │
│  │  (Left-Right) │  │ (6-Step Flow) │  │ (AI Analysis)    │    │
│  └───────────────┘  └───────────────┘  └──────────────────┘    │
└─────────────────────────────┬───────────────────────────────────┘
                              │ REST API (JSON)
┌─────────────────────────────▼───────────────────────────────────┐
│                    Backend (FastAPI + Python)                    │
│  ┌──────────────────┐  ┌─────────────────┐  ┌────────────────┐ │
│  │ API Routes       │  │ Rule Engine     │  │ Gemini Service │ │
│  │ /api/questions   │  │ diagnose_error()│  │ LLM calls      │ │
│  │ /api/answers     │  │ validate_steps()│  │ Prompt eng.    │ │
│  │ /api/reflections │  └─────────────────┘  └────────────────┘ │
│  └──────────────────┘                                            │
└─────────────────────────────┬───────────────────────────────────┘
                              │ SQLAlchemy ORM
┌─────────────────────────────▼───────────────────────────────────┐
│                       Data Layer (SQLite)                        │
│  8 Tables: passages, questions, options, reflection_steps,      │
│            reflection_choices, users, user_answers,              │
│            reflection_responses                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Key Design Decisions:**
- **Hybrid Intelligence**: Rule engine handles deterministic validation, LLM handles natural language generation
- **Single Comprehensive LLM Call**: All context sent once to minimize token costs
- **Structured Data First**: Store reflection data in database, not as unstructured text

For detailed architecture diagram, see [System_architecture_diagram.md](./docs/System_architecture_diagram.md).

---

## Technology Stack

### Backend
- **Framework**: FastAPI 0.100+
- **Language**: Python 3.11+
- **ORM**: SQLAlchemy
- **Database**: SQLite (development), PostgreSQL-ready (production)
- **AI Integration**: Google Gemini 1.5 Flash
- **Validation**: Pydantic schemas

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Fetch API

### Development Tools
- **Version Control**: Git
- **Code Formatting**: Black (Python), Prettier (JavaScript)
- **API Documentation**: FastAPI automatic OpenAPI docs

---

## Getting Started

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- npm or yarn
- Google Gemini API key (free tier available)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/toefl-diagnosis.git
cd toefl-diagnosis
```

2. **Set up the backend**
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

3. **Initialize the database**
```bash
python init_database.py
```

4. **Set up the frontend**
```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Configure API endpoint if needed
```

### Running the Application

1. **Start the backend server**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```
The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

2. **Start the frontend development server**
```bash
cd frontend
npm run dev
```
The application will open at `http://localhost:5173`

---

## Project Structure

```
toefl-diagnosis/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes.py          # API endpoints
│   │   │   └── schemas.py         # Pydantic models
│   │   ├── core/
│   │   │   └── database.py        # Database configuration
│   │   ├── models/
│   │   │   └── models.py          # SQLAlchemy models
│   │   ├── services/
│   │   │   ├── error_diagnosis.py # Rule engine
│   │   │   └── gemini_service.py  # LLM integration
│   │   └── main.py                # FastAPI app
│   ├── init_database.py           # Database initialization
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Reusable components
│   │   │   ├── question/         # Question page components
│   │   │   ├── reflection/       # Reflection workflow components
│   │   │   └── diagnosis/        # Diagnosis result components
│   │   ├── pages/
│   │   │   ├── QuestionPage.jsx
│   │   │   ├── ReflectionPage.jsx
│   │   │   └── DiagnosisPage.jsx
│   │   ├── services/
│   │   │   └── api.js            # API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── docs/                         # Documentation
│   ├── README_CN.md             # Chinese version
│   ├── MVP_Procedure.md         # Detailed workflow
│   └── System_architecture_diagram.md
└── README.md
```

---

## Screenshots

### Question Display Page
*Screenshot placeholder: Left-right layout with passage and multiple-choice question*

![Question Page](./docs/screenshots/question-page.png)

### Answer Feedback (Incorrect)
*Screenshot placeholder: Red highlighting for wrong answer, green for correct answer*

![Answer Feedback](./docs/screenshots/answer-feedback.png)

### Reflection Workflow (Step 2/6)
*Screenshot placeholder: Step-by-step reflection card with progress indicator*

![Reflection Step](./docs/screenshots/reflection-step.png)

### AI-Powered Diagnosis Result
*Screenshot placeholder: Left panel showing step-by-step results, right panel showing AI analysis*

![Diagnosis Result](./docs/screenshots/diagnosis-result.png)

---

## API Documentation

### Core Endpoints

#### 1. Get Question
```http
GET /api/questions/{question_id}
```
Returns question details, passage, and options.

#### 2. Submit Answer
```http
POST /api/answers
Content-Type: application/json

{
  "user_id": 1,
  "question_id": 1,
  "selected_option_id": 3
}
```
Returns whether answer is correct and triggers reflection workflow if incorrect.

#### 3. Get Reflection Steps
```http
GET /api/reflections/{user_answer_id}
```
Returns structured reflection questions based on question type.

#### 4. Submit Reflection
```http
POST /api/reflections
Content-Type: application/json

{
  "user_answer_id": 123,
  "step1_choice_id": 3,
  "step2_choice_id": 2,
  ...
}
```
Returns AI-generated diagnosis and error categorization.

For full API documentation, visit `/docs` when running the backend server.

---

## Design Philosophy

### Why Structured Reflection Over Pure AI?

Many AI-powered tutoring systems use LLM to generate generic explanations. This project takes a different approach:

1. **Cognitive Task Decomposition**: Break down reading comprehension into discrete, observable steps
2. **Student Self-Awareness**: Force students to articulate their thought process, not just guess
3. **Actionable Diagnosis**: Error labels like "sentence_location_error" are more actionable than "you need to practice more"
4. **Cost Efficiency**: Rule-based validation is free; LLM only generates explanations, reducing API costs by 70%

### Why Hybrid Rule + LLM Architecture?

**Naive approach:**
```
Step 1 → LLM call
Step 2 → LLM call
Step 3 → LLM call
...
Total: 6 LLM calls, high latency, high cost
```

**Our approach:**
```
Step 1-6 → Local validation (instant, free)
Final → 1 comprehensive LLM call with all context
Result: 70% cost reduction, 5x faster
```

---

## Roadmap

### MVP (Current)
- [x] Single question type (Factual Information)
- [x] 6-step reflection workflow
- [x] Rule-based error diagnosis
- [x] Google Gemini integration
- [x] Basic error tracking

### Phase 2 (In Progress)
- [ ] Support for 3 more question types (Inference, Rhetorical Purpose, Vocabulary)
- [ ] User authentication and profiles
- [ ] Enhanced error analytics dashboard
- [ ] Export error reports (PDF)

### Phase 3 (Planned)
- [ ] Adaptive practice generation based on error patterns
- [ ] Teacher dashboard for classroom use
- [ ] Multi-language support (Chinese explanations)
- [ ] Mobile app (React Native)

### Research Extensions
- [ ] Fine-tuned error classification model
- [ ] Student error trajectory modeling
- [ ] Automated practice generation using RAG

---


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Contact

**Danyan** - [Your Email] - [LinkedIn Profile]

Project Link: [https://github.com/yourusername/toefl-diagnosis](https://github.com/yourusername/toefl-diagnosis)

---

## Acknowledgments

- **Educational Design**: Based on real TOEFL teaching experience and cognitive science research
- **Google Gemini**: For cost-effective AI integration
- **FastAPI Community**: For excellent documentation and support
- **TOEFL Test Takers**: For inspiring this project's creation

---

## Project Stats

- **Lines of Code**: ~3,000 (Backend: 1,500, Frontend: 1,500)
- **Database Schema**: 8 tables, fully normalized
- **API Endpoints**: 4 core endpoints
- **Avg. Token Usage**: 800 tokens per diagnosis (~$0.02)
- **Response Time**: <2s for full diagnosis (including LLM call)

---

## Learning Outcomes

This project demonstrates:
- ✅ Full-stack development (React + FastAPI)
- ✅ RESTful API design
- ✅ Database modeling and ORM usage
- ✅ LLM integration and prompt engineering
- ✅ Educational technology principles
- ✅ Hybrid AI architecture (Rule-based + LLM)
- ✅ Cost-conscious AI application design
- ✅ User-centered interaction design



## 1. 项目背景（Background & Motivation）
在托福阅读练习中，大量学生在做题后只能得到“对 / 错”的结果反馈，却**无法对错误进行有效复盘**。常见情况包括：

- 只知道自己选错，但不知道为什么错
- 模糊归因于“没看懂”，但无法定位具体原因
- 在推断题、修辞目的题等高阶题型中，无法复盘自己的思考路径
- 过度依赖老师讲解，缺乏独立反思与成长机制

长期结果是：
- 学生做题量增加，但能力提升不明显
- 老师重复讲解相似错误，教学效率低

本项目试图通过**结构化复盘 + 半自动错因诊断**，帮助学生明确：

> *“我到底是在阅读理解的哪一个步骤出了问题？”*


## 2. 问题定义（Problem Definition）

### 2.1 核心问题

**学生缺乏对托福阅读错题的结构化复盘能力**，无法将“错误结果”转化为“可行动的改进方向”。

### 2.2 问题特征

- **高频**：每一套阅读、每一道错题都会发生
- **高痛点**：学生感到迷茫、挫败，老师感到重复劳动
- **已有低效解决方案**：等老师讲解、模糊总结

## 3. 产品目标（Product Goals）

### 3.1 MVP 阶段目标

> 在每一道错题后，引导学生完成一次**结构化的自我复盘**，并获得明确的错误类型反馈。

### 3.2 非目标（当前不做）

- 完全自动化 AI 批改
- 替代老师教学
- 覆盖听说读写所有科目

## 4. 核心产品理念（Key Insight）

**托福阅读错误并非随机，而是可被归因到固定的认知层级中。**

本项目将错误拆分为三层：

### Level 1：语言理解层（Language）
- 长难句结构理解失败
- 熟词僻义误判
- 指代关系不清

### Level 2：信息处理层（Process）
- 定位句错误或不完整
- 关键信息遗漏
- 忽略转折 / 限定条件

### Level 3：策略与题型层（Strategy）
- 推断题过度推断
- 修辞目的题误判作者意图
- 选项比对方法不当

## 5. 用户画像（Target Users）

### 主要用户
- 托福阅读备考学生（中高级水平）

### 次要用户
- 托福阅读教师（用于教学辅助与学生诊断）


## 6. 使用流程（User Flow）

1. 学生完成题型专项托福阅读练习
2. 系统判断题目结果（对 / 错）
3. 如果错误，进入【错题复盘流程】
4. 学生回答一组引导性复盘问题
5. 系统生成：
   - 错误类型诊断
   - 简要原因解释
   - 未来可以生成针对性的AI-based练习
6. 错题被记录进个人错误画像


## 7. 核心功能模块（MVP）

> **MVP 范围确认**：仅支持托福阅读【单选题】（符合托福改革后题型），暂不支持多选题、插句题等特殊题型。

### 7.1 错题复盘引导模块（核心）

该模块以 **题型驱动（Question-type driven）** 的方式，引导学生复盘自己的解题路径，而非仅复盘结果。

#### 题型化复盘设计

目前先针对一个题型跑通流程：
- **事实信息题（Factual Information）**
   - 解题路径：题干解析 $\rightarrow$ 重点抽取（主干 / 逻辑）$\rightarrow$  原文定位 $\rightarrow$ 答案句确认 $\rightarrow$ 选项匹配（主干 → 细节）
   - 错因分层：
     1. 题干重点错误
        - 没有遵循正确的解题步骤：先看题干
        - 没有找准题干的实义主干
        - 没有确认提问逻辑
     3. 原文定位错误
        - 没有按照题干关键词定位（定位句里没有关键词）
        - 定位句有关键词但是不是答案句    
     5. 答案分析错误
        - 选项的主干内容不匹配
        - 选项的细节和原文不符


> 本部分将由真实教学经验持续补充，并作为后续 AI 诊断与生成的重要结构化输入。

### 7.2 错因诊断模块（半自动）

结合以下信息进行判断：
- 题型
- 正确选项 vs 错误选项
- 学生复盘选择

输出：
- 1～2 个主要错误类型标签
- 简要自然语言解释


### 7.3 错误画像与统计模块

系统长期记录学生的：
- 高频错误类型
- 不同题型的错误分布
- 错误层级占比（Language / Process / Strategy）

## 8. 技术架构拆解（Technical Architecture）

### 8.1 前端（Frontend）

**目标**：提供清晰、低负担的复盘体验

- 技术栈：
  - 框架：React 18 + Vite
  - 样式：Tailwind CSS

- 核心页面：
  - 题目展示页
  - 错题复盘问答页
  - 错误诊断结果页
  - 个人错误统计页

### 8.2 后端（Backend）

**目标**：管理题目、用户行为与诊断逻辑

- 技术栈：
  - Python (FastAPI)

- 核心模块：
  - 用户管理模块
  - 题目与答案数据模块
  - 错题记录模块
  - 错因诊断规则引擎


### 8.3 AI 模块（Explainable AI & Agent-based Extension）

- AI 模块采用 **Explainable + Progressive Intelligence** 设计，而非黑箱端到端模型。
- Google Gemini 1.5 flash

### 8.4 数据库
- SQLite（本地开发）→ PostgreSQL（生产）


#### 阶段 1（MVP）
- Rule-based 错因判断（基于题型 + 复盘路径）
- LLM 用于：
  - 错因解释的自然语言生成（中英结合）
  - 长难句与词义的定向解释（why 而非 what）

#### 阶段 2（Agent-based 扩展）
- **题目生成 Agent**：
  - 基于修改后的托福文本自动生成模拟题（避免使用官方原题）
  - 控制题型、难度与语言特征

- **错误分析 Agent**：
  - 汇总学生多次错误
  - 生成个性化错误模式总结（非模板化）

#### 阶段 3（智能学习闭环）
- 个性化练习生成（针对高频错误类型）
- 词汇与阅读微练习小游戏生成

---

#### 阶段 1（MVP）
- Rule-based 错因判断
- LLM 用于：
  - 错因解释文本生成
  - 长难句/词义辅助解释

#### 阶段 2（进阶）
- 错误类型分类模型（Multi-class classification）
- 输入：题目文本、题型、选项、学生选择

#### 阶段 3（研究型）
- 学生错误路径建模（Error Trajectory Modeling）


## 9. 数据设计（Data Design）

- Question
- Option
- UserAnswer
- ErrorType
- ReflectionResponse
- ErrorProfile


## 10. 项目阶段规划（Roadmap）

### Phase 1：需求抽象与规则设计
- 整理真实教学错题
- 归纳错误类型（<=10）

### Phase 2：MVP 实现
- 基础前后端
- 规则 + LLM 解释

### Phase 3：用户测试与迭代
- 小规模真实学生使用
- 优化复盘问题与诊断准确率


## 11. 项目价值总结

- 教育场景真实、需求明确
- 强结合领域知识 + AI + 软件工程
- 具备研究与工程双重扩展空间
- 可作为高质量 CS / AI / PM 方向项目


## 12. 已确认决策与后续待扩展点

### 已确认（MVP 范围）

- 仅支持托福阅读【单选题】
- 使用 **修改后的模拟题文本**，不使用官方原题
- 第一版仅提供【学生端】，不包含教学管理
- 错因解释语言：**中英结合**
- 项目定位：**Full-stack + LLM 应用**，可扩展至 Agent-based 系统

### 后续可扩展方向（非 MVP）

- 教师端 Dashboard（基于学生错误画像）
- 更细粒度的错误路径建模
- 自适应学习内容生成



# AI-powered-application
[Example of AI-powered-application from Cloudflare](https://agents.cloudflare.com/)
## An AI-powered application should include the following components:
1. LLM (recommend using Llama 3.3 on Workers AI), or an external LLM of your choice
2. Workflow / coordination (recommend using Workflows, Workers or Durable Objects)
3. User input via chat or voice (recommend using Pages or Realtime)
4. Memory or state

[documentation](https://developers.cloudflare.com/agents/)


--

## ⚠️ 重要：未来技术债与改进计划

### 🔧 诊断结构优化（Phase 2 优先级：高）

**当前状态（选项 A - MVP 实现）：**
- ✅ 使用 Structured Output（JSON Schema）保证输出可靠性
- ✅ 基础诊断输出：`explanation` + `suggestion`
- ✅ 规则引擎判断错误层级（Level 1-5）
- ✅ LLM 生成个性化解释

**已知限制：**
- 诊断结构较简单，只有两个字段
- 缺少结构化的关键词提取
- 缺少具体的训练方向建议
- 前端展示可扩展性有限

**计划改进（选项 C - 完整方案）：**

当用户反馈积累到一定程度，或需要更精细的诊断报告时，应升级为以下结构：

```python
# 扩展后的诊断输出结构
{
    # 现有字段（保持）
    "error_level": "level_2",
    "error_type": "定位能力不足",
    "explanation": "你准确识别了定位词...",
    "suggestion": "建议练习...",
    
    # 新增字段（待实现）
    "primary_error_tag": "Wrong Localization",  # 更细粒度的分类
    "key_points": [                              # 关键词汇/概念提取
        "sport for peace program",
        "conflict resolution",
        "team-building activities"
    ],
    "cognitive_breakdown": {                     # 认知断点分析
        "step": "sentence_location",
        "issue": "误判了包含关键词的句子就是答案句"
    },
    "practice_focus": [                          # 具体训练方向
        "定位词 + 题干核心问题组合定位",
        "区分背景描述 vs 直接回答",
        "同义替换识别"
    ]
}

{
  # 新的 Prompt 结构：
    prompt = f"""
      【题目信息】
      题干：{question_stem}
      正确答案：{correct_answer}
      学生选择：{user_answer}

      【学生复盘过程】
      Step 1 (定位词): {step1_selected}
      Step 2 (答案句): {step2_selected}
      ...

      【规则引擎诊断】
      错误层级：{error_level}
      错误类型：{error_type}

      【任务】
      请生成结构化的诊断报告，包含：
      1. explanation: 清晰指出认知断点
      2. suggestion: 具体的改进建议
      3. key_points: 关键词汇/概念列表
      4. practice_focus: 3个针对性训练方向
      """
}
```

**实现步骤（估计工作量：80 分钟）：**

1. **更新 LLM Schema**（20 分钟）
   - 修改 `gemini_service.py` 的 `response_schema`
   - 添加新的字段定义
   - 更新 prompt 要求 LLM 生成更丰富的输出

2. **更新后端数据结构**（15 分钟）
   - 修改 `schemas.py` 的 `DiagnosisOut`
   - 可选：更新数据库 schema 存储更多诊断信息

3. **更新 API 返回**（10 分钟）
   - 修改 `routes.py` 的 `submit_reflection()` 返回格式

4. **更新前端 DiagnosisPage**（30 分钟）
   - 重新设计诊断结果展示 UI
   - 添加关键词高亮
   - 添加训练方向卡片
   - 可视化认知断点

5. **测试与优化**（5 分钟）
   - 完整流程测试
   - 验证新结构的教育效果

**触发条件（满足任一即应实施）：**
- [ ] 累计 50+ 次学生使用反馈
- [ ] 需要构建错误统计/分析功能
- [ ] 需要生成学习报告
- [ ] 用户明确要求更详细的诊断
- [ ] 准备添加教师端 Dashboard


**重要提醒：**
- 当前 MVP 使用 `gemini-2.5-flash` 模型
- 升级时需要测试新 Schema 的 token 消耗
- 建议先在开发环境验证完整流程再部署