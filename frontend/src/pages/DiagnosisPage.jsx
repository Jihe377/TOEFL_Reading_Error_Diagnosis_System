import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'

function DiagnosisPage() {
  const { answerId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  // 尝试从 location.state 获取数据（从 ReflectionPage 传递）
  const [diagnosis, setDiagnosis] = useState(location.state?.diagnosisResult || null)
  const [loading, setLoading] = useState(!diagnosis)

  // 如果没有数据（用户直接访问或刷新），则从 API 获取
  useEffect(() => {
    if (!diagnosis) {
      // TODO: 实现 GET /api/diagnosis/:answerId 获取数据
      // const data = await getDiagnosis(answerId)
      // setDiagnosis(data)
      setLoading(false)
    }
  }, [answerId, diagnosis])

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">加载诊断结果...</div>
      </div>
    )
  }

  // 错误状态
  if (!diagnosis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">✖ 诊断结果不存在</div>
          <Button onClick={() => navigate(-1)}>返回</Button>
        </div>
      </div>
    )
  }

  // 错误层级的颜色映射
  const getLevelColor = (level) => {
    const colors = {
      'level_1': 'bg-red-100 text-red-700 border-red-300',
      'level_2': 'bg-orange-100 text-orange-700 border-orange-300',
      'level_3': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'level_4': 'bg-blue-100 text-blue-700 border-blue-300',
      'level_5': 'bg-green-100 text-green-700 border-green-300',
    }
    return colors[level] || 'bg-gray-100 text-gray-700 border-gray-300'
  }

  // 错误层级的图标
  const getLevelIcon = (level) => {
    const icons = {
      'level_1': '🔴',
      'level_2': '🟠',
      'level_3': '🟡',
      'level_4': '🔵',
      'level_5': '🟢',
    }
    return icons[level] || '⚪'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        
        {/* 标题卡片 */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                错题诊断报告
              </h1>
              <p className="text-gray-500 text-sm">
                Answer ID: {answerId}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">诊断完成</div>
              <div className="text-xs text-gray-400">
                {new Date().toLocaleDateString('zh-CN')}
              </div>
            </div>
          </div>
        </Card>

       {/* 复盘过程回顾卡片 + 错误定位标签 */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span>复盘过程回顾</span>
            </h2>
            
            {/* 彩色错误类型标签 */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-bold ${getLevelColor(diagnosis.rule_error_level)}`}>
              <span className="text-xl">{getLevelIcon(diagnosis.rule_error_level)}</span>
              <span>{diagnosis.rule_error_type}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Step 1: 定位词识别 */}
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-2xl ${diagnosis.step1_is_correct ? '' : 'opacity-50'}`}>
                  {diagnosis.step1_is_correct ? '✓' : '✗'}
                </span>
                <div className="flex-1">
                  <span className="font-medium text-gray-700">Step 1: 定位词识别</span>
                  <span className={`ml-2 text-sm ${diagnosis.step1_is_correct ? 'text-green-600' : 'text-red-600'}`}>
                    {diagnosis.step1_is_correct ? '正确' : '错误'}
                  </span>
                </div>
              </div>
              
              <div className="ml-11 space-y-1">
                <div className="text-sm text-gray-600">
                  你的选择：<span className="font-medium text-gray-800">{diagnosis.step1_student_choice}</span>
                </div>
                {!diagnosis.step1_is_correct && (
                  <div className="text-sm text-green-700">
                    正确答案：<span className="font-semibold">{diagnosis.step1_correct_answer}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: 答案句定位 */}
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-2xl ${diagnosis.step2_is_correct ? '' : 'opacity-50'}`}>
                  {diagnosis.step2_is_correct ? '✓' : '✗'}
                </span>
                <div className="flex-1">
                  <span className="font-medium text-gray-700">Step 2: 答案句定位</span>
                  <span className={`ml-2 text-sm ${diagnosis.step2_is_correct ? 'text-green-600' : 'text-red-600'}`}>
                    {diagnosis.step2_is_correct ? '正确' : '错误'}
                  </span>
                </div>
              </div>
              
              <div className="ml-11 space-y-2">
                <div className="text-sm text-gray-600">
                  <div className="mb-1">你的选择：</div>
                  <div className="text-gray-800 italic pl-2 border-l-2 border-gray-300">
                    "{diagnosis.step2_student_choice.length > 100 
                      ? diagnosis.step2_student_choice.substring(0, 100) + '...' 
                      : diagnosis.step2_student_choice}"
                  </div>
                </div>
                {!diagnosis.step2_is_correct && (
                  <div className="text-sm text-green-700">
                    <div className="mb-1 font-semibold">正确答案：</div>
                    <div className="text-green-800 italic pl-2 border-l-2 border-green-400">
                      "{diagnosis.step2_correct_answer.length > 100 
                        ? diagnosis.step2_correct_answer.substring(0, 100) + '...' 
                        : diagnosis.step2_correct_answer}"
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: 答案句理解 */}
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">
                  {diagnosis.step3_quality === 'correct' ? '✓' : diagnosis.step3_quality === 'wrong' ? '✗' : '?'}
                </span>
                <div className="flex-1">
                  <span className="font-medium text-gray-700">Step 3: 答案句理解</span>
                  <span className={`ml-2 text-sm ${
                    diagnosis.step3_quality === 'correct' ? 'text-green-600' : 
                    diagnosis.step3_quality === 'wrong' ? 'text-red-600' : 
                    'text-yellow-600'
                  }`}>
                    {diagnosis.step3_quality === 'correct' ? '正确' : 
                     diagnosis.step3_quality === 'wrong' ? '错误' : 
                     '部分理解'}
                  </span>
                </div>
              </div>
              
              <div className="ml-11 space-y-1">
                <div className="text-sm text-gray-600">
                  你的理解：<span className="font-medium text-gray-800">{diagnosis.step3_student_understanding}</span>
                </div>
                {diagnosis.step3_quality !== 'correct' && (
                  <div className="text-sm text-green-700">
                    正确理解：<span className="font-semibold">{diagnosis.step3_correct_understanding}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* AI 错因分析卡片 */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>AI 错因分析</span>
          </h2>
          
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed text-base">
              {diagnosis.llm_explanation}
            </p>
          </div>
        </Card>

        {/* 改进建议卡片 */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>改进建议</span>
          </h2>
          
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed text-base">
              {diagnosis.llm_suggestion}
            </p>
          </div>
        </Card>

        {/* 操作按钮 */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate(`/reflection/${answerId}`)}
              variant="secondary"
              className="flex-1 sm:flex-none"
            >
              查看完整复盘
            </Button>
            
            <Button
              onClick={() => {
                // 假设下一题是当前 ID + 1
                const currentQuestionId = 1 // 实际应该从 diagnosis 或 API 获取
                navigate(`/question/${currentQuestionId + 1}`)
              }}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
            >
              下一题 →
            </Button>
          </div>
        </Card>

      </div>
    </div>
  )
}

export default DiagnosisPage