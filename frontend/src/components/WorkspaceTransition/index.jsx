import React, { createContext, useContext, useState } from 'react';

// 创建上下文
const WorkspaceTransitionContext = createContext({
  isTransitioning: false,
  startTransition: () => {},
  endTransition: () => {},
});

// 创建Provider组件
export function WorkspaceTransitionProvider({ children }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const startTransition = () => setIsTransitioning(true);
  const endTransition = () => setIsTransitioning(false);
  
  return (
    <WorkspaceTransitionContext.Provider 
      value={{ isTransitioning, startTransition, endTransition }}
    >
      {children}
      {isTransitioning && (
        <div 
          className="fixed inset-0 z-50 bg-theme-bg-secondary bg-opacity-40 flex items-center justify-center transition-opacity duration-300"
          style={{ backdropFilter: 'blur(2px)' }}
        >
          <div className="w-16 h-16 border-4 border-blue-400 border-solid rounded-full border-t-transparent animate-spin"></div>
        </div>
      )}
    </WorkspaceTransitionContext.Provider>
  );
}

// 创建Hook
export function useWorkspaceTransition() {
  return useContext(WorkspaceTransitionContext);
} 