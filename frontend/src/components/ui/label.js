import React from "react";

export function Label({ children, className, ...props }) {
  return (
    <label className={`block text-sm font-medium mb-1 ${className}`} {...props}>
      {children}
    </label>
  );
}
export function Card({ children, className }) {
    return (
      <div className={`rounded-lg shadow p-4 bg-white ${className}`}>
        {children}
      </div>
    );
  }
  
  export function CardHeader({ children }) {
    return <div className="mb-2">{children}</div>;
  }
  
  export function CardTitle({ children }) {
    return <h2 className="text-lg font-bold">{children}</h2>;
  }
  
  export function CardContent({ children }) {
    return <div>{children}</div>;
  }