import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getQuestion, submitAnswer } from '../services/api'
import Button from '../components/common/Button'
import OptionItem from '../components/common/OptionItem'

function QuestionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // 状态管理
  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOptionId, setSelectedOptionId] = useState(null)
  const [answerResult, setAnswerResult] = useState(null)
  const [userAnswerId, setUserAnswerId] = useState(null)

  // 获取题目数据
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

  // 提交答案
  const handleSubmitAnswer = async () => {
    if (!selectedOptionId) return

    try {
      const result = await submitAnswer({
        user_id: 1,  // 硬编码用户 ID，实际项目中应该从认证系统获取
        question_id: parseInt(id),
        selected_option_id: selectedOptionId
      })
      
      setAnswerResult(result)
      setUserAnswerId(result.user_answer_id)
    } catch (err) {
      console.error('Failed to submit answer:', err)
      alert('提交答案失败，请重试')
    }
  }

  // 开始复盘
  const handleStartReflection = () => {
    navigate(`/reflection/${userAnswerId}`)
  }

  // 下一题
  const handleNextQuestion = () => {
    const nextId = parseInt(id) + 1
    navigate(`/question/${nextId}`)
  }

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">加载中...</div>
      </div>
    )
  }

  // 错误状态
  if (error || !question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">❌ {error || '题目不存在'}</div>
          <Button onClick={() => navigate('/question/1')}>返回首页</Button>
        </div>
      </div>
    )
  }

  // 找出正确选项
  const correctOption = question.options.find(opt => opt.is_correct)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 左右分栏布局 */}
      <div className="flex h-screen">
        
        {/* 左侧：文章展示区 */}
        <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {question.passage_title}
            </h1>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {question.passage_content}
              </p>
            </div>
          </div>
        </div>

        {/* 右侧：答题区 */}
        <div className="w-1/2 bg-gray-50 overflow-y-auto">
          <div className="p-8">
            
            {/* 题目题干 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase tracking-wide">
                  {question.question_type}
                </span>
                <span className="text-gray-400 text-xs font-mono">
                  Question #{id}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 leading-relaxed">
                {question.stem}
              </h3>
            </div>

            {/* 选项列表 */}
            <div className="space-y-3 mb-6">
              {question.options.map((option) => {
                    const isThisCorrectOption = correctOption?.id === option.id
                    const isThisSelectedOption = selectedOptionId === option.id

                    const isWrong = answerResult && isThisSelectedOption && !isThisCorrectOption
                    const isCorrect = answerResult && isThisCorrectOption

                    console.log(question.options[0])
                    
                    return(
                        <OptionItem
                        key={option.id}
                        option={option}
                        isSelected={isThisSelectedOption}
                        isCorrect={isCorrect}
                        isWrong={isWrong}
                        showResult={!!answerResult}
                        onClick={() => setSelectedOptionId(option.id)}
                        disabled={!!answerResult}
                        />
                    )
                })}
            </div>

            {/* 操作按钮区 */}
            <div className="flex justify-end gap-4">
              {!answerResult && (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOptionId}
                  className="w-full"
                >
                  提交答案
                </Button>
              )}

              {answerResult && answerResult.is_correct &&(
                <Button 
                    onClick={handleNextQuestion}
                    className="w-full bg-green-600 hover:bg-green-700">
                    下一题 →
                </Button>
                )}

              {answerResult && !answerResult.is_correct && (
                    <Button 
                        onClick={handleStartReflection}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      开始复盘 →
                    </Button>
                  )}
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default QuestionPage