import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getReflectionSteps, submitReflection } from '../services/api'
import Button from '../components/common/Button'

function ReflectionPage() {
  const { answerId } = useParams()
  const navigate = useNavigate()
  
  // 状态管理
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reflectionData, setReflectionData] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  
  // 用户的复盘回答
  const [responses, setResponses] = useState({
    step1_choice_id: null,
    step2_choice_id: null,
    step3_choice_id: null,
    step3_custom_input: '',
    step4a_choice_id: null,
    step4a_custom_input: '',
    step4b_choice_id: null,
    step4b_custom_input: '',
    step5_choice_id: null,
    step5_custom_input: '',
    step6_notes: ''
  })

  // 获取复盘步骤数据
  useEffect(() => {
    const fetchReflectionSteps = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getReflectionSteps(answerId)
        setReflectionData(data)
      } catch (err) {
        console.error('Failed to fetch reflection steps:', err)
        setError('加载复盘流程失败')
      } finally {
        setLoading(false)
      }
    }

    fetchReflectionSteps()
  }, [answerId])

  // 提交复盘答案
  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      const result = await submitReflection({
        user_answer_id: parseInt(answerId),
        ...responses
      })
      
      // 跳转到诊断结果页
      navigate(`/diagnosis/${answerId}`)
    } catch (err) {
      console.error('Failed to submit reflection:', err)
      alert('提交失败，请重试')
      setSubmitting(false)
    }
  }

  // 下一步
  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  // 上一步
  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // 检查当前步骤是否可以继续
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return responses.step1_choice_id !== null
      case 2:
        return responses.step2_choice_id !== null
      case 3:
        return responses.step3_choice_id !== null
      case 4:
        return responses.step4a_choice_id !== null && responses.step4b_choice_id !== null
      case 5:
        return responses.step5_choice_id !== null
      case 6:
        return true // 第6步是选填，总是可以继续
      default:
        return false
    }
  }

  // 前端步骤到数据库 step_number 的映射
  const getStepNumber = (currentStep) => {
    // currentStep 1-3 直接对应 step_number 1-3
    if (currentStep <= 3) return currentStep
    // currentStep 4 不需要单个 step（会特殊处理 4A 和 4B）
    if (currentStep === 4) return null
    // currentStep 5 对应 step_number 6（因为 step_number 4,5 是 Step 4A 和 4B）
    if (currentStep === 5) return 6
    // currentStep 6 是自由输入，没有对应的数据库记录
    if (currentStep === 6) return null
    return null
  }

  // 渲染当前步骤
  const renderStep = () => {
    if (!reflectionData) return null

    const stepNumber = getStepNumber(currentStep)
    const step = stepNumber ? reflectionData.steps.find(s => s.step_number === stepNumber) : null

    // Step 1-3, 5: 单选题
    if ([1, 2, 3, 5].includes(currentStep)) {
      if (!step) return null
      const responseKey = `step${currentStep}_choice_id`
      const customInputKey = `step${currentStep}_custom_input`
      
      return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{step.prompt_text}</h3>
            {currentStep === 1 && (
              <p className="text-sm text-gray-500">题目：{reflectionData.question_stem}</p>
            )}
          </div>
          
          <div className="space-y-3">
            {step.choices.map((choice) => (
              <label
                key={choice.id}
                className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  responses[responseKey] === choice.id
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                    : 'border-gray-200 hover:border-blue-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  className="hidden"
                  name={`step${currentStep}`}
                  checked={responses[responseKey] === choice.id}
                  onChange={() => setResponses({ ...responses, [responseKey]: choice.id })}
                />
                <span className="text-gray-700 leading-relaxed">{choice.choice_text}</span>
              </label>
            ))}
          </div>

          {/* 自定义输入框（如果该步骤允许） */}
          {step.allow_custom_input && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                补充说明（选填）：
              </label>
              <textarea
                value={responses[customInputKey] || ''}
                onChange={(e) => setResponses({ ...responses, [customInputKey]: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="如有其他想法，请在此补充..."
              />
            </div>
          )}
        </div>
      )
    }

    // Step 4: 双选题（错误选项 + 正确选项）
    if (currentStep === 4) {
      const step4a = reflectionData.steps.find(s => s.step_type === 'wrong_option_understanding')
      const step4b = reflectionData.steps.find(s => s.step_type === 'correct_option_understanding')
      
      return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Step 4: 选项对比分析</h3>
          </div>

          {/* Part A: 错误选项理解 */}
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-xs font-bold text-red-600 uppercase mb-2">你的选择（错误）</p>
            <p className="text-gray-700 font-medium mb-3">{reflectionData.user_selected_option}</p>
            <p className="text-sm text-gray-600 mb-3">{step4a?.prompt_text}</p>
            
            <div className="space-y-2">
              {step4a?.choices.map((choice) => (
                <label
                  key={choice.id}
                  className={`block p-3 rounded-lg border cursor-pointer transition-all ${
                    responses.step4a_choice_id === choice.id
                      ? 'border-red-400 bg-white'
                      : 'border-red-100 bg-red-25 hover:border-red-300'
                  }`}
                >
                  <input
                    type="radio"
                    className="hidden"
                    name="step4a"
                    checked={responses.step4a_choice_id === choice.id}
                    onChange={() => setResponses({ ...responses, step4a_choice_id: choice.id })}
                  />
                  <span className="text-sm text-gray-700">{choice.choice_text}</span>
                </label>
              ))}
            </div>

            {step4a?.allow_custom_input && (
              <textarea
                value={responses.step4a_custom_input || ''}
                onChange={(e) => setResponses({ ...responses, step4a_custom_input: e.target.value })}
                className="w-full mt-3 p-2 border border-red-200 rounded-lg text-sm"
                rows="2"
                placeholder="其他想法..."
              />
            )}
          </div>

          {/* Part B: 正确选项理解 */}
          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
            <p className="text-xs font-bold text-green-600 uppercase mb-2">正确答案</p>
            <p className="text-gray-700 font-medium mb-3">{reflectionData.correct_option}</p>
            <p className="text-sm text-gray-600 mb-3">{step4b?.prompt_text}</p>
            
            <div className="space-y-2">
              {step4b?.choices.map((choice) => (
                <label
                  key={choice.id}
                  className={`block p-3 rounded-lg border cursor-pointer transition-all ${
                    responses.step4b_choice_id === choice.id
                      ? 'border-green-400 bg-white'
                      : 'border-green-100 bg-green-25 hover:border-green-300'
                  }`}
                >
                  <input
                    type="radio"
                    className="hidden"
                    name="step4b"
                    checked={responses.step4b_choice_id === choice.id}
                    onChange={() => setResponses({ ...responses, step4b_choice_id: choice.id })}
                  />
                  <span className="text-sm text-gray-700">{choice.choice_text}</span>
                </label>
              ))}
            </div>

            {step4b?.allow_custom_input && (
              <textarea
                value={responses.step4b_custom_input || ''}
                onChange={(e) => setResponses({ ...responses, step4b_custom_input: e.target.value })}
                className="w-full mt-3 p-2 border border-green-200 rounded-lg text-sm"
                rows="2"
                placeholder="其他想法..."
              />
            )}
          </div>
        </div>
      )
    }

    // Step 6: 自由输入
    if (currentStep === 6) {
      return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Step 6: 补充说明</h3>
            <p className="text-sm text-gray-500">还有其他想补充的吗？（选填）</p>
          </div>
          
          <textarea
            value={responses.step6_notes || ''}
            onChange={(e) => setResponses({ ...responses, step6_notes: e.target.value })}
            className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="例如：有哪些词汇或长难句影响了你的理解？你在解题时有什么特殊的纠结？"
          />
        </div>
      )
    }
  }

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">加载复盘流程...</div>
      </div>
    )
  }

  // 错误状态
  if (error || !reflectionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">✖ {error || '数据加载失败'}</div>
          <Button onClick={() => navigate(-1)}>返回</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* 进度条 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">错题复盘流程</h1>
            <span className="text-sm font-semibold text-gray-500">
              Step {currentStep} / 6
            </span>
          </div>
          
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  step < currentStep
                    ? 'bg-blue-600'
                    : step === currentStep
                    ? 'bg-blue-400'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 内容卡片 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6">
          {renderStep()}
        </div>

        {/* 导航按钮 */}
        <div className="flex justify-between gap-4">
          <Button
            onClick={handlePrev}
            disabled={currentStep === 1}
            variant="secondary"
            className="w-32"
          >
            ← 上一步
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed() || submitting}
            className="w-32"
          >
            {currentStep === 6 ? (submitting ? '提交中...' : '生成诊断') : '下一步 →'}
          </Button>
        </div>

        {/* 提示信息 */}
        {currentStep === 6 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            点击"生成诊断"后，AI 将分析你的复盘过程并给出个性化建议
          </div>
        )}
      </div>
    </div>
  )
}

export default ReflectionPage