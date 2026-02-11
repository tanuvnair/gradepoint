import { Meta, Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Container,
  Input,
  Label,
} from "~/components/ui";
import { cn } from "~/lib/utils";

export default function SignIn() {
  return (
    <div
      class={cn(
        "flex min-h-dvh flex-col items-center justify-center py-10 px-4",
        "safe-area-inset-bottom safe-area-inset-top"
      )}
    >
      <Title>Sign in - GradePoint</Title>
      <Meta
        name="description"
        content="Sign in to your GradePoint account with your email and password."
      />
      <Container size="sm" class="w-full flex flex-col items-center">
        <A
          href="/"
          class="mb-10 flex flex-col items-center gap-3 no-underline text-foreground"
          aria-label="GradePoint home"
        >
          <img src="/favicon.svg" alt="" class="size-14" width="56" height="56" />
          <span class="text-xl font-semibold text-balance">GradePoint</span>
        </A>

        <Card class="w-full max-w-[400px] shadow-apple-lg">
          <CardHeader class="pb-4">
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription class="text-pretty">
              Use your email and password to access GradePoint dashboard.
            </CardDescription>
          </CardHeader>
          <form action="#" method="post" class="contents" onSubmit={(e) => e.preventDefault()}>
            <CardContent class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <Label for="sign-in-email">Email</Label>
                <Input
                  id="sign-in-email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between">
                  <Label for="sign-in-password">Password</Label>
                  <A href="/forgot-password" class="text-sm text-primary hover:underline">
                    Forgot password?
                  </A>
                </div>
                <Input
                  id="sign-in-password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </CardContent>
            <CardFooter class="flex flex-col gap-5">
              <Button type="submit" class="w-full">
                Sign in
              </Button>
              <p class="text-center text-sm text-muted-foreground text-pretty">
                Don&apos;t have an account?{" "}
                <A href="/sign-up" class="text-primary font-medium hover:underline">
                  Create one
                </A>
              </p>
            </CardFooter>
          </form>
        </Card>

        <A
          href="/"
          class="mt-8 text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        >
          Back to landing page
        </A>
      </Container>
    </div>
  );
}
