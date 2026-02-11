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

export default function ForgotPassword() {
  return (
    <AuthPageLayout
      pageTitle="Forgot password"
      metaDescription="Reset your GradePoint password. Enter your email to receive a reset link."
    >
      <Card class="w-full max-w-[400px] shadow-apple-lg">
        <CardHeader class="pb-4">
          <CardTitle>Reset your password</CardTitle>
          <CardDescription class="text-pretty">
            Enter the email address for your account and we&apos;ll send you a link to reset your
            password.
          </CardDescription>
        </CardHeader>
        <form action="#" method="post" class="contents" onSubmit={(e) => e.preventDefault()}>
          <CardContent class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
              <Label for="forgot-password-email">Email</Label>
              <Input
                id="forgot-password-email"
                name="email"
                type="email"
                autocomplete="email"
                placeholder="name@example.com"
                required
              />
            </div>
          </CardContent>
          <CardFooter class="flex flex-col gap-5">
            <Button type="submit" class="w-full">
              Send reset link
            </Button>
            <p class="text-center text-sm text-muted-foreground text-pretty">
              <A href="/sign-in" class="text-primary font-medium hover:underline">
                Back to sign in
              </A>
            </p>
          </CardFooter>
        </form>
      </Card>
    </AuthPageLayout>
  );
}
