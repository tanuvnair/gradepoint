import { Meta } from "@solidjs/meta";
import { Show, createSignal } from "solid-js";
import CreateOrganizationDialog from "~/components/dialogs/create-organization-dialog";
import JoinOrganizationDialog from "~/components/dialogs/join-organization-dialog";
import OrganizationsPageLayout from "~/components/layout/organizations-page-layout";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Combobox,
  EmptyState,
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
  const [joinDialogOpen, setJoinDialogOpen] = createSignal(false);
  const [joinError, setJoinError] = createSignal<string | undefined>(undefined);
  let formRef: HTMLFormElement | undefined;
  let continueButtonRef: HTMLButtonElement | undefined;
  /** Set when a selection just happened; we move focus to Continue instead of leaving it on the input. */
  let justSelectedRef = false;

  const hasOrganizations = () => organizations().length > 0;

  const openCreateDialog = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCreateDialogOpen(true);
  };

  const handleCreateSubmit = (name: string) => {
    const newOrg: MockOrganization = { id: String(Date.now()), name };
    setOrganizations((prev) => [...prev, newOrg]);
    setSelectedOrg(newOrg);
  };

  const openJoinDialog = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setJoinError(undefined);
    setJoinDialogOpen(true);
  };

  const handleJoinSubmit = (code: string) => {
    setJoinError(undefined);
    // Mock: treat code as org id suffix and add a placeholder org; replace with real API call.
    const newOrg: MockOrganization = {
      id: `join-${code}`,
      name: `Organization (${code})`,
    };
    setOrganizations((prev) => [...prev, newOrg]);
    setSelectedOrg(newOrg);
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
              description="Create your first organization or join one with a code."
              action={
                <div class="flex flex-col gap-2">
                  <Button type="button" onClick={openCreateDialog}>
                    Create your first organization
                  </Button>
                  <Button type="button" variant="outline" onClick={openJoinDialog}>
                    Join with code
                  </Button>
                </div>
              }
            />
          }
        >
          <Card class="flex flex-col shadow-apple-lg">
            <CardHeader>
              <CardTitle>Your organizations</CardTitle>
              <CardDescription class="text-pretty">
                Select one to continue or create a new organization.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form
                ref={formRef}
                noValidate
                onSubmit={(e) => e.preventDefault()}
                class="flex flex-col gap-6"
                onFocusIn={(e) => {
                  if (
                    justSelectedRef &&
                    e.target instanceof HTMLInputElement &&
                    formRef?.querySelector("input") === e.target
                  ) {
                    justSelectedRef = false;
                    continueButtonRef?.focus();
                  }
                }}
              >
                <Combobox
                  options={organizations()}
                  optionValue={(o) => (o as MockOrganization).id}
                  optionTextValue={(o) => (o as MockOrganization).name}
                  optionLabel={(o) => (o as MockOrganization).name}
                  placeholder="Select organization"
                  value={selectedOrg()}
                  onChange={(v: unknown) => {
                    setSelectedOrg(v as MockOrganization | null);
                    justSelectedRef = true;
                  }}
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
                    <Combobox.Content
                      class="max-h-[min(var(--kb-combobox-content-available-height),18rem)]"
                      onCloseAutoFocus={(e: Event) => e.preventDefault()}
                    >
                      <Combobox.Listbox />
                    </Combobox.Content>
                  </Combobox.Portal>
                </Combobox>

                <div class="flex flex-col gap-3">
                  <Button
                    ref={continueButtonRef}
                    type="submit"
                    class="w-full"
                    disabled={!selectedOrg()}
                    title={!selectedOrg() ? "Select an organization to continue" : undefined}
                  >
                    Continue
                  </Button>
                  <div class="flex flex-row gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      class="w-full p-2"
                      onClick={openCreateDialog}
                    >
                      Create new organization
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      class="w-full p-2"
                      onClick={openJoinDialog}
                    >
                      Join with code
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </Show>
      </div>

      <CreateOrganizationDialog
        open={createDialogOpen()}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateSubmit}
      />
      <JoinOrganizationDialog
        open={joinDialogOpen()}
        onOpenChange={setJoinDialogOpen}
        onSubmit={handleJoinSubmit}
        error={joinError()}
      />
    </OrganizationsPageLayout>
  );
}
