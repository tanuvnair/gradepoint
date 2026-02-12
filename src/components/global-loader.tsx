import { useIsRouting } from "@solidjs/router";
import { createEffect, createSignal, Show } from "solid-js";
import { cn } from "../lib/utils";

const COMPLETE_DURATION_MS = 200;

export function GlobalLoader() {
  const isRouting = useIsRouting();
  const [completing, setCompleting] = createSignal(false);
  const [prevRouting, setPrevRouting] = createSignal(false);
  const visible = () => isRouting() || completing();

  createEffect(() => {
    const routing = isRouting();
    const wasRouting = prevRouting();
    setPrevRouting(routing);
    if (wasRouting && !routing) {
      setCompleting(true);
      const t = setTimeout(() => setCompleting(false), COMPLETE_DURATION_MS);
      return () => clearTimeout(t);
    }
  });

  return (
    <Show when={visible()}>
      <div
        class={cn(
          "fixed left-0 right-0 top-0 z-50 h-0.5 overflow-hidden pointer-events-none",
          "safe-area-inset-top"
        )}
        role="progressbar"
        aria-hidden="true"
        aria-label="Page loading"
      >
        <div
          class={cn(
            "h-full bg-primary origin-left",
            isRouting() && "global-loader-bar--loading",
            completing() && "global-loader-bar--completing"
          )}
        />
      </div>
    </Show>
  );
}
