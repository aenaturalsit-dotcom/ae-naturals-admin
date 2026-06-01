// src\components\admin\ui\Card.tsx

import React, { forwardRef } from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties; 
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = "", style }, ref) => {
    return (
      <div
        ref={ref}
        style={style}
        className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";