import { children, Component, JSX, splitProps } from "solid-js";
import { cn } from "~/lib/utils";

export interface EmptyStateProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** Primary message */
  title: string;
  /** Optional secondary description */
  description?: string;
  /** Optional action slot (e.g. a button) */
  action?: JSX.Element;
}

const EmptyState: Component<EmptyStateProps> = (props) => {
  const [local, others] = splitProps(props, [
    "title",
    "description",
    "action",
    "class",
    "children",
  ]);
  const resolvedAction = children(() => local.action);
  const resolvedChildren = children(() => local.children);

  return (
    <div
      class={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/60 bg-secondary/30 p-12 text-center",
        local.class,
      )}
      {...others}
    >
      <p class="text-lg font-medium text-foreground text-balance">{local.title}</p>
      {local.description && (
        <p class="text-sm text-muted-foreground text-pretty">{local.description}</p>
      )}
      {resolvedAction() && <div class="flex justify-center">{resolvedAction()}</div>}
      {resolvedChildren()}
    </div>
  );
};

export default EmptyState;
