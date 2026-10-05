import {
  Bell,
  BarChart3,
  Briefcase,
  Building2,
  ClipboardList,
  FolderTree,
  Gauge,
  Image as ImageIcon,
  LayoutDashboard,
  Mail,
  Newspaper,
  ScrollText,
  Settings,
  ShieldCheck,
  Trophy,
  UserRound,
  Users,
  UsersRound,
  type Icon,
} from "@/components/icons";
import type { Role } from "@/lib/demo/role";

export type NavArea = "cabinet" | "admin";
export type NavItem = { href: string; labelKey: string; icon: Icon; exact?: boolean };

const TALENT_ROLES: readonly Role[] = ["musician", "vocalist", "conductor", "composer"];

const cabinetItem = (key: string, icon: Icon, path = key, exact = false): NavItem => ({
  href: path ? `/cabinet/${path}` : "/cabinet",
  labelKey: `cabinet.${key}`,
  icon,
  exact,
});

const adminItem = (key: string, icon: Icon, path = key, exact = false): NavItem => ({
  href: path ? `/admin/${path}` : "/admin",
  labelKey: `admin.${key}`,
  icon,
  exact,
});

function cabinetNavFor(role: Role): NavItem[] {
  const home = cabinetItem("dashboard", LayoutDashboard, "", true);
  const common = [cabinetItem("notifications", Bell), cabinetItem("settings", Settings)];
  if (TALENT_ROLES.includes(role)) {
    return [
      home,
      cabinetItem("profile", UserRound),
      cabinetItem("portfolio", ImageIcon),
      cabinetItem("stats", BarChart3),
      cabinetItem("applications", ClipboardList),
      cabinetItem("offers", Mail),
      ...common,
    ];
  }
  if (role === "collective") {
    return [
      home,
      cabinetItem("collective", UsersRound),
      cabinetItem("portfolio", ImageIcon),
      cabinetItem("stats", BarChart3),
      ...common,
    ];
  }
  if (role === "organization") {
    return [
      home,
      cabinetItem("profile", Building2),
      cabinetItem("manageCastings", Briefcase, "castings"),
      cabinetItem("candidates", Users),
      ...common,
    ];
  }
  return [home, cabinetItem("profile", UserRound), ...common];
}

function adminNavFor(role: Role): NavItem[] {
  const home = adminItem("dashboard", LayoutDashboard, "", true);
  const moderation = [
    adminItem("profiles", ShieldCheck),
    adminItem("media", ImageIcon),
    adminItem("organizations", Building2),
    adminItem("collectives", UsersRound),
    adminItem("castings", Briefcase),
  ];
  if (role === "moderator") return [home, ...moderation];
  if (role === "admin") {
    return [
      home,
      adminItem("users", Users),
      ...moderation,
      adminItem("competitions", Trophy),
      adminItem("news", Newspaper),
      adminItem("references", FolderTree),
      adminItem("auditLog", ScrollText),
      adminItem("statistics", BarChart3),
      adminItem("system", Gauge),
    ];
  }
  return [];
}

export function navFor(area: NavArea, role: Role): NavItem[] {
  return area === "admin" ? adminNavFor(role) : cabinetNavFor(role);
}

export const PUBLIC_NAV: { href: string; labelKey: string }[] = [
  { href: "/musicians", labelKey: "nav.musicians" },
  { href: "/vocalists", labelKey: "nav.vocalists" },
  { href: "/conductors", labelKey: "nav.conductors" },
  { href: "/composers", labelKey: "nav.composers" },
  { href: "/orchestras", labelKey: "nav.orchestras" },
  { href: "/choirs", labelKey: "nav.choirs" },
  { href: "/organizations", labelKey: "nav.organizations" },
  { href: "/castings", labelKey: "nav.castings" },
  { href: "/vacancies", labelKey: "nav.vacancies" },
  { href: "/competitions", labelKey: "nav.competitions" },
  { href: "/festivals", labelKey: "nav.festivals" },
  { href: "/projects", labelKey: "nav.projects" },
  { href: "/news", labelKey: "nav.news" },
  { href: "/education", labelKey: "nav.education" },
];

export const PUBLIC_NAV_PRIMARY = ["/musicians", "/orchestras", "/castings", "/vacancies", "/news"];
