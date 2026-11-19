import Link from "next/link";
export default function NotFound() { return <main className="empty-state" style={{ minHeight: "100dvh", justifyContent: "center" }}><h1>Page not found</h1><p>This address does not belong to a CyberSentinel workspace page.</p><Link href="/" className="btn-primary">Open workspace</Link></main>; }
