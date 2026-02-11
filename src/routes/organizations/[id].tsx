import { useParams } from "@solidjs/router";
import { Title } from "@solidjs/meta";
import { Container } from "~/components/ui";

/**
 * Placeholder for organization-scoped app.
 * Replace with dashboard, exams, etc. when implementing.
 */
export default function OrganizationPlaceholder() {
  const params = useParams<{ id: string }>();

  return (
    <div class="flex min-h-dvh flex-col items-center justify-center p-4">
      <Title>Organization - GradePoint</Title>
      <Container size="sm" class="text-center">
        <p class="text-muted-foreground text-pretty">
          Organization ID: <span class="font-medium text-foreground tabular-nums">{params.id}</span>
        </p>
        <p class="mt-2 text-sm text-muted-foreground">
          Dashboard and org-scoped routes will go here.
        </p>
      </Container>
    </div>
  );
}
