import { Separator as KobalteSeparator } from "@kobalte/core/separator";
import type { Orientation } from "@kobalte/utils";
import { Component, JSX, splitProps } from "solid-js";
import { cn } from "~/lib/utils";

export interface SeparatorProps extends JSX.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

const Separator: Component<SeparatorProps> = (props) => {
  const [local, others] = splitProps(props, ["orientation", "class"]);

  return (
    <KobalteSeparator
      orientation={(local.orientation ?? "horizontal") as Orientation}
      class={cn(
        "shrink-0 bg-border",
        local.orientation === "vertical" ? "h-full w-px" : "h-px w-full",
        local.class
      )}
      {...others}
    />
  );
};

export default Separator;
