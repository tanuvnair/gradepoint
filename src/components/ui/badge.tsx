import { Component, JSX, splitProps } from "solid-js";
import { cn } from "~/lib/utils";

export interface BadgeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "destructive";
}

const Badge: Component<BadgeProps> = (props) => {
  const [local, others] = splitProps(props, ["variant", "class", "children"]);

  const variantClasses: Record<string, string> = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-border bg-background text-foreground",
    destructive: "bg-destructive text-destructive-foreground",
  };

  return (
    <span
      class={cn(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium",
        variantClasses[local.variant ?? "default"],
        local.class,
      )}
      {...others}
    >
      {local.children}
    </span>
  );
};

export default Badge;
