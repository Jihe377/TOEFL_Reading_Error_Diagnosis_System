function NavBar({
  onBack,
  onNext,
  showBack = true,
  showNext = true,
  backLabel = '< Back',
  nextLabel = 'Next >',
}) {
  return (
    <div className="h-14 bg-toefl-header flex items-center justify-between px-8 flex-shrink-0">
      {/* Logo */}
      <span className="text-white font-semibold text-lg tracking-wide">
        TOEFL Reading Practice
      </span>

      {/* Navigation buttons */}
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={onBack}
            className="px-5 py-1.5 text-sm font-medium text-white border border-white rounded hover:bg-white hover:text-toefl-header transition-colors duration-150"
          >
            {backLabel}
          </button>
        )}
        {showNext && (
          <button
            onClick={onNext}
            className="px-5 py-1.5 text-sm font-medium text-toefl-header bg-white rounded hover:bg-gray-100 transition-colors duration-150"
          >
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export default NavBar