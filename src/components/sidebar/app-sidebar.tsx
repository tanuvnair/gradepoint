import { A, useLocation } from "@solidjs/router";
import { createSignal, For, onCleanup } from "solid-js";
import BrandLogo from "~/components/brand/brand-logo";
import AppSidebarOrgSelector from "~/components/sidebar/app-sidebar-org-selector";
import AppSidebarUserBlock from "~/components/sidebar/app-sidebar-user-block";
import { cn } from "~/lib/utils";
import type { LucideIcon } from "lucide-solid";
import ChevronDown from "lucide-solid/icons/chevron-down";
import ChevronRight from "lucide-solid/icons/chevron-right";
import PanelLeft from "lucide-solid/icons/panel-left";
import PanelLeftClose from "lucide-solid/icons/panel-left-close";

export interface NavItem {
  href?: string;
  label: string;
  icon: LucideIcon;
  /** When true, active only when path exactly matches href (or href + "/"). */
  exact?: boolean;
  /** Nested items (expandable group). When set, parent is a toggle; children are links. */
  children?: NavItem[];
}

export interface NavSection {
  /** Optional section heading (e.g. "Platform", "Projects"). */
  title?: string;
  items: NavItem[];
}

export interface OrgSelectorConfig {
  currentOrg: { id: string; name: string; subtitle?: string };
  /** List of organizations to switch to. */
  organizations: { id: string; name: string }[];
  /** URL for "Add team" when onAddTeam is not set (e.g. /organizations). */
  addTeamHref: string;
  /** When set, "Add team" calls this instead of navigating (e.g. open create-org dialog). */
  onAddTeam?: () => void;
}

export interface UserBlockConfig {
  name: string;
  email: string;
  avatarUrl?: string;
  signOutHref: string;
  accountHref?: string;
  notificationsHref?: string;
}

export interface AppSidebarProps {
  /** Main nav: flat list (single section, no title). Used when navSections is not set. */
  navItems?: NavItem[];
  /** Nav with optional section titles and/or expandable groups. Takes precedence over navItems. */
  navSections?: NavSection[];
  /** Link for the brand logo when orgSelector is not used. */
  homeHref?: string;
  /** Org/team switcher at top (reference style). When set, replaces logo in header. */
  orgSelector?: OrgSelectorConfig;
  /** User block at bottom (reference style). When set, replaces footerItem. */
  userBlock?: UserBlockConfig;
  /** Legacy: single footer link when userBlock is not set. */
  footerItem?: {
    href: string;
    label: string;
    icon: LucideIcon;
  };
  defaultCollapsed?: boolean;
  toggleLabel?: string;
  class?: string;
}

const SIDEBAR_WIDTH_EXPANDED = "14rem";
const SIDEBAR_WIDTH_COLLAPSED = "4rem";

const navLinkBaseClass =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors";
const navLinkInactiveClass = "text-muted-foreground hover:bg-muted hover:text-foreground";
const navLinkActiveClass = "bg-muted text-foreground";

const SIDEBAR_TRANSITION_MS = 250;

export default function AppSidebar(props: AppSidebarProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = createSignal(props.defaultCollapsed ?? false);
  const [expandedGroups, setExpandedGroups] = createSignal<Set<string>>(new Set());
  const [transitioning, setTransitioning] = createSignal(false);
  let expandButtonRef: HTMLButtonElement | undefined;
  let transitionTimeoutId: ReturnType<typeof setTimeout> | undefined;
  onCleanup(() => {
    if (transitionTimeoutId !== undefined) clearTimeout(transitionTimeoutId);
  });

  const sections = (): NavSection[] => {
    if (props.navSections && props.navSections.length > 0) {
      return props.navSections;
    }
    if (props.navItems && props.navItems.length > 0) {
      return [{ items: props.navItems }];
    }
    return [];
  };

  const homeHref = () =>
    props.homeHref ?? props.navItems?.[0]?.href ?? props.navSections?.[0]?.items?.[0]?.href ?? "/";

  function isActive(item: NavItem): boolean {
    if (!item.href) return false;
    const path = location.pathname;
    const href = item.href;
    if (item.exact) {
      return path === href || path === href + "/";
    }
    return path.startsWith(href);
  }

  function toggleGroup(label: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function toggleSidebar() {
    const willCollapse = !collapsed();
    if (transitionTimeoutId !== undefined) clearTimeout(transitionTimeoutId);

    if (willCollapse) {
      setTransitioning(true);
      requestAnimationFrame(() => {
        setCollapsed((prev) => !prev);
        queueMicrotask(() => {
          expandButtonRef?.focus({ preventScroll: true });
        });
        transitionTimeoutId = setTimeout(() => {
          setTransitioning(false);
          transitionTimeoutId = undefined;
        }, SIDEBAR_TRANSITION_MS);
      });
    } else {
      setCollapsed((prev) => !prev);
    }
  }

  function renderNavItem(item: NavItem, depth: number) {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isGroupExpanded = hasChildren && expandedGroups().has(item.label);

    if (hasChildren) {
      return (
        <div class="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => toggleGroup(item.label)}
            class={cn(navLinkBaseClass, navLinkInactiveClass, collapsed() && "justify-center px-2")}
            title={collapsed() ? item.label : undefined}
            aria-expanded={isGroupExpanded}
          >
            <Icon class="size-5 shrink-0" aria-hidden />
            {!collapsed() && (
              <>
                <span class="flex-1 truncate text-left">{item.label}</span>
                {isGroupExpanded ? (
                  <ChevronDown class="size-4 shrink-0" aria-hidden />
                ) : (
                  <ChevronRight class="size-4 shrink-0" aria-hidden />
                )}
              </>
            )}
          </button>
          {!collapsed() &&
            isGroupExpanded &&
            item.children!.map((child) => renderNavItem(child, depth + 1))}
        </div>
      );
    }

    const active = isActive(item);
    const href = item.href ?? "#";
    return (
      <A
        href={href}
        class={cn(
          navLinkBaseClass,
          active ? navLinkActiveClass : navLinkInactiveClass,
          collapsed() && "justify-center px-2",
          depth > 0 && "pl-8"
        )}
        aria-current={active ? "page" : undefined}
        title={collapsed() ? item.label : undefined}
      >
        <Icon class="size-5 shrink-0" aria-hidden />
        {!collapsed() && <span class="truncate">{item.label}</span>}
      </A>
    );
  }

  return (
    <aside
      class={cn(
        "flex shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 ease-in-out",
        props.class
      )}
      style={{
        width: collapsed() ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
      }}
      aria-label="Application navigation"
    >
      {/* Header: org selector or logo + collapse */}
      <div class="flex min-h-16 flex-none flex-col justify-center border-b border-border">
        {props.orgSelector ? (
          <div class="flex items-center gap-1 px-2 py-2">
            <div class="flex min-w-0 flex-1">
              <AppSidebarOrgSelector
                currentOrg={props.orgSelector.currentOrg}
                organizations={props.orgSelector.organizations}
                addTeamHref={props.orgSelector.addTeamHref}
                onAddTeam={props.orgSelector.onAddTeam}
                collapsed={collapsed()}
                suppressHover={transitioning()}
                class="w-full"
              />
            </div>
            {!collapsed() && (
              <button
                type="button"
                onClick={toggleSidebar}
                class="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={props.toggleLabel ?? "Collapse sidebar"}
                aria-expanded={!collapsed()}
              >
                <PanelLeftClose class="size-5" aria-hidden />
              </button>
            )}
          </div>
        ) : (
          <div class="flex items-center justify-between px-3 py-3">
            <div
              class={cn(
                "flex min-w-0 items-center overflow-hidden",
                collapsed() ? "justify-center" : "px-1"
              )}
            >
              <BrandLogo href={homeHref()} size="sm" iconOnly={collapsed()} class="shrink-0" />
            </div>
            {!collapsed() && (
              <button
                type="button"
                onClick={toggleSidebar}
                class="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={props.toggleLabel ?? "Collapse sidebar"}
                aria-expanded={!collapsed()}
              >
                <PanelLeftClose class="size-5" aria-hidden />
              </button>
            )}
          </div>
        )}

        {collapsed() && (
          <div class="flex justify-center border-t border-border py-2">
            <button
              ref={(el) => (expandButtonRef = el)}
              type="button"
              onClick={toggleSidebar}
              class="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label={props.toggleLabel ?? "Expand sidebar"}
              aria-expanded={!collapsed()}
            >
              <PanelLeft class="size-5" aria-hidden />
            </button>
          </div>
        )}
      </div>

      {/* Nav sections */}
      <nav
        class="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden p-3"
        aria-label="Main"
      >
        <For each={sections()} fallback={null}>
          {(section) => (
            <div class="flex flex-col gap-1">
              {section.title && !collapsed() && (
                <h2 class="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </h2>
              )}
              {section.items.map((item) => renderNavItem(item, 0))}
            </div>
          )}
        </For>
      </nav>

      {/* Footer: user block or legacy footer link */}
      {(props.userBlock || props.footerItem) && (
        <div class="border-t border-border p-3">
          {props.userBlock ? (
            <AppSidebarUserBlock
              name={props.userBlock.name}
              email={props.userBlock.email}
              avatarUrl={props.userBlock.avatarUrl}
              signOutHref={props.userBlock.signOutHref}
              accountHref={props.userBlock.accountHref}
              notificationsHref={props.userBlock.notificationsHref}
              collapsed={collapsed()}
            />
          ) : (
            props.footerItem && (
              <A
                href={props.footerItem.href}
                class={cn(
                  navLinkBaseClass,
                  navLinkInactiveClass,
                  collapsed() && "justify-center px-2"
                )}
                title={collapsed() ? props.footerItem.label : undefined}
              >
                <props.footerItem.icon class="size-5 shrink-0" aria-hidden />
                {!collapsed() && <span class="truncate">{props.footerItem.label}</span>}
              </A>
            )
          )}
        </div>
      )}
    </aside>
  );
}
