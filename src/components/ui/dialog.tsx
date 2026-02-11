import {
  Component,
  JSX,
  createEffect,
  onCleanup,
  createSignal,
  splitProps,
} from "solid-js";
import { Portal } from "solid-js/web";
import { cn } from "~/lib/utils";

const DURATION_MS = 200;

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  class?: string;
  children: JSX.Element;
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
  const [entered, setEntered] = createSignal(false);
  const [exiting, setExiting] = createSignal(false);

  const visible = () => props.open || exiting();
  const state = () => (entered() && !exiting() ? "open" : "closed");

  const close = () => {
    if (exiting()) return;
    setExiting(true);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") close();
  };

  createEffect(() => {
    if (props.open) {
      setExiting(false);
      setEntered(false);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setEntered(true));
      });
      onCleanup(() => cancelAnimationFrame(raf));
    } else if (entered()) {
      setExiting(true);
    }
  });

  createEffect(() => {
    if (!exiting()) return;
    const id = setTimeout(() => {
      setExiting(false);
      setEntered(false);
      props.onOpenChange(false);
    }, DURATION_MS);
    onCleanup(() => clearTimeout(id));
  });

  createEffect(() => {
    if (!visible()) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    onCleanup(() => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    });
  });

  return (
    <Portal>
      <div
        class={cn("fixed inset-0 z-50 flex items-center justify-center", props.class)}
      >
        <div
          class="dialog-overlay fixed inset-0 z-50 bg-black/50"
          data-state={state()}
          data-exiting={exiting()}
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
          aria-hidden
        />
        <div
          class="dialog-content relative z-50"
          role="dialog"
          aria-modal="true"
          data-state={state()}
          data-exiting={exiting()}
          onClick={(e) => e.stopPropagation()}
        >
          {props.children}
        </div>
      </div>
    </Portal>
  );
};

const DialogContent: Component<DialogContentProps> = (props) => (
  <div
    class={cn(
      "relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border/60 bg-card p-0 text-card-foreground shadow-apple-lg",
      props.class,
    )}
  >
    {props.children}
  </div>
);

const DialogHeader: Component<DialogHeaderProps> = (props) => (
  <div class={cn("flex flex-col gap-1.5 p-6 pb-4", props.class)}>
    {props.children}
  </div>
);

const DialogBody: Component<DialogBodyProps> = (props) => (
  <div class={cn("flex flex-col gap-4 px-6 pb-6", props.class)}>
    {props.children}
  </div>
);

const DialogFooter: Component<DialogFooterProps> = (props) => (
  <div
    class={cn(
      "flex flex-row justify-end gap-2 border-t border-border/60 p-6",
      props.class,
    )}
  >
    {props.children}
  </div>
);

const DialogTitle: Component<DialogTitleProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "id", "children"]);
  return (
    <h2
      class={cn("text-xl font-semibold leading-8 text-balance", local.class)}
      id={local.id}
      {...others}
    >
      {local.children}
    </h2>
  );
};

const DialogDescription: Component<DialogDescriptionProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "id", "children"]);
  return (
    <p
      class={cn("text-sm text-muted-foreground text-pretty", local.class)}
      id={local.id}
      {...others}
    >
      {local.children}
    </p>
  );
};

export default Dialog;
export {
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
