// Helpers for showing API/admin-supplied text safely.
// - escapeHtml: for values interpolated into HTML strings (sweetalert2 `html:` templates). Attribute values read back
//   with getAttribute() come out unescaped, so copy buttons etc. keep working unchanged.
// - sanitizeHtml: for admin-authored rich text (promotion descriptions). Keeps formatting and inline styles, strips
//   scripts, event handlers, iframes/forms and non-http(s) links. Browser-only (DOMPurify needs a DOM).
import DOMPurify from "dompurify";

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

/** An http(s) or same-origin path image URL, escaped for an HTML attribute; "" when unsafe. */
export function safeImageSrc(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "";
  const raw = value.trim();
  if (raw.startsWith("/") && !raw.startsWith("//")) return escapeHtml(raw);
  try {
    const url = new URL(raw);
    return url.protocol === "https:" || url.protocol === "http:" ? escapeHtml(url.href) : "";
  } catch { return ""; }
}

let hooked = false;
export function sanitizeHtml(html: unknown): string {
  if (typeof html !== "string" || !html) return "";
  if (typeof window === "undefined") return ""; // never render unsanitized markup on the server
  if (!hooked) {
    hooked = true;
    DOMPurify.addHook("afterSanitizeAttributes", (node) => {
      if (node.tagName === "A") {
        const href = node.getAttribute("href") ?? "";
        if (href && !/^(https?:|mailto:|tel:|\/(?!\/)|#)/i.test(href)) node.removeAttribute("href");
        if (node.getAttribute("target") === "_blank") node.setAttribute("rel", "noopener noreferrer");
      }
    });
  }
  return DOMPurify.sanitize(html, {
    FORBID_TAGS: ["style", "iframe", "frame", "object", "embed", "form", "input", "button", "textarea", "select", "meta", "link", "base"],
    ADD_ATTR: ["target"],
  });
}
