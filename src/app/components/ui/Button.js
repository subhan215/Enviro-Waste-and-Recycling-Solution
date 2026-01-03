const variants = {
  primary: 'bg-custom-green text-custom-black hover:bg-custom-green-dark focus:ring-custom-green shadow-button hover:shadow-md',
  secondary: 'bg-white text-custom-black border-2 border-custom-green hover:bg-custom-green-light focus:ring-custom-green',
  outline: 'bg-transparent text-custom-green border-2 border-custom-green hover:bg-custom-green hover:text-custom-black focus:ring-custom-green',
  danger: 'bg-error text-white hover:bg-red-600 focus:ring-error',
  ghost: 'bg-transparent text-custom-black hover:bg-gray-100 focus:ring-gray-300',
};

const sizes = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-base',
  lg: 'h-12 px-8 text-base',
};

export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
}
  