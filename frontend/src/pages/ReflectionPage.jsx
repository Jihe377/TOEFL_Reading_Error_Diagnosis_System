import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getReflectionSteps, submitReflection } from '../services/api'
import Button from '../components/common/Button'
import NavBar from '../components/layout/NavBar'
import SubHeader from '../components/layout/SubHeader'

function ReflectionPage() {
  const { answerId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reflectionData, setReflectionData] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [showPassage, setShowPassage] = useState(false)

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
    step6_notes: '',
  })

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

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      const result = await submitReflection({
        user_answer_id: parseInt(answerId),
        ...responses,
      })
      navigate(`/diagnosis/${answerId}`, { state: { diagnosisResult: result } })
    } catch (err) {
      console.error('Failed to submit reflection:', err)
      alert('提交失败，请重试')
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1)
    else handleSubmit()
  }

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return responses.step1_choice_id !== null
      case 2: return responses.step2_choice_id !== null
      case 3: return responses.step3_choice_id !== null
      case 4: return responses.step4a_choice_id !== null && responses.step4b_choice_id !== null
      case 5: return responses.step5_choice_id !== null
      case 6: return true
      default: return false
    }
  }

  const getStepNumber = (s) => {
    if (s <= 3) return s
    if (s === 4) return null
    if (s === 5) return 6
    return null
  }

  // Shared radio choice renderer
  const renderChoices = (step, responseKey, customInputKey, borderColor = 'toefl') => {
    const selectedBorder = borderColor === 'red' ? 'border-red-400 bg-white' : borderColor === 'green' ? 'border-green-400 bg-white' : 'border-toefl-accent bg-toefl-light'
    const defaultBorder = borderColor === 'red' ? 'border-red-100 hover:border-red-300 bg-white' : borderColor === 'green' ? 'border-green-100 hover:border-green-300 bg-white' : 'border-gray-200 hover:border-toefl-accent bg-white'

    return (
      <div className="space-y-2">
        {step.choices.map((choice) => (
          <label
            key={choice.id}
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors duration-150 ${
              responses[responseKey] === choice.id ? selectedBorder : defaultBorder
            }`}
          >
            <input
              type="radio"
              className="hidden"
              name={responseKey}
              checked={responses[responseKey] === choice.id}
              onChange={() => setResponses({ ...responses, [responseKey]: choice.id })}
            />
            {/* Radio circle */}
            <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
              responses[responseKey] === choice.id
                ? borderColor === 'red' ? 'border-red-500 bg-red-500' : borderColor === 'green' ? 'border-green-500 bg-green-500' : 'border-toefl-accent bg-toefl-accent'
                : 'border-gray-400'
            }`}>
              {responses[responseKey] === choice.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </span>
            <span className="text-sm text-gray-700 leading-relaxed">{choice.choice_text}</span>
          </label>
        ))}

        {step.allow_custom_input && (
          <div className="mt-3">
            <textarea
              value={responses[customInputKey] || ''}
              onChange={(e) => setResponses({ ...responses, [customInputKey]: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-toefl-accent focus:border-transparent"
              rows="2"
              placeholder="如有其他想法，请在此补充..."
            />
          </div>
        )}
      </div>
    )
  }

  const renderStep = () => {
    if (!reflectionData) return null

    const stepNumber = getStepNumber(currentStep)
    const step = stepNumber ? reflectionData.steps.find(s => s.step_number === stepNumber) : null

    // Steps 1-3, 5
    if ([1, 2, 3, 5].includes(currentStep)) {
      if (!step) return null
      const responseKey = `step${currentStep}_choice_id`
      const customInputKey = `step${currentStep}_custom_input`

      return (
        <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
          <div>
            <p className="text-base font-bold text-gray-800 mb-1">{step.prompt_text}</p>
            {(currentStep === 1 || currentStep === 2) && (
              <p className="text-sm text-gray-500">题目：{reflectionData.question_stem}</p>
            )}
          </div>
          {renderChoices(step, responseKey, customInputKey)}
        </div>
      )
    }

    // Step 4: wrong + correct option
    if (currentStep === 4) {
      const step4a = reflectionData.steps.find(s => s.step_type === 'wrong_option_understanding')
      const step4b = reflectionData.steps.find(s => s.step_type === 'correct_option_understanding')

      return (
        <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
          <p className="text-base font-bold text-gray-800">Step 4: 选项对比分析</p>

          {/* Part A */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-xs font-bold text-red-600 uppercase mb-1">你的选择（错误）</p>
            <p className="text-sm text-gray-700 font-medium mb-3">{reflectionData.user_selected_option}</p>
            <p className="text-sm text-gray-600 mb-3">{step4a?.prompt_text}</p>
            {step4a && renderChoices(step4a, 'step4a_choice_id', 'step4a_custom_input', 'red')}
          </div>

          {/* Part B */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-xs font-bold text-green-600 uppercase mb-1">正确答案</p>
            <p className="text-sm text-gray-700 font-medium mb-3">{reflectionData.correct_option}</p>
            <p className="text-sm text-gray-600 mb-3">{step4b?.prompt_text}</p>
            {step4b && renderChoices(step4b, 'step4b_choice_id', 'step4b_custom_input', 'green')}
          </div>
        </div>
      )
    }

    // Step 6: free text
    if (currentStep === 6) {
      return (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <div>
            <p className="text-base font-bold text-gray-800 mb-1">Step 6: 补充说明</p>
            <p className="text-sm text-gray-500">还有其他想补充的吗？（选填）</p>
          </div>
          <textarea
            value={responses.step6_notes || ''}
            onChange={(e) => setResponses({ ...responses, step6_notes: e.target.value })}
            className="w-full h-32 p-4 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-toefl-accent focus:border-transparent"
            placeholder="例如：有哪些词汇或长难句影响了你的理解？"
          />
        </div>
      )
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <NavBar showBack={false} showNext={false} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-600">加载复盘流程...</div>
        </div>
      </div>
    )
  }

  if (error || !reflectionData) {
    return (
      <div className="h-screen flex flex-col">
        <NavBar onBack={() => navigate(-1)} showNext={false} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error || '数据加载失败'}</div>
            <Button onClick={() => navigate(-1)}>返回</Button>
          </div>
        </div>
      </div>
    )
  }

  const STEP_LABELS = ['定位词', '答案句', '句义理解', '选项分析', '自我诊断', '补充说明']

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Nav */}
      <NavBar
        onBack={handlePrev}
        showBack={currentStep > 1}
        showNext={false}
      />
      <SubHeader label="Reflection" questionNumber={currentStep} totalQuestions={6} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className={`mx-auto px-6 py-6 transition-all duration-300 ${showPassage ? 'max-w-6xl' : 'max-w-2xl'}`}>

          {/* Passage toggle button */}
          <div className="flex justify-start mb-4">
            <button
              onClick={() => setShowPassage(!showPassage)}
              className="text-sm text-toefl-header border border-toefl-header rounded-lg px-3 py-1.5 hover:bg-toefl-light transition-colors duration-150"
            >
              {showPassage ? '隐藏原文' : '查看原文'}
            </button>
          </div>

          <div className={`flex gap-6 items-start transition-all duration-300`}>
            {/* Passage panel */}
            {showPassage && (
              <div className="w-1/2 flex-shrink-0 bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {reflectionData.passage_content}
              </div>
            )}

            {/* Right side: stepper + card + nav */}
            <div className="flex-1 min-w-0">
              {/* Numbered circle stepper */}
              {!showPassage && (
                <div className="flex items-center mb-8">
                  {[1, 2, 3, 4, 5, 6].map((step, i) => (
                    <div key={step} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                          step < currentStep
                            ? 'bg-toefl-header text-white'
                            : step === currentStep
                            ? 'border-2 border-toefl-header text-toefl-header bg-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                          {step < currentStep ? '✓' : step}
                        </div>
                        <span className={`text-xs mt-1 whitespace-nowrap ${
                          step === currentStep ? 'text-toefl-header font-semibold' : 'text-gray-400'
                        }`}>
                          {STEP_LABELS[i]}
                        </span>
                      </div>
                      {i < 5 && (
                        <div className={`flex-1 h-0.5 mx-1 mb-4 ${step < currentStep ? 'bg-toefl-header' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Step content card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                {renderStep()}
              </div>

              {/* Navigation */}
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
                  variant="toefl"
                  className="w-36"
                >
                  {currentStep === 6 ? (submitting ? '提交中...' : '生成诊断') : '下一步 →'}
                </Button>
              </div>

              {currentStep === 6 && (
                <p className="mt-4 text-center text-sm text-gray-500">
                  点击"生成诊断"后，AI 将分析你的复盘过程并给出个性化建议
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReflectionPage
