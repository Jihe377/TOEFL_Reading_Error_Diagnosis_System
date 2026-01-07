# **TOEFL Reading Error Diagnosis System**  
（托福阅读错因诊断与复盘辅助系统）

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

每一种题型将对应一套【解题路径模板】，例如：

- **事实信息题（Factual Information）**
   - 解题路径：题干解析 $\rightarrow$ 重点抽取（主干 / 逻辑）$\rightarrow$ 原文定位 $\rightarrow$ 答案句确认 $\rightarrow$ 选项匹配（主干 → 细节）
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

- **推断题（Inference）**
  - 是否基于定位句进行推断？
  - 是否出现“过度推断”？
  - 选项是否超出原文信息范围？

- **修辞目的题（Rhetorical Purpose）**
  - 是否理解作者写这句话的目的？
  - 是否混淆“事实内容”和“写作意图”？

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

- 技术栈（暂定）：
  - React / Next.js
  - Tailwind CSS

- 核心页面：
  - 题目展示页
  - 错题复盘问答页
  - 错误诊断结果页
  - 个人错误统计页


### 8.2 后端（Backend）

**目标**：管理题目、用户行为与诊断逻辑

- 技术栈（暂定）：
  - Node.js / Python (FastAPI)
  - REST API

- 核心模块：
  - 用户管理模块
  - 题目与答案数据模块
  - 错题记录模块
  - 错因诊断规则引擎


### 8.3 AI 模块（Explainable AI & Agent-based Extension）

AI 模块采用 **Explainable + Progressive Intelligence** 设计，而非黑箱端到端模型。

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
