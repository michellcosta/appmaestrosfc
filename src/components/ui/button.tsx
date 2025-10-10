import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden group active:transform active:scale-95 motion-reduce:transition-none motion-reduce:active:transform-none",
  {
    variants: {
      variant: {
        default:
          "bg-maestros-green text-white hover:bg-maestros-green/90 shadow-lg hover:shadow-xl transition-all duration-300 focus-visible:ring-maestros-green",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 focus-visible:ring-red-500",
        outline:
          "border-2 border-gradient-to-r from-blue-500 to-purple-500 bg-white/80 backdrop-blur-sm hover:bg-white/90 hover:shadow-lg text-gray-700 hover:text-gray-900 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800 focus-visible:ring-blue-500",
        secondary:
          "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300 dark:from-zinc-800 dark:to-zinc-700 dark:text-zinc-100 dark:hover:from-zinc-700 dark:hover:to-zinc-600 shadow-md hover:shadow-lg focus-visible:ring-gray-500",
        ghost:
          "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 transition-all duration-300 focus-visible:ring-blue-500",
        link:
          "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 underline-offset-4 hover:underline hover:from-blue-700 hover:to-purple-700 focus-visible:ring-blue-500",
        success:
          "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 focus-visible:ring-green-500",
        warning:
          "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 focus-visible:ring-yellow-500",
        team:
          "bg-gradient-to-br from-white to-gray-50 text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg hover:from-blue-50 hover:to-purple-50 backdrop-blur-sm focus-visible:ring-blue-500",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base font-semibold",
        xl: "h-14 rounded-2xl px-10 text-lg font-bold shadow-xl",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    loadingText,
    icon,
    iconPosition = 'left',
    children,
    disabled,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button";

    const isDisabled = disabled || loading;
    const buttonText = loading && loadingText ? loadingText : children;

    // Se asChild é true, renderizar apenas o children sem wrapper
    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={isDisabled}
          aria-busy={loading}
          aria-disabled={isDisabled}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2
            className="animate-spin"
            size={16}
            aria-hidden="true"
          />
        )}
        {!loading && icon && iconPosition === 'left' && (
          <span aria-hidden="true">{icon}</span>
        )}
        <span>{buttonText}</span>
        {!loading && icon && iconPosition === 'right' && (
          <span aria-hidden="true">{icon}</span>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
