import { useNavigate } from "@solidjs/router";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemLabel,
  DropdownMenuSeparator,
} from "~/components/ui";
import { cn } from "~/lib/utils";
import Bell from "lucide-solid/icons/bell";
import ChevronsUpDown from "lucide-solid/icons/chevrons-up-down";
import LogOut from "lucide-solid/icons/log-out";
import CircleUser from "lucide-solid/icons/circle-user";

export interface AppSidebarUserBlockProps {
  /** User display name. */
  name: string;
  /** User email. */
  email: string;
  /** Optional avatar image URL. When absent, a placeholder initial is shown. */
  avatarUrl?: string;
  /** URL for sign out (e.g. /sign-in). */
  signOutHref: string;
  /** Optional URL for account/settings. */
  accountHref?: string;
  /** Optional URL for notifications. */
  notificationsHref?: string;
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

const itemIconClass = "size-4 shrink-0 text-muted-foreground";

function UserAvatar(props: { name: string; avatarUrl?: string }) {
  return props.avatarUrl ? (
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
  );
}

export default function AppSidebarUserBlock(props: AppSidebarUserBlockProps) {
  const collapsed = () => props.collapsed ?? false;
  const navigate = useNavigate();

  const handleSelect = (href: string | undefined) => {
    if (href) navigate(href);
  };

  return (
    <div class={cn("flex flex-col gap-1", props.class)}>
      <DropdownMenu placement="top-start" gutter={4}>
        <DropdownMenuTrigger
          class={cn(
            "flex w-full items-center rounded-lg border-0 bg-transparent px-2 py-2 text-left outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "hover:bg-muted",
            collapsed() ? "justify-center" : "gap-3"
          )}
          aria-label={`User menu: ${props.name}`}
        >
          <UserAvatar name={props.name} avatarUrl={props.avatarUrl} />
          {!collapsed() && (
            <>
              <div class="flex min-w-0 flex-1 flex-col">
                <span class="truncate text-sm font-medium text-foreground">{props.name}</span>
                <span class="truncate text-xs text-muted-foreground">{props.email}</span>
              </div>
              <ChevronsUpDown class="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent class="min-w-56">
          <div class="flex items-center gap-3 px-3 py-2" aria-hidden>
            <UserAvatar name={props.name} avatarUrl={props.avatarUrl} />
            <div class="flex min-w-0 flex-1 flex-col">
              <span class="truncate text-sm font-medium text-foreground">{props.name}</span>
              <span class="truncate text-xs text-muted-foreground">{props.email}</span>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            closeOnSelect
            onSelect={() => handleSelect(props.accountHref)}
            class="flex items-center gap-3"
          >
            <CircleUser class={itemIconClass} aria-hidden />
            <DropdownMenuItemLabel>Account</DropdownMenuItemLabel>
          </DropdownMenuItem>
          <DropdownMenuItem
            closeOnSelect
            onSelect={() => handleSelect(props.notificationsHref)}
            class="flex items-center gap-3"
          >
            <Bell class={itemIconClass} aria-hidden />
            <DropdownMenuItemLabel>Notifications</DropdownMenuItemLabel>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            closeOnSelect
            onSelect={() => handleSelect(props.signOutHref)}
            class="flex items-center gap-3"
          >
            <LogOut class={itemIconClass} aria-hidden />
            <DropdownMenuItemLabel>Log out</DropdownMenuItemLabel>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
