import sys
import os

# add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base, SessionLocal
from app.models.models import (
    Passage, Question, Option, ReflectionStep, 
    ReflectionChoice, User
)


def create_tables():
    """Create database tables based on the defined models."""
    print("正在创建数据库表...")
    Base.metadata.create_all(bind=engine)
    print("数据库表创建完成")


def insert_test_data():
    """Insert test data into the database."""
    db = SessionLocal()
    
    try:
        # 检查是否已有数据
        if db.query(Passage).first():
            print("测试数据已存在，跳过插入")
            return
        
        # 1. 创建文章
        passage = Passage(
            title="The Impact of Sports on Social Integration",
            content="""Sports can promote social integration by bridging gaps between people of various backgrounds. Participation in sports can lead to increased social cohesion and improved relationships among diverse groups.

For example, community soccer leagues often bring together people from different ethnicities, creating an environment where cultural differences are celebrated and mutual respect is cultivated. However, the impact of sports on social integration is not without challenges. Competitive environments can sometimes exacerbate social tensions, particularly when favoritism or exclusionary practices are present.

Despite these issues, many initiatives aim to use sports as a platform for social change. One such initiative is the sport for peace program, which focuses on conflict resolution through team-building activities and collaborative sports events. The role of sports in social integration extends beyond participation. Spectatorship and fandom also play significant roles in uniting people. Major international sports events like the olympics or the world cup serve as opportunities for nations to come together and share common goals. The visibility of athletes from diverse backgrounds during these events fosters a sense of global harmony. These events often highlight stories of athletes overcoming adversity, inspiring spectators and fostering a collective sense of achievement."""
        )
        db.add(passage)
        db.flush()  # Get passage.id
        
        # 2. Create question
        question = Question(
            passage_id=passage.id,
            question_type="factual_information",
            stem="What does the passage suggest about the sport for peace program?",
            answer_sentence="One such initiative is the sport for peace program, which focuses on conflict resolution through team-building activities and collaborative sports events."
        )
        db.add(question)
        db.flush()
        
        # 3. 创建选项
        options_data = [
            ("A", "Its main goal is to eliminate favoritism in sports.", False),
            ("B", "It primarily targets professional athletes.", False),
            ("C", "It uses team-building exercises to address conflicts.", True),
            ("D", "It is only effective in local communities.", False),
        ]
        
        correct_option = None
        # Create options and identify the correct one
        for label, text, is_correct in options_data:
            option = Option(
                question_id=question.id,
                option_label=label,
                option_text=text,
                is_correct=is_correct
            )
            db.add(option)
            if is_correct:
                db.flush()
                correct_option = option
        
        # Update question with correct option id
        question.correct_option_id = correct_option.id
        
        # 4. Create reflection steps and choices
        
        # Step 1: Word/Phrase Identification
        step1 = ReflectionStep(
            question_id=question.id,
            step_number=1,
            step_type="keyword_selection",
            prompt_text="请选择你认为的定位词：",
            allow_custom_input=False
        )
        db.add(step1)
        db.flush()
        
        step1_choices = [
            ("sport", False, 1),
            ("passage", False, 2),
            ("sport for peace program", True, 3),
            ("suggest", False, 4),
        ]
        for text, is_correct, order in step1_choices:
            db.add(ReflectionChoice(
                reflection_step_id=step1.id,
                choice_text=text,
                is_correct=is_correct,
                choice_order=order
            ))
        
        # Step 2: Answer Sentence Location
        step2 = ReflectionStep(
            question_id=question.id,
            step_number=2,
            step_type="sentence_location",
            prompt_text="请选择你认为的答案句：",
            allow_custom_input=False
        )
        db.add(step2)
        db.flush()
        
        step2_choices = [
            ("Competitive environments can sometimes exacerbate social tensions, particularly when favoritism or exclusionary practices are present.", False, 1),
            ("One such initiative is the sport for peace program, which focuses on conflict resolution through team-building activities and collaborative sports events.", True, 2),
            ("The role of sports in social integration extends beyond participation.", False, 3),
            ("以上都不是", False, 4),
        ]
        for text, is_correct, order in step2_choices:
            db.add(ReflectionChoice(
                reflection_step_id=step2.id,
                choice_text=text,
                is_correct=is_correct,
                choice_order=order
            ))
        
        # Step 3: Answer Sentence Understanding
        step3 = ReflectionStep(
            question_id=question.id,
            step_number=3,
            step_type="sentence_understanding",
            prompt_text="请选择最接近你理解的选项：",
            allow_custom_input=True
        )
        db.add(step3)
        db.flush()
        
        step3_choices = [
            ("这个项目旨在消除体育中的偏袒现象", False, 1),
            ("这个项目专注于团队建设活动", False, 2),
            ("这个项目通过团队建设活动来解决冲突", True, 3),
            ("以上都不对，我的理解是：", False, 4),
        ]
        for text, is_correct, order in step3_choices:
            db.add(ReflectionChoice(
                reflection_step_id=step3.id,
                choice_text=text,
                is_correct=is_correct,
                choice_order=order
            ))
        
        # Step 4A: 错误选项理解
        step4a = ReflectionStep(
            question_id=question.id,
            step_number=4,
            step_type="wrong_option_understanding",
            prompt_text="你选择了选项 A，请选择最接近你当时理解的选项：",
            allow_custom_input=True
        )
        db.add(step4a)
        db.flush()
        
        step4a_choices = [
            ("我认为文章重点讨论了 favoritism 问题，所以 A 是答案", False, 1),
            ("我认为 sport for peace program 就是为了消除 favoritism", False, 2),
            ("我混淆了 sport for peace program 和文章提到的另一个内容", False, 3),
            ("以上都不对，我的理解是：", False, 4),
        ]
        for text, is_correct, order in step4a_choices:
            db.add(ReflectionChoice(
                reflection_step_id=step4a.id,
                choice_text=text,
                is_correct=is_correct,
                choice_order=order
            ))
        
        # Step 4B: 正确选项理解
        step4b = ReflectionStep(
            question_id=question.id,
            step_number=5,
            step_type="correct_option_understanding",
            prompt_text="正确答案是选项 C，请选择最接近你现在理解的选项：",
            allow_custom_input=True
        )
        db.add(step4b)
        db.flush()
        
        step4b_choices = [
            ("这个项目的核心是团队建设", False, 1),
            ("这个项目通过团队建设活动来解决冲突", True, 2),
            ("这个项目只在特定社区有效", False, 3),
            ("我还是不太理解为什么 C 是对的：", False, 4),
        ]
        for text, is_correct, order in step4b_choices:
            db.add(ReflectionChoice(
                reflection_step_id=step4b.id,
                choice_text=text,
                is_correct=is_correct,
                choice_order=order
            ))
        
        # Step 5: 错误原因初判
        step5 = ReflectionStep(
            question_id=question.id,
            step_number=6,
            step_type="self_diagnosis",
            prompt_text="回顾你的解题过程，你认为主要错在：",
            allow_custom_input=True
        )
        db.add(step5)
        db.flush()
        
        step5_choices = [
            ("定位句找错了", False, 1),
            ("答案句理解不对", False, 2),
            ("选项主干内容不明确", False, 3),
            ("选项细节信息理解错误", False, 4),
            ("其他：", False, 5),
        ]
        for text, is_correct, order in step5_choices:
            db.add(ReflectionChoice(
                reflection_step_id=step5.id,
                choice_text=text,
                is_correct=is_correct,
                choice_order=order
            ))
        
        # 5. 创建测试用户
        user = User(username="test_student", email="test@example.com")
        db.add(user)
        
        db.commit()
        print("测试数据插入完成")
        
    except Exception as e:
        db.rollback()
        print(f"错误: {e}")
        raise
    finally:
        db.close()


def verify_data():
    """验证数据是否正确插入"""
    db = SessionLocal()
    
    try:
        passage_count = db.query(Passage).count()
        question_count = db.query(Question).count()
        option_count = db.query(Option).count()
        step_count = db.query(ReflectionStep).count()
        choice_count = db.query(ReflectionChoice).count()
        user_count = db.query(User).count()
        
        print("\n数据库统计：")
        print(f"  - passages: {passage_count} 条")
        print(f"  - questions: {question_count} 条")
        print(f"  - options: {option_count} 条")
        print(f"  - reflection_steps: {step_count} 条")
        print(f"  - reflection_choices: {choice_count} 条")
        print(f"  - users: {user_count} 条")
        
    finally:
        db.close()


if __name__ == "__main__":
    create_tables()
    insert_test_data()
    verify_data()
    print("\n数据库初始化完成！")