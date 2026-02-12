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
  Combobox,
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

interface MockOrganization {
  id: string;
  name: string;
}

/** Mock data: use [] to see "no orgs" state, or 2 items to see "select or create" state. */
const MOCK_ORGANIZATIONS: MockOrganization[] = [
  { id: "1", name: "Acme School" },
  { id: "2", name: "Tech Institute" },
];

export default function OrganizationSelection() {
  const [organizations, setOrganizations] = createSignal<MockOrganization[]>(MOCK_ORGANIZATIONS);
  const [selectedOrg, setSelectedOrg] = createSignal<MockOrganization | null>(null);
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
    setSelectedOrg(newOrg);
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
              <form noValidate onSubmit={(e) => e.preventDefault()} class="flex flex-col gap-6">
                <Combobox
                  options={organizations()}
                  optionValue={(o) => (o as MockOrganization).id}
                  optionTextValue={(o) => (o as MockOrganization).name}
                  optionLabel={(o) => (o as MockOrganization).name}
                  placeholder="Select organization"
                  value={selectedOrg()}
                  onChange={(v: unknown) => setSelectedOrg(v as MockOrganization | null)}
                  onInputChange={(value) => {
                    if (value === "") setSelectedOrg(null);
                  }}
                  triggerMode="focus"
                  defaultFilter={(option, inputValue) => {
                    const o = option as MockOrganization;
                    const selected = selectedOrg();
                    if (selected && inputValue === selected.name) return true;
                    return o.name.toLowerCase().includes((inputValue ?? "").toLowerCase());
                  }}
                  sameWidth
                  required={false}
                  itemComponent={(props) => (
                    <Combobox.Item item={props.item}>
                      <Combobox.ItemLabel>
                        {(props.item.rawValue as MockOrganization).name}
                      </Combobox.ItemLabel>
                      <Combobox.ItemIndicator />
                    </Combobox.Item>
                  )}
                >
                  <Combobox.Label>Organization</Combobox.Label>
                  <Combobox.Control aria-label="Organization">
                    <Combobox.Input />
                    <Combobox.Trigger aria-label="Open organization list">
                      <Combobox.Icon />
                    </Combobox.Trigger>
                  </Combobox.Control>
                  <Combobox.Portal>
                    <Combobox.Content class="max-h-[min(var(--kb-combobox-content-available-height),18rem)]">
                      <Combobox.Listbox />
                    </Combobox.Content>
                  </Combobox.Portal>
                </Combobox>

                <div class="flex flex-col gap-3">
                  <Button
                    type="submit"
                    class="w-full"
                    disabled={!selectedOrg()}
                    title={!selectedOrg() ? "Select an organization to continue" : undefined}
                  >
                    Continue
                  </Button>
                  <Button type="button" variant="outline" class="w-full" onClick={openCreateDialog}>
                    Create new organization
                  </Button>
                </div>
              </form>
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
