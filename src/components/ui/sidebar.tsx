
import * as React from "react"
import { ChevronRight, Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"

interface SidebarProviderProps {
  defaultCollapsed?: boolean
  defaultOpen?: boolean
  children: React.ReactNode
}

interface SidebarContextProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextProps>({
  collapsed: false,
  setCollapsed: () => {},
  open: false,
  setOpen: () => {},
})

export function useSidebar() {
  return React.useContext(SidebarContext)
}

export function SidebarProvider({
  defaultCollapsed = false,
  defaultOpen = true,
  children,
}: SidebarProviderProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        setCollapsed,
        open,
        setOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  const { collapsed, open, setOpen } = useSidebar()

  return (
    <aside
      data-state={open ? "open" : "closed"}
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col",
        "bg-card text-card-foreground shadow-lg",
        "data-[state=closed]:invisible data-[state=closed]:pointer-events-none lg:data-[state=closed]:visible lg:data-[state=closed]:pointer-events-auto",
        "transition-transform duration-300",
        "data-[state=closed]:translate-x-[-100%] lg:data-[state=closed]:translate-x-0",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "flex grow flex-col gap-0",
          "transition-transform duration-300",
          "lg:w-60",
          collapsed && "lg:w-16"
        )}
      >
        {children}
      </div>

      <button
        onClick={() => setOpen(false)}
        className={cn(
          "absolute right-3 top-3 z-10 h-6 w-6 rounded-full",
          "lg:hidden",
          "bg-secondary/15 backdrop-blur-md",
          "hover:bg-secondary",
          "flex items-center justify-center"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </aside>
  )
}

export function SidebarTrigger({ className }: { className?: string }) {
  const { setOpen } = useSidebar()

  return (
    <Button
      onClick={() => setOpen(true)}
      size="icon"
      variant="ghost"
      className={cn("h-10 w-10 lg:hidden", className)}
    >
      <Menu className="h-4 w-4" />
    </Button>
  )
}

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarHeader({
  className,
  children,
  ...props
}: SidebarHeaderProps) {
  const { collapsed } = useSidebar()

  return (
    <header
      className={cn(
        "relative min-h-16 border-b px-4 py-3",
        "flex items-center justify-between gap-3",
        collapsed && "justify-center",
        "lg:min-h-[60px]",
        className
      )}
      {...props}
    >
      {children}
    </header>
  )
}

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarContent({
  className,
  children,
  ...props
}: SidebarContentProps) {
  return (
    <div
      className={cn("flex flex-col gap-2 p-2 grow overflow-y-auto", className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarGroup({
  className,
  children,
  ...props
}: SidebarGroupProps) {
  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {children}
    </div>
  )
}

interface SidebarGroupLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarGroupLabel({
  className,
  children,
  ...props
}: SidebarGroupLabelProps) {
  const { collapsed } = useSidebar()

  if (collapsed) return null

  return (
    <div
      className={cn(
        "text-xs text-muted-foreground font-medium px-2 py-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface SidebarGroupContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarGroupContent({
  className,
  children,
  ...props
}: SidebarGroupContentProps) {
  return (
    <div className={cn("mb-2", className)} {...props}>
      {children}
    </div>
  )
}

interface SidebarMenuProps extends React.HTMLAttributes<HTMLUListElement> {}

export function SidebarMenu({
  className,
  children,
  ...props
}: SidebarMenuProps) {
  return (
    <ul
      className={cn(
        "flex flex-col gap-px",
        "text-muted-foreground px-1",
        className
      )}
      {...props}
    >
      {children}
    </ul>
  )
}

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLLIElement> {}

export function SidebarMenuItem({
  className,
  children,
  ...props
}: SidebarMenuItemProps) {
  return (
    <li className={cn("block", className)} {...props}>
      {children}
    </li>
  )
}

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  asChild?: boolean
}

export function SidebarMenuButton({
  className,
  children,
  active,
  asChild,
  ...props
}: SidebarMenuButtonProps) {
  const { collapsed } = useSidebar()

  const Comp = asChild ? Button : "button"

  return (
    <Comp
      className={cn(
        "flex h-9 w-full items-center rounded text-primary text-sm",
        "hover:bg-accent/50 hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        active && "bg-accent text-accent-foreground",
        "transition-colors duration-75",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "flex w-full items-center gap-2",
          asChild && "h-full",
          !collapsed && "px-2",
          collapsed && "justify-center px-0"
        )}
      >
        {children}
      </div>
    </Comp>
  )
}

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarFooter({
  className,
  children,
  ...props
}: SidebarFooterProps) {
  return (
    <footer
      className={cn(
        "border-t p-3 text-xs flex items-center",
        "text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </footer>
  )
}
