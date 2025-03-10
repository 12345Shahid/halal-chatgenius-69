
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'default', size = 'default', isLoading = false, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          "relative inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none disabled:pointer-events-none rounded-lg",
          // Variants
          variant === 'default' && "bg-primary text-primary-foreground shadow hover:bg-primary/90",
          variant === 'destructive' && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          variant === 'outline' && "border border-border bg-transparent hover:bg-secondary",
          variant === 'secondary' && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          variant === 'ghost' && "hover:bg-secondary",
          variant === 'link' && "text-primary underline-offset-4 hover:underline",
          // Sizes
          size === 'default' && "h-10 px-4 py-2 text-sm",
          size === 'sm' && "h-8 px-3 text-xs",
          size === 'lg' && "h-12 px-8 text-base",
          size === 'icon' && "h-10 w-10",
          // Disabled
          (disabled || isLoading) && "opacity-70",
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
