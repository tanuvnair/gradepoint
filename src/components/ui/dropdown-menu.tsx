import {
  Root as DropdownMenuRoot,
  Trigger as DropdownMenuTrigger,
  Portal as DropdownMenuPortal,
  Content as DropdownMenuContentPrimitive,
  Item as DropdownMenuItemPrimitive,
  ItemLabel as DropdownMenuItemLabel,
  Group as DropdownMenuGroupPrimitive,
  GroupLabel as DropdownMenuGroupLabelPrimitive,
  Separator as DropdownMenuSeparatorPrimitive,
  type DropdownMenuRootProps,
} from "@kobalte/core/dropdown-menu";
import { Component, JSX, splitProps } from "solid-js";
import { cn } from "~/lib/utils";

export interface DropdownMenuProps extends DropdownMenuRootProps {
  class?: string;
  children: JSX.Element;
}

export interface DropdownMenuTriggerProps {
  class?: string;
  children: JSX.Element;
}

export interface DropdownMenuContentComponentProps {
  class?: string;
  children: JSX.Element;
}

export interface DropdownMenuItemComponentProps {
  class?: string;
  children: JSX.Element;
  closeOnSelect?: boolean;
  onSelect?: () => void;
}

const DropdownMenu: Component<DropdownMenuProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return <DropdownMenuRoot {...others}>{local.children}</DropdownMenuRoot>;
};

const DropdownMenuTriggerComponent: Component<DropdownMenuTriggerProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <DropdownMenuTrigger
      class={cn(
        "flex cursor-pointer items-center outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        local.class
      )}
      {...others}
    >
      {local.children}
    </DropdownMenuTrigger>
  );
};

const DropdownMenuContent: Component<DropdownMenuContentComponentProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <DropdownMenuPortal>
      <DropdownMenuContentPrimitive
        class={cn(
          "z-50 min-w-32 overflow-hidden rounded-lg border border-border bg-popover px-0 py-2 text-popover-foreground shadow-apple-lg",
          local.class
        )}
        {...others}
      >
        {local.children}
      </DropdownMenuContentPrimitive>
    </DropdownMenuPortal>
  );
};

export interface DropdownMenuGroupProps {
  class?: string;
  children: JSX.Element;
}

export interface DropdownMenuGroupLabelProps {
  class?: string;
  children: JSX.Element;
}

const DropdownMenuGroup: Component<DropdownMenuGroupProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <DropdownMenuGroupPrimitive class={cn("flex flex-col", local.class)} {...others}>
      {local.children}
    </DropdownMenuGroupPrimitive>
  );
};

const DropdownMenuGroupLabel: Component<DropdownMenuGroupLabelProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <DropdownMenuGroupLabelPrimitive
      class={cn(
        "px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground",
        local.class
      )}
      {...others}
    >
      {local.children}
    </DropdownMenuGroupLabelPrimitive>
  );
};

const DropdownMenuItem: Component<DropdownMenuItemComponentProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "children", "closeOnSelect", "onSelect"]);
  return (
    <DropdownMenuItemPrimitive
      class={cn(
        "relative flex cursor-pointer select-none items-center gap-3 rounded-none px-3 py-2 text-sm outline-none",
        "focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
        local.class
      )}
      closeOnSelect={local.closeOnSelect ?? true}
      onSelect={local.onSelect}
      {...others}
    >
      {local.children}
    </DropdownMenuItemPrimitive>
  );
};

export interface DropdownMenuSeparatorComponentProps {
  class?: string;
}

const DropdownMenuSeparatorComponent: Component<DropdownMenuSeparatorComponentProps> = (props) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <DropdownMenuSeparatorPrimitive
      class={cn("my-2 h-px w-full shrink-0 bg-border", local.class)}
      {...others}
    />
  );
};

export {
  DropdownMenu,
  DropdownMenuTriggerComponent as DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuItemLabel,
  DropdownMenuSeparatorComponent as DropdownMenuSeparator,
};
