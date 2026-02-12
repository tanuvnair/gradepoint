import { Component, JSX, splitProps } from "solid-js";
import { cn } from "~/lib/utils";

export interface LabelProps extends JSX.LabelHTMLAttributes<HTMLLabelElement> {
  selectable?: boolean;
}

const Label: Component<LabelProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "children", "selectable"]);

  return (
    <label
      class={cn(
        "text-sm font-medium leading-5 text-foreground",
        !local.selectable && "select-none",
        local.class
      )}
      {...others}
    >
      {local.children}
    </label>
  );
};

export default Label;
