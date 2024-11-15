// Card.jsx
export function Card({ children, className }) {
    return (
      <div className={`border border-[#17cf42] rounded shadow p-4 ${className}`}>
        {children}
      </div>
    );
  }
  
  export function CardHeader({ children }) {
    return <div className="mb-2">{children}</div>;
  }
  
  export function CardTitle({ children }) {
    return <h3 className="font-bold text-[#17cf42]">{children}</h3>;
  }
  
  export function CardContent({ children }) {
    return <div>{children}</div>;
  }
      