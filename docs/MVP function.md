# MVP Procedure 
学生答题 → 判断对错 → 【错题进入复盘流程】

复盘流程（5 步）：
1. 题干定位词识别（结构化选择）
2. 答案句定位（结构化选择）
3. 答案句理解（半开放选择 + 可选自由输入）
4. 选项理解（半开放选择 + 可选自由输入）
5. 错误原因初判（结构化选择）
6. 补充说明（开放输入，可选）

系统输出：
→ LLM 生成综合错因诊断
→ 记录错误类型
→ 提供改进建议


# 案例 - 事实信息题

**The Impact of sports on social Integration** 

Sports can promote social integration by bridging gaps between people of various backgrounds. participation in sports can lead to increased social cohesion and improved relationships among diverse groups.
 
For example, community soccer leagues often bring together people from different ethnicities, creating an environment where cultural differences are celebrated and mutual respect is cultivated. However, the impact of sports on social integration is not without challenges. Competitive environments can sometimes exacerbate social tensions, particularly when favoritism or exclusionary practices are present.
 
Despite these issues, many initiatives aim to use sports as a platform for social change. One such initiative is the sport for peace program, which focuses on conflict resolution through team - building activities and collaborative sports events. The role of sports in social integration extends beyond participation. Spectatorship and fandom also play significant roles in uniting people. Major international sports events like the olympics or the world cup serve as opportunities for nations to come together and share common goals. The visibility of athletes from diverse backgrounds during these events fosters a sense of global harmony. These events often highlight stories of athletes overcoming adversity, inspiring spectators and fostering a collective sense of achievement.

**What does the passage suggest about the sport for peace program?**

A. Its main goal is to eliminate favoritism in sports.
B. It primarily targets professional athletes.
C. It uses team - building exercises to address conflicts.
D. It is only effective in local communities.
 
正确答案：C
学生选择：A

## 复盘流程设计

### Step 1：题干定位词识别
- 给出 3-4 个候选词/短语
- 学生勾选 → 系统判断对错

**目标：** 检验学生是否能找准题干中的关键定位信号
**交互方式：** 结构化单选
题干："What does the passage suggest about the sport for peace program?"

请选择你认为的定位词：(不可多选)
☐ sport
☐ passage
☐ sport for peace program
☐ suggest

**系统处理：**
- 直接判断对错（规则引擎）
- 记录学生选择
- 暂不给出反馈（避免打断复盘流程）

### Step 2：答案句定位
- 给出 3-4 个候选句子
- 学生选择 → 系统判断对错

**目标：** 检验学生是否能根据定位词找到正确的答案句
**交互方式：** 结构化单选
请选择你认为的答案句：

○ Competitive environments can sometimes exacerbate social tensions, particularly when favoritism or exclusionary practices are present.

○ One such initiative is the sport for peace program, which focuses on conflict resolution through team-building activities and collaborative sports events.

○ The role of sports in social integration extends beyond participation.

○ 以上都不是

**系统处理：**
- 直接判断对错
- 记录学生选择
- 为后续诊断提供关键数据（是否定位正确）

### Step 3：答案句理解
- 给出 2-3 个理解模板
- 学生选择最接近的 + 可选自由补充

**目标：** 检验学生对答案句的核心含义是否理解到位
**交互方式：** 半开放选择 + 可选自由输入

你选择的答案句是：
"One such initiative is the sport for peace program, which focuses on conflict resolution through team-building activities..."
请选择最接近你理解的选项：

○ 这个项目旨在消除体育中的偏袒现象
○ 这个项目专注于团队建设活动
○ 这个项目通过团队建设活动来解决冲突
○ 以上都不对，我的理解是：[自由输入框]

**系统处理：**
- 判断学生选择的理解模板质量（correct / partial / wrong）
- 如果有自由输入，记录但暂不分析
- 为 LLM 诊断提供关键信息
### Step 4：选项理解
**Part A：错误选项理解**
你选择了选项 A："Its main goal is to eliminate favoritism in sports."
请选择最接近你当时理解的选项：
○ 我认为文章重点讨论了 favoritism 问题，所以 A 是答案
○ 我认为 sport for peace program 就是为了消除 favoritism
○ 我混淆了 sport for peace program 和文章提到的另一个内容
○ 以上都不对，我的理解是：[自由输入框]

**理解模板设计原则：**
模板 1：定位混淆（把其他句子的内容当成答案）
模板 2：概念混淆（误解了项目的核心目标）
模板 3：信息错位（把相关但不同的概念混为一谈）

**Part B：正确选项理解**
正确答案是选项 C："It uses team-building exercises to address conflicts."
请选择最接近你现在理解的选项：
○ 这个项目的核心是团队建设
○ 这个项目通过团队建设活动来解决冲突
○ 这个项目只在特定社区有效
○ 我还是不太理解为什么 C 是对的：[自由输入框]

**理解模板设计原则：**
模板 1：片面理解（只抓到手段，没抓到目标）
模板 2：正确理解（完整把握因果关系）
模板 3：其他干扰理解（常见误解）

### Step 5：错误原因初判
**目标：** 让学生自我诊断主要错在哪个环节
**交互方式：** 结构化单选

回顾你的解题过程，你认为主要错在：
○ 定位句找错了
○ 答案句理解不对
○ 选项主干内容不明确
○ 选项细节信息理解错误
○ 其他：[自由输入框]

**系统处理：**
- 记录学生的自我判断
- 对比系统判断（基于 Step 1-3 的结果）
- 为 LLM 生成诊断提供上下文

### Step 6：补充说明
**目标：** 捕捉结构化问题无法覆盖的个性化因素
**交互方式：** 开放输入（可选）

还有其他想补充的吗？（选填）
例如：
- 有哪些词汇/句子影响了你的理解？
- 你在解题时有什么特殊的思考？
[自由输入框]

**系统处理：**
- 记录学生输入
- 暂不强制分析（避免增加 MVP 复杂度）
- 为未来个性化诊断积累数据

## 综合分析输出
触发时机：学生完成 Step 1-5 后
**处理逻辑：**
1. 规则引擎判断（无需 LLM）
【Level 1：定位词判断】
IF Step1_错误：
   → 核心问题：定位词概念不清晰（不能判断什么是题干重点）
   → 建议：强化关键词识别训练（专有名词、核心动词优先）

【Level 2：答案句定位】
ELIF Step1_正确 AND Step2_错误：
   → 核心问题：定位能力不足
   → 细分：
     - 如果 Step2 选择的句子不包含 Step1 定位词
       → 根本没有应用定位词定位
     - 如果 Step2 选择的句子包含 Step1 定位词但仍错误
       → 误判了同义替换 OR 误以为该句就是答案句

ELIF Step1_错误 AND Step2_正确：
   → 核心问题：定位词识别错误但答案句定位正确
   → 分析：可能是通过其他线索（如选项关键词）找到答案句
   → 建议：虽然结果对了，但仍需强化定位词识别

【Level 3：答案句理解】
ELIF Step2_正确 AND Step3_错误：
   → 核心问题：答案句理解偏差
   → 结合 Step3 的理解模板选择，LLM 分析具体偏差点：
     - 因果关系误判
     - 转折逻辑遗漏
     - 限定条件忽略

【Level 4：选项理解】
ELIF Step2_正确 AND Step3_正确 AND Step4_错误选项理解错误：
   → 核心问题：误判了错误选项的吸引力
   → 分析：
     - 如果选择"认为文章重点讨论了 favoritism"
       → 定位混淆（把干扰信息当主旨）
     - 如果选择"认为 program 就是为了消除 favoritism"
       → 概念混淆（误解项目目标）

ELIF Step2_正确 AND Step3_正确 AND Step4_正确选项理解错误：
   → 核心问题：虽然定位和理解答案句都对，但没理解正确选项
   → 分析：可能是"做对但不知道为什么对"
   → 建议：需要强化选项与原文的对应关系训练

【Level 5：完整理解但仍选错】
ELIF Step2_正确 AND Step3_正确 AND Step4_两个选项理解都正确：
   → 核心问题：答案句和选项都理解了，但选择时失误
   → 可能原因：
     - 粗心（misclick）
     - 考试压力下判断失误
     - 对"最佳答案"的判断标准不清晰

2. LLM 生成个性化诊断
- 输入信息：
   - 题目、选项、正确答案
   - Step 1-5 的学生选择
   - Step 3/5 的自由输入（如果有）

- 输出内容：
   - 简短的错因解释（50-100 字）
   - 具体的改进建议
   - 关键知识点提示

3. 数据记录
   - 错误类型归档
   - 为错误画像积累数据