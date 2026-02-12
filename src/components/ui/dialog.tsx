import {
  Root as DialogRoot,
  Portal as DialogPortal,
  Overlay as DialogOverlay,
  Content as DialogContentPrimitive,
  Title as DialogTitlePrimitive,
  Description as DialogDescriptionPrimitive,
  type DialogRootProps,
} from "@kobalte/core/dialog";
import { Component, JSX, splitProps } from "solid-js";
import { cn } from "~/lib/utils";

export interface DialogProps extends DialogRootProps {
  class?: string;
}

export interface DialogContentProps {
  class?: string;
  children: JSX.Element;
}

export interface DialogHeaderProps {
  class?: string;
  children: JSX.Element;
}

export interface DialogBodyProps {
  class?: string;
  children: JSX.Element;
}

export interface DialogFooterProps {
  class?: string;
  children: JSX.Element;
}

export interface DialogTitleProps {
  class?: string;
  id?: string;
  children: JSX.Element;
}

export interface DialogDescriptionProps {
  class?: string;
  id?: string;
  children: JSX.Element;
}

const Dialog: Component<DialogProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return <DialogRoot {...others}>{local.children}</DialogRoot>;
};

const DialogContent: Component<DialogContentProps> = (props) => (
  <DialogPortal>
    <div class="fixed inset-0 z-50 flex items-center justify-center safe-area-inset-bottom safe-area-inset-top">
      <DialogOverlay class="dialog-overlay fixed inset-0 z-50 bg-black/50 safe-area-inset-bottom safe-area-inset-top" />
      <DialogContentPrimitive
        class="dialog-content relative z-50"
        onClick={(e: MouseEvent) => e.stopPropagation()}
      >
        <div
          class={cn(
            "relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border/60 bg-card p-0 text-card-foreground shadow-apple-lg",
            props.class
          )}
        >
          {props.children}
        </div>
      </DialogContentPrimitive>
    </div>
  </DialogPortal>
);

const DialogHeader: Component<DialogHeaderProps> = (props) => (
  <div class={cn("flex flex-col gap-1.5 p-6 pb-4", props.class)}>{props.children}</div>
);

const DialogBody: Component<DialogBodyProps> = (props) => (
  <div class={cn("flex flex-col gap-4 px-6 pb-6", props.class)}>{props.children}</div>
);

const DialogFooter: Component<DialogFooterProps> = (props) => (
  <div class={cn("flex flex-row justify-end gap-2 border-t border-border/60 p-6", props.class)}>
    {props.children}
  </div>
);

const DialogTitle: Component<DialogTitleProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "id", "children"]);
  return (
    <DialogTitlePrimitive
      class={cn("text-xl font-semibold leading-8 text-balance", local.class)}
      id={local.id}
      {...others}
    >
      {local.children}
    </DialogTitlePrimitive>
  );
};

const DialogDescription: Component<DialogDescriptionProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "id", "children"]);
  return (
    <DialogDescriptionPrimitive
      class={cn("text-sm text-muted-foreground text-pretty", local.class)}
      id={local.id}
      {...others}
    >
      {local.children}
    </DialogDescriptionPrimitive>
  );
};

export default Dialog;
export { DialogContent, DialogHeader, DialogBody, DialogFooter, DialogTitle, DialogDescription };
