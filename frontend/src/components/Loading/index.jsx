import React from "react";

export default function Loading({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="w-8 h-8 relative">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <div 
          className="absolute top-0 left-0 animate-spin rounded-full h-8 w-8 border-r-2 border-blue-500" 
          style={{ animationDirection: 'reverse', animationDuration: '1s' }}
        ></div>
      </div>
      <p className="mt-2 text-sm text-theme-text-subtle">{text}</p>
    </div>
  );
}