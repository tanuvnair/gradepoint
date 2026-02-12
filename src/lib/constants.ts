import type { LucideIcon } from "lucide-solid";
import LayoutDashboard from "lucide-solid/icons/layout-dashboard";
import LogOut from "lucide-solid/icons/log-out";
import Settings from "lucide-solid/icons/settings";
import Users from "lucide-solid/icons/users";

/** Route definition for nav: path, label, icon, optional exact match, optional page heading. */
export interface RouteDef {
  path: string;
  label: string;
  icon: LucideIcon;
  /** When true, active only when path exactly matches (or path + "/"). */
  exact?: boolean;
  /** Page heading title (rendered when this route is active). */
  pageTitle?: string;
  /** Page heading description (rendered when this route is active). */
  pageDescription?: string;
}

/** Main app sidebar nav (e.g. when not in an org context). */
export const MAIN_NAV_ROUTES: RouteDef[] = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
    pageTitle: "Dashboard",
    pageDescription: "Welcome to your GradePoint dashboard.",
  },
];

/** Footer nav item (e.g. sign out). */
export const FOOTER_ROUTE: RouteDef = {
  path: "/sign-in",
  label: "Sign out",
  icon: LogOut,
};

/**
 * Org-scoped nav routes. Paths are relative to /organizations/:id
 * (e.g. "" for dashboard, "users" for /organizations/:id/users).
 */
export const ORG_NAV_ROUTES: RouteDef[] = [
  {
    path: "",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
    pageTitle: "Dashboard",
    pageDescription: "Welcome to your GradePoint dashboard.",
  },
  {
    path: "users",
    label: "Users",
    icon: Users,
    pageTitle: "Users",
    pageDescription: "Manage organization members and roles.",
  },
  {
    path: "settings",
    label: "Settings",
    icon: Settings,
    pageTitle: "Settings",
    pageDescription: "Organization settings and preferences.",
  },
];

/** Section title for org nav in the sidebar. */
export const ORG_NAV_SECTION_TITLE = "Platform";

/** Suffix for document titles (e.g. "Dashboard - GradePoint"). */
export const DOCUMENT_TITLE_SUFFIX = "GradePoint";

/**
 * Converts route definitions to nav items with resolved hrefs.
 * @param defs - Route definitions
 * @param basePath - Optional base path (e.g. /organizations/123 for org nav)
 */
export function routeDefsToNavItems(
  defs: RouteDef[],
  basePath = ""
): Array<{ href: string; label: string; icon: LucideIcon; exact?: boolean }> {
  return defs.map((d) => {
    const href =
      basePath === ""
        ? d.path
        : d.path === ""
          ? basePath.replace(/\/$/, "")
          : `${basePath.replace(/\/$/, "")}/${d.path.replace(/^\//, "")}`;
    return {
      href,
      label: d.label,
      icon: d.icon,
      exact: d.exact,
    };
  });
}

/**
 * Builds org nav sections for the sidebar from ORG_NAV_ROUTES.
 * @param orgId - Organization id (e.g. from route params)
 */
export function getOrgNavSections(
  orgId: string
): Array<{ title?: string; items: ReturnType<typeof routeDefsToNavItems> }> {
  const basePath = `/organizations/${orgId}`;
  const items = routeDefsToNavItems(ORG_NAV_ROUTES, basePath);
  return [{ title: ORG_NAV_SECTION_TITLE, items }];
}

export interface PageHeadingConfig {
  title: string;
  description?: string;
}

/**
 * Resolves page heading for the current path from route definitions.
 * When orgId is set, matches against ORG_NAV_ROUTES; otherwise MAIN_NAV_ROUTES.
 * @param pathname - Current pathname (e.g. from useLocation().pathname)
 * @param orgId - When in org context, the organization id
 */
export function getPageHeading(pathname: string, orgId?: string): PageHeadingConfig | undefined {
  const defs = orgId != null ? ORG_NAV_ROUTES : MAIN_NAV_ROUTES;
  const basePath = orgId != null ? `/organizations/${orgId}` : "";

  for (const def of defs) {
    const defFullPath =
      basePath === "" ? def.path : def.path === "" ? basePath : `${basePath}/${def.path}`;
    const normalizedDef = defFullPath.replace(/\/$/, "") || "/";
    const normalizedPathname = pathname.replace(/\/$/, "") || "/";
    const matches = def.exact
      ? normalizedPathname === normalizedDef
      : normalizedPathname === normalizedDef || normalizedPathname.startsWith(normalizedDef + "/");
    if (matches && (def.pageTitle != null || def.pageDescription != null)) {
      return {
        title: def.pageTitle ?? def.label,
        description: def.pageDescription,
      };
    }
  }
  return undefined;
}
