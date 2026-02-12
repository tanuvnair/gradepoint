import { A } from "@solidjs/router";
import { cn } from "~/lib/utils";

export type BrandLogoSize = "sm" | "md" | "lg";

export interface BrandLogoProps {
  href?: string;
  size?: BrandLogoSize;
  /** When true, only the icon is shown (e.g. for collapsed sidebars). */
  iconOnly?: boolean;
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

  const iconOnly = () => props.iconOnly ?? false;

  return (
    <A
      href={href()}
      class={cn(
        "flex items-center no-underline text-foreground",
        !iconOnly() && "gap-2",
        size() === "lg" && !iconOnly() && "flex-col gap-2",
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
      {!iconOnly() && <span class={cn("text-balance", config().textClass)}>GradePoint</span>}
    </A>
  );
}
