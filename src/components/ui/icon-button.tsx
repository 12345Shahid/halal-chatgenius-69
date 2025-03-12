
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <Button
        variant="ghost"
        size="icon"
        ref={ref}
        className={cn("h-8 w-8 p-0", className)}
        {...props}
      />
    )
  }
)
IconButton.displayName = "IconButton"

export { IconButton }
