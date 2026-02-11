import { children, Component, JSX, splitProps } from "solid-js";
import { cn } from "~/lib/utils";
import Info from "lucide-solid/icons/info";
import AlertTriangle from "lucide-solid/icons/alert-triangle";
import AlertCircle from "lucide-solid/icons/circle-alert";

export interface AlertProps extends JSX.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "warning" | "destructive";
}

const variantConfig: Record<string, { container: string; icon: string }> = {
  default: {
    container: "bg-secondary/60 text-foreground",
    icon: "text-muted-foreground",
  },
  warning: {
    container: "bg-secondary/60 text-foreground",
    icon: "text-amber-500 dark:text-amber-400",
  },
  destructive: {
    container: "bg-secondary/60 text-foreground",
    icon: "text-destructive",
  },
};

const variantIcon: Record<string, typeof Info> = {
  default: Info,
  warning: AlertTriangle,
  destructive: AlertCircle,
};

const Alert: Component<AlertProps> = (props) => {
  const [local, others] = splitProps(props, ["variant", "class", "children"]);
  const resolved = children(() => local.children);
  const variant = () => local.variant ?? "default";
  const config = () => variantConfig[variant()];
  const Icon = variantIcon[local.variant ?? "default"];

  return (
    <div
      role="alert"
      class={cn(
        "flex gap-3 rounded-lg border border-border/60 p-4 text-sm",
        config().container,
        local.class
      )}
      {...others}
    >
      <Icon class={cn("h-5 w-5 shrink-0", config().icon)} />
      <div class="flex flex-1 flex-col gap-1">{resolved()}</div>
    </div>
  );
};

export default Alert;
