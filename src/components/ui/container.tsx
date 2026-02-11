import { Component, JSX, splitProps } from "solid-js";
import { cn } from "~/lib/utils";

export interface ContainerProps extends JSX.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const Container: Component<ContainerProps> = (props) => {
  const [local, others] = splitProps(props, ["size", "class", "children"]);

  const sizeClasses: Record<string, string> = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div
      class={cn(
        "mx-auto w-full px-4",
        sizeClasses[local.size ?? "md"],
        local.class,
      )}
      {...others}
    >
      {local.children}
    </div>
  );
};

export default Container;
