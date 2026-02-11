import { Meta, Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { Button, Container } from "~/components/ui";
import BrandLogo from "~/components/brand/brand-logo";
import { cn } from "~/lib/utils";

export default function NotFound() {
  return (
    <>
      <Title>Page Not Found – GradePoint</Title>
      <Meta
        name="description"
        content="The page you're looking for doesn't exist. Return to GradePoint home."
      />

      <main
        class={cn(
          "relative flex min-h-dvh flex-col items-center justify-center px-4 py-24",
          "bg-muted/25 border-b border-border/40",
          "safe-area-inset-bottom safe-area-inset-top"
        )}
      >
        <Container size="md" class="relative z-10 flex flex-col items-center text-center">
          <div class="mb-8">
            <BrandLogo size="lg" href="/" />
          </div>
          <span
            class={cn(
              "inline-block rounded-full border border-border/60 bg-background px-4 py-1.5",
              "text-sm font-medium text-muted-foreground tabular-nums"
            )}
          >
            404
          </span>
          <h1 class="mt-6 text-4xl font-bold text-balance sm:text-5xl md:text-6xl">
            Page not found
          </h1>
          <div class="mt-4 h-1 w-16 rounded-full bg-primary" aria-hidden />
          <p class="mt-8 max-w-xl text-lg text-muted-foreground text-pretty sm:text-xl">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
          <div class="mt-12">
            <A href="/">
              <Button size="lg" class="min-w-[180px]">
                Go home
              </Button>
            </A>
          </div>
        </Container>
      </main>
    </>
  );
}
