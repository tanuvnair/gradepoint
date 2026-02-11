import { Component, JSX, splitProps } from "solid-js";
import { cn } from "~/lib/utils";

export interface SeparatorProps extends JSX.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

const Separator: Component<SeparatorProps> = (props) => {
  const [local, others] = splitProps(props, ["orientation", "class"]);

  return (
    <div
      role="separator"
      class={cn(
        "shrink-0 bg-border",
        local.orientation === "vertical"
          ? "h-full w-px"
          : "h-px w-full",
        local.class,
      )}
      {...others}
    />
  );
};

export default Separator;
