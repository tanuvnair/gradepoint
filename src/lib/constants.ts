import type { LucideIcon } from "lucide-solid";
import LayoutDashboard from "lucide-solid/icons/layout-dashboard";
import LogOut from "lucide-solid/icons/log-out";
import Settings from "lucide-solid/icons/settings";
import Users from "lucide-solid/icons/users";

/** Route definition for nav: path, label, icon, optional exact match, optional page heading. */
export interface RouteDef {
  /** Stable id for the route (e.g. for analytics or tests). */
  constant?: string;
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

/** Sidebar section: header and list of route definitions. */
export interface NavSectionConfig {
  header: string;
  submenu: RouteDef[];
}

/**
 * Org-scoped sidebar nav: sections with header and submenu. Paths are relative to
 * /organizations/:id (e.g. "" for dashboard, "users" for /organizations/:id/users).
 */
export const ORG_NAV_SECTIONS: NavSectionConfig[] = [
  {
    header: "Platform",
    submenu: [
      {
        constant: "DASHBOARD",
        path: "",
        label: "Dashboard",
        icon: LayoutDashboard,
        exact: true,
        pageTitle: "Dashboard",
        pageDescription: "Welcome to your GradePoint dashboard.",
      },
      {
        constant: "USERS_ROUTE",
        path: "users",
        label: "Users",
        icon: Users,
        pageTitle: "Users",
        pageDescription: "Manage organization members and roles.",
      },
      {
        constant: "SETTINGS_ROUTE",
        path: "settings",
        label: "Settings",
        icon: Settings,
        pageTitle: "Settings",
        pageDescription: "Organization settings and preferences.",
      },
    ],
  },
];

/** Suffix for document titles (e.g. "Dashboard - GradePoint"). */
export const DOCUMENT_TITLE_SUFFIX = "GradePoint";

/** Footer nav item (e.g. sign out). */
export const FOOTER_ROUTE: RouteDef = {
  path: "/sign-in",
  label: "Sign out",
  icon: LogOut,
};

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
 * Builds org nav sections for the sidebar from ORG_NAV_SECTIONS.
 * @param orgId - Organization id (e.g. from route params)
 */
export function getOrgNavSections(
  orgId: string
): Array<{ title?: string; items: ReturnType<typeof routeDefsToNavItems> }> {
  const basePath = `/organizations/${orgId}`;
  return ORG_NAV_SECTIONS.map((section) => ({
    title: section.header,
    items: routeDefsToNavItems(section.submenu, basePath),
  }));
}

export interface PageHeadingConfig {
  title: string;
  description?: string;
}

/**
 * Resolves page heading for the current path from route definitions.
 * When orgId is set, matches against ORG_NAV_SECTIONS (all submenus).
 * @param pathname - Current pathname (e.g. from useLocation().pathname)
 * @param orgId - When in org context, the organization id
 */
export function getPageHeading(pathname: string, orgId?: string): PageHeadingConfig | undefined {
  if (orgId == null) return undefined;
  const defs = ORG_NAV_SECTIONS.flatMap((s) => s.submenu);
  const basePath = `/organizations/${orgId}`;

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
