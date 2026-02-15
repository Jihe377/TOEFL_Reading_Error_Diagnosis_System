from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import (
    Passage, Question, Option, ReflectionStep, 
    ReflectionChoice, User, UserAnswer, ReflectionResponse
)
from app.api.schemas import (
    QuestionOut, OptionOut, AnswerSubmit, AnswerResult,
    ReflectionStepsOut, ReflectionStepOut, ReflectionChoiceOut,
    ReflectionSubmit, DiagnosisOut
)

from app.services.rule_engine import ErrorDiagnoser
from app.services.gemini_service import generate_diagnosis_explanation

router = APIRouter(prefix="/api", tags=["api"])


@router.get("/questions/{question_id}", response_model=QuestionOut)
def get_question(question_id: int, db: Session = Depends(get_db)):
    '''
    Docstring for get_question
    
    :param question_id: Description
    :type question_id: int
    :param db: Description
    :type db: Session
    '''
    
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="题目不存在")
    
    passage = db.query(Passage).filter(Passage.id == question.passage_id).first()
    options = db.query(Option).filter(Option.question_id == question_id).all()
    
    return QuestionOut(
        id=question.id,
        question_type=question.question_type,
        stem=question.stem,
        passage_title=passage.title,
        passage_content=passage.content,
        options=[OptionOut.model_validate(opt) for opt in options]
    )


@router.post("/answers", response_model=AnswerResult)
def submit_answer(answer: AnswerSubmit, db: Session = Depends(get_db)):
    """
    Docstring for submit_answer
    param answer: Description
    type answer: AnswerSubmit
    param db: Description
    type db: Session
    return: Description
    """
    
    user = db.query(User).filter(User.id == answer.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    question = db.query(Question).filter(Question.id == answer.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="题目不存在")
    
    correct_option = db.query(Option).filter(
        Option.question_id == answer.question_id,
        Option.is_correct == True
    ).first()
    
    selected_option = db.query(Option).filter(Option.id == answer.selected_option_id).first()
    if not selected_option:
        raise HTTPException(status_code=404, detail="选项不存在")
    
    is_correct = (answer.selected_option_id == correct_option.id)
    needs_reflection = not is_correct
    
    # 保存答题记录
    user_answer = UserAnswer(
        user_id=answer.user_id,
        question_id=answer.question_id,
        selected_option_id=answer.selected_option_id,
        is_correct=is_correct,
        needs_reflection=needs_reflection
    )
    db.add(user_answer)
    db.commit()
    db.refresh(user_answer)
    
    # 返回结果
    if is_correct:
        message = "回答正确！"
    else:
        message = f"回答错误。正确答案是 {correct_option.option_label}。请进入复盘流程。"
    
    return AnswerResult(
        user_answer_id=user_answer.id,
        is_correct=is_correct,
        correct_option_label=correct_option.option_label,
        needs_reflection=needs_reflection,
        message=message
    )


@router.get("/reflections/{user_answer_id}", response_model=ReflectionStepsOut)
def get_reflection_steps(user_answer_id: int, db: Session = Depends(get_db)):
    """获取复盘步骤和选项"""
    
    # 获取答题记录
    user_answer = db.query(UserAnswer).filter(UserAnswer.id == user_answer_id).first()
    if not user_answer:
        raise HTTPException(status_code=404, detail="答题记录不存在")
    
    if not user_answer.needs_reflection:
        raise HTTPException(status_code=400, detail="该题回答正确，无需复盘")
    
    # 获取题目信息
    question = db.query(Question).filter(Question.id == user_answer.question_id).first()
    
    # 获取用户选择的选项和正确选项
    selected_option = db.query(Option).filter(Option.id == user_answer.selected_option_id).first()
    correct_option = db.query(Option).filter(
        Option.question_id == question.id,
        Option.is_correct == True
    ).first()
    
    # 获取复盘步骤
    steps = db.query(ReflectionStep).filter(
        ReflectionStep.question_id == question.id
    ).order_by(ReflectionStep.step_number).all()
    
    steps_out = []
    for step in steps:
        choices = db.query(ReflectionChoice).filter(
            ReflectionChoice.reflection_step_id == step.id
        ).order_by(ReflectionChoice.choice_order).all()
        
        steps_out.append(ReflectionStepOut(
            id=step.id,
            step_number=step.step_number,
            step_type=step.step_type,
            prompt_text=step.prompt_text,
            allow_custom_input=step.allow_custom_input,
            choices=[ReflectionChoiceOut.model_validate(c) for c in choices]
        ))
    
    return ReflectionStepsOut(
        question_id=question.id,
        question_stem=question.stem,
        user_selected_option=f"{selected_option.option_label}: {selected_option.option_text}",
        correct_option=f"{correct_option.option_label}: {correct_option.option_text}",
        steps=steps_out
    )


# 提交复盘回答
@router.post("/reflections", response_model=DiagnosisOut)
def submit_reflection(reflection: ReflectionSubmit, db: Session = Depends(get_db)):
    """提交复盘回答，返回诊断结果"""
    
    # 验证答题记录存在
    user_answer = db.query(UserAnswer).filter(UserAnswer.id == reflection.user_answer_id).first()
    if not user_answer:
        raise HTTPException(status_code=404, detail="答题记录不存在")
    
    # 检查是否已经提交过复盘
    existing = db.query(ReflectionResponse).filter(
        ReflectionResponse.user_answer_id == reflection.user_answer_id
    ).first()
    if existing:
        db.delete(existing)
        db.commit()
        print(f"⚠️ 覆盖已有的复盘记录 (user_answer_id={reflection.user_answer_id})")
    
    # 判断各步骤的正误
    step1_choice = db.query(ReflectionChoice).filter(ReflectionChoice.id == reflection.step1_choice_id).first()
    step2_choice = db.query(ReflectionChoice).filter(ReflectionChoice.id == reflection.step2_choice_id).first()
    step3_choice = db.query(ReflectionChoice).filter(ReflectionChoice.id == reflection.step3_choice_id).first()
    
    step1_is_correct = step1_choice.is_correct if step1_choice else False
    step2_is_correct = step2_choice.is_correct if step2_choice else False
    
    # Step 3 理解质量判断
    if step3_choice and step3_choice.is_correct:
        step3_quality = "correct"
    elif step3_choice and step3_choice.choice_order == 4:  # "以上都不对"
        step3_quality = "unknown"
    else:
        step3_quality = "wrong"
        
    # 获取题目完整上下文（用于规则引擎和 LLM）
    question = db.query(Question).filter(Question.id == user_answer.question_id).first()
    passage = db.query(Passage).filter(Passage.id == question.passage_id).first()
    selected_option = db.query(Option).filter(Option.id == user_answer.selected_option_id).first()
    correct_option = db.query(Option).filter(
        Option.question_id == question.id,
        Option.is_correct == True
    ).first()
    
    question_data = {
        "stem": question.stem,
        "passage_content": passage.content,
        "correct_answer": f"{correct_option.option_label}: {correct_option.option_text}",
        "user_answer": f"{selected_option.option_label}: {selected_option.option_text}"
    }
    
    # 规则引擎诊断
    diagnoser = ErrorDiagnoser(
        db=db,
        step1_is_correct=step1_is_correct,
        step1_choice_id=reflection.step1_choice_id,
        step2_is_correct=step2_is_correct,
        step2_choice_id=reflection.step2_choice_id,
        step3_quality=step3_quality,
        step3_choice_id=reflection.step3_choice_id,
        step3_custom_input=reflection.step3_custom_input,
        step4a_choice_id=reflection.step4a_choice_id,
        step4b_choice_id=reflection.step4b_choice_id,
        step5_choice_id=reflection.step5_choice_id,
        question_data=question_data
    )
    
    # 执行诊断
    diagnosis_result = diagnoser.diagnose()
    rule_error_level = diagnosis_result.error_level
    rule_error_type = diagnosis_result.error_type
        
    # LLM 生成个性化解释和建议    
    llm_context = diagnoser.get_context_for_llm()
    llm_explanation, llm_suggestion = generate_diagnosis_explanation(
        error_level=rule_error_level,
        error_type=rule_error_type,
        rule_details=diagnosis_result.details,
        question_data=question_data,
        user_responses=llm_context
    )

    # 获取每个步骤的学生选择和正确答案（用于前端对比展示）
    # Step 1: 定位词识别
    step1_student_choice_obj = db.query(ReflectionChoice).filter(
        ReflectionChoice.id == reflection.step1_choice_id
    ).first()
    step1_correct_choice = db.query(ReflectionChoice).filter(
        ReflectionChoice.reflection_step_id == step1_student_choice_obj.reflection_step_id,
        ReflectionChoice.is_correct == True
    ).first()
    
    step1_student_choice = step1_student_choice_obj.choice_text if step1_student_choice_obj else ""
    step1_correct_answer = step1_correct_choice.choice_text if step1_correct_choice else "未找到正确答案"
    
    # Step 2: 答案句定位
    step2_student_choice_obj = db.query(ReflectionChoice).filter(
        ReflectionChoice.id == reflection.step2_choice_id
    ).first()
    step2_correct_choice = db.query(ReflectionChoice).filter(
        ReflectionChoice.reflection_step_id == step2_student_choice_obj.reflection_step_id,
        ReflectionChoice.is_correct == True
    ).first()
    
    step2_student_choice = step2_student_choice_obj.choice_text if step2_student_choice_obj else ""
    step2_correct_answer = step2_correct_choice.choice_text if step2_correct_choice else "未找到正确答案"
    
    # Step 3: 答案句理解
    step3_student_choice_obj = db.query(ReflectionChoice).filter(
        ReflectionChoice.id == reflection.step3_choice_id
    ).first()
    step3_correct_choice = db.query(ReflectionChoice).filter(
        ReflectionChoice.reflection_step_id == step3_student_choice_obj.reflection_step_id,
        ReflectionChoice.is_correct == True
    ).first()
    
    step3_student_understanding = step3_student_choice_obj.choice_text if step3_student_choice_obj else ""
    step3_correct_understanding = step3_correct_choice.choice_text if step3_correct_choice else "未找到正确答案"
    

    
    # 保存复盘记录
    response = ReflectionResponse(
        user_answer_id=reflection.user_answer_id,
        step1_choice_id=reflection.step1_choice_id,
        step1_is_correct=step1_is_correct,
        step2_choice_id=reflection.step2_choice_id,
        step2_is_correct=step2_is_correct,
        step3_choice_id=reflection.step3_choice_id,
        step3_custom_input=reflection.step3_custom_input,
        step3_quality=step3_quality,
        step4a_choice_id=reflection.step4a_choice_id,
        step4a_custom_input=reflection.step4a_custom_input,
        step4b_choice_id=reflection.step4b_choice_id,
        step4b_custom_input=reflection.step4b_custom_input,
        step5_choice_id=reflection.step5_choice_id,
        step5_custom_input=reflection.step5_custom_input,
        step6_notes=reflection.step6_notes,
        rule_error_level=rule_error_level,
        rule_error_type=rule_error_type,
        llm_explanation=llm_explanation,
        llm_suggestion=llm_suggestion
    )
    db.add(response)
    db.commit()

    correct_option = db.query(Option).filter(
        Option.question_id == question.id,
        Option.is_correct == True
    ).first()
    
    return DiagnosisOut(
        user_answer_id=reflection.user_answer_id,
        
        # Step 1 对比
        step1_is_correct=step1_is_correct,
        step1_student_choice=step1_student_choice,
        step1_correct_answer=step1_correct_answer,
        
        # Step 2 对比
        step2_is_correct=step2_is_correct,
        step2_student_choice=step2_student_choice,
        step2_correct_answer=step2_correct_answer,
        
        # Step 3 对比
        step3_quality=step3_quality,
        step3_student_understanding=step3_student_understanding,
        step3_correct_understanding=step3_correct_understanding,
        
        # 诊断结果
        rule_error_level=rule_error_level,
        rule_error_type=rule_error_type,
        llm_explanation=llm_explanation,
        llm_suggestion=llm_suggestion
    )
