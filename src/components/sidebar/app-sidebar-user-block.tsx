import { A } from "@solidjs/router";
import { cn } from "~/lib/utils";
import LogOut from "lucide-solid/icons/log-out";

export interface AppSidebarUserBlockProps {
  /** User display name. */
  name: string;
  /** User email. */
  email: string;
  /** Optional avatar image URL. When absent, a placeholder initial is shown. */
  avatarUrl?: string;
  /** URL for sign out (e.g. /sign-in). */
  signOutHref: string;
  /** When true, show only the avatar (for collapsed sidebar). */
  collapsed?: boolean;
  class?: string;
}

function getInitial(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name[0] ?? "?").toUpperCase();
}

const navLinkBaseClass =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground";

export default function AppSidebarUserBlock(props: AppSidebarUserBlockProps) {
  const collapsed = () => props.collapsed ?? false;

  return (
    <div class={cn("flex flex-col gap-1", props.class)}>
      <div
        class={cn(
          "flex w-full items-center rounded-lg px-2 py-2",
          collapsed() ? "justify-center" : "gap-3"
        )}
        aria-label={`User: ${props.name}`}
      >
        {props.avatarUrl ? (
          <img
            src={props.avatarUrl}
            alt=""
            class="size-8 shrink-0 rounded-full object-cover"
            width={32}
            height={32}
          />
        ) : (
          <div
            class="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground"
            aria-hidden
          >
            {getInitial(props.name)}
          </div>
        )}
        {!collapsed() && (
          <div class="flex min-w-0 flex-1 flex-col">
            <span class="truncate text-sm font-medium text-foreground">{props.name}</span>
            <span class="truncate text-xs text-muted-foreground">{props.email}</span>
          </div>
        )}
      </div>
      <A
        href={props.signOutHref}
        class={cn(navLinkBaseClass, collapsed() && "justify-center px-2")}
        title={collapsed() ? "Sign out" : undefined}
      >
        <LogOut class="size-5 shrink-0" aria-hidden />
        {!collapsed() && <span class="truncate">Sign out</span>}
      </A>
    </div>
  );
}
