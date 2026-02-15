"""
Rule Engine for TOEFL Reading Error Diagnosis

This module implements a rule-based system to diagnose student errors
in TOEFL reading comprehension questions through structured reflection.
"""

from dataclasses import dataclass
from typing import Optional
from sqlalchemy.orm import Session
from app.models.models import ReflectionChoice


@dataclass
class DiagnosisResult:
    """错误诊断结果"""
    error_level: str  # "level_1" ~ "level_5"
    error_type: str   # 错误类型描述
    details: dict     # 详细分析信息（用于 LLM prompt）


class ErrorDiagnoser:
    """
    错误诊断规则引擎
    
    根据学生的复盘数据，判断错误发生在哪个认知层级：
    - Level 1: 定位词识别错误
    - Level 2: 答案句定位错误
    - Level 3: 答案句理解错误
    - Level 4: 选项理解错误
    - Level 5: 完整理解但仍选错
    """
    
    def __init__(
        self,
        db: Session,
        step1_is_correct: bool,
        step1_choice_id: int,
        step2_is_correct: bool,
        step2_choice_id: int,
        step3_quality: str,
        step3_choice_id: int,
        step3_custom_input: Optional[str],
        step4a_choice_id: int,
        step4b_choice_id: int,
        step5_choice_id: int,
        question_data: dict = None
    ):
        """
        初始化诊断器
        
        Args:
            db: 数据库 session
            step1_is_correct: Step 1 是否正确
            step1_choice_id: Step 1 选择的 choice ID
            step2_is_correct: Step 2 是否正确
            step2_choice_id: Step 2 选择的 choice ID
            step3_quality: Step 3 理解质量 ("correct", "partial", "wrong", "unknown")
            step3_choice_id: Step 3 选择的 choice ID
            step3_custom_input: Step 3 自定义输入
            step4a_choice_id: Step 4A (错误选项) 选择的 choice ID
            step4b_choice_id: Step 4B (正确选项) 选择的 choice ID
            step5_choice_id: Step 5 自我诊断选择的 choice ID
            question_data: 可选的题目上下文信息
        """
        self.db = db
        self.step1_is_correct = step1_is_correct
        self.step1_choice_id = step1_choice_id
        self.step2_is_correct = step2_is_correct
        self.step2_choice_id = step2_choice_id
        self.step3_quality = step3_quality
        self.step3_choice_id = step3_choice_id
        self.step3_custom_input = step3_custom_input
        self.step4a_choice_id = step4a_choice_id
        self.step4b_choice_id = step4b_choice_id
        self.step5_choice_id = step5_choice_id
        self.question_data = question_data or {}
    
    def diagnose(self) -> DiagnosisResult:
        """
        执行诊断，返回错误层级和类型
        
        Returns:
            DiagnosisResult: 包含 error_level, error_type 和详细分析
        """
        # Level 1: 定位词识别错误
        if not self.step1_is_correct:
            return self._diagnose_level_1()
        
        # Level 2: 答案句定位错误
        if not self.step2_is_correct:
            return self._diagnose_level_2()
        
        # Level 3: 答案句理解错误
        if self.step3_quality in ['wrong', 'unknown']:
            return self._diagnose_level_3()
        
        # Level 4 & 5: 选项理解相关
        return self._diagnose_level_4_and_5()
    
    def _diagnose_level_1(self) -> DiagnosisResult:
        """
        Level 1: 定位词识别错误
        
        核心问题：学生不能准确判断题干中的关键定位信息
        """
        # 获取学生选择的关键词
        step1_choice = self.db.query(ReflectionChoice).filter(
            ReflectionChoice.id == self.step1_choice_id
        ).first()
        
        student_keyword = step1_choice.choice_text if step1_choice else "unknown"
        
        error_type = "定位词概念不清晰"
        details = {
            "analysis": "学生未能正确识别题干中的关键定位词，这是解题的第一步出现了偏差。",
            "student_keyword": student_keyword,
            "issue": "不能判断什么是题干重点",
            "recommendation_focus": "关键词识别训练（专有名词、核心动词优先）"
        }
        
        return DiagnosisResult(
            error_level="level_1",
            error_type=error_type,
            details=details
        )
    
    def _diagnose_level_2(self) -> DiagnosisResult:
        """
        Level 2: 答案句定位错误
        
        细分两种情况：
        1. 选择的句子不包含关键词 → 根本没有应用定位词
        2. 选择的句子包含关键词但仍错误 → 误判了同义替换或定位范围
        """
        # 获取学生选择的句子
        step2_choice = self.db.query(ReflectionChoice).filter(
            ReflectionChoice.id == self.step2_choice_id
        ).first()
        
        student_sentence = step2_choice.choice_text if step2_choice else ""
        
        # 获取 Step 1 的关键词用于分析
        step1_choice = self.db.query(ReflectionChoice).filter(
            ReflectionChoice.id == self.step1_choice_id
        ).first()
        keyword = step1_choice.choice_text if step1_choice else ""
        
        # 简单判断：句子是否包含关键词（简化版，实际可以更复杂）
        contains_keyword = keyword.lower() in student_sentence.lower() if keyword else False
        
        if not contains_keyword:
            error_type = "定位能力不足 - 未应用定位词"
            sub_issue = "根本没有应用定位词去定位答案句"
        else:
            error_type = "定位能力不足 - 误判定位范围"
            sub_issue = "虽然找到了包含关键词的句子，但误判了同义替换或定位范围"
        
        details = {
            "analysis": f"学生虽然识别了关键词，但在定位答案句时出现了错误。{sub_issue}。",
            "student_sentence": student_sentence[:100] + "..." if len(student_sentence) > 100 else student_sentence,
            "contains_keyword": contains_keyword,
            "issue": sub_issue,
            "recommendation_focus": "定位训练、同义替换识别"
        }
        
        return DiagnosisResult(
            error_level="level_2",
            error_type=error_type,
            details=details
        )
    
    def _diagnose_level_3(self) -> DiagnosisResult:
        """
        Level 3: 答案句理解错误
        
        学生找对了答案句，但对句子含义的理解出现偏差
        可能涉及：因果关系、转折逻辑、限定条件等
        """
        # 获取学生选择的理解模板
        step3_choice = self.db.query(ReflectionChoice).filter(
            ReflectionChoice.id == self.step3_choice_id
        ).first()
        
        student_understanding = step3_choice.choice_text if step3_choice else ""
        
        # 根据 quality 判断具体问题
        if self.step3_quality == "wrong":
            error_type = "答案句理解偏差"
            issue = "对答案句的核心含义理解错误"
        else:  # unknown
            error_type = "答案句理解存在困难"
            issue = "对答案句的理解不确定，需要进一步分析"
        
        details = {
            "analysis": "学生成功定位到了答案句，但在理解句子含义时出现了偏差。",
            "student_understanding": student_understanding,
            "custom_input": self.step3_custom_input or "",
            "issue": issue,
            "possible_causes": "可能涉及：因果关系误判、转折逻辑遗漏、限定条件忽略",
            "recommendation_focus": "长难句分析、逻辑关系识别"
        }
        
        return DiagnosisResult(
            error_level="level_3",
            error_type=error_type,
            details=details
        )
    
    def _diagnose_level_4_and_5(self) -> DiagnosisResult:
        """
        Level 4 & 5: 选项理解相关
        
        Step 1-3 都正确，问题出在选项理解或比对环节
        """
        # 获取 Step 4A 和 4B 的选择
        step4a_choice = self.db.query(ReflectionChoice).filter(
            ReflectionChoice.id == self.step4a_choice_id
        ).first()
        step4b_choice = self.db.query(ReflectionChoice).filter(
            ReflectionChoice.id == self.step4b_choice_id
        ).first()
        
        # 简化判断：根据 choice_order 判断是否选择了"正确"的理解
        # 通常 choice_order 较小的是正确理解，较大的是错误理解
        step4a_is_good = step4a_choice.choice_order <= 2 if step4a_choice else False
        step4b_is_good = step4b_choice.is_correct if step4b_choice else False
        
        # Level 5: 都理解了，但仍选错
        if step4a_is_good and step4b_is_good:
            error_type = "完整理解但判断失误"
            details = {
                "analysis": "学生对答案句和选项的理解都基本正确，但在最终选择时出现了失误。",
                "issue": "可能原因：粗心、考试压力、对'最佳答案'的判断标准不清晰",
                "recommendation_focus": "答题策略训练、心理调节、排除法练习"
            }
            return DiagnosisResult(
                error_level="level_5",
                error_type=error_type,
                details=details
            )
        
        # Level 4: 选项理解有问题
        if not step4a_is_good:
            # 误判了错误选项的吸引力
            error_type = "误判错误选项吸引力"
            issue = "对错误选项的干扰性理解不足，被错误选项的表面信息吸引"
        elif not step4b_is_good:
            # 没理解正确选项
            error_type = "正确选项理解不足"
            issue = "虽然定位和理解答案句都对，但没能准确理解正确选项与原文的对应关系"
        else:
            error_type = "选项比对问题"
            issue = "选项理解存在偏差"
        
        details = {
            "analysis": "学生在定位和理解答案句上都做得不错，但在选项理解或比对环节出现了问题。",
            "step4a_understanding": step4a_choice.choice_text if step4a_choice else "",
            "step4b_understanding": step4b_choice.choice_text if step4b_choice else "",
            "issue": issue,
            "recommendation_focus": "选项分析训练、同义改写识别、干扰项特征分析"
        }
        
        return DiagnosisResult(
            error_level="level_4",
            error_type=error_type,
            details=details
        )
    
    def get_context_for_llm(self) -> dict:
        """
        准备用于 LLM prompt 的完整上下文信息
        
        Returns:
            dict: 包含所有诊断相关信息的字典
        """
        # 获取所有 choices 的文本
        step1_choice = self.db.query(ReflectionChoice).filter(
            ReflectionChoice.id == self.step1_choice_id
        ).first()
        step2_choice = self.db.query(ReflectionChoice).filter(
            ReflectionChoice.id == self.step2_choice_id
        ).first()
        step3_choice = self.db.query(ReflectionChoice).filter(
            ReflectionChoice.id == self.step3_choice_id
        ).first()
        step4a_choice = self.db.query(ReflectionChoice).filter(
            ReflectionChoice.id == self.step4a_choice_id
        ).first()
        step4b_choice = self.db.query(ReflectionChoice).filter(
            ReflectionChoice.id == self.step4b_choice_id
        ).first()
        step5_choice = self.db.query(ReflectionChoice).filter(
            ReflectionChoice.id == self.step5_choice_id
        ).first()
        
        return {
            "step1": {
                "is_correct": self.step1_is_correct,
                "selected": step1_choice.choice_text if step1_choice else ""
            },
            "step2": {
                "is_correct": self.step2_is_correct,
                "selected": step2_choice.choice_text if step2_choice else ""
            },
            "step3": {
                "quality": self.step3_quality,
                "selected": step3_choice.choice_text if step3_choice else "",
                "custom_input": self.step3_custom_input or ""
            },
            "step4a": {
                "selected": step4a_choice.choice_text if step4a_choice else ""
            },
            "step4b": {
                "selected": step4b_choice.choice_text if step4b_choice else ""
            },
            "step5": {
                "selected": step5_choice.choice_text if step5_choice else ""
            },
            "question_data": self.question_data
        }