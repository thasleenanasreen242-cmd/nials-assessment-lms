"use client";

import { FormEvent, useEffect, useState } from "react";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const authError = url.searchParams.get("error_description") || url.searchParams.get("error");

    if (authError) {
      setError(decodeURIComponent(authError.replace(/\+/g, " ")));
      url.searchParams.delete("error");
      url.searchParams.delete("error_description");
      window.history.replaceState({}, "", url.toString());
      return;
    }

    if (code) {
      setBusy(true);
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setError("We couldn't verify this email link. It may have expired. Please request a new confirmation email.");
        } else {
          setMessage("Email verified successfully. Your NiALS account is ready. Please sign in.");
          setMode("login");
        }
        url.searchParams.delete("code");
        window.history.replaceState({}, "", url.toString());
      }).catch(() => {
        setError("Email verification could not be completed. Please request a new confirmation email.");
      }).finally(() => setBusy(false));
    }
  }, []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName.trim() }, emailRedirectTo: (process.env.NEXT_PUBLIC_SITE_URL || "https://nials-assessment-lms.vercel.app") + "/login" }
        });
        if (error) throw error;
        if (data.session) window.location.href = "/lms";
        else setMessage("Account created. Please check your email and confirm your address before signing in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        window.location.href = "/lms";
      }
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
        redirectTo: "https://nials-assessment-lms.vercel.app/reset-password"
      });
      if (error) throw error;
      setMessage("If an account exists for this email, a password reset link will be sent.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to request a reset link.");
    } finally { setBusy(false); }
  }

  return <main className="auth-page">
    <section className="auth-brand-panel">
      <div className="auth-brand brand-lockup"><div className="brand-mark"><BookOpen size={23} strokeWidth={2.2}/><span className="brand-spark">✦</span></div><div><div className="brand-name">NiALS</div><div className="brand-caption">ASSESSMENT SERVICES</div></div></div>
      <div className="auth-message"><span>LEARN · REFLECT · GROW</span><h1>Every learner deserves a clearer path forward.</h1><p>A thoughtful space for assessments, counselling and student progress.</p></div>
      <div className="auth-foot">NiALS Assessment &amp; Student Portal</div>
    </section>
    <section className="auth-form-panel">
      <div className="auth-form-wrap">
        <div className="auth-mobile-brand">NiALS <span>ASSESSMENT SERVICES</span></div>
        <span className="auth-eyebrow">{mode === "login" ? "WELCOME BACK" : "GET STARTED"}</span>
        <h2>{mode === "login" ? "Sign in to your portal" : "Create your learner account"}</h2>
        <p className="auth-intro">{mode === "login" ? "Access your NiALS learning and assessment space." : "Register as a learner to get started with NiALS."}</p>
        <div className="auth-mode-switch"><button type="button" className={mode === "login" ? "active" : ""} onClick={() => {setMode("login");setError("");setMessage("");}}>Sign in</button><button type="button" className={mode === "signup" ? "active" : ""} onClick={() => {setMode("signup");setError("");setMessage("");}}>Sign up</button></div>
        <form onSubmit={signIn}>
          {mode === "signup" && <><label htmlFor="fullName">Full name</label><input id="fullName" type="text" autoComplete="name" required maxLength={100} value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Your full name"/></>}
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
          <label htmlFor="password">Password</label>
          <div className="password-field"><input id="password" type={showPassword ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} placeholder={mode === "signup" ? "Create a password (at least 8 characters)" : "Enter your password"}/><button className="password-toggle" type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>
          <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"} <span>→</span></button>
        </form>
        {mode === "login" && <button className="auth-reset" type="button" disabled={busy} onClick={resetPassword}>Forgot password?</button>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        {message && <p className="auth-success" role="status">{message}</p>}
        <div className="auth-note">{mode === "signup" ? "Learner registration only. Counsellor, school and administrator accounts are created by NiALS." : "School and staff access is provided by your NiALS administrator."}</div>
      </div>
    </section>
  </main>;
}
