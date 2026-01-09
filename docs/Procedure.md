阶段 1：数据层搭建（Database + Models）
目标： 能存储题目、用户答案、复盘数据
需要完成的工作：

设计数据库表结构

questions 表：存储题目、文章、选项
user_answers 表：记录用户选择和对错
reflections 表：存储复盘各步骤的回答
error_types 表：错误类型分类


创建 SQLAlchemy Models

定义 Python 类对应每张表
设置表之间的关联关系


初始化数据库

配置 SQLite 连接
编写数据库迁移脚本
插入你案例中的那道测试题



验收标准： 能通过 Python 代码成功读写数据库

阶段 2：后端 API 框架（FastAPI Endpoints）
目标： 前端能通过 HTTP 请求获取和提交数据
需要完成的工作：

搭建 FastAPI 项目结构

项目目录组织
依赖管理（requirements.txt）
配置文件


实现核心 API 端点

GET /api/questions/{id} - 获取题目详情
POST /api/answers - 提交用户答案
POST /api/reflections - 提交复盘回答
GET /api/diagnosis/{answer_id} - 获取诊断结果


定义请求/响应数据格式

使用 Pydantic 定义数据模型
处理输入验证



验收标准： 能用 Postman 或 curl 调用所有 API

阶段 3：规则引擎（Error Diagnosis Logic）
目标： 根据复盘回答自动判断错误类型
需要完成的工作：

实现 Step 1-5 的判断逻辑

定位词正误判断
答案句正误判断
理解模板匹配


实现分层诊断规则

按你文档中的 Level 1-5 逻辑
输出错误类型标签


编写单元测试

用你的案例验证逻辑正确性



验收标准： 输入测试案例的复盘数据，输出正确的错误类型

阶段 4：LLM 集成（Gemini Service）
目标： 生成个性化的错因解释
需要完成的工作：

配置 Gemini API

获取 API Key
封装调用函数


设计 Prompt 模板

输入：题目信息 + 复盘回答 + 规则引擎结果
输出：中英结合的错因解释


集成到诊断流程

规则引擎输出 → Prompt 生成 → LLM 调用 → 结果返回



验收标准： 能生成合理的自然语言诊断解释

阶段 5：前端界面（React UI）
目标： 用户能完成完整的答题-复盘流程
需要完成的工作：

搭建 React + Vite 项目

项目初始化
Tailwind CSS 配置
路由设置


实现核心页面

题目展示页（显示文章 + 选项）
复盘问答页（Step 1-6 的交互）
诊断结果页（显示分析结果）


连接后端 API

封装 API 调用函数
处理加载状态和错误



验收标准： 能完成一道题的完整流程

建议的开发顺序
阶段 1 → 阶段 2 → 阶段 3 → 阶段 4 → 阶段 5
数据层    API      规则引擎   LLM      前端
理由： 后端先行，每完成一层都可以独立测试，不依赖其他部分。前端放最后是因为只要 API 稳定，UI 可以快速迭代。
