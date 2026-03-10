"""
seed_questions.py — Add 5 more TOEFL factual_information questions across 3 new passages.

Passages:
  Passage 2: Mycorrhizal Fungi in Forest Ecosystems       (2 questions)
  Passage 3: Writing Systems in the Ancient World         (2 questions)
  Passage 4: The Psychology of Flow States                (1 question)

Run:
    cd backend && python seed_questions.py
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base, SessionLocal
from app.models.models import (
    Passage, Question, Option, ReflectionStep,
    ReflectionChoice, User,
)


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def add_question(db, passage_id, stem, answer_sentence, options_data,
                 step1_choices, step2_choices, step3_choices,
                 step4_choices, step5_choices, step6_choices):
    """
    Insert one question + 4 options + 6 reflection steps + their choices.

    options_data : list of (label, text, is_correct)
    stepN_choices: list of (text, is_correct, order)
    """
    # 1. Question
    question = Question(
        passage_id=passage_id,
        question_type="factual_information",
        stem=stem,
        answer_sentence=answer_sentence,
    )
    db.add(question)
    db.flush()

    # 2. Options
    correct_option = None
    for label, text, is_correct in options_data:
        opt = Option(question_id=question.id, option_label=label,
                     option_text=text, is_correct=is_correct)
        db.add(opt)
        if is_correct:
            db.flush()
            correct_option = opt

    question.correct_option_id = correct_option.id

    # 3. Reflection steps
    steps_spec = [
        (1, "keyword_selection",            "请选择你认为的定位词：",                         False, step1_choices),
        (2, "sentence_location",            "请选择你认为的答案句：",                         False, step2_choices),
        (3, "sentence_understanding",       "请选择最接近你对答案句理解的选项：",              True,  step3_choices),
        (4, "wrong_option_understanding",   "请选择最接近你当时选择错误选项的理由：",          True,  step4_choices),
        (5, "correct_option_understanding", "正确答案是：请选择最接近你现在理解的选项：",      True,  step5_choices),
        (6, "self_diagnosis",               "回顾你的解题过程，你认为主要错在：",              True,  step6_choices),
    ]

    for step_number, step_type, prompt_text, allow_custom_input, choices in steps_spec:
        step = ReflectionStep(
            question_id=question.id,
            step_number=step_number,
            step_type=step_type,
            prompt_text=prompt_text,
            allow_custom_input=allow_custom_input,
        )
        db.add(step)
        db.flush()
        for text, is_correct, order in choices:
            db.add(ReflectionChoice(
                reflection_step_id=step.id,
                choice_text=text,
                is_correct=is_correct,
                choice_order=order,
            ))

    return question


# ---------------------------------------------------------------------------
# Data definitions
# ---------------------------------------------------------------------------

PASSAGES = [
    # -----------------------------------------------------------------------
    # Passage 2 — Mycorrhizal Fungi in Forest Ecosystems
    # -----------------------------------------------------------------------
    {
        "title": "Mycorrhizal Fungi in Forest Ecosystems",
        "content": (
            "In forest ecosystems, mycorrhizal fungi form symbiotic relationships with the roots "
            "of most plant species. These underground networks, often called the 'wood wide web,' "
            "allow trees to exchange nutrients, water, and chemical signals across vast distances. "
            "Through these fungal connections, older, larger trees—sometimes called 'mother trees'—"
            "can transfer carbon and nitrogen to younger seedlings growing in shaded conditions "
            "where photosynthesis is limited.\n\n"
            "Research has shown that trees connected to mycorrhizal networks recover more quickly "
            "from environmental stresses such as drought and disease. When one tree in a network "
            "is attacked by insects, it can send chemical warning signals through the fungal "
            "threads to neighboring trees, which then increase their own defensive compound "
            "production in response.\n\n"
            "Experimental studies have demonstrated that seedlings planted in sterilized soil "
            "lacking mycorrhizal fungi show significantly stunted growth compared to seedlings "
            "in natural forest soil. These isolated seedlings also fail to develop the root "
            "architecture needed to efficiently absorb phosphorus and other minerals. However, "
            "when fungal spores are reintroduced to the sterilized soil, seedling growth rates "
            "recover to near-normal levels within several weeks."
        ),
        "questions": [
            # Q2-1
            {
                "stem": "According to the passage, what is one benefit of mycorrhizal networks for trees under environmental stress?",
                "answer_sentence": (
                    "When one tree in a network is attacked by insects, it can send chemical warning "
                    "signals through the fungal threads to neighboring trees, which then increase "
                    "their own defensive compound production in response."
                ),
                "options": [
                    ("A", "They increase the rate of photosynthesis in shaded conditions.", False),
                    ("B", "They allow trees to send warning signals that trigger neighboring trees' defenses.", True),
                    ("C", "They help trees absorb more sunlight during drought periods.", False),
                    ("D", "They eliminate the need for trees to produce their own nutrients.", False),
                ],
                "step1_choices": [
                    ("environmental stress", True, 1),
                    ("mycorrhizal networks", False, 2),
                    ("benefit", False, 3),
                    ("trees", False, 4),
                ],
                "step2_choices": [
                    ("Through these fungal connections, older, larger trees can transfer carbon and nitrogen to younger seedlings.", False, 1),
                    ("When one tree in a network is attacked by insects, it can send chemical warning signals through the fungal threads to neighboring trees, which then increase their own defensive compound production in response.", True, 2),
                    ("Research has shown that trees connected to mycorrhizal networks recover more quickly from environmental stresses such as drought and disease.", False, 3),
                    ("以上都不是", False, 4),
                ],
                "step3_choices": [
                    ("真菌网络使树木在干旱期间能更好地进行光合作用", False, 1),
                    ("通过真菌网络，受到昆虫攻击的树木能向邻近树木发送化学警报，使其增加防御物质", True, 2),
                    ("菌根网络帮助树木避免受到任何形式的攻击", False, 3),
                    ("以上都不对，我的理解是：", False, 4),
                ],
                "step4_choices": [
                    ("我看到选项中有文章里出现的词，就认为它正确", False, 1),
                    ("我误解了问题中的关键词", False, 2),
                    ("我混淆了文章中两个相近的概念", False, 3),
                    ("以上都不对，我的理由是：", False, 4),
                ],
                "step5_choices": [
                    ("菌根帮助树木直接抵御干旱", False, 1),
                    ("受攻击的树木通过真菌网络发出化学信号，邻近树木因此提高防御物质的产量", True, 2),
                    ("菌根让树木之间共享光合作用产生的能量", False, 3),
                    ("我还不太理解为什么选项 B 是对的：", False, 4),
                ],
                "step6_choices": [
                    ("定位词找错了", False, 1),
                    ("答案句定位不准确", False, 2),
                    ("答案句理解错误", False, 3),
                    ("选项含义理解偏差", False, 4),
                    ("其他：", False, 5),
                ],
            },
            # Q2-2
            {
                "stem": "According to the passage, what happens to seedlings planted in sterilized soil?",
                "answer_sentence": (
                    "Experimental studies have demonstrated that seedlings planted in sterilized soil "
                    "lacking mycorrhizal fungi show significantly stunted growth compared to seedlings "
                    "in natural forest soil."
                ),
                "options": [
                    ("A", "They develop stronger root systems than seedlings in natural soil.", False),
                    ("B", "They cannot survive even if fungal spores are later added to the soil.", False),
                    ("C", "They show noticeably reduced growth in comparison to seedlings in natural soil.", True),
                    ("D", "They produce more defensive compounds than seedlings in fungal-rich soil.", False),
                ],
                "step1_choices": [
                    ("sterilized soil", True, 1),
                    ("seedlings", False, 2),
                    ("mycorrhizal fungi", False, 3),
                    ("natural forest soil", False, 4),
                ],
                "step2_choices": [
                    ("These isolated seedlings also fail to develop the root architecture needed to efficiently absorb phosphorus and other minerals.", False, 1),
                    ("Experimental studies have demonstrated that seedlings planted in sterilized soil lacking mycorrhizal fungi show significantly stunted growth compared to seedlings in natural forest soil.", True, 2),
                    ("When fungal spores are reintroduced to the sterilized soil, seedling growth rates recover to near-normal levels within several weeks.", False, 3),
                    ("以上都不是", False, 4),
                ],
                "step3_choices": [
                    ("种在无菌土壤中的幼苗比普通土壤中的幼苗生长更快", False, 1),
                    ("实验表明，缺乏菌根真菌的无菌土壤中的幼苗生长明显受阻", True, 2),
                    ("无菌土壤中的幼苗无法存活", False, 3),
                    ("以上都不对，我的理解是：", False, 4),
                ],
                "step4_choices": [
                    ("我把'stunted growth'误理解为'无法存活'", False, 1),
                    ("我混淆了再加入孢子后的恢复情况和初始状态", False, 2),
                    ("我认为'sterilized'意味着幼苗会死亡", False, 3),
                    ("以上都不对，我的理由是：", False, 4),
                ],
                "step5_choices": [
                    ("幼苗在无菌土壤中完全无法存活", False, 1),
                    ("无菌土壤中的幼苗与天然土壤中的相比生长明显更为迟缓", True, 2),
                    ("无菌土壤中的幼苗会产生更多防御化合物", False, 3),
                    ("我还不太理解为什么选项 C 是对的：", False, 4),
                ],
                "step6_choices": [
                    ("定位词找错了", False, 1),
                    ("答案句定位不准确", False, 2),
                    ("答案句理解错误", False, 3),
                    ("选项含义理解偏差", False, 4),
                    ("其他：", False, 5),
                ],
            },
        ],
    },

    # -----------------------------------------------------------------------
    # Passage 3 — Writing Systems in the Ancient World
    # -----------------------------------------------------------------------
    {
        "title": "The Development of Writing Systems in the Ancient World",
        "content": (
            "The earliest writing systems emerged independently in several regions of the ancient "
            "world, beginning around 3200 BCE in Mesopotamia. Sumerian cuneiform, the oldest known "
            "writing system, was initially developed not for literary or religious expression but "
            "primarily to record economic transactions—tracking grain shipments, livestock "
            "inventories, and labor obligations for the emerging city-states.\n\n"
            "Over centuries, cuneiform evolved from simple pictographic symbols representing "
            "concrete objects into an abstract system capable of expressing complex ideas, verb "
            "tenses, and grammatical relationships. By 2500 BCE, it was being used to record "
            "laws, hymns, and mythological narratives. The script was eventually adapted by "
            "neighboring cultures, including the Akkadians, Babylonians, and Assyrians, each "
            "modifying the symbols to suit their own languages.\n\n"
            "The Phoenician alphabet, developed around 1050 BCE, represented a significant "
            "simplification: instead of hundreds of symbols, it used only 22 consonantal letters. "
            "Merchants and traders spread this alphabet throughout the Mediterranean world. The "
            "Greeks later adapted it by adding vowel symbols, creating the direct ancestor of "
            "modern European writing systems. This demonstrates how writing systems can cross "
            "linguistic and cultural boundaries through commercial rather than military or "
            "political channels."
        ),
        "questions": [
            # Q3-1
            {
                "stem": "According to the passage, what was the original purpose of Sumerian cuneiform writing?",
                "answer_sentence": (
                    "Sumerian cuneiform, the oldest known writing system, was initially developed "
                    "not for literary or religious expression but primarily to record economic "
                    "transactions—tracking grain shipments, livestock inventories, and labor "
                    "obligations for the emerging city-states."
                ),
                "options": [
                    ("A", "To record religious ceremonies and preserve sacred hymns.", False),
                    ("B", "To document economic and administrative transactions.", True),
                    ("C", "To preserve mythological narratives for future generations.", False),
                    ("D", "To facilitate long-distance communication between city-states.", False),
                ],
                "step1_choices": [
                    ("original purpose", True, 1),
                    ("Sumerian cuneiform", False, 2),
                    ("writing", False, 3),
                    ("developed", False, 4),
                ],
                "step2_choices": [
                    ("Over centuries, cuneiform evolved from simple pictographic symbols into an abstract system capable of expressing complex ideas.", False, 1),
                    ("Sumerian cuneiform, the oldest known writing system, was initially developed not for literary or religious expression but primarily to record economic transactions.", True, 2),
                    ("By 2500 BCE, it was being used to record laws, hymns, and mythological narratives.", False, 3),
                    ("以上都不是", False, 4),
                ],
                "step3_choices": [
                    ("楔形文字最初用于记录宗教仪式和神话故事", False, 1),
                    ("楔形文字最初主要用于记录经济交易，如粮食运输和劳动义务，而非文学或宗教用途", True, 2),
                    ("楔形文字最初用于城邦之间的远程通信", False, 3),
                    ("以上都不对，我的理解是：", False, 4),
                ],
                "step4_choices": [
                    ("我看到文章提到了宗教和文学，就以为这是最初目的", False, 1),
                    ("我混淆了楔形文字后来的用途和最初的用途", False, 2),
                    ("我对'originally'这个关键词不够重视", False, 3),
                    ("以上都不对，我的理由是：", False, 4),
                ],
                "step5_choices": [
                    ("楔形文字最初是为了宗教目的而发明的", False, 1),
                    ("楔形文字最初是为了记录经济事务而发展起来的，不是文学或宗教", True, 2),
                    ("楔形文字一开始就能表达复杂的语法关系", False, 3),
                    ("我还不太理解为什么选项 B 是对的：", False, 4),
                ],
                "step6_choices": [
                    ("定位词找错了", False, 1),
                    ("答案句定位不准确", False, 2),
                    ("答案句理解错误", False, 3),
                    ("选项含义理解偏差", False, 4),
                    ("其他：", False, 5),
                ],
            },
            # Q3-2
            {
                "stem": "According to the passage, how did the Phoenician alphabet spread throughout the Mediterranean world?",
                "answer_sentence": (
                    "Merchants and traders spread this alphabet throughout the Mediterranean world."
                ),
                "options": [
                    ("A", "Through military conquest and territorial expansion.", False),
                    ("B", "Through the activities of merchants and traders.", True),
                    ("C", "Through formal diplomatic agreements between nations.", False),
                    ("D", "Through the political influence of Phoenician rulers.", False),
                ],
                "step1_choices": [
                    ("Phoenician alphabet spread", True, 1),
                    ("Mediterranean world", False, 2),
                    ("alphabet", False, 3),
                    ("how", False, 4),
                ],
                "step2_choices": [
                    ("The Phoenician alphabet, developed around 1050 BCE, represented a significant simplification: instead of hundreds of symbols, it used only 22 consonantal letters.", False, 1),
                    ("Merchants and traders spread this alphabet throughout the Mediterranean world.", True, 2),
                    ("The Greeks later adapted it by adding vowel symbols, creating the direct ancestor of modern European writing systems.", False, 3),
                    ("以上都不是", False, 4),
                ],
                "step3_choices": [
                    ("腓尼基字母通过军事征服传播到地中海世界", False, 1),
                    ("商人和贸易者将腓尼基字母传播到整个地中海地区", True, 2),
                    ("腓尼基字母通过希腊人的改造后才得以传播", False, 3),
                    ("以上都不对，我的理解是：", False, 4),
                ],
                "step4_choices": [
                    ("我认为'spread'在历史背景下通常意味着军事扩张", False, 1),
                    ("我混淆了腓尼基字母传播的方式和希腊人改造字母的内容", False, 2),
                    ("我没有注意到文章最后一句关于'commercial channels'的内容", False, 3),
                    ("以上都不对，我的理由是：", False, 4),
                ],
                "step5_choices": [
                    ("腓尼基字母通过战争传播", False, 1),
                    ("商人和贸易者是腓尼基字母在地中海地区传播的主要媒介", True, 2),
                    ("腓尼基字母是通过政治外交手段传播的", False, 3),
                    ("我还不太理解为什么选项 B 是对的：", False, 4),
                ],
                "step6_choices": [
                    ("定位词找错了", False, 1),
                    ("答案句定位不准确", False, 2),
                    ("答案句理解错误", False, 3),
                    ("选项含义理解偏差", False, 4),
                    ("其他：", False, 5),
                ],
            },
        ],
    },

    # -----------------------------------------------------------------------
    # Passage 4 — The Psychology of Flow States
    # -----------------------------------------------------------------------
    {
        "title": "The Psychology of Flow States",
        "content": (
            "The concept of 'flow'—a state of complete absorption in a challenging activity—was "
            "first systematically studied by psychologist Mihaly Csikszentmihalyi in the 1970s. "
            "People who experience flow describe a sense of effortless action, heightened focus, "
            "and a distorted perception of time, often reporting that hours seemed to pass in "
            "minutes. Athletes call this being 'in the zone'; musicians describe it as playing "
            "where the notes seem to emerge automatically.\n\n"
            "For a flow state to occur, there must be a precise balance between the difficulty of "
            "a task and the skill level of the person performing it. If a task is too easy "
            "relative to one's abilities, boredom results; if it is too difficult, anxiety and "
            "frustration arise. Flow emerges only in the narrow range where challenge slightly "
            "exceeds current skill, providing just enough difficulty to require full engagement "
            "without overwhelming the performer.\n\n"
            "Research indicates that individuals who frequently experience flow states report "
            "significantly higher levels of overall life satisfaction and psychological well-being. "
            "Companies and educational institutions have begun applying flow principles to "
            "workplace design and curriculum planning, attempting to structure tasks so that "
            "employees and students are more likely to experience this productive state. However, "
            "critics note that not all high-performance states are equivalent to flow, and that "
            "the absence of self-consciousness characteristic of flow may not always be desirable "
            "or achievable in collaborative settings."
        ),
        "questions": [
            # Q4-1
            {
                "stem": "According to the passage, what specific condition is necessary for a flow state to occur?",
                "answer_sentence": (
                    "For a flow state to occur, there must be a precise balance between the "
                    "difficulty of a task and the skill level of the person performing it."
                ),
                "options": [
                    ("A", "The task must be extremely difficult in order to maximize mental engagement.", False),
                    ("B", "The person must possess an exceptionally high level of skill in the activity.", False),
                    ("C", "There must be a close balance between the difficulty of the task and the person's skill level.", True),
                    ("D", "The person must have prior experience achieving flow states in the same activity.", False),
                ],
                "step1_choices": [
                    ("condition", True, 1),
                    ("flow state occur", False, 2),
                    ("necessary", False, 3),
                    ("specific", False, 4),
                ],
                "step2_choices": [
                    ("People who experience flow describe a sense of effortless action, heightened focus, and a distorted perception of time.", False, 1),
                    ("For a flow state to occur, there must be a precise balance between the difficulty of a task and the skill level of the person performing it.", True, 2),
                    ("Flow emerges only in the narrow range where challenge slightly exceeds current skill.", False, 3),
                    ("以上都不是", False, 4),
                ],
                "step3_choices": [
                    ("心流状态发生需要任务难度极高", False, 1),
                    ("心流状态的产生需要任务难度与个人技能水平之间达到精确的平衡", True, 2),
                    ("心流状态发生要求个人技能水平远超任务难度", False, 3),
                    ("以上都不对，我的理解是：", False, 4),
                ],
                "step4_choices": [
                    ("我认为高度参与等于任务要非常困难", False, 1),
                    ("我把'balance'误理解为技能水平要很高", False, 2),
                    ("我混淆了心流状态的条件和心流状态本身的描述", False, 3),
                    ("以上都不对，我的理由是：", False, 4),
                ],
                "step5_choices": [
                    ("心流发生要求任务极其困难", False, 1),
                    ("心流发生需要任务难度与个人技能水平之间的精确平衡——挑战略高于当前技能", True, 2),
                    ("心流只在个人技能远超任务难度时才会出现", False, 3),
                    ("我还不太理解为什么选项 C 是对的：", False, 4),
                ],
                "step6_choices": [
                    ("定位词找错了", False, 1),
                    ("答案句定位不准确", False, 2),
                    ("答案句理解错误", False, 3),
                    ("选项含义理解偏差", False, 4),
                    ("其他：", False, 5),
                ],
            },
        ],
    },
]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def seed():
    db = SessionLocal()
    try:
        total_questions = 0
        for passage_data in PASSAGES:
            # Check if this passage already exists
            existing = db.query(Passage).filter(
                Passage.title == passage_data["title"]
            ).first()
            if existing:
                print(f"⚠️  已存在，跳过: {passage_data['title']}")
                continue

            # Create passage
            passage = Passage(
                title=passage_data["title"],
                content=passage_data["content"],
            )
            db.add(passage)
            db.flush()
            print(f"✅ 创建文章: {passage_data['title']} (id={passage.id})")

            for q_data in passage_data["questions"]:
                add_question(
                    db=db,
                    passage_id=passage.id,
                    stem=q_data["stem"],
                    answer_sentence=q_data["answer_sentence"],
                    options_data=q_data["options"],
                    step1_choices=q_data["step1_choices"],
                    step2_choices=q_data["step2_choices"],
                    step3_choices=q_data["step3_choices"],
                    step4_choices=q_data["step4_choices"],
                    step5_choices=q_data["step5_choices"],
                    step6_choices=q_data["step6_choices"],
                )
                total_questions += 1
                print(f"   ✅ 添加题目: {q_data['stem'][:60]}…")

        db.commit()
        print(f"\n数据导入完成！新增题目: {total_questions} 道")

        # Summary
        from app.models.models import Question as Q, Option as O, ReflectionStep as RS, ReflectionChoice as RC
        print("\n数据库统计：")
        print(f"  - passages: {db.query(Passage).count()} 条")
        print(f"  - questions: {db.query(Q).count()} 条")
        print(f"  - options: {db.query(O).count()} 条")
        print(f"  - reflection_steps: {db.query(RS).count()} 条")
        print(f"  - reflection_choices: {db.query(RC).count()} 条")

    except Exception as e:
        db.rollback()
        print(f"❌ 错误: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()