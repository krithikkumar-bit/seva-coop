"""Input sanitization utilities to prevent stored XSS and control-character injection."""
import re
from typing import Optional

_SCRIPT_OR_STYLE_BLOCK_RE = re.compile(
    r"<\s*(script|style|iframe|object|embed|svg)\b[^>]*>.*?<\s*/\s*\1\s*>",
    re.IGNORECASE | re.DOTALL,
)
_HTML_TAG_RE = re.compile(r"<[^>]*>")
_CONTROL_CHARS_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
_BIDI_CHARS_RE = re.compile(r"[\u200e\u200f\u202a-\u202e\u2066-\u2069]")
_DANGEROUS_SCHEME_RE = re.compile(
    r"(?:j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t|"
    r"v\s*b\s*s\s*c\s*r\s*i\s*p\s*t|"
    r"d\s*a\s*t\s*a\s*:\s*(?:text/html|image/svg\+xml))\s*:",
    re.IGNORECASE,
)


def sanitize_text(value: Optional[str]) -> str:
    """
    Strip script/style/embed blocks, HTML tags, angle brackets, dangerous URI schemes,
    Unicode BiDi overrides, and ASCII control characters from user-supplied text.
    """
    if not value:
        return ""
    cleaned = _CONTROL_CHARS_RE.sub("", str(value))
    cleaned = _BIDI_CHARS_RE.sub("", cleaned)
    # Loop until fixed point to neutralize nested payloads like <scr<script>ipt>
    for _ in range(5):
        prev = cleaned
        cleaned = _SCRIPT_OR_STYLE_BLOCK_RE.sub("", cleaned)
        cleaned = _HTML_TAG_RE.sub("", cleaned)
        cleaned = cleaned.replace("<", "").replace(">", "")
        cleaned = _DANGEROUS_SCHEME_RE.sub("", cleaned)
        if cleaned == prev:
            break
    return cleaned.strip()
