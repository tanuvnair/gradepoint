import { createSignal } from "solid-js";
import {
  Alert,
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

/** Exactly 6 alphanumeric characters (A-Z, a-z, 0-9). */
export const JOIN_CODE_LENGTH = 6;
export const JOIN_CODE_PATTERN = /^[A-Za-z0-9]{6}$/;

export function isValidJoinCode(value: string): boolean {
  return JOIN_CODE_PATTERN.test(value.replace(/\s/g, ""));
}

export interface JoinOrganizationDialogProps {
  /** Controlled open state. */
  open: boolean;
  /** Called when open state should change. */
  onOpenChange: (open: boolean) => void;
  /** Called when the user submits a valid 6-character alphanumeric code. */
  onSubmit: (code: string) => void;
  /** Optional error message (e.g. invalid or expired code). Cleared when dialog opens. */
  error?: string;
}

const INPUT_ID = "join-organization-code";

export default function JoinOrganizationDialog(props: JoinOrganizationDialogProps) {
  const [code, setCode] = createSignal("");

  function handleOpenChange(open: boolean) {
    setCode("");
    props.onOpenChange(open);
  }

  function formatCodeInput(value: string): string {
    const alphanumeric = value.replace(/[^A-Za-z0-9]/g, "").slice(0, JOIN_CODE_LENGTH);
    return alphanumeric;
  }

  function handleInput(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    setCode(formatCodeInput(target.value));
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    const raw = code().trim();
    if (!isValidJoinCode(raw)) return;
    props.onSubmit(raw);
    setCode("");
    props.onOpenChange(false);
  }

  const codeValid = () => isValidJoinCode(code());

  return (
    <Dialog open={props.open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Join organization</DialogTitle>
            <DialogDescription class="text-pretty">
              Enter the 6-character code shared by your organization to join.
            </DialogDescription>
          </DialogHeader>
          <DialogBody class="flex flex-col gap-4">
            {props.error && (
              <Alert id="join-org-error" variant="destructive" role="alert">
                {props.error}
              </Alert>
            )}
            <div class="flex flex-col gap-2">
              <Label for={INPUT_ID}>Invite code</Label>
              <Input
                id={INPUT_ID}
                type="text"
                autocomplete="one-time-code"
                maxlength={JOIN_CODE_LENGTH}
                value={code()}
                onInput={handleInput}
                placeholder="ABC123"
                class="font-mono text-lg tracking-widest uppercase"
                aria-invalid={props.error ? true : undefined}
                aria-describedby={props.error ? "join-org-error" : undefined}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!codeValid()}>
              Join organization
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
