function OptionItem({
  option,
  isSelected,
  isCorrect,
  isWrong,
  showResult,
  onClick,
  disabled,
}) {
  // Determine radio circle style
  let circleStyles = 'w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors duration-200'
  let rowStyles = 'flex items-start gap-3 py-3 px-3 rounded-lg cursor-pointer transition-colors duration-150'
  if (showResult) {
    if (isCorrect) {
      circleStyles += ' border-green-600 bg-green-600'
      rowStyles += ' bg-green-50'
    } else if (isWrong) {
      circleStyles += ' border-red-500 bg-red-500'
      rowStyles += ' bg-red-50'
    } else {
      circleStyles += ' border-gray-300'
      rowStyles += ' opacity-50'
    }
  } else {
    if (isSelected) {
      circleStyles += ' border-toefl-accent bg-toefl-accent'
      rowStyles += ' bg-toefl-light'
      labelStyles = 'text-sm font-semibold w-5 flex-shrink-0 mt-0.5 text-toefl-accent'
    } else {
      circleStyles += ' border-gray-400'
      rowStyles += ' hover:bg-gray-50'
    }
    if (disabled) rowStyles += ' cursor-not-allowed'
  }

  // Inner dot for selected/correct/wrong states
  const showInnerDot = isSelected || (showResult && (isCorrect || isWrong))
  const innerDotColor = showResult
    ? isCorrect ? 'bg-white' : isWrong ? 'bg-white' : ''
    : 'bg-white'

  return (
    <button
      onClick={!disabled && !showResult ? onClick : undefined}
      disabled={disabled || showResult}
      className={`w-full text-left ${rowStyles}`}
    >
      {/* Radio circle */}
      <span className={circleStyles}>
        {showInnerDot && (
          <span className={`w-2 h-2 rounded-full ${innerDotColor}`} />
        )}
      </span>

      {/* Option text */}
      <span className="flex-1 text-gray-800 text-sm leading-relaxed">
        {option.option_text}
      </span>

      {/* Result label */}
      {showResult && isCorrect && (
        <span className="text-xs text-green-700 font-medium ml-2 flex-shrink-0">正确答案</span>
      )}
      {showResult && isWrong && (
        <span className="text-xs text-red-700 font-medium ml-2 flex-shrink-0">你的选择</span>
      )}
    </button>
  )
}

export default OptionItem