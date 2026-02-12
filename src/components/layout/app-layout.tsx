import { Meta, Title } from "@solidjs/meta";
import { useLocation } from "@solidjs/router";
import AppSidebar, {
  type NavItem,
  type NavSection,
  type OrgSelectorConfig,
  type UserBlockConfig,
} from "~/components/sidebar/app-sidebar";
import {
  PageHeading,
  PageHeadingActions,
  PageHeadingDescription,
  PageHeadingTitle,
} from "~/components/layout/page-heading";
import { DOCUMENT_TITLE_SUFFIX, FOOTER_ROUTE, getPageHeading } from "~/lib/constants";
import { cn } from "~/lib/utils";
import { type JSX, Show } from "solid-js";

export type { NavItem, NavSection } from "~/components/sidebar/app-sidebar";

export interface AppLayoutProps {
  /** Main nav items (single section). Ignored when navSections is set. */
  navItems?: NavItem[];
  /** Nav with section titles and/or expandable groups. */
  navSections?: NavSection[];
  children: JSX.Element;
  homeHref?: string;
  /** Org/team switcher at top (reference style). */
  orgSelector?: OrgSelectorConfig;
  /** User block at bottom (reference style). */
  userBlock?: UserBlockConfig;
  sidebarDefaultCollapsed?: boolean;
  class?: string;
  /** Optional page heading: title. */
  pageTitle?: JSX.Element;
  /** Optional page heading: description. */
  pageDescription?: JSX.Element;
  /** Optional page heading: action buttons/slots. */
  pageActions?: JSX.Element;
  /** When in org context, pass org id so page heading is resolved from route config. */
  orgId?: string;
}

const defaultNavItems: NavItem[] = [];
const defaultFooterItem = {
  href: FOOTER_ROUTE.path,
  label: FOOTER_ROUTE.name,
  icon: FOOTER_ROUTE.icon,
};

export default function AppLayout(props: AppLayoutProps) {
  const location = useLocation();
  const navItems = () =>
    props.navItems && props.navItems.length > 0 ? props.navItems : defaultNavItems;

  const dynamicHeading = () => getPageHeading(location.pathname, props.orgId);
  const title = () => props.pageTitle ?? dynamicHeading()?.title;
  const description = () => props.pageDescription ?? dynamicHeading()?.description;

  const showHeading = () =>
    title() !== undefined || description() !== undefined || props.pageActions !== undefined;

  const documentTitle = () => {
    const t = title();
    return typeof t === "string" ? `${t} - ${DOCUMENT_TITLE_SUFFIX}` : undefined;
  };

  return (
    <div class={cn("flex min-h-dvh flex-row bg-background text-foreground", props.class)}>
      <AppSidebar
        navItems={props.navSections ? undefined : navItems()}
        navSections={props.navSections}
        homeHref={props.homeHref}
        orgSelector={props.orgSelector}
        userBlock={props.userBlock}
        footerItem={!props.userBlock ? defaultFooterItem : undefined}
        defaultCollapsed={props.sidebarDefaultCollapsed}
      />
      <Show when={documentTitle()}>
        <Title>{documentTitle()}</Title>
      </Show>
      <Show when={description() && typeof description() === "string"}>
        <Meta name="description" content={description() as string} />
      </Show>
      <main class="flex min-w-0 flex-1 flex-col overflow-auto">
        <Show when={showHeading()}>
          <PageHeading>
            <div class="flex flex-col gap-1">
              <Show when={title()}>
                <PageHeadingTitle>
                  {typeof title() === "string" ? title() : props.pageTitle}
                </PageHeadingTitle>
              </Show>
              <Show when={description()}>
                <PageHeadingDescription>
                  {typeof description() === "string" ? description() : props.pageDescription}
                </PageHeadingDescription>
              </Show>
            </div>
            <Show when={props.pageActions}>
              <PageHeadingActions>{props.pageActions}</PageHeadingActions>
            </Show>
          </PageHeading>
        </Show>
        {props.children}
      </main>
    </div>
  );
}
