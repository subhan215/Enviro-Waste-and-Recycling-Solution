import React, { createContext, useContext, useState } from "react";

// Create the context
const AlertContext = createContext();

// Hook to use the Alert context
export const useAlert = () => useContext(AlertContext);

// Provider component
export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const addAlert = (type, message) => {
    const id = Math.random().toString(36).substr(2, 9);
    setAlerts([...alerts, { id, type, message }]);
    setTimeout(() => {
      setAlerts((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 3000); // Remove the alert after 3 seconds
  };

  return (
    <AlertContext.Provider value={addAlert}>
      {children}
      <div className="fixed top-0 right-0 p-4 space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`px-4 py-2 rounded shadow-md text-white ${
              alert.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {alert.message}
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};
