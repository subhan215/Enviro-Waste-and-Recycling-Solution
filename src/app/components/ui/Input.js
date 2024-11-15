export function Input({ className, ...props }) {
    return (
      <input
        className={`border border-[#17cf42] p-2 rounded ${className}`}
        {...props}
      />
    );
  }
  