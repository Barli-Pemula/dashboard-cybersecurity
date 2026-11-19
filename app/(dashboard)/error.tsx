"use client";
import Link from "next/link";
export default function WorkspaceError({ reset }: { reset: () => void }) { return <div className="card empty-state"><h1>Unable to open this workspace</h1><p>Your session or workspace data could not be loaded. Try again, or return to sign in.</p><div className="page-actions"><button className="btn-primary" onClick={reset}>Try again</button><Link className="btn-secondary" href="/login">Return to sign in</Link></div></div>; }
