export function Table({ children }) {
    return <table className="min-w-full border border-[#17cf42]">{children}</table>;
  }
  
  export function TableHeader({ children }) {
    return <thead className="bg-[#17cf42] text-white">{children}</thead>;
  }
  
  export function TableRow({ children }) {
    return <tr className="border-b border-[#17cf42]">{children}</tr>;
  }
  
  export function TableCell({ children }) {
    return <td className="p-2 border-b border-[#17cf42]">{children}</td>;
  }
  
  export function TableBody({ children }) {
    return <tbody>{children}</tbody>;
  }
  
  export function TableHead({ children }) {
    return <th className="p-2 text-left">{children}</th>;
  }
  