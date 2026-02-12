import { A } from "@solidjs/router";
import { cn } from "~/lib/utils";

export type BrandLogoSize = "sm" | "md" | "lg";

export interface BrandLogoProps {
  href?: string;
  size?: BrandLogoSize;
  class?: string;
}

const sizeConfig: Record<
  BrandLogoSize,
  { iconClass: string; iconSize: number; textClass: string }
> = {
  sm: { iconClass: "size-6", iconSize: 24, textClass: "text-sm font-medium" },
  md: { iconClass: "size-8", iconSize: 32, textClass: "text-lg font-semibold" },
  lg: { iconClass: "size-14", iconSize: 56, textClass: "text-xl font-semibold" },
};

export default function BrandLogo(props: BrandLogoProps) {
  const href = () => props.href ?? "/";
  const size = () => props.size ?? "md";
  const config = () => sizeConfig[size()];

  return (
    <A
      href={href()}
      class={cn(
        "flex items-center gap-2 no-underline text-foreground",
        size() === "lg" && "flex-col gap-3",
        props.class
      )}
      aria-label="GradePoint home"
    >
      <img
        src="/favicon.svg"
        alt=""
        class={config().iconClass}
        width={config().iconSize}
        height={config().iconSize}
      />
      <span class={cn("text-balance", config().textClass)}>GradePoint</span>
    </A>
  );
}
