import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getExamSets, getPassages, getPassageDetail } from '../services/api'
/**
 * 1. 录入的CRUD不完整，现在不能修改和删除
 * 2. 现在机经题目做错还是会进入复盘流程，但是不需要（不过现在的logic都是混在一起的，怎么区分？）
 * 3. 填词题还没有设置好，创建文章的方式也不一样
 * 4. 设置阅读的题目最多不超过5道题
 * 5. Question 11 of 6 这部分也不是很对
 */


const QUESTION_TYPES = {
  factual_and_negative_factual: 'Factual / Negative Factual',
  vocabulary: 'Vocabulary',
  select_the_sentence: 'Select the Sentence',
  sentence_simplification: 'Sentence Simplification',
  reference: 'Reference',
  inference: 'Inference',
  rhetorical_purpose: 'Rhetorical Purpose',
  insert_text: 'Insert Text',
}

function QuestionCard({ q, onPractice }) {
  const correct = q.options.find((o) => o.is_correct)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <span className="inline-block bg-gray-100 text-gray-600 text-xs rounded px-2 py-0.5 flex-shrink-0">
          {QUESTION_TYPES[q.question_type] ?? q.question_type}
        </span>
        <span className="text-xs text-gray-400">ID {q.id}</span>
      </div>

      {/* Stem */}
      <p className="text-sm text-gray-800 leading-relaxed">{q.stem}</p>

      {/* Options */}
      <div className="space-y-1.5">
        {q.options.map((opt) => (
          <div
            key={opt.id}
            className={`flex items-start gap-2.5 px-3 py-2 rounded-lg text-sm ${
              opt.is_correct
                ? 'bg-green-50 border border-green-300 text-green-800'
                : 'bg-gray-50 border border-gray-200 text-gray-600'
            }`}
          >
            <span className={`font-bold flex-shrink-0 ${opt.is_correct ? 'text-green-700' : 'text-gray-400'}`}>
              {opt.option_label}.
            </span>
            <span className="leading-snug">{opt.option_text}</span>
          </div>
        ))}
      </div>

      {/* Footer: correct answer + practice button */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        <span className="text-xs text-green-700 font-medium">
          正确答案：{correct?.option_label}
        </span>
        <button
          onClick={() => onPractice(q.id)}
          className="text-xs bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          练习
        </button>
      </div>
    </div>
  )
}

export default function JijingPage() {
  const navigate = useNavigate()
  const [examSets, setExamSets] = useState([])
  const [selectedExamSet, setSelectedExamSet] = useState(null)
  const [passages, setPassages] = useState([])
  const [passageDetail, setPassageDetail] = useState(null)
  const [loadingSets, setLoadingSets] = useState(true)
  const [loadingPassage, setLoadingPassage] = useState(false)

  useEffect(() => {
    getExamSets()
      .then(setExamSets)
      .catch(() => {})
      .finally(() => setLoadingSets(false))
  }, [])

  async function selectExamSet(es) {
    setSelectedExamSet(es)
    setPassageDetail(null)
    setPassages([])
    const list = await getPassages(es.id).catch(() => [])
    setPassages(list)
  }

  async function selectPassage(p) {
    setLoadingPassage(true)
    setPassageDetail(null)
    const detail = await getPassageDetail(p.id).catch(() => null)
    setPassageDetail(detail)
    setLoadingPassage(false)
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-teal-700 text-white px-6 py-4 flex items-center gap-4 flex-shrink-0">
        <button onClick={() => navigate('/')} className="text-teal-200 hover:text-white text-sm">← 返回</button>
        <span className="text-xl font-bold tracking-wide">*toefl ibt</span>
        <span className="text-teal-200 text-sm">查看机经</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Nav sidebar */}
        <aside className="w-52 bg-white border-r border-gray-200 flex flex-col overflow-y-auto flex-shrink-0">
          {loadingSets && <p className="text-xs text-gray-400 p-4">加载中…</p>}
          {!loadingSets && examSets.length === 0 && (
            <p className="text-xs text-gray-400 p-4">暂无机经集</p>
          )}

          {examSets.map((es) => (
            <div key={es.id}>
              <button
                onClick={() => selectExamSet(es)}
                className={`w-full text-left px-4 py-3 text-sm font-medium border-b border-gray-100 transition-colors ${
                  selectedExamSet?.id === es.id
                    ? 'bg-teal-50 text-teal-800'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {es.name}
                {es.description && (
                  <span className="block text-xs text-gray-400 mt-0.5 truncate">{es.description}</span>
                )}
              </button>

              {selectedExamSet?.id === es.id &&
                passages.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectPassage(p)}
                    className={`w-full text-left pl-6 pr-3 py-2 text-xs border-b border-gray-50 transition-colors ${
                      passageDetail?.id === p.id
                        ? 'bg-teal-100 text-teal-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p.title}
                  </button>
                ))}
            </div>
          ))}
        </aside>

        {/* Passage + Questions split */}
        {!passageDetail && !loadingPassage && (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p className="text-sm">从左侧选择文章查看内容</p>
          </div>
        )}

        {loadingPassage && (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p className="text-sm">加载中…</p>
          </div>
        )}

        {passageDetail && !loadingPassage && (
          <>
            {/* Left: passage text */}
            <div className="flex-1 overflow-y-auto bg-white border-r border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-800 mb-4">{passageDetail.title}</h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {passageDetail.content}
              </p>
            </div>

            {/* Right: questions */}
            <div className="w-[420px] flex-shrink-0 overflow-y-auto bg-gray-50 p-5 space-y-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                题目 ({passageDetail.questions.length})
              </p>
              {passageDetail.questions.length === 0 && (
                <p className="text-sm text-gray-400">该文章暂无题目</p>
              )}
              {passageDetail.questions.map((q) => (
                <QuestionCard
                  key={q.id}
                  q={q}
                  onPractice={(id) => navigate(`/question/${id}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
