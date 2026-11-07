"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      window.location.href = "/lms";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to sign in. Please try again.");
    } finally { setBusy(false); }
  }

  async function resetPassword() {
    if (!email.trim()) { setError("Enter your email address first."); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + "/login"
      });
      if (error) throw error;
      setMessage("If an account exists for this email, a password reset link will be sent.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to request a reset link.");
    } finally { setBusy(false); }
  }

  return <main className="auth-page">
    <section className="auth-brand-panel">
      <div className="auth-brand"><div className="auth-mark">N</div><div><b>NiALS</b><small>ASSESSMENT SERVICES</small></div></div>
      <div className="auth-message"><span>LEARN · REFLECT · GROW</span><h1>Every learner deserves a clearer path forward.</h1><p>A thoughtful space for assessments, counselling and student progress.</p></div>
      <div className="auth-foot">NiALS Assessment &amp; Student Portal</div>
    </section>
    <section className="auth-form-panel">
      <div className="auth-form-wrap">
        <div className="auth-mobile-brand">NiALS <span>ASSESSMENT SERVICES</span></div>
        <span className="auth-eyebrow">WELCOME BACK</span>
        <h2>Sign in to your portal</h2>
        <p className="auth-intro">Use the account details provided by your school or NiALS administrator.</p>
        <form onSubmit={signIn}>
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/>
          <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Please wait…" : "Sign in"} <span>→</span></button>
        </form>
        <button className="auth-reset" type="button" disabled={busy} onClick={resetPassword}>Forgot password?</button>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {message && <p className="auth-success" role="status">{message}</p>}
        <div className="auth-note">Access is managed by your school or NiALS. Self-registration is currently disabled.</div>
        <Link className="auth-back" href="/">← Back to portal preview</Link>
      </div>
    </section>
  </main>;
}
