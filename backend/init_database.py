import sys
import os

# add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base
import app.models.models  # noqa: F401 — registers all models with Base metadata


def create_tables():
    """Create all database tables based on the defined models."""
    print("正在创建数据库表...")
    Base.metadata.create_all(bind=engine)
    print("数据库表创建完成")


if __name__ == "__main__":
    create_tables()
    print("\n数据库初始化完成！运行 seed_questions.py 以导入题目数据。")
