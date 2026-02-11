import { A } from "@solidjs/router";
import BrandLogo from "~/components/brand/brand-logo";
import { Container } from "~/components/ui";
import { cn } from "~/lib/utils";

export interface SiteFooterProps {
  class?: string;
}

const footerLinkClass = cn(
  "text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline",
);

export default function SiteFooter(props: SiteFooterProps) {
  return (
    <footer
      class={cn(
        "border-t border-border/60 py-8",
        props.class,
      )}
    >
      <Container
        size="xl"
        class="flex flex-col items-center justify-between gap-4 px-4 sm:flex-row"
      >
        <BrandLogo size="sm" />
        <nav class="flex items-center gap-6" aria-label="Footer navigation">
          <A href="/sign-in" class={footerLinkClass}>
            Sign in
          </A>
          <A href="/sign-up" class={footerLinkClass}>
            Get started
          </A>
        </nav>
      </Container>
    </footer>
  );
}
