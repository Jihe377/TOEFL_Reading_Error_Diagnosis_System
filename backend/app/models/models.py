from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Passage(Base):
    '''
    Docstring for Passage
    '''
    __tablename__ = "passages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    questions = relationship("Question", back_populates="passage")

class Question(Base):
    """
    Docstring for Question
    """

    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    passage_id = Column(Integer, ForeignKey("passages.id"), nullable=False)
    question_type = Column(String(50), nullable=False)  # "factual_information"
    stem = Column(Text, nullable=False)
    correct_option_id = Column(Integer)  
    answer_sentence = Column(Text) 
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    passage = relationship("Passage", back_populates="questions")
    options = relationship("Option", back_populates="question")
    reflection_steps = relationship("ReflectionStep", back_populates="question")
    user_answers = relationship("UserAnswer", back_populates="question")

class Option(Base):
    """
    Docstring for Option
    """
    __tablename__ = "options"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    option_label = Column(String(1), nullable=False)  # "A", "B", "C", "D"
    option_text = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False)
    
    # Relationships
    question = relationship("Question", back_populates="options")    

class ReflectionStep(Base):
    """
    Docstring for ReflectionStep
    """
    __tablename__ = "reflection_steps"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    step_number = Column(Integer, nullable=False)  # 1-6
    step_type = Column(String(50), nullable=False)
    # Type: "keyword_selection", "sentence_location", 
    #       "sentence_understanding", "wrong_option_understanding",
    #       "correct_option_understanding", "self_diagnosis", "additional_notes"
    prompt_text = Column(Text, nullable=False)
    allow_custom_input = Column(Boolean, default=False)
    
    # Relationships
    question = relationship("Question", back_populates="reflection_steps")
    choices = relationship("ReflectionChoice", back_populates="reflection_step")

class ReflectionChoice(Base):
    """
    Docstring for ReflectionChoice
    """
    __tablename__ = "reflection_choices"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    reflection_step_id = Column(Integer, ForeignKey("reflection_steps.id"), nullable=False)
    choice_text = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False)
    choice_order = Column(Integer)
    
    # Relationships
    reflection_step = relationship("ReflectionStep", back_populates="choices")

class User(Base):
    """
    Docstring for User
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), nullable=False, unique=True)
    email = Column(String(200))
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    answers = relationship("UserAnswer", back_populates="user")

class UserAnswer(Base):
    """
    Docstring for UserAnswer
    """

    __tablename__ = "user_answers"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    selected_option_id = Column(Integer, ForeignKey("options.id"), nullable=False)
    is_correct = Column(Boolean, nullable=False)
    needs_reflection = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="answers")
    question = relationship("Question", back_populates="user_answers")
    selected_option = relationship("Option")
    reflection_response = relationship("ReflectionResponse", back_populates="user_answer", uselist=False)

class ReflectionResponse(Base):
    """
    Docstring for ReflectionResponse
    """

    __tablename__ = "reflection_responses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_answer_id = Column(Integer, ForeignKey("user_answers.id"), nullable=False, unique=True)
    
    # Step 1: keyword_selection
    step1_choice_id = Column(Integer, ForeignKey("reflection_choices.id"))
    step1_is_correct = Column(Boolean)
    
    # Step 2: sentence_location
    step2_choice_id = Column(Integer, ForeignKey("reflection_choices.id"))
    step2_is_correct = Column(Boolean)
    
    # Step 3: sentence_understanding
    step3_choice_id = Column(Integer, ForeignKey("reflection_choices.id"))
    step3_custom_input = Column(Text)
    step3_quality = Column(String(20))  # "correct", "partial", "wrong"
    
    # Step 4A: wrong_option_understanding
    step4a_choice_id = Column(Integer, ForeignKey("reflection_choices.id"))
    step4a_custom_input = Column(Text)
    
    # Step 4B: correct_option_understanding
    step4b_choice_id = Column(Integer, ForeignKey("reflection_choices.id"))
    step4b_custom_input = Column(Text)
    
    # Step 5: self_diagnosis
    step5_choice_id = Column(Integer, ForeignKey("reflection_choices.id"))
    step5_custom_input = Column(Text)
    
    # Step 6: additional_notes
    step6_notes = Column(Text)
    
    # outcome of the reflection
    rule_error_level = Column(String(20))  # "level_1" ~ "level_5"
    rule_error_type = Column(String(100))
    
    # LLM feedback
    llm_explanation = Column(Text)
    llm_suggestion = Column(Text)
    
    created_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime)
    
    # Relationships
    user_answer = relationship("UserAnswer", back_populates="reflection_response")