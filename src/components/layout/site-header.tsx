import { A } from "@solidjs/router";
import BrandLogo from "~/components/brand/brand-logo";
import { Button, Container } from "~/components/ui";
import { cn } from "~/lib/utils";

export interface SiteHeaderProps {
  class?: string;
}

const navLinkClass = cn(
  "inline-flex min-h-11 items-center px-4 text-sm font-medium text-foreground",
  "hover:text-primary underline-offset-4 hover:underline",
);

export default function SiteHeader(props: SiteHeaderProps) {
  return (
    <header
      class={cn(
        "border-b border-border/60 bg-background/95",
        props.class,
      )}
    >
      <Container size="xl" class="flex h-16 items-center justify-between">
        <BrandLogo size="md" />
        <nav class="flex items-center gap-3" aria-label="Main navigation">
          <A href="/sign-in" class={navLinkClass}>
            Sign in
          </A>
          <A href="/sign-up" class="inline-flex items-center">
            <Button size="sm">Get started</Button>
          </A>
        </nav>
      </Container>
    </header>
  );
}
