import { useNavigate, useParams } from "@solidjs/router";
import type { RouteSectionProps } from "@solidjs/router";
import CreateOrganizationDialog from "~/components/dialogs/create-organization-dialog";
import AppLayout from "~/components/layout/app-layout";
import { getOrgNavSections } from "~/lib/constants";
import { createSignal } from "solid-js";

/** Mock: replace with real org list from API/session. */
const INITIAL_ORGANIZATIONS = [
  { id: "1", name: "Acme School" },
  { id: "2", name: "Tech Institute" },
];

/** Mock: replace with real user from session. */
const MOCK_USER = {
  name: "User",
  email: "user@example.com",
};

export default function OrganizationLayout(props: RouteSectionProps) {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [organizations, setOrganizations] = createSignal(INITIAL_ORGANIZATIONS);
  const [createDialogOpen, setCreateDialogOpen] = createSignal(false);

  const orgId = () => params.id;

  const currentOrg = () => {
    const id = orgId();
    const found = organizations().find((o) => o.id === id);
    return {
      id,
      name: found?.name ?? "Organization",
      subtitle: "Team",
    };
  };

  function handleCreateOrganization(name: string) {
    const newOrg = { id: String(Date.now()), name };
    setOrganizations((prev) => [...prev, newOrg]);
    navigate(`/organizations/${newOrg.id}`);
  }

  return (
    <AppLayout
      orgId={orgId()}
      navSections={getOrgNavSections(orgId())}
      homeHref={`/organizations/${orgId()}`}
      orgSelector={{
        currentOrg: currentOrg(),
        organizations: organizations(),
        addTeamHref: "/organizations",
        onAddTeam: () => setCreateDialogOpen(true),
      }}
      userBlock={{
        name: MOCK_USER.name,
        email: MOCK_USER.email,
        signOutHref: "/sign-in",
      }}
    >
      {props.children}
      <CreateOrganizationDialog
        open={createDialogOpen()}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateOrganization}
      />
    </AppLayout>
  );
}
