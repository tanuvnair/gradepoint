import {
  Root as CheckboxRoot,
  Control as CheckboxControl,
  Input as CheckboxInput,
  Indicator as CheckboxIndicator,
  Label as CheckboxLabel,
} from "@kobalte/core/checkbox";
import { Component, JSX, splitProps, Show } from "solid-js";
import { cn } from "~/lib/utils";
import Check from "lucide-solid/icons/check";

export type CheckboxProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  defaultChecked?: boolean;
};

const Checkbox: Component<CheckboxProps> = (props) => {
  const [local, others] = splitProps(props, [
    "class",
    "checked",
    "defaultChecked",
    "onChange",
    "disabled",
    "children",
  ]);

  const handleChange = (checked: boolean) => {
    const fn = local.onChange;
    if (typeof fn === "function") {
      const ev = new Event("change", { bubbles: true });
      Object.defineProperty(ev, "currentTarget", {
        value: { checked },
        writable: false,
      });
      (fn as (e: Event & { currentTarget: HTMLInputElement }) => void)(
        ev as Event & { currentTarget: HTMLInputElement }
      );
    }
  };

  return (
    <CheckboxRoot
      class={cn("relative inline-flex cursor-pointer items-center", local.class)}
      checked={local.checked}
      defaultChecked={local.defaultChecked}
      onChange={handleChange as (checked: boolean) => void}
      disabled={local.disabled}
      {...others}
    >
      <CheckboxInput class="peer sr-only" />
      <CheckboxControl
        class={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-input bg-background transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
          "data-checked:border-primary data-checked:bg-primary"
        )}
      >
        <CheckboxIndicator>
          <Check class="h-3 w-3 text-primary-foreground" />
        </CheckboxIndicator>
      </CheckboxControl>
      <Show when={local.children}>
        <CheckboxLabel class="ml-2 text-sm font-medium text-foreground select-none">
          {local.children}
        </CheckboxLabel>
      </Show>
    </CheckboxRoot>
  );
};

export default Checkbox;
