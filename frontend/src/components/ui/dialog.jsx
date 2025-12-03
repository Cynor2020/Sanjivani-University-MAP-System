import React from "react";

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      {children}
    </div>
  );
};

const DialogContent = ({ className = "", children, ...props }) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const DialogHeader = ({ className = "", children, ...props }) => {
  return (
    <div 
      className={`border-b p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const DialogTitle = ({ className = "", children, ...props }) => {
  return (
    <h3 
      className={`text-lg font-semibold ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export { Dialog, DialogContent, DialogHeader, DialogTitle };