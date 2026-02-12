import { useNavigate } from "@solidjs/router";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuItemLabel,
  DropdownMenuSeparator,
} from "~/components/ui";
import { cn } from "~/lib/utils";
import Building2 from "lucide-solid/icons/building-2";
import ChevronsUpDown from "lucide-solid/icons/chevrons-up-down";
import Plus from "lucide-solid/icons/plus";

export interface OrgOption {
  id: string;
  name: string;
  /** Optional keyboard shortcut hint (e.g. "⌘1"). */
  shortcut?: string;
}

export interface AppSidebarOrgSelectorProps {
  /** Currently selected organization. */
  currentOrg: { id: string; name: string; subtitle?: string };
  /** List of organizations to switch to. */
  organizations: OrgOption[];
  /** URL for "Add team" when onAddTeam is not set (navigate to org picker). */
  addTeamHref: string;
  /** When set, "Add team" calls this instead of navigating (e.g. open create-org dialog). */
  onAddTeam?: () => void;
  /** When true, show only the icon (for collapsed sidebar). */
  collapsed?: boolean;
  /** When true, hover style is suppressed (e.g. during sidebar collapse transition). */
  suppressHover?: boolean;
  class?: string;
}

const itemIconClass = "size-4 shrink-0 text-muted-foreground";

export default function AppSidebarOrgSelector(props: AppSidebarOrgSelectorProps) {
  const collapsed = () => props.collapsed ?? false;
  const navigate = useNavigate();

  return (
    <DropdownMenu placement="bottom-start" gutter={4} sameWidth>
      <DropdownMenuTrigger
        class={cn(
          "flex w-full items-center rounded-lg border-0 bg-transparent text-left outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          !props.suppressHover && "hover:bg-muted",
          props.suppressHover && "pointer-events-none",
          collapsed() ? "justify-center px-0 py-2" : "gap-2 px-2 py-2",
          props.class
        )}
      >
        <div class="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Building2 class="size-4" aria-hidden />
        </div>
        {!collapsed() && (
          <div class="flex min-w-0 flex-1 flex-col">
            <span class="truncate text-sm font-medium text-foreground">
              {props.currentOrg.name}
            </span>
            {props.currentOrg.subtitle && (
              <span class="truncate text-xs text-muted-foreground">
                {props.currentOrg.subtitle}
              </span>
            )}
          </div>
        )}
        {!collapsed() && (
          <ChevronsUpDown class="size-4 shrink-0 text-muted-foreground" aria-hidden />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent class="min-w-[var(--kb-popper-anchor-width)]">
        <DropdownMenuGroup>
          <DropdownMenuGroupLabel>Teams</DropdownMenuGroupLabel>
          {props.organizations.map((org) => {
            const isSelected = org.id === props.currentOrg.id;
            return (
              <DropdownMenuItem
                closeOnSelect
                onSelect={() => navigate(`/organizations/${org.id}`)}
                class={cn("flex items-center gap-3", isSelected && "bg-muted font-medium")}
              >
                <Building2 class={itemIconClass} aria-hidden />
                <DropdownMenuItemLabel class="flex-1 min-w-0 truncate">
                  {org.name}
                </DropdownMenuItemLabel>
                {org.shortcut && (
                  <span class="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {org.shortcut}
                  </span>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          closeOnSelect
          onSelect={() => {
            if (props.onAddTeam) props.onAddTeam();
            else navigate(props.addTeamHref);
          }}
        >
          <Plus class={itemIconClass} aria-hidden />
          <DropdownMenuItemLabel>Add team</DropdownMenuItemLabel>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
