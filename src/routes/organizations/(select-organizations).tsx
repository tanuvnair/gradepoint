import { Meta } from "@solidjs/meta";
import { Show, createSignal } from "solid-js";
import OrganizationsPageLayout from "~/components/layout/organizations-page-layout";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Input,
  Label,
} from "~/components/ui";
import { cn } from "~/lib/utils";

interface MockOrganization {
  id: string;
  name: string;
}

/** Mock data: use [] to see "no orgs" state, or 2 items to see "select or create" state. */
const MOCK_ORGANIZATIONS: MockOrganization[] = [
  { id: "1", name: "Acme School" },
  { id: "2", name: "Tech Institute" },
];

const selectPlaceholderClass = cn(
  "flex h-11 w-full items-center rounded-lg border border-input bg-muted/30 px-4 py-2 text-base text-muted-foreground",
  "cursor-not-allowed"
);

export default function OrganizationSelection() {
  const [organizations, setOrganizations] = createSignal<MockOrganization[]>(MOCK_ORGANIZATIONS);
  const [createDialogOpen, setCreateDialogOpen] = createSignal(false);
  const [newOrgName, setNewOrgName] = createSignal("");

  const hasOrganizations = () => organizations().length > 0;

  const openCreateDialog = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNewOrgName("");
    setCreateDialogOpen(true);
  };

  const closeCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  const handleCreateSubmit = (e: Event) => {
    e.preventDefault();
    const name = newOrgName().trim();
    if (!name) return;
    const newOrg: MockOrganization = { id: String(Date.now()), name };
    setOrganizations((prev) => [...prev, newOrg]);
    closeCreateDialog();
  };

  return (
    <OrganizationsPageLayout
      pageTitle="Choose organization"
      metaDescription="Select an organization or create a new one to continue."
    >
      <Meta name="robots" content="noindex" />

      <div class="w-full max-w-[420px] flex flex-col gap-8">
        <div class="flex flex-col gap-2 text-center">
          <h1 class="text-2xl font-semibold text-balance">Choose organization</h1>
          <p class="text-sm text-muted-foreground text-pretty">
            Select an organization to continue, or create one if you don&apos;t have any yet.
          </p>
        </div>

        <Show
          when={hasOrganizations()}
          fallback={
            <EmptyState
              title="No organizations yet"
              description="Create your first organization to start conducting or taking exams."
              action={
                <Button type="button" onClick={openCreateDialog}>
                  Create your first organization
                </Button>
              }
            />
          }
        >
          <Card class="shadow-apple-lg">
            <CardHeader class="flex flex-col">
              <CardTitle>Your organizations</CardTitle>
              <CardDescription class="text-pretty">
                Select one to continue or create a new organization.
              </CardDescription>
            </CardHeader>
            <CardContent class="flex flex-col gap-6">
              <div class="flex flex-col gap-3">
                <Label for="organization-select">Organization</Label>
                <div id="organization-select" class={selectPlaceholderClass}>
                  Select organization
                </div>
              </div>

              <div class="flex flex-col gap-3">
                <Button type="button" class="w-full" disabled>
                  Continue
                </Button>
                <Button type="button" variant="outline" class="w-full" onClick={openCreateDialog}>
                  Create new organization
                </Button>
              </div>
            </CardContent>
          </Card>
        </Show>
      </div>

      <Dialog open={createDialogOpen()} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle>Create organization</DialogTitle>
              <DialogDescription class="text-pretty">
                Give your organization a name. You can change this later.
              </DialogDescription>
            </DialogHeader>
            <DialogBody class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <Label for="create-org-name">Organization name</Label>
                <Input
                  id="create-org-name"
                  value={newOrgName()}
                  onInput={(e) => setNewOrgName(e.currentTarget.value)}
                  placeholder="e.g. Acme School"
                  autocomplete="organization"
                  required
                />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeCreateDialog}>
                Cancel
              </Button>
              <Button type="submit">Create organization</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </OrganizationsPageLayout>
  );
}
