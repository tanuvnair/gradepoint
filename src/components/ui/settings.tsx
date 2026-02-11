import { Component, JSX } from "solid-js";
import { cn } from "~/lib/utils";

export interface SettingsSectionProps {
  class?: string;
  children: JSX.Element;
}

export const SettingsSection: Component<SettingsSectionProps> = (props) => (
  <div class={cn("flex flex-col gap-3", props.class)}>{props.children}</div>
);

export interface SettingsGroupProps {
  class?: string;
  children: JSX.Element;
}

export const SettingsGroup: Component<SettingsGroupProps> = (props) => (
  <div
    class={cn(
      "flex flex-col rounded-lg border border-border/60 bg-secondary/30 overflow-hidden",
      props.class,
    )}
  >
    {props.children}
  </div>
);

export interface SettingsRowProps {
  label: string;
  description?: string;
  border?: boolean;
  class?: string;
  children: JSX.Element;
}

export const SettingsRow: Component<SettingsRowProps> = (props) => {
  const showBorder = () => props.border !== false;

  return (
    <div
      class={cn(
        "flex flex-row items-center justify-between gap-4 px-4 py-3",
        showBorder() && "border-b border-border/60 last:border-b-0",
        props.class,
      )}
    >
      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
        <span class="text-sm font-medium text-foreground">{props.label}</span>
        {props.description && (
          <span class="text-xs text-muted-foreground text-pretty">{props.description}</span>
        )}
      </div>
      <div class="shrink-0">{props.children}</div>
    </div>
  );
};

export interface SettingsContentRowProps {
  label: string;
  description?: string;
  border?: boolean;
  class?: string;
  children: JSX.Element;
}

export const SettingsContentRow: Component<SettingsContentRowProps> = (
  props,
) => {
  const showBorder = () => props.border !== false;

  return (
    <div
      class={cn(
        "flex flex-col gap-2 px-4 py-3",
        showBorder() && "border-b border-border/60 last:border-b-0",
        props.class,
      )}
    >
      <span class="text-sm font-medium text-foreground">{props.label}</span>
      {props.children}
      {props.description && (
        <span class="text-xs text-muted-foreground text-pretty">{props.description}</span>
      )}
    </div>
  );
};
