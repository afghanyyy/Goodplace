"use client";

import React, { createContext, useState, useContext } from 'react';

type FloatingButtonsContextValue = {
  hidden: boolean;
  setHidden: (v: boolean) => void;
};

const FloatingButtonsContext = createContext<FloatingButtonsContextValue | undefined>(undefined);

export const FloatingButtonsProvider = ({ children }: { children: React.ReactNode }) => {
  const [hidden, setHidden] = useState(false);
  return (
    <FloatingButtonsContext.Provider value={{ hidden, setHidden }}>
      {children}
    </FloatingButtonsContext.Provider>
  );
};

export const useFloatingButtons = () => {
  const ctx = useContext(FloatingButtonsContext);
  if (!ctx) throw new Error('useFloatingButtons must be used within FloatingButtonsProvider');
  return ctx;
};

export default FloatingButtonsContext;
