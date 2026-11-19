# CyberSentinel design direction

Software: security operations workspace for analysts. The user's direction is professional, comfortable to read, and equally usable on desktop and mobile.

ENERGY 1 / RHYTHM 2 / MOTION 1. Operational clarity leads. No marketing sections or decorative scenes inside the working dashboard.

- Navy navigation separates persistent workspace controls from the light reading surface. Emerald identifies primary actions and the selected destination. Severity colors have semantic meaning only.
- A 240px sidebar on large screens becomes a compact bottom navigation below 1024px. The tablet layout uses two metric columns; wide desktop uses four. Mobile data rows reflow into readable cards.
- System sans (Segoe UI on Windows) is locally available, readable at interface sizes, and avoids a blocking font download. Monospace is limited to technical addresses and identifiers. Body 16px, controls and labels 14px, secondary metadata 13px.
- Spacing follows 4/8/12/16/24/32/48px. Content has equal margins and a centered maximum width of 1480px. Cards group related data, not every individual sentence.
- The existing shield mark is retained. Interface glyphs identify concrete actions: search, scan, reports, export, account, and activity. No generated imagery or profile photos.
- Restrained hover/press feedback indicates action; chart lines encode event counts. There is no perpetual decorative motion. Reduced motion is supported globally.
- Demo figures are derived from explicitly labeled example records. Real mode derives figures from stored records and uses honest empty/error states. Scans remain simulations and never claim to inspect a live target.
- Voice: direct English matching the existing application, short action labels, actionable error messages, no unsupported security or performance claims.

Primary workflows: open demo, review event data, run a simulated URL scan, inspect findings, create a report from a scan, read and export reports, and reset demo data. Demo sessions are signed and expire after eight hours; demo records stay in browser storage and never enter the real database.

The taste skill's marketing-specific full-screen sections, visual dealers, promotional effects, and stock imagery are inapplicable to this existing operations application. Its typography, alignment, accessibility, responsive QA, and consistency guidance apply.
