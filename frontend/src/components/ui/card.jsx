import React from "react";

const Card = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const baseClasses = "rounded-2xl border bg-white text-card-foreground shadow-card transition-all duration-300";
  
  const variantClasses = {
    default: "border-gray-200 hover:shadow-card-hover",
    elevated: "border-gray-200 shadow-lg hover:shadow-xl",
    solid: "border-0 bg-white",
    outlined: "border-2 border-gray-200 bg-transparent hover:bg-gray-50"
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${className || ""}`;
  
  return (
    <div
      ref={ref}
      className={classes}
      {...props}
    />
  );
});

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 p-6 ${className || ""}`}
    {...props}
  />
));

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-2xl font-bold leading-none tracking-tight text-gray-900 ${className || ""}`}
    {...props}
  />
));

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-muted-foreground text-gray-600 ${className || ""}`}
    {...props}
  />
));

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className || ""}`} {...props} />
));

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center p-6 pt-0 ${className || ""}`}
    {...props}
  />
));

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };