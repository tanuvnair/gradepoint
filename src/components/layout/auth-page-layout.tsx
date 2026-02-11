import { Meta, Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import BrandLogo from "~/components/brand/brand-logo";
import { Container } from "~/components/ui";
import { cn } from "~/lib/utils";
import type { JSX } from "solid-js";

export interface AuthPageLayoutProps {
  pageTitle: string;
  metaDescription: string;
  backLinkLabel?: string;
  children: JSX.Element;
}

const backLinkClass = cn(
  "text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline",
);

export default function AuthPageLayout(props: AuthPageLayoutProps) {
  return (
    <div
      class={cn(
        "flex min-h-dvh flex-col items-center justify-center py-10 px-4",
        "safe-area-inset-bottom safe-area-inset-top",
      )}
    >
      <Title>{props.pageTitle} - GradePoint</Title>
      <Meta name="description" content={props.metaDescription} />
      <Container size="sm" class="w-full flex flex-col items-center">
        <div class="mb-10">
          <BrandLogo size="lg" />
        </div>

        {props.children}

        <A href="/" class={cn("mt-8", backLinkClass)}>
          {props.backLinkLabel ?? "Back to landing page"}
        </A>
      </Container>
    </div>
  );
}
