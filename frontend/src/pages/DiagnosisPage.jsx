import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import NavBar from '../components/layout/NavBar'
import { getDiagnosis } from '../services/api'

const LEVEL_STYLES = {
  level_1: { pill: 'bg-red-100 text-red-700 border border-red-300',    bar: 'border-l-red-500' },
  level_2: { pill: 'bg-orange-100 text-orange-700 border border-orange-300', bar: 'border-l-orange-500' },
  level_3: { pill: 'bg-yellow-100 text-yellow-700 border border-yellow-300', bar: 'border-l-yellow-500' },
  level_4: { pill: 'bg-blue-100 text-blue-700 border border-blue-300',   bar: 'border-l-blue-500' },
  level_5: { pill: 'bg-green-100 text-green-700 border border-green-300', bar: 'border-l-green-500' },
}

function StepCompareCard({ stepLabel, isCorrect, quality, studentText, correctText }) {
  const correct = isCorrect !== undefined ? isCorrect : quality === 'correct'
  const borderColor = correct ? 'border-l-green-500' : 'border-l-red-500'
  const statusText = quality
    ? (quality === 'correct' ? '正确' : quality === 'wrong' ? '错误' : '部分理解')
    : (correct ? '正确' : '错误')
  const statusColor = correct ? 'text-green-600' : quality === 'unknown' ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className={`bg-white border border-gray-200 rounded-xl border-l-4 ${borderColor} overflow-hidden`}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-700">{stepLabel}</span>
        <span className={`text-sm font-medium ${statusColor}`}>{statusText}</span>
      </div>
      <div className="grid grid-cols-2 divide-x divide-gray-100">
        <div className="px-5 py-4">
          <p className="text-xs text-gray-400 mb-1">你的选择</p>
          <p className="text-sm text-gray-800 leading-relaxed">{studentText || '—'}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs text-gray-400 mb-1">正确答案</p>
          <p className="text-sm text-green-800 leading-relaxed font-medium">{correctText || '—'}</p>
        </div>
      </div>
    </div>
  )
}

function DiagnosisPage() {
  const { answerId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [diagnosis, setDiagnosis] = useState(location.state?.diagnosisResult || null)
  const [loading, setLoading] = useState(!diagnosis)

  useEffect(() => {
    if (!diagnosis) {
      getDiagnosis(answerId)
        .then(data => setDiagnosis(data))
        .catch(() => setDiagnosis(null))
        .finally(() => setLoading(false))
    }
  }, [answerId, diagnosis])

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <NavBar showBack={false} showNext={false} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-600">加载诊断结果...</div>
        </div>
      </div>
    )
  }

  if (!diagnosis) {
    return (
      <div className="h-screen flex flex-col">
        <NavBar onBack={() => navigate(-1)} showNext={false} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">诊断结果不存在</div>
            <button onClick={() => navigate(-1)} className="text-toefl-header underline text-sm">返回</button>
          </div>
        </div>
      </div>
    )
  }

  const level = diagnosis.rule_error_level
  const levelStyle = LEVEL_STYLES[level] || { pill: 'bg-gray-100 text-gray-600 border border-gray-300', bar: 'border-l-gray-400' }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <NavBar
        onBack={() => navigate(-1)}
        onNext={diagnosis.next_question_id ? () => navigate(`/question/${diagnosis.next_question_id}`) : undefined}
        backLabel="< Back"
        nextLabel="Try Next"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-5">

          {/* Title row + error level badge */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">错题诊断报告</h1>
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${levelStyle.pill}`}>
              {diagnosis.rule_error_type}
            </span>
          </div>

          {/* Step comparison cards */}
          <div className="space-y-3">
            <StepCompareCard
              stepLabel="Step 1 — 定位词识别"
              isCorrect={diagnosis.step1_is_correct}
              studentText={diagnosis.step1_student_choice}
              correctText={diagnosis.step1_correct_answer}
            />
            <StepCompareCard
              stepLabel="Step 2 — 答案句定位"
              isCorrect={diagnosis.step2_is_correct}
              studentText={diagnosis.step2_student_choice}
              correctText={diagnosis.step2_correct_answer}
            />
            <StepCompareCard
              stepLabel="Step 3 — 答案句理解"
              quality={diagnosis.step3_quality}
              studentText={diagnosis.step3_student_understanding}
              correctText={diagnosis.step3_correct_understanding}
            />
          </div>

          {/* AI explanation */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">AI 错因分析</h2>
            <p className="text-gray-800 leading-relaxed text-sm">{diagnosis.llm_explanation}</p>
          </div>

          {/* Suggestion */}
          <div className="bg-toefl-light border border-toefl-header/20 rounded-xl p-5">
            <h2 className="text-sm font-bold text-toefl-header mb-3 uppercase tracking-wide">改进建议</h2>
            <p className="text-gray-800 leading-relaxed text-sm">{diagnosis.llm_suggestion}</p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default DiagnosisPage
