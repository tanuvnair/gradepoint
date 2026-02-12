import { Container } from "~/components/ui";

/**
 * Org-scoped users route: /organizations/:id/users
 * Title and description come from lib/constants (ORG_NAV_ROUTES) via app-layout.
 */
export default function OrganizationUsers() {
  return (
    <div class="flex flex-1 flex-col px-6 py-6">
      <Container size="xl" class="flex flex-1 flex-col px-0" />
    </div>
  );
}
