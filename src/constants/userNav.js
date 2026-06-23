/** Navigasi utama penyewa — desktop navbar + mobile bottom bar */

export const USER_NAV_ITEMS = [
  { label: "Home", path: "/", iconKey: "home", desktop: true, mobile: true, guestMobile: true },
  { label: "Search", path: "/search", iconKey: "search", desktop: true, mobile: true, guestMobile: true },
  { label: "My List", path: "/like", iconKey: "heart", desktop: true, mobile: true, guestMobile: true },
  { label: "Masuk", path: "/auth", iconKey: "login", desktop: false, mobile: false, guestMobile: true },
  { label: "Profil", path: "/profil", iconKey: "user", desktop: false, mobile: true, guestMobile: false },
];

export const USER_DESKTOP_LINKS = USER_NAV_ITEMS.filter((n) => n.desktop);

export function isUserNavActive(currentPath, path) {
  if (path === "/") return currentPath === "/" || currentPath === "/dashboard";
  if (path === "/profil") {
    return currentPath === "/profil" || currentPath.startsWith("/settings");
  }
  if (path === "/auth") {
    return currentPath === "/auth" || currentPath.startsWith("/auth/");
  }
  return currentPath === path || currentPath.startsWith(`${path}/`);
}

export function getUserMobileNavItems(isLoggedIn) {
  if (isLoggedIn) return USER_NAV_ITEMS.filter((n) => n.mobile);
  return USER_NAV_ITEMS.filter((n) => n.guestMobile);
}
