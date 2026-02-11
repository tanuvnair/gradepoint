import { Component, JSX, splitProps } from "solid-js";
import { cn } from "~/lib/utils";

export type InputProps = JSX.InputHTMLAttributes<HTMLInputElement>;

const Input: Component<InputProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "type"]);
  const type = () => local.type ?? "text";

  return (
    <input
      type={type()}
      class={cn(
        "flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        (type() === "number" || type() === "tel") && "tabular-nums",
        local.class,
      )}
      {...others}
    />
  );
};

export default Input;
