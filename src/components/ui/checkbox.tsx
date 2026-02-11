import { Component, JSX, splitProps, Show } from "solid-js";
import { cn } from "~/lib/utils";
import Check from "lucide-solid/icons/check";

export type CheckboxProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "type"
>;

const Checkbox: Component<CheckboxProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "checked", "disabled"]);

  return (
    <label class="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        class="peer sr-only"
        checked={local.checked}
        disabled={local.disabled}
        {...others}
      />
      <div
        class={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-input bg-background transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
          local.checked && "border-primary bg-primary",
          local.class,
        )}
      >
        <Show when={local.checked}>
          <Check class="h-3 w-3 text-primary-foreground" />
        </Show>
      </div>
    </label>
  );
};

export default Checkbox;
