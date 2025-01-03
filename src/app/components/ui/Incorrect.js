import React from 'react';

const Incorrect = ({ text }) => {
  return (
    <div className="relative w-full flex flex-wrap items-center justify-center py-3 pl-4 pr-14 rounded-lg text-base font-medium transition-all duration-500 ease-in-out border border-[#f85149] text-[#b22b2b] bg-[#f851491a]">
     
      <p className="flex flex-row items-start gap-x-2 whitespace-normal break-words overflow-visible w-full">
        <svg
          stroke="currentColor"
          fill="none"
          strokeWidth={2}
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          height={28}
          width={28}
          className="h-7 w-7 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
        <span className="flex-grow">
          {text}
        </span>
      </p>
    </div>
  );
};

export default Incorrect;
