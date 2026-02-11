import { Meta, Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { For } from "solid-js";
import { Button, Container } from "~/components/ui";
import FeatureCard from "~/components/landing/feature-card";
import SiteFooter from "~/components/layout/site-footer";
import SiteHeader from "~/components/layout/site-header";
import { cn } from "~/lib/utils";

const FEATURES = [
  {
    title: "Track your grades",
    description:
      "Log assignments and exams, see your running average per course, and know where you stand at a glance.",
  },
  {
    title: "Manage courses",
    description:
      "Keep all your courses in one place. Add semesters, set credits, and see your overall GPA when it matters.",
  },
  {
    title: "Stay organized",
    description:
      "No spreadsheets, no guesswork. GradePoint gives you a clear view of your progress so you can focus on learning.",
  },
] as const;

export default function Home() {
  return (
    <>
      <Title>GradePoint – Manage your grades and courses</Title>
      <Meta
        name="description"
        content="GradePoint helps students track grades, manage courses, and stay on top of their progress in one simple place."
      />

      <SiteHeader />

      <main>
        <section
          class={cn(
            "flex min-h-dvh flex-col items-center justify-center px-4 py-20",
            "safe-area-inset-bottom safe-area-inset-top",
          )}
        >
          <Container size="md" class="flex flex-col items-center text-center">
            <h1 class="text-4xl font-bold text-balance sm:text-5xl md:text-6xl">
              Your grades, organized.
            </h1>
            <p class="mt-6 max-w-2xl text-lg text-muted-foreground text-pretty sm:text-xl">
              Track courses, monitor your GPA, and stay on top of your progress
              in one simple place. Built for students who want clarity without
              the clutter.
            </p>
            <div class="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-3">
              <A href="/sign-up">
                <Button size="lg" class="w-full sm:w-auto">
                  Get started free
                </Button>
              </A>
              <A href="/sign-in">
                <Button variant="outline" size="lg" class="w-full sm:w-auto">
                  Sign in
                </Button>
              </A>
            </div>
          </Container>
        </section>

        <section class="border-t border-border/60 bg-muted/40 py-20">
          <Container size="lg" class="px-4">
            <h2 class="text-center text-2xl font-semibold text-balance sm:text-3xl">
              Everything you need to stay on track
            </h2>
            <p class="mx-auto mt-3 max-w-xl text-center text-muted-foreground text-pretty">
              Simple tools that fit how you study.
            </p>
            <ul class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
              <For each={FEATURES}>
                {(feature) => (
                  <li>
                    <FeatureCard
                      title={feature.title}
                      description={feature.description}
                    />
                  </li>
                )}
              </For>
            </ul>
          </Container>
        </section>

        <section class="py-20">
          <Container size="md" class="px-4 text-center">
            <h2 class="text-2xl font-semibold text-balance sm:text-3xl">
              Ready to get started?
            </h2>
            <p class="mt-3 text-muted-foreground text-pretty">
              Create your account and start tracking your grades in minutes.
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
