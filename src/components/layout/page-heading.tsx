import { type Component, type JSX, splitProps } from "solid-js";
import { cn } from "~/lib/utils";

export type PageHeadingProps = JSX.HTMLAttributes<HTMLElement>;

const PageHeading: Component<PageHeadingProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <header
      class={cn(
        "border-b border-border bg-background/95 px-6 py-4",
        "flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between",
        local.class
      )}
      {...others}
    >
      {local.children}
    </header>
  );
};

export type PageHeadingTitleProps = JSX.HTMLAttributes<HTMLHeadingElement>;

const PageHeadingTitle: Component<PageHeadingTitleProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <h1 class={cn("text-xl font-semibold leading-8 text-balance", local.class)} {...others}>
      {local.children}
    </h1>
  );
};

export type PageHeadingDescriptionProps = JSX.HTMLAttributes<HTMLParagraphElement>;

const PageHeadingDescription: Component<PageHeadingDescriptionProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <p
      class={cn("text-sm font-normal leading-6 text-pretty text-muted-foreground", local.class)}
      {...others}
    >
      {local.children}
    </p>
  );
};

export type PageHeadingActionsProps = JSX.HTMLAttributes<HTMLDivElement>;

const PageHeadingActions: Component<PageHeadingActionsProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <div class={cn("flex shrink-0 flex-wrap items-center gap-2", local.class)} {...others}>
      {local.children}
    </div>
  );
};

export { PageHeading, PageHeadingTitle, PageHeadingDescription, PageHeadingActions };
