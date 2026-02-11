import { A } from "@solidjs/router";
import AuthPageLayout from "~/components/layout/auth-page-layout";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "~/components/ui";

export default function SignUp() {
  return (
    <AuthPageLayout
      pageTitle="Sign up"
      metaDescription="Create your GradePoint account to conduct or take real-time online exams."
    >
      <Card class="w-full max-w-[400px] shadow-apple-lg">
        <CardHeader class="pb-4">
          <CardTitle>Create your account</CardTitle>
          <CardDescription class="text-pretty">
            Enter your details to get started with the real-time examination system.
          </CardDescription>
        </CardHeader>
        <form action="#" method="post" class="contents" onSubmit={(e) => e.preventDefault()}>
          <CardContent class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
              <Label for="sign-up-name">Name</Label>
              <Input
                id="sign-up-name"
                name="name"
                type="text"
                autocomplete="name"
                placeholder="Your name"
                required
              />
            </div>
            <div class="flex flex-col gap-2">
              <Label for="sign-up-email">Email</Label>
              <Input
                id="sign-up-email"
                name="email"
                type="email"
                autocomplete="email"
                placeholder="name@example.com"
                required
              />
            </div>
            <div class="flex flex-col gap-2">
              <Label for="sign-up-password">Password</Label>
              <Input
                id="sign-up-password"
                name="password"
                type="password"
                autocomplete="new-password"
                placeholder="Create a password"
                required
              />
            </div>
            <div class="flex flex-col gap-2">
              <Label for="sign-up-confirm-password">Confirm password</Label>
              <Input
                id="sign-up-confirm-password"
                name="confirmPassword"
                type="password"
                autocomplete="new-password"
                placeholder="Confirm your password"
                required
              />
            </div>
          </CardContent>
          <CardFooter class="flex flex-col gap-5">
            <Button type="submit" class="w-full">
              Create account
            </Button>
            <p class="text-center text-sm text-muted-foreground text-pretty">
              Already have an account?{" "}
              <A href="/sign-in" class="text-primary font-medium hover:underline">
                Sign in
              </A>
            </p>
          </CardFooter>
        </form>
      </Card>
    </AuthPageLayout>
  );
}
