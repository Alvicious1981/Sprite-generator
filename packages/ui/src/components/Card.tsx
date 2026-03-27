import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      className={[
        "rounded-lg border border-gray-200 bg-white shadow-sm",
        onClick ? "cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all" : "",
        className,
      ].join(" ")}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
