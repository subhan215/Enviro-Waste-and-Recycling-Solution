export function Input({
  className = '',
  error = false,
  ...props
}) {
  const baseStyles = 'w-full h-12 px-4 bg-white border rounded-lg text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:ring-2';
  const normalStyles = 'border-border focus:border-custom-green focus:ring-custom-green/20';
  const errorStyles = 'border-error focus:border-error focus:ring-error/20';

  return (
    <input
      className={`${baseStyles} ${error ? errorStyles : normalStyles} ${className}`}
      {...props}
    />
  );
}

export function Textarea({
  className = '',
  error = false,
  rows = 4,
  ...props
}) {
  const baseStyles = 'w-full px-4 py-3 bg-white border rounded-lg text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:ring-2 resize-none';
  const normalStyles = 'border-border focus:border-custom-green focus:ring-custom-green/20';
  const errorStyles = 'border-error focus:border-error focus:ring-error/20';

  return (
    <textarea
      className={`${baseStyles} ${error ? errorStyles : normalStyles} ${className}`}
      rows={rows}
      {...props}
    />
  );
}

export function FormField({
  label,
  error,
  required = false,
  children,
  className = '',
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
}

export function Select({
  className = '',
  error = false,
  children,
  ...props
}) {
  const baseStyles = 'w-full h-12 px-4 bg-white border rounded-lg text-text-primary transition-all duration-200 focus:outline-none focus:ring-2 appearance-none cursor-pointer';
  const normalStyles = 'border-border focus:border-custom-green focus:ring-custom-green/20';
  const errorStyles = 'border-error focus:border-error focus:ring-error/20';

  return (
    <div className="relative">
      <select
        className={`${baseStyles} ${error ? errorStyles : normalStyles} ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
  