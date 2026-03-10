function formatQuestionType(type) {
  if (!type) return ''
  return type
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function SubHeader({ questionType, questionNumber, totalQuestions, label = '' }) {
  const parts = label ? [label] : []
  if (questionType) parts.push(formatQuestionType(questionType))
  if (questionNumber && totalQuestions) parts.push(`Question ${questionNumber} of ${totalQuestions}`)

  return (
    <div className="h-10 bg-white border-b border-gray-200 flex items-center px-8 flex-shrink-0">
      <span className="text-sm text-gray-700">
        {parts.join('  |  ')}
      </span>
    </div>
  )
}

export default SubHeader