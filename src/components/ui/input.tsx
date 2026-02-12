import { Root as TextFieldRoot, Input as TextFieldInput } from "@kobalte/core/text-field";
import { Component, JSX, splitProps } from "solid-js";
import { cn } from "~/lib/utils";

export type InputProps = JSX.InputHTMLAttributes<HTMLInputElement>;

const INPUT_ROOT_KEYS: (keyof InputProps)[] = [
  "value",
  "onInput",
  "id",
  "name",
  "required",
  "disabled",
  "readOnly",
  "class",
  "type",
  "placeholder",
  "autocomplete",
  "autofocus",
  "aria-invalid",
];

const Input: Component<InputProps> = (props) => {
  const [rootProps] = splitProps(props, INPUT_ROOT_KEYS);
  const type = () => rootProps.type ?? "text";

  const value = () =>
    typeof rootProps.value === "string" || rootProps.value === undefined
      ? rootProps.value
      : String(rootProps.value);

  const handleChange = (value: string) => {
    const fn = rootProps.onInput;
    if (typeof fn === "function") {
      const ev = new InputEvent("input", { bubbles: true });
      Object.defineProperty(ev, "currentTarget", {
        value: { value },
        writable: false,
      });
      (fn as (e: InputEvent & { currentTarget: HTMLInputElement }) => void)(
        ev as InputEvent & { currentTarget: HTMLInputElement }
      );
    }
  };

  const isControlled = () => rootProps.value !== undefined;
  const defaultValue = () => ("defaultValue" in props ? (props.defaultValue as string) : undefined);

  return (
    <TextFieldRoot
      {...(isControlled()
        ? { value: value(), onChange: handleChange }
        : {
            ...(defaultValue() !== undefined && {
              defaultValue: defaultValue(),
            }),
            ...(rootProps.onInput && { onChange: handleChange }),
          })}
      id={rootProps.id}
      name={rootProps.name}
      required={rootProps.required}
      disabled={rootProps.disabled}
      readOnly={rootProps.readOnly}
      validationState={rootProps["aria-invalid"] ? "invalid" : undefined}
    >
      <TextFieldInput
        type={type()}
        class={cn(
          "flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          (type() === "number" || type() === "tel") && "tabular-nums",
          rootProps.class
        )}
        placeholder={rootProps.placeholder}
        autocomplete={rootProps.autocomplete}
        autofocus={rootProps.autofocus}
      />
    </TextFieldRoot>
  );
};

export default Input;
