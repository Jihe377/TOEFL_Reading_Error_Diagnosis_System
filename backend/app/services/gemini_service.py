"""
Gemini LLM Service for TOEFL Reading Error Diagnosis

This module integrates Google Gemini API to generate personalized
error explanations and improvement suggestions based on rule engine results.

Updated to use the new google-genai package (google.generativeai is deprecated)
"""

import os
import re
import json
from typing import Tuple
from dotenv import load_dotenv
from google import genai
from google.genai import types

# 加载环境变量
load_dotenv()

# 配置 Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("警告: GEMINI_API_KEY 未设置，将无法使用 LLM 功能")
    client = None
else:
    client = genai.Client(api_key=GEMINI_API_KEY)

MODEL_NAME = "gemini-2.5-flash"


def generate_diagnosis_explanation(
    error_level: str,
    error_type: str,
    rule_details: dict,
    question_data: dict,
    user_responses: dict
) -> Tuple[str, str]:
    """
    使用 Gemini LLM 生成个性化的错误诊断解释和改进建议
    
    Args:
        error_level: 错误层级 ("level_1" ~ "level_5")
        error_type: 错误类型描述
        rule_details: 规则引擎的详细分析结果
        question_data: 题目信息 (stem, passage_content, correct_answer, user_answer)
        user_responses: 学生的复盘回答内容
    
    Returns:
        Tuple[str, str]: (explanation, suggestion)
        - explanation: 50-100字的错因解释
        - suggestion: 50-100字的改进建议
    """
    
    # 如果没有配置 API key，返回占位符
    if not GEMINI_API_KEY or not client:
        return _generate_fallback_response(error_level, error_type, rule_details)
    
    try:
        # 构建 prompt
        prompt = _build_prompt(
            error_level=error_level,
            error_type=error_type,
            rule_details=rule_details,
            question_data=question_data,
            user_responses=user_responses
        )
        # 构建系统指令
        system_instruction = """你是一位经验丰富的托福阅读教师，正在帮助学生分析错题。请用友好、鼓励的语气，生成简洁的错因解释和改进建议。使用中英结合的方式：关键术语用英文，解释用中文。"""
        
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema={
                    "type": types.Type.OBJECT,
                    "properties": {
                        "explanation": {
                            "type": types.Type.STRING,
                            "description": "50-100字的错因解释，清晰指出学生在哪个环节、为什么会犯错"
                        },
                        "suggestion": {
                            "type": types.Type.STRING,
                            "description": "50-100字的改进建议，给出具体的、可操作的学习建议"
                        }
                    },
                    "required": ["explanation", "suggestion"]
                }
            )
        )
        
        # 直接解析 JSON 响应（不需要正则表达式）
        result = json.loads(response.text)
        explanation = result.get("explanation", "")
        suggestion = result.get("suggestion", "")
        
        # 如果解析失败或为空，使用 fallback
        if not explanation or not suggestion:
            return _generate_fallback_response(error_level, error_type, rule_details)
        
        return (explanation, suggestion)
    
    except Exception as e:
        print(f"Gemini API 调用失败: {e}")
        # 失败时返回基于规则的回退内容
        return _generate_fallback_response(error_level, error_type, rule_details)


def _build_prompt(
    error_level: str,
    error_type: str,
    rule_details: dict,
    question_data: dict,
    user_responses: dict
) -> str:
    """
    构建发送给 Gemini 的 prompt
    """
    
    # 提取关键信息
    stem = question_data.get("stem", "")
    correct_answer = question_data.get("correct_answer", "")
    user_answer = question_data.get("user_answer", "")
    
    step1 = user_responses.get("step1", {})
    step2 = user_responses.get("step2", {})
    step3 = user_responses.get("step3", {})
    step5 = user_responses.get("step5", {})
    
    # 构建 prompt
    prompt = f"""你是一位经验丰富的托福阅读教师，正在帮助学生分析错题。请用友好、鼓励的语气，生成简洁的错因解释和改进建议。

【题目信息】
题干：{stem}
正确答案：{correct_answer}
学生选择：{user_answer}

【诊断结果】
错误层级：{error_level}
错误类型：{error_type}
规则分析：{rule_details.get('analysis', '')}

【学生复盘过程】
Step 1 (定位词识别): {'✓ 正确' if step1.get('is_correct') else '✗ 错误'}
  学生选择: {step1.get('selected', '')}

Step 2 (答案句定位): {'✓ 正确' if step2.get('is_correct') else '✗ 错误'}
  学生选择: {step2.get('selected', '')[:80]}{'...' if len(step2.get('selected', '')) > 80 else ''}

Step 3 (答案句理解): {step3.get('quality', '')}
  学生理解: {step3.get('selected', '')}
  {f"补充说明: {step3.get('custom_input', '')}" if step3.get('custom_input') else ''}

Step 5 (自我诊断):
  学生判断: {step5.get('selected', '')}

【任务要求】
请生成两段内容，用中英结合的方式（关键术语用英文，解释用中文）：

1. 错因解释 (EXPLANATION)：
   - 50-100字
   - 清晰指出学生在哪个环节、为什么会犯错
   - 避免重复已知信息，聚焦最核心的认知偏差
   - 如果学生有补充说明，考虑其中的疑问

2. 改进建议 (SUGGESTION)：
   - 50-100字
   - 给出具体的、可操作的学习建议
   - 针对该错误类型的典型训练方法
   - 语气友好、鼓励性

【输出格式】严格按照以下格式输出，不要有其他内容：
EXPLANATION: [你的解释内容]
SUGGESTION: [你的建议内容]

示例：
EXPLANATION: 你准确识别了定位词 "sport for peace program"，但在定位答案句时选择了讨论 favoritism 的句子。这是因为该句确实提到了相关话题，但它描述的是问题背景，而非该项目的具体做法。定位时需要找到直接回答题干的句子，而不是相关讨论。
SUGGESTION: 建议练习"定位词 + 题干核心问题"的组合定位法：找到定位词后，继续寻找直接回答 "what does it do" 这类核心问题的句子。可以尝试每次定位后问自己："这句话是在描述问题还是在回答问题？"

请现在开始生成："""
    
    return prompt


def _generate_fallback_response(
    error_level: str,
    error_type: str,
    rule_details: dict
) -> Tuple[str, str]:
    """
    当 LLM 不可用时，生成基于规则的回退内容
    """
    
    # 基于错误层级的默认解释模板
    fallback_explanations = {
        "level_1": f"你在识别题干关键定位词时出现了偏差。{rule_details.get('issue', '')}这是解题的第一步，准确的定位词识别是后续所有步骤的基础。",
        "level_2": f"你虽然识别了关键词，但在定位答案句时出现了错误。{rule_details.get('issue', '')}定位能力需要在大量练习中培养。",
        "level_3": f"你成功定位到了答案句，但对句子含义的理解出现了偏差。{rule_details.get('issue', '')}建议重点关注句子的逻辑关系。",
        "level_4": f"你在定位和理解答案句上都做得不错，但在选项理解或比对环节出现了问题。{rule_details.get('issue', '')}",
        "level_5": f"你对答案句和选项的理解都基本正确，但在最终选择时出现了失误。{rule_details.get('issue', '')}这可能是答题策略的问题。"
    }
    
    # 基于错误层级的默认建议模板
    fallback_suggestions = {
        "level_1": f"建议：{rule_details.get('recommendation_focus', '强化关键词识别训练')}。重点练习识别专有名词、核心动词等明显的定位信号。",
        "level_2": f"建议：{rule_details.get('recommendation_focus', '加强定位训练')}。练习找到包含关键词的句子后，判断该句是否直接回答题干。",
        "level_3": f"建议：{rule_details.get('recommendation_focus', '强化长难句分析')}。尝试拆解句子结构，标注因果、转折、限定等逻辑关系词。",
        "level_4": f"建议：{rule_details.get('recommendation_focus', '加强选项分析训练')}。练习识别选项与原文的同义改写，以及干扰项的常见特征。",
        "level_5": f"建议：{rule_details.get('recommendation_focus', '优化答题策略')}。可以尝试排除法，或在选择前再次确认选项与原文的对应关系。"
    }
    
    explanation = fallback_explanations.get(error_level, f"错误类型：{error_type}。{rule_details.get('analysis', '')}")
    suggestion = fallback_suggestions.get(error_level, "建议加强针对性练习，关注自己的薄弱环节。")
    
    return (explanation, suggestion)


def test_gemini_connection() -> bool:
    """
    测试 Gemini API 连接是否正常
    
    Returns:
        bool: True 表示连接正常，False 表示连接失败
    """
    if not GEMINI_API_KEY or not client:
        print("❌ GEMINI_API_KEY 未设置")
        return False
    
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents="Hello, please respond with 'OK'"
        )
        print(f"✅ Gemini API 连接成功")
        print(f"   使用模型: {MODEL_NAME}")
        print(f"   响应: {response.text[:50]}")
        return True
    except Exception as e:
        print(f"❌ Gemini API 连接失败: {e}")
        return False


# 测试代码
if __name__ == "__main__":
    print("测试 Gemini API 连接...")
    test_gemini_connection()