import { Meta, Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { For } from "solid-js";
import { Button, Container } from "~/components/ui";
import BrandLogo from "~/components/brand/brand-logo";
import FeatureCard from "~/components/landing/feature-card";
import HeroExamIcons from "~/components/landing/hero-exam-icons";
import SiteFooter from "~/components/layout/site-footer";
import SiteHeader from "~/components/layout/site-header";
import { cn } from "~/lib/utils";

const FEATURES = [
  {
    title: "Real-time exams",
    description:
      "Conduct and take exams live. Questions and submissions sync in real time so everyone stays on the same page.",
  },
  {
    title: "Online assessment",
    description:
      "Create exams, set time limits, and deliver them online. Students take exams from anywhere with a browser.",
  },
  {
    title: "Instant results",
    description:
      "See submissions as they come in. Grade and release results quickly so students get feedback without the wait.",
  },
] as const;

export default function Home() {
  return (
    <>
      <Title>GradePoint – Real-time online examination system</Title>
      <Meta
        name="description"
        content="GradePoint is a real-time online examination system for students, educators and organizations. Conduct and take exams live, with instant results and grading."
      />

      <SiteHeader />

      <main>
        <section
          class={cn(
            "relative flex min-h-dvh flex-col items-center justify-center px-4 py-24",
            "bg-muted/25 border-b border-border/40",
            "safe-area-inset-bottom safe-area-inset-top"
          )}
        >
          <HeroExamIcons />
          <Container size="md" class="relative z-10 flex flex-col items-center text-center">
            <div class="mb-8">
              <BrandLogo size="lg" href="/" />
            </div>
            <span
              class={cn(
                "inline-block rounded-full border border-border/60 bg-background px-4 py-1.5",
                "text-sm font-medium text-muted-foreground"
              )}
            >
              For students, educators and organizations
            </span>
            <h1 class="mt-6 text-4xl font-bold text-balance sm:text-5xl md:text-6xl lg:text-7xl">
              Real-time online examinations.
            </h1>
            <div class="mt-4 h-1 w-16 rounded-full bg-primary" aria-hidden />
            <p class="mt-8 max-w-2xl text-lg text-muted-foreground text-pretty sm:text-xl">
              Conduct and take exams live. Create assessments, run them in real time, and get
              instant results. Students, educators and organizations can all benefit from a single,
              reliable examination system.
            </p>
            <div class="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:gap-4">
              <A href="/sign-up">
                <Button size="lg" class="min-w-[180px] w-full sm:w-auto">
                  Get started
                </Button>
              </A>
              <A href="/sign-in">
                <Button variant="outline" size="lg" class="min-w-[180px] w-full sm:w-auto">
                  Sign in
                </Button>
              </A>
            </div>
          </Container>
        </section>

        <section class="border-t border-border/60 bg-muted/40 py-20">
          <Container size="lg" class="px-4">
            <h2 class="text-center text-2xl font-semibold text-balance sm:text-3xl">
              Built for live, online assessment
            </h2>
            <p class="mx-auto mt-3 max-w-xl text-center text-muted-foreground text-pretty">
              Students take exams, educators create and grade them, and organizations run
              assessments at scale.
            </p>
            <ul class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
              <For each={FEATURES}>
                {(feature) => (
                  <li>
                    <FeatureCard title={feature.title} description={feature.description} />
                  </li>
                )}
              </For>
            </ul>
          </Container>
        </section>

        <section class="py-20">
          <Container size="md" class="px-4 text-center">
            <h2 class="text-2xl font-semibold text-balance sm:text-3xl">Ready to get started?</h2>
            <p class="mt-3 text-muted-foreground text-pretty">
              Create your account and run your first real-time exam in minutes.
            </p>
            <div class="mt-8">
              <A href="/sign-up">
                <Button size="lg">Create free account</Button>
              </A>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
