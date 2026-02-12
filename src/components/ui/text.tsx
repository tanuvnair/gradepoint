import { children, Component, JSX, splitProps } from "solid-js";
import { cn } from "~/lib/utils";

export interface TextProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "body"
    | "caption"
    | "footnote"
    | "headline"
    | "subheadline"
    | "title1"
    | "title2"
    | "title3";
  muted?: boolean;
  /** Use tabular-nums for numeric data. */
  tabularNums?: boolean;
}

const Text: Component<TextProps> = (props) => {
  const [local, others] = splitProps(props, [
    "variant",
    "muted",
    "tabularNums",
    "class",
    "children",
  ]);
  const resolved = children(() => local.children);
  const v = () => local.variant ?? "body";

  const variantClasses: Record<string, string> = {
    body: "text-lg font-normal leading-7 text-pretty",
    caption: "text-xs font-normal leading-5 text-pretty",
    footnote: "text-sm font-normal leading-6 text-pretty",
    headline: "text-lg font-semibold leading-7 text-balance",
    subheadline: "text-base font-normal leading-6 text-pretty",
    title1: "text-4xl font-bold leading-tight text-balance",
    title2: "text-3xl font-bold leading-tight text-balance",
    title3: "text-xl font-semibold leading-8 text-balance",
  };

  return (
    <span
      class={cn(
        variantClasses[v()],
        local.muted && "text-muted-foreground",
        local.tabularNums && "tabular-nums",
        local.class
      )}
      {...others}
    >
      {resolved()}
    </span>
  );
};

export default Text;
