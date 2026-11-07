"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function prepare() {
      try {
        const supabase = createClient();
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const type = url.searchParams.get("type") || hash.get("type");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          url.searchParams.delete("code");
          window.history.replaceState({}, "", url.pathname + url.search + url.hash);
        } else if (hash.get("access_token") && hash.get("refresh_token")) {
          const { error } = await supabase.auth.setSession({
            access_token: hash.get("access_token")!,
            refresh_token: hash.get("refresh_token")!
          });
          if (error) throw error;
          window.history.replaceState({}, "", url.pathname + url.search);
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session || (type && type !== "recovery")) {
          throw new Error("This is not a valid password-reset link. Request a new reset email from the NiALS login page.");
        }
        if (active) setReady(true);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "This reset link is invalid or expired. Request a new one.");
      } finally {
        if (active) setBusy(false);
      }
    }
    prepare();
    return () => { active = false; };
  }, []);

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setMessage("");
    if (password.length < 8) { setError("Use at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("The passwords do not match."); return; }
    setBusy(true);
    try {
      const { error } = await createClient().auth.updateUser({ password });
      if (error) throw error;
      await createClient().auth.signOut();
      setMessage("Your password has been updated. You can now sign in with your new password.");
      setReady(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update your password.");
    } finally { setBusy(false); }
  }

  return <main className="auth-page"><section className="auth-brand-panel"><div className="auth-brand brand-lockup"><div className="brand-mark">N</div><div><div className="brand-name">NiALS</div><div className="brand-caption">ASSESSMENT SERVICES</div></div></div><div className="auth-message"><span>SECURE ACCOUNT ACCESS</span><h1>Choose a new password.</h1><p>Keep your NiALS account secure with a password only you know.</p></div><div className="auth-foot">NiALS Assessment &amp; Student Portal</div></section><section className="auth-form-panel"><div className="auth-form-wrap"><span className="auth-eyebrow">ACCOUNT RECOVERY</span><h2>Reset your password</h2><p className="auth-intro">Enter and confirm your new password below.</p>{busy && !ready && !error ? <p>Checking your secure reset link…</p> : ready ? <form onSubmit={savePassword}><label htmlFor="new-password">New password</label><div className="password-field"><input id="new-password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/><button className="password-toggle" type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div><label htmlFor="confirm-password">Confirm new password</label><div className="password-field"><input id="confirm-password" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Enter the password again"/><button className="password-toggle" type="button" onClick={() => setShowConfirmPassword(v => !v)} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>{showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div><button className="auth-submit" type="submit" disabled={busy}>{busy ? "Saving…" : "Update password"} <span>→</span></button></form> : null}{error && <p className="auth-error" role="alert">{error}</p>}{message && <p className="auth-success" role="status">{message}</p>}<Link className="auth-back" href="/login">← Back to sign in</Link></div></section></main>;
}
