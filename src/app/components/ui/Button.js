export function Button({ children, className, ...props }) {
    return (
      <button className={`px-4 py-2 bg-[#17cf42] text-white rounded ${className}`} {...props}>
        {children}
      </button>
    );
  }
  