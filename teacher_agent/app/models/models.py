from sqlalchemy import (
    Boolean, Column, Integer, String, Float,
    DateTime, Text, JSON
)
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from app.core.database import Base


class Document(Base):
    """
    Uploaded source file (PDF / Word). MD5 hash prevents duplicate processing.
    """
    __tablename__ = "documents"

    id           = Column(Integer, primary_key=True, autoincrement=True)
    filename     = Column(String(200), nullable=False)
    source_hash  = Column(String(32), nullable=False, unique=True)  # MD5
    reading_type = Column(String(50))   # "academic" / "daily" / "vocabulary_fill"
    uploaded_at  = Column(DateTime, server_default=func.now())
    processed    = Column(Boolean, default=False)


class QuestionClassification(Base):
    """
    Classifier + QA Validator output per question.
    question_id references the shared questions table in the student app.
    No FK constraint intentionally — cross-app boundary.
    """
    __tablename__ = "question_classifications"

    id            = Column(Integer, primary_key=True, autoincrement=True)
    question_id   = Column(Integer, nullable=False)   # → student app questions.id
    question_type = Column(String(50), nullable=False) # "factual_information", etc.
    confidence    = Column(Float, nullable=False)
    reasoning     = Column(Text)           # shown to teacher in review queue
    validated_by  = Column(String(20), default="ai_auto")
    # "ai_auto" | "ai_review" | "teacher"
    needs_human   = Column(Boolean, default=False)
    teacher_note  = Column(Text)
    created_at    = Column(DateTime, server_default=func.now())


class SolvingStrategy(Base):
    """
    Teacher-authored solving framework per question type, versioned.
    Only one version per question_type has is_current=True at any time.
    """
    __tablename__ = "solving_strategies"

    id            = Column(Integer, primary_key=True, autoincrement=True)
    question_type = Column(String(50), nullable=False)  # "factual_information"
    version       = Column(String(20), nullable=False)  # "v1", "v2", ...
    steps         = Column(JSON, nullable=False)         # ["step 1 text", ...]
    created_by    = Column(String(50), default="teacher")
    is_current    = Column(Boolean, default=True)
    created_at    = Column(DateTime, server_default=func.now())


class Card(Base):
    """
    Knowledge card produced by the pipeline per question.
    Links back to the student app's questions table via question_id (no FK).
    """
    __tablename__ = "cards"

    id               = Column(Integer, primary_key=True, autoincrement=True)
    question_id      = Column(Integer, nullable=False)   # → student app questions.id
    question_type    = Column(String(50), nullable=False)
    strategy_version = Column(String(20), nullable=False)
    knowledge_points = Column(JSON, nullable=False)
    solving_steps    = Column(JSON, nullable=False)
    error_patterns   = Column(JSON, nullable=False)
    difficulty       = Column(String(20), nullable=False)  # "easy/medium/hard"
    difficulty_reason = Column(Text)
    source_ref       = Column(Text)
    similar_q_ids    = Column(JSON, default=list)
    card_markdown    = Column(Text)
    created_at       = Column(DateTime, server_default=func.now())
    updated_at       = Column(DateTime, server_default=func.now())


class QuestionTypeDefinition(Base):
    """
    Vector knowledge base for Classifier Agent (pgvector similarity search).
    Seeded once with the 9 TOEFL reading question types.
    """
    __tablename__ = "question_type_definitions"

    id          = Column(Integer, primary_key=True, autoincrement=True)
    type_name   = Column(String(50), nullable=False)   # "factual_information"
    description = Column(Text, nullable=False)
    keywords    = Column(JSON)
    embedding   = Column(Vector(1536))                 # text-embedding-3-small dim