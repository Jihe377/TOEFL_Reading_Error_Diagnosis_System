import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getQuestion, submitAnswer } from '../services/api'
import Button from '../components/common/Button'
import OptionItem from '../components/common/OptionItem'
import NavBar from '../components/layout/NavBar'
import SubHeader from '../components/layout/SubHeader'

const TOTAL_QUESTIONS = 6

function QuestionPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOptionId, setSelectedOptionId] = useState(null)
  const [answerResult, setAnswerResult] = useState(null)
  const [userAnswerId, setUserAnswerId] = useState(null)

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true)
        setError(null)
        setSelectedOptionId(null)
        setAnswerResult(null)
        const data = await getQuestion(id)
        setQuestion(data)
      } catch (err) {
        console.error('Failed to fetch question:', err)
        setError('加载题目失败')
      } finally {
        setLoading(false)
      }
    }
    fetchQuestion()
  }, [id])

  const handleSubmitAnswer = async () => {
    if (!selectedOptionId) return
    try {
      const result = await submitAnswer({
        user_id: 1,
        question_id: parseInt(id),
        selected_option_id: selectedOptionId,
      })
      setAnswerResult(result)
      setUserAnswerId(result.user_answer_id)
    } catch (err) {
      console.error('Failed to submit answer:', err)
      alert('提交答案失败，请重试')
    }
  }

  const handleStartReflection = () => navigate(`/reflection/${userAnswerId}`)
  const handleNextQuestion = () => navigate(`/question/${parseInt(id) + 1}`)
  const handleBack = () => { if (parseInt(id) > 1) navigate(`/question/${parseInt(id) - 1}`) }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-600">加载中...</div></div>
  }

  if (error || !question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error || '题目不存在'}</div>
          <Button onClick={() => navigate('/question/1')}>返回首页</Button>
        </div>
      </div>
    )
  }

  const correctOption = question.options.find(opt => opt.is_correct)

  return (
    <div className="h-screen flex flex-col bg-white">
      <NavBar
        onBack={handleBack}
        onNext={answerResult?.is_correct ? handleNextQuestion : undefined}
        showBack={parseInt(id) > 1}
        showNext={!!answerResult?.is_correct}
        nextLabel="Next >"
      />
      <SubHeader
        questionType={question.question_type}
        questionNumber={parseInt(id)}
        totalQuestions={TOTAL_QUESTIONS}
      />

      {/* Passage title — full width, centered */}
      <div className="bg-white border-b border-gray-200 py-4 px-8 text-center flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">{question.passage_title}</h1>
      </div>

      {/* Split panel */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: passage */}
        <div className="w-1/2 overflow-y-auto border-r border-gray-300 bg-white">
          <div className="px-10 py-6">
            <p className="text-gray-800 leading-relaxed text-[15px] whitespace-pre-wrap">
              {question.passage_content}
            </p>
          </div>
        </div>

        {/* Right: question + options */}
        <div className="w-1/2 overflow-y-auto bg-white">
          <div className="px-10 py-6 flex flex-col h-full">

            <p className="text-base font-bold text-gray-900 mb-6 leading-snug">
              {question.stem}
            </p>

            <div className="flex-1 space-y-1">
              {question.options.map((option) => {
                const isThisCorrect = correctOption?.id === option.id
                const isThisSelected = selectedOptionId === option.id
                const isWrong = answerResult && isThisSelected && !isThisCorrect
                const isCorrect = answerResult && isThisCorrect
                return (
                  <OptionItem
                    key={option.id}
                    option={option}
                    isSelected={isThisSelected}
                    isCorrect={isCorrect}
                    isWrong={isWrong}
                    showResult={!!answerResult}
                    onClick={() => setSelectedOptionId(option.id)}
                    disabled={!!answerResult}
                  />
                )
              })}
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-auto">
              {!answerResult && (
                <Button variant="toefl" onClick={handleSubmitAnswer} disabled={!selectedOptionId}>
                  提交答案
                </Button>
              )}
              {answerResult?.is_correct && (
                <Button variant="toefl" onClick={handleNextQuestion}>下一题 →</Button>
              )}
              {answerResult && !answerResult.is_correct && (
                <Button variant="toefl" onClick={handleStartReflection}>开始复盘 →</Button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionPage
