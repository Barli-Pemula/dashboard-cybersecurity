"use client";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Brand } from "@/components/Sidebar";
import Icon from "@/components/ui/Icon";
import { ErrorMessage } from "@/components/ui/Feedback";
import { requestJSON } from "@/lib/workspace";
export default function AuthScreen({
  register = false,
  allowDemo,
}: {
  register?: boolean;
  allowDemo: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  useEffect(() => {
    setRegistered(
      new URLSearchParams(window.location.search).get("registered") === "1",
    );
  }, []);
  async function openDemo() {
    setError("");
    setDemoLoading(true);
    try {
      await requestJSON("/api/demo", { method: "POST" });
      window.location.assign("/dashboard");
    } catch (error) {
      setError((error as Error).message);
      setDemoLoading(false);
    }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (register && !name.trim()) {
      setError("Enter your full name.");
      return;
    }
    if (register && password !== confirm) {
      setError("The passwords do not match. Check both password fields.");
      return;
    }
    setLoading(true);
    try {
      if (register) {
        await requestJSON("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
          }),
        });
        router.push("/login?registered=1");
      } else {
        const result = await signIn("credentials", {
          email: email.toLowerCase().trim(),
          password,
          redirect: false,
        });
        if (!result || result.error || !result.ok)
          throw new Error(
            "Unable to sign in. Check your email and password, or open the demo workspace.",
          );
        const callback = new URLSearchParams(window.location.search).get(
          "callbackUrl",
        );
        window.location.assign(
          callback && ["/dashboard", "/scanner", "/reports"].includes(callback)
            ? callback
            : "/dashboard",
        );
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="auth-page">
      <aside className="auth-story">
        <Brand href="/login" />
        <div className="auth-story-content">
          <span className="auth-category">Security operations workspace</span>
          <p className="auth-story-title">
            Your security picture.
            <br />
            <span>In better focus.</span>
          </p>
          <p>
            Review events, explore vulnerabilities, and give every finding a
            clear next step.
          </p>
          <div
            className="auth-product-preview"
            aria-label="An illustrative assessment preview"
          >
            <div className="preview-top">
              <span>
                <Icon name="shield" size={17} />
                Assessment workspace
              </span>
              <span>Preview</span>
            </div>
            <div className="preview-body">
              <span className="preview-target">
                <Icon name="globe" size={18} />
                portal.example.com
              </span>
              <div className="preview-check">
                <span>
                  <Icon name="check" size={16} />
                  HTTP header review
                </span>
                <span>Completed</span>
              </div>
              <div className="preview-check">
                <span>
                  <Icon name="check" size={16} />
                  Transport configuration
                </span>
                <span>Completed</span>
              </div>
              <div className="preview-check">
                <span>
                  <Icon name="reports" size={16} />
                  Assessment report
                </span>
                <span>Ready to review</span>
              </div>
            </div>
          </div>
          <div className="auth-story-note">
            <Icon name="info" size={17} />
            <span>Try the workflow with simulated data in demo mode.</span>
          </div>
        </div>
        <footer>CyberSentinel · A clearer security workflow</footer>
      </aside>
      <main className="auth-main">
        <div className="auth-mobile-brand">
          <Brand href="/login" />
        </div>
        <div className="auth-form-wrap page-enter">
          <div className="auth-form-heading">
            <span className="auth-form-category">Your workspace</span>
            <h1>{register ? "Create your account" : "Welcome back"}</h1>
            <p>
              {register
                ? "Set up your personal security workspace."
                : "Sign in to continue to CyberSentinel."}
            </p>
          </div>
          {registered && !register && (
            <div className="success-message" role="status">
              <Icon name="check" size={18} />
              Account created. You can sign in now.
            </div>
          )}
          {error && <ErrorMessage message={error} />}
          <form onSubmit={submit} className="auth-form">
            {register && (
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input
                  className="input"
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                  required
                  autoComplete="name"
                  maxLength={100}
                  disabled={loading || demoLoading}
                />
              </div>
            )}
            <div className="field">
              <label htmlFor="email">Work email</label>
              <div className="input-with-icon">
                <Icon name="mail" size={18} />
                <input
                  className="input"
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                  maxLength={254}
                  disabled={loading || demoLoading}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="password-field">
                <input
                  className="input"
                  id="password"
                  type={visible ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={
                    register ? "At least 8 characters" : "Enter your password"
                  }
                  minLength={register ? 8 : undefined}
                  maxLength={register ? 72 : 1024}
                  required
                  autoComplete={register ? "new-password" : "current-password"}
                  disabled={loading || demoLoading}
                />
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setVisible(!visible)}
                  aria-label={visible ? "Hide password" : "Show password"}
                  aria-pressed={visible}
                >
                  <Icon name="eye" size={18} />
                </button>
              </div>
            </div>
            {register && (
              <div className="field">
                <label htmlFor="confirm-password">Confirm password</label>
                <input
                  className="input"
                  id="confirm-password"
                  type={visible ? "text" : "password"}
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  placeholder="Enter your password again"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                  required
                  disabled={loading || demoLoading}
                />
              </div>
            )}
            <button
              className="btn-primary auth-submit"
              type="submit"
              disabled={loading || demoLoading}
            >
              {loading
                ? register
                  ? "Creating account…"
                  : "Signing in…"
                : register
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>
          {allowDemo && (
            <>
              <div className="auth-divider">
                <span>or take a look around</span>
              </div>
              <button
                className="btn-demo"
                onClick={openDemo}
                disabled={loading || demoLoading}
              >
                <Icon name="play" size={17} />
                {demoLoading
                  ? "Opening demo workspace…"
                  : "Open demo workspace"}
              </button>
              <p className="demo-explanation">
                Demo analyst account · No password needed
                <br />
                Example data stays in this browser.
              </p>
            </>
          )}
          <p className="auth-switch">
            {register ? "Already have an account?" : "New to CyberSentinel?"}{" "}
            <Link href={register ? "/login" : "/register"}>
              {register ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </div>
        <footer className="auth-footer">
          <Icon name="lock" size={14} />
          {allowDemo
            ? "A separate demo environment. No production systems connected."
            : "Your personal assessment workspace."}
        </footer>
      </main>
    </div>
  );
}
