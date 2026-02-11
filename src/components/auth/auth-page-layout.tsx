import { Meta, Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { Container } from "~/components/ui";
import { cn } from "~/lib/utils";
import type { JSX } from "solid-js";

export interface AuthPageLayoutProps {
  pageTitle: string;
  metaDescription: string;
  backLinkLabel?: string;
  children: JSX.Element;
}

export default function AuthPageLayout(props: AuthPageLayoutProps) {
  return (
    <div
      class={cn(
        "flex min-h-dvh flex-col items-center justify-center py-10 px-4",
        "safe-area-inset-bottom safe-area-inset-top"
      )}
    >
      <Title>{props.pageTitle} - GradePoint</Title>
      <Meta name="description" content={props.metaDescription} />
      <Container size="sm" class="w-full flex flex-col items-center">
        <A
          href="/"
          class="mb-10 flex flex-col items-center gap-3 no-underline text-foreground"
          aria-label="GradePoint home"
        >
          <img src="/favicon.svg" alt="" class="size-14" width="56" height="56" />
          <span class="text-xl font-semibold text-balance">GradePoint</span>
        </A>

        {props.children}

        <A
          href="/"
          class="mt-8 text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        >
          {props.backLinkLabel ?? "Back to landing page"}
        </A>
      </Container>
    </div>
  );
}
