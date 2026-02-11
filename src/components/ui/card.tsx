import { Component, JSX, splitProps } from "solid-js";
import { cn } from "~/lib/utils";

export type CardProps = JSX.HTMLAttributes<HTMLDivElement>;

const Card: Component<CardProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <div
      class={cn(
        "rounded-xl border border-border/60 bg-card text-card-foreground shadow-apple",
        local.class,
      )}
      {...others}
    >
      {local.children}
    </div>
  );
};

export type CardHeaderProps = JSX.HTMLAttributes<HTMLDivElement>;

const CardHeader: Component<CardHeaderProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <div
      class={cn("flex flex-col gap-1.5 p-6", local.class)}
      {...others}
    >
      {local.children}
    </div>
  );
};

export type CardTitleProps = JSX.HTMLAttributes<HTMLHeadingElement>;

const CardTitle: Component<CardTitleProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <h3
      class={cn("text-xl font-semibold leading-8 text-balance", local.class)}
      {...others}
    >
      {local.children}
    </h3>
  );
};

export type CardDescriptionProps = JSX.HTMLAttributes<HTMLParagraphElement>;

const CardDescription: Component<CardDescriptionProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <p
      class={cn("text-sm text-muted-foreground text-pretty", local.class)}
      {...others}
    >
      {local.children}
    </p>
  );
};

export type CardContentProps = JSX.HTMLAttributes<HTMLDivElement>;

const CardContent: Component<CardContentProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <div class={cn("p-6 pt-0", local.class)} {...others}>
      {local.children}
    </div>
  );
};

export type CardFooterProps = JSX.HTMLAttributes<HTMLDivElement>;

const CardFooter: Component<CardFooterProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <div
      class={cn("flex items-center p-6 pt-0", local.class)}
      {...others}
    >
      {local.children}
    </div>
  );
};

export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export default Card;
