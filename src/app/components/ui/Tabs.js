// Tabs.jsx
import { useState } from 'react';

export function Tabs({ value, onChange, children }) {
  const [activeTab, setActiveTab] = useState(value);

  const handleTabClick = (val) => {
    setActiveTab(val);
    if (onChange) onChange(val);
  };

  return (
    <div>
      {children.map((child , ind) =>
        child.type.name === 'TabsList' ? (
          <child.type
            {...child.props}
            activeTab={activeTab}
            onTabClick={handleTabClick}
            key={ind}
          />
        ) : (
          child
        )
      )}
    </div>
  );
}

export function TabsList({ children, activeTab, onTabClick }) {
  return (
    <div className="flex">
      {children.map((child) => (
        <child.type
          {...child.props}
          key={child.props.value}
          isActive={activeTab === child.props.value}
          onClick={() => onTabClick(child.props.value)}
        />
      ))}
    </div>
  );
}

export function TabsTrigger({ isActive, children, onClick }) {
  return (
    <button
      className={`p-3 ${isActive ? 'bg-[#17cf42] text-white' : 'text-[#17cf42]'}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children }) {
  return <div>{children}</div>;
}
