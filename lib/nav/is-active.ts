const LOCALE_PREFIX = /^\/(uz|ru|en)(?=\/|$)/;

export function isActive(pathname: string, href: string, exact = false): boolean {
  const path = pathname.replace(LOCALE_PREFIX, "") || "/";
  return path === href || (!exact && path.startsWith(`${href}/`));
}
