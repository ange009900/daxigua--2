"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const sidebarVariants = cva(
  "flex h-full flex-col overflow-hidden bg-background data-[collapsible=icon]:data-[state=closed]:w-[--sidebar-icon-width] data-[collapsible=icon]:data-[state=closed]:min-w-[--sidebar-icon-width] data-[collapsible=icon]:data-[state=closed]:max-w-[--sidebar-icon-width] data-[collapsible=icon]:data-[state=closed]:px-2 data-[collapsible=icon]:data-[state=closed]:py-2 data-[collapsible=icon]:data-[state=closed]:group-[.sidebar-has-rail]/sidebar:w-0 data-[collapsible=icon]:data-[state=closed]:group-[.sidebar-has-rail]/sidebar:min-w-0 data-[collapsible=icon]:data-[state=closed]:group-[.sidebar-has-rail]/sidebar:max-w-0 data-[collapsible=icon]:data-[state=closed]:group-[.sidebar-has-rail]/sidebar:px-0 data-[collapsible=icon]:data-[state=closed]:group-[.sidebar-has-rail]/sidebar:py-0 data-[collapsible=icon]:data-[state=closed]:group-[.sidebar-has-rail]/sidebar:opacity-0 data-[collapsible=icon]:transition-[width,min-width,max-width,padding,opacity] data-[collapsible=icon]:ease-in-out data-[collapsible=icon]:duration-300",
  {
    variants: {
      variant: {
        default: "border-border",
        outline: "border border-border",
      },
      collapsible: {
        none: "",
        icon: "",
      },
    },
    defaultVariants: {
      variant: "default",
      collapsible: "none",
    },
  },
)

interface SidebarContextValue {
  collapsible: "none" | "icon"
  isCollapsed: boolean
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContextValue>({
  collapsible: "none",
  isCollapsed: false,
  setIsCollapsed: () => {},
  isMobile: false,
})

export function useSidebar() {
  const context = React.useContext(SidebarContext)

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }

  return context
}

export const SidebarProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  return (
    <SidebarContext.Provider
      value={{
        collapsible: "none",
        isCollapsed,
        setIsCollapsed,
        isMobile,
      }}
    >
      <div className="flex h-full w-full group/sidebar sidebar-has-rail">{children}</div>
    </SidebarContext.Provider>
  )
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sidebarVariants> {
  state?: "open" | "closed"
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, variant, collapsible = "none", state, ...props }, ref) => {
    const { isCollapsed, setIsCollapsed } = useSidebar()
    const [controlled] = React.useState(state !== undefined)

    const collapsed = controlled ? state === "closed" : isCollapsed

    return (
      <div
        ref={ref}
        data-state={collapsed ? "closed" : "open"}
        data-collapsible={collapsible}
        className={cn(sidebarVariants({ variant, collapsible }), className)}
        {...props}
      />
    )
  },
)
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-2 px-3 py-2 group-data-[collapsible=icon]/sidebar:data-[state=closed]:px-0 group-data-[collapsible=icon]/sidebar:data-[state=closed]:py-0",
        className,
      )}
      {...props}
    />
  ),
)
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-1 flex-col gap-2 overflow-hidden px-3 py-2 group-data-[collapsible=icon]/sidebar:data-[state=closed]:px-0 group-data-[collapsible=icon]/sidebar:data-[state=closed]:py-0",
        className,
      )}
      {...props}
    />
  ),
)
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-2 px-3 py-2 group-data-[collapsible=icon]/sidebar:data-[state=closed]:px-0 group-data-[collapsible=icon]/sidebar:data-[state=closed]:py-0",
        className,
      )}
      {...props}
    />
  ),
)
SidebarFooter.displayName = "SidebarFooter"

const SidebarInset = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-1 flex-col overflow-auto", className)} {...props} />
  ),
)
SidebarInset.displayName = "SidebarInset"

const SidebarTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    const { setIsCollapsed } = useSidebar()

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        onClick={() => setIsCollapsed((prev) => !prev)}
        {...props}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <line x1="9" x2="15" y1="3" y2="3" />
          <line x1="9" x2="15" y1="21" y2="21" />
          <line x1="9" x2="9" y1="9" y2="15" />
          <line x1="9" x2="15" y1="9" y2="9" />
          <line x1="15" x2="15" y1="9" y2="15" />
          <line x1="9" x2="15" y1="15" y2="15" />
        </svg>
        <span className="sr-only">Toggle Sidebar</span>
      </button>
    )
  },
)
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarRail = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "absolute inset-y-0 right-0 z-10 w-[--sidebar-rail-width] translate-x-full border-l border-border bg-background opacity-0 shadow-sm transition-[transform,opacity] duration-300 ease-in-out group-data-[collapsible=icon]/sidebar:data-[state=closed]:translate-x-0 group-data-[collapsible=icon]/sidebar:data-[state=closed]:opacity-100",
        className,
      )}
      {...props}
    />
  ),
)
SidebarRail.displayName = "SidebarRail"

export { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarInset, SidebarTrigger, SidebarRail }

