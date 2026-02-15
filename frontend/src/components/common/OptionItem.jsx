function OptionItem({ 
  option,
  isSelected,
  isCorrect,
  isWrong,
  showResult,
  onClick,
  disabled
}) {
  let containerStyles = 'w-full p-4 text-left rounded-xl border-2 transition-all duration-300 flex items-start gap-4 group'
  let labelStyles = 'w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg font-bold transition-colors'
  
  if (showResult) {
    if (isCorrect) {
      containerStyles += ' border-green-500 bg-green-50 ring-2 ring-green-500'
      labelStyles += ' bg-green-600 text-white'
    } else if (isWrong) {
      containerStyles += ' border-red-500 bg-red-50 ring-2 ring-red-500'
      labelStyles += ' bg-red-600 text-white'
    } else {
      containerStyles += ' border-gray-200 bg-white opacity-60'
      labelStyles += ' bg-gray-100 text-gray-400'
    }
  } else {
    if (isSelected) {
      containerStyles += ' border-blue-500 bg-blue-50 ring-2 ring-blue-500'
      labelStyles += ' bg-blue-600 text-white'
    } else {
      containerStyles += ' border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
      labelStyles += ' bg-gray-100 text-gray-500 group-hover:bg-blue-100'
    }
  }

  if (disabled && !showResult) {
    containerStyles += ' cursor-not-allowed opacity-50'
  }

  return (
    <button
      onClick={!disabled && !showResult ? onClick : undefined}
      disabled={disabled || showResult}
      className={containerStyles}
    >
        <span className={labelStyles}>
            {option.option_label}
        </span>

        <span className="flex-1 text-gray-800 mt-1 text-left">
            {option.option_text}
        </span>
        
        {/* 答题结果图标和标签 */}

        {showResult && isCorrect && (
            <span className="text-green-600 text-2xl font-bold animate-in zoom-in">✓</span>
        )}
        {showResult && isWrong && (
            <span className="text-red-600 text-2xl font-bold animate-in zoom-in">✗</span>
        )}

        {showResult && (
        <div className="absolute top-2 right-2 text-xs font-medium">
          {isCorrect && !isWrong && (
            <span className="text-green-700">✓ 正确答案</span>
          )}
          {isCorrect && isWrong && (
            <span className="text-green-700">✓ 正确答案</span>
          )}
          {isWrong && (
            <span className="text-red-700">✗ 你的选择</span>
          )}
        </div>
      )}
    </button>
  )
}

export default OptionItem