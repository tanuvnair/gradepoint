import {
  Root as ComboboxRoot,
  Control as ComboboxControlPrimitive,
  Input as ComboboxInputPrimitive,
  Trigger as ComboboxTriggerPrimitive,
  Icon as ComboboxIconPrimitive,
  Portal as ComboboxPortalPrimitive,
  Content as ComboboxContentPrimitive,
  Listbox as ComboboxListboxPrimitive,
  Item as ComboboxItemPrimitive,
  ItemLabel as ComboboxItemLabelPrimitive,
  ItemIndicator as ComboboxItemIndicatorPrimitive,
  Label as ComboboxLabelPrimitive,
  Description as ComboboxDescriptionPrimitive,
  ErrorMessage as ComboboxErrorMessagePrimitive,
  type ComboboxRootProps,
  type ComboboxControlProps,
  type ComboboxContentProps,
  type ComboboxItemProps,
  type ComboboxLabelProps,
  type ComboboxDescriptionProps,
  type ComboboxErrorMessageProps,
} from "@kobalte/core/combobox";
import Check from "lucide-solid/icons/check";
import ChevronDown from "lucide-solid/icons/chevron-down";
import { Component, JSX, splitProps } from "solid-js";
import { cn } from "~/lib/utils";

export type ComboboxProps<Option = unknown, OptGroup = never> = Omit<
  ComboboxRootProps<Option, OptGroup>,
  "class"
> & { class?: string; children?: JSX.Element };

export type ComboboxControlPropsOption<Option> = ComboboxControlProps<Option> & { class?: string };

export type ComboboxContentPropsOption = ComboboxContentProps & {
  class?: string;
  children?: JSX.Element;
};

export type ComboboxItemPropsOption = ComboboxItemProps & {
  class?: string;
  children?: JSX.Element;
};

export type ComboboxLabelPropsOption = ComboboxLabelProps & {
  class?: string;
  children?: JSX.Element;
};

export type ComboboxDescriptionPropsOption = ComboboxDescriptionProps & {
  class?: string;
  children?: JSX.Element;
};

export type ComboboxErrorMessagePropsOption = ComboboxErrorMessageProps & {
  class?: string;
  children?: JSX.Element;
};

const Combobox: Component<ComboboxProps<unknown, never>> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <ComboboxRoot
      {...(others as ComboboxRootProps<unknown, never>)}
      class={cn("flex flex-col gap-1.5", local.class)}
    >
      {local.children}
    </ComboboxRoot>
  );
};

const ComboboxLabel: Component<ComboboxLabelPropsOption> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <ComboboxLabelPrimitive
      class={cn("text-sm font-medium text-foreground leading-6 select-none", local.class)}
      {...others}
    >
      {local.children}
    </ComboboxLabelPrimitive>
  );
};

const ComboboxControl: Component<ComboboxControlPropsOption<unknown>> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <ComboboxControlPrimitive
      class={cn(
        "flex h-11 w-full items-center rounded-lg border border-input bg-background text-base transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        local.class
      )}
      {...others}
    >
      {local.children}
    </ComboboxControlPrimitive>
  );
};

const ComboboxInput: Component<{ class?: string }> = (props) => {
  const [local] = splitProps(props, ["class"]);
  return (
    <ComboboxInputPrimitive
      class={cn(
        "flex flex-1 rounded-lg border-0 bg-transparent px-4 py-2 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
        local.class
      )}
    />
  );
};

const ComboboxTrigger: Component<{
  class?: string;
  "aria-label"?: string;
  children?: JSX.Element;
}> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <ComboboxTriggerPrimitive
      class={cn(
        "flex items-center justify-center rounded-r-lg px-3 text-muted-foreground hover:text-foreground data-expanded:text-foreground",
        local.class
      )}
      {...others}
    >
      {local.children}
    </ComboboxTriggerPrimitive>
  );
};

const ComboboxIcon: Component<{ class?: string; children?: JSX.Element }> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <ComboboxIconPrimitive
      class={cn("flex size-4 shrink-0 items-center justify-center", local.class)}
      {...others}
    >
      {local.children ?? <ChevronDown class="size-4" />}
    </ComboboxIconPrimitive>
  );
};

const ComboboxPortal: Component<{ children: JSX.Element }> = (props) => (
  <ComboboxPortalPrimitive>{props.children}</ComboboxPortalPrimitive>
);

const ComboboxContent: Component<ComboboxContentPropsOption> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <ComboboxContentPrimitive
      {...(others as ComboboxContentProps)}
      class={cn(
        "z-50 max-h-(--kb-combobox-content-available-height) min-w-(--kb-combobox-trigger-width) overflow-y-auto rounded-lg border border-border/60 bg-popover text-popover-foreground shadow-apple-lg",
        local.class
      )}
    >
      {local.children}
    </ComboboxContentPrimitive>
  );
};

const ComboboxListbox: Component<{
  class?: string;
  "aria-label"?: string;
}> = (props) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <ComboboxListboxPrimitive
      {...others}
      class={cn("flex flex-col gap-0.5 p-1 outline-none", local.class)}
    />
  );
};

const ComboboxItem: Component<ComboboxItemPropsOption> = (props) => {
  const [local, others] = splitProps(props, ["class", "item", "children"]);
  return (
    <ComboboxItemPrimitive
      {...(others as Omit<ComboboxItemProps, "class" | "item" | "children">)}
      item={local.item}
      class={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-md py-2 pl-3 pr-8 text-sm outline-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground",
        local.class
      )}
    >
      {local.children}
    </ComboboxItemPrimitive>
  );
};

const ComboboxItemLabel: Component<{
  class?: string;
  children: JSX.Element;
}> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <ComboboxItemLabelPrimitive
      class={cn("flex flex-1 flex-col gap-0.5 truncate", local.class)}
      {...others}
    >
      {local.children}
    </ComboboxItemLabelPrimitive>
  );
};

const ComboboxItemIndicator: Component<{
  class?: string;
  children?: JSX.Element;
  forceMount?: boolean;
}> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <ComboboxItemIndicatorPrimitive
      class={cn(
        "absolute right-2 flex size-4 items-center justify-center text-primary",
        local.class
      )}
      {...others}
    >
      {local.children ?? <Check class="size-4" />}
    </ComboboxItemIndicatorPrimitive>
  );
};

const ComboboxDescription: Component<ComboboxDescriptionPropsOption> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <ComboboxDescriptionPrimitive
      {...(others as ComboboxDescriptionProps)}
      class={cn("text-sm text-muted-foreground", local.class)}
    >
      {local.children}
    </ComboboxDescriptionPrimitive>
  );
};

const ComboboxErrorMessage: Component<ComboboxErrorMessagePropsOption> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <ComboboxErrorMessagePrimitive
      {...(others as ComboboxErrorMessageProps)}
      class={cn("text-sm text-destructive", local.class)}
    >
      {local.children}
    </ComboboxErrorMessagePrimitive>
  );
};

export default Object.assign(Combobox, {
  Label: ComboboxLabel,
  Control: ComboboxControl,
  Input: ComboboxInput,
  Trigger: ComboboxTrigger,
  Icon: ComboboxIcon,
  Portal: ComboboxPortal,
  Content: ComboboxContent,
  Listbox: ComboboxListbox,
  Item: ComboboxItem,
  ItemLabel: ComboboxItemLabel,
  ItemIndicator: ComboboxItemIndicator,
  Description: ComboboxDescription,
  ErrorMessage: ComboboxErrorMessage,
});
