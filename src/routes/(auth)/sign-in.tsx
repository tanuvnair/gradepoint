import { A } from "@solidjs/router";
import AuthPageLayout from "~/components/auth/auth-page-layout";
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

export default function SignIn() {
  return (
    <AuthPageLayout
      pageTitle="Sign in"
      metaDescription="Sign in to GradePoint, the real-time online examination system."
    >
      <Card class="w-full max-w-[400px] shadow-apple-lg">
        <CardHeader class="pb-4">
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription class="text-pretty">
            Use your email and password to access the examination system.
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
    </AuthPageLayout>
  );
}
