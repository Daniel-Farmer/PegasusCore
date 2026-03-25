/**
 * Extract the client's IP address from request headers.
 * Handles x-forwarded-for (proxy chains), x-real-ip, and IPv4-mapped IPv6.
 */
export function getClientIp(request: Request): string | null {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    return normalizeIp(xff.split(",")[0].trim());
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return normalizeIp(realIp.trim());
  }

  return null;
}

/** Strip IPv4-mapped IPv6 prefix (::ffff:1.2.3.4 → 1.2.3.4) */
function normalizeIp(ip: string): string {
  if (ip.startsWith("::ffff:")) {
    return ip.slice(7);
  }
  return ip;
}
