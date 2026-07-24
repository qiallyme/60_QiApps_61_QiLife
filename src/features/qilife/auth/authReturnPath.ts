export interface InternalLocation {
  pathname: string;
  search: string;
  hash: string;
}

export function currentInternalDestination(location: InternalLocation): string {
  const pathname = location.pathname.startsWith("/") ? location.pathname : "/";
  return `${pathname}${location.search}${location.hash}`;
}

export function sameOriginAuthRedirect(origin: string, destination: string): string {
  const base = new URL(origin);
  try {
    const candidate = new URL(destination, base);
    if (candidate.origin !== base.origin) return new URL("/", base).toString();
    return new URL(
      `${candidate.pathname}${candidate.search}${candidate.hash}`,
      base,
    ).toString();
  } catch {
    return new URL("/", base).toString();
  }
}
