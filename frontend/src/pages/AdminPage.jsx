import { useState, useEffect } from 'react'
import {
  getExamSets, createExamSet,
  getPassages, createPassage,
  getQuestions, createQuestion,
} from '../services/api'

const PASSAGE_TYPES = [
  { value: 'complete_the_words', label: 'Complete the Words' },
  { value: 'read_in_daily_life', label: 'Read in Daily Life' },
  { value: 'read_an_academic_passage', label: 'Read an Academic Passage' },
]

const QUESTION_TYPES = [
  { value: 'factual_and_negative_factual', label: 'Factual / Negative Factual (EXCEPT)' },
  { value: 'vocabulary', label: 'Vocabulary' },
  { value: 'select_the_sentence', label: 'Select the Sentence' },
  { value: 'sentence_simplification', label: 'Sentence Simplification' },
  { value: 'reference', label: 'Reference' },
  { value: 'inference', label: 'Inference' },
  { value: 'rhetorical_purpose', label: 'Rhetorical Purpose' },
  { value: 'insert_text', label: 'Insert Text' },
]

const LABELS = ['A', 'B', 'C', 'D']

function emptyOptions() {
  return LABELS.map((label) => ({ option_label: label, option_text: '', is_correct: false }))
}

// ── Sub-forms ─────────────────────────────────────────────────────────────────

function ExamSetForm({ onCreated }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return setError('名称不能为空')
    setSaving(true)
    setError('')
    try {
      const result = await createExamSet({ name: name.trim(), description: desc.trim() || null })
      setName('')
      setDesc('')
      onCreated(result)
    } catch {
      setError('创建失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">新建机经集</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">名称 *</label>
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="例如：机经一"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">描述（可选）</label>
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="例如：2026年3月机经"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg"
      >
        {saving ? '创建中…' : '创建机经集'}
      </button>
    </form>
  )
}

function PassageForm({ examSetId, onCreated }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [passageType, setPassageType] = useState('read_an_academic_passage')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return setError('标题不能为空')
    if (!content.trim()) return setError('正文不能为空')
    setSaving(true)
    setError('')
    try {
      const result = await createPassage({ title: title.trim(), content: content.trim(), passage_type: passageType, exam_set_id: examSetId })
      setTitle('')
      setContent('')
      onCreated(result)
    } catch {
      setError('创建失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">新建文章</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">文章类型 *</label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          value={passageType}
          onChange={(e) => setPassageType(e.target.value)}
        >
          {PASSAGE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="文章标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">正文 *</label>
        <textarea
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          rows={10}
          placeholder="粘贴文章正文…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg"
      >
        {saving ? '创建中…' : '创建文章'}
      </button>
    </form>
  )
}

function QuestionForm({ passageId, onCreated }) {
  const [questionType, setQuestionType] = useState('factual_and_negative_factual')
  const [stem, setStem] = useState('')
  const [answerSentence, setAnswerSentence] = useState('')
  const [options, setOptions] = useState(emptyOptions())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function setOptionText(index, text) {
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, option_text: text } : o)))
  }

  function setCorrect(index) {
    setOptions((prev) => prev.map((o, i) => ({ ...o, is_correct: i === index })))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!stem.trim()) return setError('题干不能为空')
    if (options.some((o) => !o.option_text.trim())) return setError('每个选项都必须填写')
    if (!options.some((o) => o.is_correct)) return setError('请选择正确答案')
    setSaving(true)
    try {
      const result = await createQuestion({
        passage_id: passageId,
        question_type: questionType,
        stem: stem.trim(),
        answer_sentence: answerSentence.trim() || null,
        options: options.map((o) => ({ ...o, option_text: o.option_text.trim() })),
      })
      setStem('')
      setAnswerSentence('')
      setOptions(emptyOptions())
      setSuccess(`题目已创建（ID: ${result.id}）`)
      onCreated(result)
    } catch {
      setError('创建失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-800">新建题目</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">题型 *</label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value)}
        >
          {QUESTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">题干 *</label>
        <textarea
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          rows={3}
          placeholder="输入题目题干…"
          value={stem}
          onChange={(e) => setStem(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">答案句（可选）</label>
        <textarea
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          rows={2}
          placeholder="原文中含有答案的句子（可留空）"
          value={answerSentence}
          onChange={(e) => setAnswerSentence(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">选项（点击字母标记正确答案）*</label>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={opt.option_label} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCorrect(i)}
                className={`w-8 h-8 rounded-full text-sm font-bold flex-shrink-0 border-2 transition-colors ${
                  opt.is_correct
                    ? 'bg-teal-600 border-teal-600 text-white'
                    : 'border-gray-300 text-gray-500 hover:border-teal-400'
                }`}
              >
                {opt.option_label}
              </button>
              <input
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder={`选项 ${opt.option_label}`}
                value={opt.option_text}
                onChange={(e) => setOptionText(i, e.target.value)}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">点击字母圆圈标记该选项为正确答案</p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-teal-600 text-sm font-medium">{success}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg"
      >
        {saving ? '保存中…' : '保存题目'}
      </button>
    </form>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [examSets, setExamSets] = useState([])
  const [selectedExamSet, setSelectedExamSet] = useState(null)
  const [passages, setPassages] = useState([])
  const [selectedPassage, setSelectedPassage] = useState(null)
  const [questions, setQuestions] = useState([])
  // panel: 'new-set' | 'new-passage' | 'new-question' | null
  const [panel, setPanel] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getExamSets()
      .then(setExamSets)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function selectExamSet(es) {
    setSelectedExamSet(es)
    setSelectedPassage(null)
    setQuestions([])
    setPanel('new-passage')
    const list = await getPassages(es.id).catch(() => [])
    setPassages(list)
  }

  async function selectPassage(p) {
    setSelectedPassage(p)
    setPanel('new-question')
    const list = await getQuestions(p.id).catch(() => [])
    setQuestions(list)
  }

  function handleExamSetCreated(es) {
    setExamSets((prev) => [...prev, es])
    selectExamSet(es)
  }

  function handlePassageCreated(p) {
    setPassages((prev) => [...prev, p])
    selectPassage(p)
  }

  function handleQuestionCreated(q) {
    setQuestions((prev) => [...prev, q])
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-teal-700 text-white px-6 py-4 flex items-center gap-4">
        <span className="text-xl font-bold tracking-wide">*toefl ibt</span>
        <span className="text-teal-200 text-sm">管理后台 — 题库录入</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-gray-100">
            <button
              onClick={() => { setSelectedExamSet(null); setSelectedPassage(null); setPanel('new-set') }}
              className="w-full text-left text-sm font-medium text-teal-700 hover:text-teal-900 flex items-center gap-2"
            >
              <span className="text-lg leading-none">+</span> 新建机经集
            </button>
          </div>

          {loading && <p className="text-xs text-gray-400 p-4">加载中…</p>}

          {examSets.map((es) => (
            <div key={es.id}>
              <button
                onClick={() => selectExamSet(es)}
                className={`w-full text-left px-4 py-3 text-sm font-medium border-b border-gray-100 flex items-center justify-between transition-colors ${
                  selectedExamSet?.id === es.id
                    ? 'bg-teal-50 text-teal-800'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{es.name}</span>
                {es.description && (
                  <span className="text-xs text-gray-400 truncate ml-2">{es.description}</span>
                )}
              </button>

              {selectedExamSet?.id === es.id && passages.map((p) => (
                <button
                  key={p.id}
                  onClick={() => selectPassage(p)}
                  className={`w-full text-left pl-8 pr-4 py-2 text-xs border-b border-gray-50 transition-colors ${
                    selectedPassage?.id === p.id
                      ? 'bg-teal-100 text-teal-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p.title}
                  {selectedPassage?.id === p.id && questions.length > 0 && (
                    <span className="ml-1 text-gray-400">({questions.length}题)</span>
                  )}
                </button>
              ))}

              {selectedExamSet?.id === es.id && (
                <button
                  onClick={() => { setSelectedPassage(null); setPanel('new-passage') }}
                  className="w-full text-left pl-8 pr-4 py-2 text-xs text-teal-600 hover:text-teal-800 border-b border-gray-50"
                >
                  + 新建文章
                </button>
              )}
            </div>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Breadcrumb */}
          {(selectedExamSet || selectedPassage) && (
            <div className="text-xs text-gray-400 mb-6 flex items-center gap-1">
              {selectedExamSet && <span className="text-gray-600 font-medium">{selectedExamSet.name}</span>}
              {selectedPassage && (
                <>
                  <span>/</span>
                  <span className="text-gray-600 font-medium">{selectedPassage.title}</span>
                </>
              )}
            </div>
          )}

          {/* Question list (when a passage is selected) */}
          {selectedPassage && questions.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                已有题目 ({questions.length})
              </h3>
              <div className="space-y-2">
                {questions.map((q) => (
                  <div key={q.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm">
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs rounded px-2 py-0.5 mr-2">
                      {QUESTION_TYPES.find((t) => t.value === q.question_type)?.label ?? q.question_type}
                    </span>
                    <span className="text-gray-700">{q.stem}</span>
                    <span className="ml-2 text-xs text-gray-400">ID: {q.id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Forms */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
            {panel === 'new-set' && (
              <ExamSetForm onCreated={handleExamSetCreated} />
            )}
            {panel === 'new-passage' && selectedExamSet && (
              <PassageForm examSetId={selectedExamSet.id} onCreated={handlePassageCreated} />
            )}
            {panel === 'new-question' && selectedPassage && (
              <QuestionForm passageId={selectedPassage.id} onCreated={handleQuestionCreated} />
            )}
            {!panel && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-4">📚</p>
                <p className="text-sm">从左侧选择或新建机经集开始录入题目</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
