"use client";
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useAccess } from "@/components/WorkspaceProvider";
import { resetDemoWorkspace, requestJSON } from "@/lib/workspace";
import { useNotifications } from "@/context/NotificationContext";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import NotificationDropdown from "@/components/NotificationDropdown";
export default function Header() {
  const access = useAccess();
  const pathname = usePathname();
  const { showToast } = useNotifications();
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  async function exit() {
    setLeaving(true);
    try {
      await requestJSON("/api/demo", { method: "DELETE" });
      if (access.demo) window.location.assign("/login");
      else await signOut({ callbackUrl: "/login" });
    } catch (error) {
      showToast({
        type: "error",
        title: "Unable to sign out",
        message: (error as Error).message,
      });
      setLeaving(false);
    }
  }
  return (
    <>
      <header className="app-header">
        <div className="breadcrumb">
          <span className="desktop-breadcrumb">
            Workspace
            <Icon name="chevron" size={14} />
          </span>
          <strong>
            {pathname === "/scanner"
              ? "Vulnerability scanner"
              : pathname === "/reports"
                ? "Security reports"
                : "Overview"}
          </strong>
        </div>
        <div className="header-actions">
          {access.demo && <span className="demo-tag">Demo mode</span>}
          <NotificationDropdown />
          <span className="header-divider" />
          <div ref={ref} className="account-wrapper">
            <button
              className="account-button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="account-menu"
              aria-label="Account menu"
            >
              <span className="avatar">
                {access.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <span className="account-name">
                {access.name}
                <small>
                  {access.demo ? "Demo account" : "Security analyst"}
                </small>
              </span>
              <Icon name="down" size={14} />
            </button>
            {open && (
              <div className="account-menu" id="account-menu">
                <p>
                  {access.name}
                  <small>{access.email}</small>
                </p>
                {access.demo && (
                  <button
                    onClick={() => {
                      setConfirmReset(true);
                      setOpen(false);
                    }}
                  >
                    <Icon name="refresh" size={17} />
                    Reset demo data
                  </button>
                )}
                <button onClick={exit} disabled={leaving}>
                  <Icon name="logout" size={17} />
                  {leaving
                    ? "Signing out…"
                    : access.demo
                      ? "Exit demo"
                      : "Sign out"}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      {confirmReset && (
        <Modal title="Reset demo data?" onClose={() => setConfirmReset(false)}>
          <p className="muted">
            This replaces scans and reports in this demo browser with the
            original examples. Download any reports you want to keep first.
          </p>
          <div className="modal-actions">
            <button
              className="btn-secondary"
              onClick={() => setConfirmReset(false)}
            >
              Keep my data
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                try {
                  resetDemoWorkspace();
                  setConfirmReset(false);
                  showToast({
                    type: "success",
                    title: "Demo data reset",
                    message: "The original example records are ready.",
                  });
                } catch (error) {
                  showToast({
                    type: "error",
                    title: "Reset failed",
                    message: (error as Error).message,
                  });
                }
              }}
            >
              Reset demo data
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
