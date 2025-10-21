// src/components/HeaderContext.jsx
import React, { createContext, useContext, useState } from 'react';

const HeaderContext = createContext(null);

export function HeaderProvider({ children }) {
  const [rightNode, setRightNode] = useState(null);

  // setRightNode accepts either a React node or null
  return (
    <HeaderContext.Provider value={{ rightNode, setRightNode }}>
      {children}
    </HeaderContext.Provider>
  );
}

/**
 * Hook for pages:
 * const { setRightNode } = useHeaderActions();
 * setRightNode(<button .../>)
 */
export function useHeaderActions() {
  const ctx = useContext(HeaderContext);
  if (!ctx) throw new Error('useHeaderActions must be used inside HeaderProvider');
  return ctx;
}
