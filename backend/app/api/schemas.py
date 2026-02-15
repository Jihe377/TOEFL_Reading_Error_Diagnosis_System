from pydantic import BaseModel
from typing import Optional 
from datetime import datetime

class OptionOut(BaseModel):
    id:int
    option_label: str
    option_text: str
    is_correct: bool

    class Config:
        from_attributes = True

class QuestionOut(BaseModel):
    id: int
    question_type: str
    stem: str
    passage_title: str
    passage_content: str
    options: list[OptionOut]
    
    class Config:
        from_attributes = True

class AnswerSubmit(BaseModel):
    """Submit answer payload"""
    user_id: int
    question_id: int
    selected_option_id: int


class AnswerResult(BaseModel):
    """Answer result response format"""
    user_answer_id: int
    is_correct: bool
    correct_option_label: str
    needs_reflection: bool
    message: str

class ReflectionChoiceOut(BaseModel):
    id: int
    choice_text: str
    choice_order: int
    
    class Config:
        from_attributes = True

class ReflectionStepOut(BaseModel):
    id: int
    step_number: int
    step_type: str
    prompt_text: str
    allow_custom_input: bool
    choices: list[ReflectionChoiceOut]
    
    class Config:
        from_attributes = True

class ReflectionStepsOut(BaseModel):
    """Reflection steps for a question"""
    question_id: int
    question_stem: str
    user_selected_option: str
    correct_option: str
    steps: list[ReflectionStepOut]

class ReflectionSubmit(BaseModel):
    """Submit reflection responses"""
    user_answer_id: int
    
    step1_choice_id: int
    step2_choice_id: int
    step3_choice_id: int
    step3_custom_input: Optional[str] = None
    step4a_choice_id: int
    step4a_custom_input: Optional[str] = None
    step4b_choice_id: int
    step4b_custom_input: Optional[str] = None
    step5_choice_id: int
    step5_custom_input: Optional[str] = None
    step6_notes: Optional[str] = None


class DiagnosisOut(BaseModel):
    """Diagnosis result for a user answer"""
    user_answer_id: int
    
    step1_is_correct: bool
    step1_student_choice: str          
    step1_correct_answer: str 

    step2_is_correct: bool
    step2_student_choice: str          
    step2_correct_answer: str

    step3_quality: str                 
    step3_student_understanding: str   
    step3_correct_understanding: str  
    
    rule_error_level: str
    rule_error_type: str
    
    llm_explanation: str
    llm_suggestion: str


    class Config:
        from_attributes = True