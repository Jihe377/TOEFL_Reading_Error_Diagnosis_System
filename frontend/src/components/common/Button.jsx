// 之后可以加上loading状态
function Button({ 
  children, 
  onClick, 
  variant = 'primary',  // 'primary' | 'secondary'
  disabled = false,
  className = ''
}) {
  const baseStyles = 'px-6 py-3 rounded-lg font-medium transition-all duration-200'
  
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-white text-secondary border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export default Button