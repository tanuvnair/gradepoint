import { createSignal } from "solid-js";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "~/components/ui";

export interface CreateOrganizationDialogProps {
  /** Controlled open state. */
  open: boolean;
  /** Called when open state should change (e.g. close after submit or cancel). */
  onOpenChange: (open: boolean) => void;
  /** Called when the user submits the form with a valid organization name. */
  onSubmit: (name: string) => void;
}

const INPUT_ID = "create-organization-name";

export default function CreateOrganizationDialog(props: CreateOrganizationDialogProps) {
  const [name, setName] = createSignal("");

  function handleOpenChange(open: boolean) {
    setName("");
    props.onOpenChange(open);
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    const value = name().trim();
    if (!value) return;
    props.onSubmit(value);
    setName("");
    props.onOpenChange(false);
  }

  return (
    <Dialog open={props.open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create organization</DialogTitle>
            <DialogDescription class="text-pretty">
              Give your organization a name. You can change this later.
            </DialogDescription>
          </DialogHeader>
          <DialogBody class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
              <Label for={INPUT_ID}>Organization name</Label>
              <Input
                id={INPUT_ID}
                value={name()}
                onInput={(e) => setName(e.currentTarget.value)}
                placeholder="e.g. Acme School"
                autocomplete="organization"
                required
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create organization</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
