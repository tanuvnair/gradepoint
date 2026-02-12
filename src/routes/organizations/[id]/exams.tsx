import { Container } from "~/components/ui";

/**
 * Org-scoped exams route: /organizations/:id/exams
 * Title and description come from lib/constants (ORG_NAV_SECTIONS) via app-layout.
 */
export default function OrganizationExams() {
  return (
    <div class="flex flex-1 flex-col px-6 py-6">
      <Container size="xl" class="flex flex-1 flex-col px-0" />
    </div>
  );
}
