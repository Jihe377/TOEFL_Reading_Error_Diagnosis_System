import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getQuestions } from '../services/api'

const QUESTION_TYPES = [
  { value: 'factual_and_negative_factual', label: 'Factual / Negative Factual' },
  { value: 'vocabulary', label: 'Vocabulary' },
  { value: 'select_the_sentence', label: 'Select the Sentence' },
  { value: 'sentence_simplification', label: 'Sentence Simplification' },
  { value: 'reference', label: 'Reference' },
  { value: 'inference', label: 'Inference' },
  { value: 'rhetorical_purpose', label: 'Rhetorical Purpose' },
  { value: 'insert_text', label: 'Insert Text' },
]

const TYPE_COLORS = [
  'border-teal-500 hover:bg-teal-50 text-teal-700',
  'border-blue-500 hover:bg-blue-50 text-blue-700',
  'border-violet-500 hover:bg-violet-50 text-violet-700',
  'border-orange-500 hover:bg-orange-50 text-orange-700',
  'border-rose-500 hover:bg-rose-50 text-rose-700',
  'border-amber-500 hover:bg-amber-50 text-amber-700',
  'border-emerald-500 hover:bg-emerald-50 text-emerald-700',
  'border-cyan-500 hover:bg-cyan-50 text-cyan-700',
]

export default function PracticePage() {
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedType) return
    setLoading(true)
    getQuestions(null, selectedType)
      .then(setQuestions)
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false))
  }, [selectedType])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-teal-700 text-white px-8 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/')} className="text-teal-200 hover:text-white text-sm">← 返回</button>
        <span className="text-xl font-bold tracking-wide">*toefl ibt</span>
        <span className="text-teal-200 text-sm">开始练习</span>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {/* Question type grid */}
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">选择题型</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {QUESTION_TYPES.map((qt, i) => (
            <button
              key={qt.value}
              onClick={() => setSelectedType(qt.value)}
              className={`border-2 rounded-xl px-4 py-3 text-sm font-medium text-left transition-colors bg-white ${TYPE_COLORS[i]} ${
                selectedType === qt.value ? 'ring-2 ring-offset-1 ring-current' : ''
              }`}
            >
              {qt.label}
            </button>
          ))}
        </div>

        {/* Question list */}
        {selectedType && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {QUESTION_TYPES.find(t => t.value === selectedType)?.label} 题目
            </h2>

            {loading && <p className="text-gray-400 text-sm">加载中…</p>}

            {!loading && questions.length === 0 && (
              <p className="text-gray-400 text-sm">该题型暂无题目</p>
            )}

            {!loading && questions.length > 0 && (
              <div className="space-y-2">
                {questions.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => navigate(`/question/${q.id}`)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-left hover:border-violet-400 hover:bg-violet-50 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-gray-700 leading-relaxed line-clamp-2 group-hover:text-gray-900">
                        {q.stem}
                      </p>
                      <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">ID {q.id}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
