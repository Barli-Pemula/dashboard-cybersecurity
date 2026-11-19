/**
 * Sanitize a string by removing HTML tags and escaping special characters.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validate and sanitize a URL input.
 */
export function sanitizeUrl(url: unknown): string | null {
  try {
    if (typeof url !== "string" || url.length > 2048) return null;
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }
    // This only validates target syntax; a future live scanner must also validate DNS results.
    const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");
    if (
      parsed.username ||
      parsed.password ||
      !hostname.includes(".") ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.includes(":") ||
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
      /^(127|0|169\.254|224|240)\./.test(hostname) ||
      hostname === "0.0.0.0"
    ) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Strip all HTML tags from a string.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/**
 * Validate email format.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
