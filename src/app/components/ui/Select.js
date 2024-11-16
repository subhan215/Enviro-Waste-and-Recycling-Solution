import React from 'react';

export const Select = ({ children, ...props }) => (
  <select {...props} className="custom-select">
    {children}
  </select>
);

export const SelectTrigger = ({ children }) => <div>{children}</div>;
export const SelectContent = ({ children }) => <div>{children}</div>;
export const SelectItem = ({ value, children }) => (
  <option value={value}>{children}</option>
);
export const SelectValue = ({ placeholder }) => <span>{placeholder}</span>;