import { Container } from "~/components/ui";

/**
 * Index route for /organizations/:id (dashboard).
 * Title and description come from lib/constants (ORG_NAV_SECTIONS) via app-layout.
 */
export default function OrganizationDashboard() {
  return (
    <div class="flex flex-1 flex-col px-6 py-6">
      <Container size="xl" class="flex flex-1 flex-col px-0"></Container>
    </div>
  );
}
