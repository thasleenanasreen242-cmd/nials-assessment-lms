"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Activity, ArrowDownToLine, ArrowRight, Bell, BookOpen, CalendarDays,
  CheckCircle2, ChevronDown, ClipboardCheck, Clock3, FileText, GraduationCap,
  LayoutDashboard, LifeBuoy, LogOut, Menu, MessageSquareText, Search,
  Settings, ShieldCheck, Sparkles, Users, X, Building2, ChartNoAxesCombined
} from "lucide-react";

type Role = "Student" | "Counsellor" | "School Admin" | "NiALS Admin";

const assessments = [
  { title: "Career Interest Assessment", subtitle: "Explore interests, strengths and possibilities", status: "In progress", progress: 64, due: "Due 18 Nov 2026", tone: "blue" },
  { title: "Learning & Study Habits", subtitle: "Understand your learning preferences", status: "Not started", progress: 0, due: "Available soon", tone: "purple" },
  { title: "Student Wellbeing Check-in", subtitle: "A guided reflection on everyday wellbeing", status: "Completed", progress: 100, due: "Completed 02 Nov 2026", tone: "green" },
];

function Brand() {
  return <div className="brand-lockup">
    <div className="brand-mark"><BookOpen size={23} strokeWidth={2.2}/><span className="brand-spark">✦</span></div>
    <div><div className="brand-name">NiALS</div><div className="brand-caption">ASSESSMENT SERVICES</div></div>
  </div>;
}

function Sidebar({ role, mobileOpen, close, onSignOut }: { role: Role; mobileOpen: boolean; close: () => void; onSignOut: () => void }) {
  const items = role === "Student"
    ? [{ label: "Overview", icon: LayoutDashboard }, { label: "My assessments", icon: ClipboardCheck }, { label: "My progress", icon: ChartNoAxesCombined }, { label: "Counselling", icon: MessageSquareText }, { label: "My reports", icon: FileText }]
    : role === "Counsellor"
    ? [{ label: "Overview", icon: LayoutDashboard }, { label: "Learners", icon: Users }, { label: "Assessment reviews", icon: ClipboardCheck }, { label: "Sessions", icon: CalendarDays }, { label: "Reports", icon: FileText }]
    : role === "School Admin"
    ? [{ label: "Overview", icon: LayoutDashboard }, { label: "Students", icon: Users }, { label: "Assessment activity", icon: Activity }, { label: "School insights", icon: ChartNoAxesCombined }, { label: "Settings", icon: Settings }]
    : [{ label: "Overview", icon: LayoutDashboard }, { label: "Schools", icon: Building2 }, { label: "Users & roles", icon: Users }, { label: "Assessment catalogue", icon: BookOpen }, { label: "Evidence & versions", icon: ShieldCheck }, { label: "Platform settings", icon: Settings }];

  return <>
    {mobileOpen && <button className="mobile-scrim" onClick={close} aria-label="Close menu" />}
    <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-top"><Brand/><button className="close-menu" onClick={close}><X size={19}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <button className="workspace-switch"><div className="workspace-avatar">N</div><span><b>{role === "Student" ? "My learning space" : role === "School Admin" ? "School workspace" : role === "Counsellor" ? "Counsellor workspace" : "NiALS platform"}</b><small>{role} access</small></span><ChevronDown size={16}/></button>
      <div className="nav-label">MENU</div>
      <nav className="side-nav">
        {items.map((item, i) => <button key={item.label} className={i === 0 ? "nav-item active" : "nav-item"} onClick={() => { if (i > 0) document.getElementById("workspace-content")?.scrollIntoView({ behavior: "smooth" }); close(); }}><item.icon size={18}/><span>{item.label}</span>{item.label === "Assessment reviews" && <span className="nav-count">4</span>}</button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="help-card"><div className="help-icon"><LifeBuoy size={18}/></div><b>Need a hand?</b><p>Our support team is here to help.</p><button>Contact support <ArrowRight size={13}/></button></div>
        <button className="nav-item"><Settings size={18}/><span>Preferences</span></button>
        <button className="nav-item" onClick={onSignOut}><LogOut size={18}/><span>Sign out</span></button>
        <div className="sidebar-version">NiALS Portal <span>v1.0 · Demo</span></div>
      </div>
    </aside>
  </>;
}

function StudentDashboard({ displayName, liveAssignmentCount, learnerLinked }: { displayName: string; liveAssignmentCount: number; learnerLinked: boolean }) {
  return <>
    <div className="welcome-row"><div><div className="eyebrow">SATURDAY, 07 NOVEMBER 2026</div><h1>Good afternoon, {displayName.split(" ")[0]} <span className="wave">✦</span></h1><p className="subheading">Your next step starts with understanding yourself.</p></div><button className="primary-btn" onClick={() => document.getElementById("assessments")?.scrollIntoView({behavior:"smooth"})}><ClipboardCheck size={17}/> Continue assessment</button></div>
    <section className="hero-card"><div className="hero-copy"><div className="hero-kicker"><Sparkles size={14}/> YOUR JOURNEY, YOUR PACE</div><h2>Discover what makes<br/>you <em>uniquely you.</em></h2><p>Take thoughtful steps towards understanding your interests, strengths and future possibilities.</p><button className="hero-btn" onClick={() => document.getElementById("assessments")?.scrollIntoView({behavior:"smooth"})}>Explore my assessments <ArrowRight size={16}/></button></div><div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="art-circle"><GraduationCap size={68}/></div><div className="float-chip chip-one"><Sparkles size={15}/> Your strengths</div><div className="float-chip chip-two"><Activity size={15}/> Your interests</div><div className="art-dot dot-one"/><div className="art-dot dot-two"/></div></section>
    <div className="section-heading"><div><h2>Your overview</h2><p>A little progress every day adds up.</p></div><button className="text-link">View activity <ArrowRight size={15}/></button></div>
    <div className="stats-grid">
      <div className="stat-card"><div className="stat-icon stat-blue"><ClipboardCheck size={19}/></div><div className="stat-label">ASSESSMENTS</div><div className="stat-number">{String(liveAssignmentCount).padStart(2, "0")} <span>assigned</span></div><div className="stat-foot">{learnerLinked ? "Live assignments linked to your account" : "Waiting for school/NiALS account linking"}</div></div>
      <div className="stat-card"><div className="stat-icon stat-purple"><Activity size={19}/></div><div className="stat-label">MY PROGRESS</div><div className="stat-number">64<span>%</span></div><div className="progress-track"><div className="progress-fill" style={{width:"64%"}}/></div><div className="stat-foot">Keep going, you're doing well</div></div>
      <div className="stat-card"><div className="stat-icon stat-green"><CalendarDays size={19}/></div><div className="stat-label">COUNSELLING</div><div className="stat-number">{liveSessionCount} <span>sessions</span></div><div className="stat-foot">From your counselling schedule</div></div>
      <div className="stat-card"><div className="stat-icon stat-orange"><FileText size={19}/></div><div className="stat-label">MY REPORTS</div><div className="stat-number">{liveReportCount} <span>available</span></div><div className="stat-foot">Counsellor-released summaries</div></div>
    </div>
    <div className="section-heading assessment-heading" id="assessments"><div><h2>My assessments</h2><p>Pick up where you left off.</p></div><button className="outline-btn">View all <ArrowRight size={15}/></button></div>
    <div className="assessment-list">{assessments.map((a, i) => <div className="assessment-card" key={a.title}><div className={`assessment-icon ${a.tone}`}>{i === 0 ? <Sparkles size={22}/> : i === 1 ? <BookOpen size={22}/> : <CheckCircle2 size={22}/>}</div><div className="assessment-info"><div className="assessment-title">{a.title}</div><p>{a.subtitle}</p><div className="assessment-meta"><span><Clock3 size={13}/>{a.due}</span>{a.status === "Completed" && <span className="complete-label"><CheckCircle2 size={13}/> Completed</span>}</div></div><div className="assessment-action">{a.status === "In progress" ? <><span className="status-pill in-progress">In progress</span><div className="mini-progress"><span style={{width:`${a.progress}%`}}/></div><small>{a.progress}% complete</small><button className="small-primary">Continue <ArrowRight size={14}/></button></> : a.status === "Completed" ? <><span className="status-pill completed">Completed</span><button className="small-outline">View details</button></> : <><span className="status-pill upcoming">Coming up</span><button className="small-outline" disabled>Not available</button></>}</div></div>)}</div>
    <section className="notice-card"><div className="notice-icon"><ShieldCheck size={20}/></div><div><b>Your information stays private</b><p>Your individual assessment responses are visible only to authorised assessment professionals. Your school receives group-level insights, not your personal scores.</p></div><button aria-label="Learn about privacy"><ArrowRight size={17}/></button></section>
  </>;
}

function StaffDashboard({ role }: { role: Role }) {
  const isCounsellor = role === "Counsellor";
  const isSchool = role === "School Admin";
  return <>
    <div className="welcome-row"><div><div className="eyebrow">NIALS ASSESSMENT SERVICES · DEMO WORKSPACE</div><h1>{isCounsellor ? "Counsellor overview" : isSchool ? "School overview" : "Platform overview"}</h1><p className="subheading">{isCounsellor ? "Review learner progress and manage counselling sessions." : isSchool ? "A clear picture of assessment activity across your school." : "Manage schools, assessment programmes and platform activity."}</p></div><button className="primary-btn"><ArrowDownToLine size={17}/> Export overview</button></div>
    <div className="staff-banner"><div><span className="hero-kicker"><Activity size={14}/> LIVE WORKSPACE PREVIEW</span><h2>{isCounsellor ? "Every learner deserves to be heard." : isSchool ? "Understand progress. Support every learner." : "A thoughtful assessment ecosystem."}</h2><p>{isCounsellor ? "Your workspace brings reviews, sessions and report releases together." : isSchool ? "Monitor participation and group-level patterns while protecting individual student privacy." : "A central view of your schools, people and assessment catalogue."}</p></div><div className="staff-banner-icon">{isCounsellor ? <MessageSquareText size={55}/> : isSchool ? <Building2 size={55}/> : <ShieldCheck size={55}/>}</div></div>
    <div className="stats-grid staff-stats">
      {(isCounsellor ? [["PENDING REVIEWS","12","4 need attention"],["SESSIONS THIS WEEK","08","2 scheduled today"],["COMPLETED REVIEWS","34","Across active schools"],["REPORTS TO RELEASE","05","After session confirmation"]] : isSchool ? [["ENROLLED LEARNERS","248","Across 8 classes"],["ASSESSMENTS STARTED","186","75% participation"],["SESSIONS HELD","42","Counsellor-led sessions"],["SUMMARIES RELEASED","31","With authorised release"]] : [["PARTNER SCHOOLS","08","Pilot workspace"],["ACTIVE LEARNERS","248","Demo learner accounts"],["ASSESSMENT REVIEWS","12","Across counsellors"],["ACTIVE ASSESSMENTS","03","Catalogue entries"]]).map((s,i)=><div className="stat-card" key={s[0]}><div className="stat-label">{s[0]}</div><div className="stat-number">{s[1]}</div><div className="stat-foot">{s[2]}</div></div>)}
    </div>
    <div className="section-heading" id="workspace-content"><div><h2>{isCounsellor ? "Learner review queue" : isSchool ? "Assessment activity" : "Platform activity"}</h2><p>{isSchool ? "Aggregate participation data only — no individual scores." : "Illustrative information for the website preview."}</p></div><button className="outline-btn">View all <ArrowRight size={15}/></button></div>
    <div className="table-card"><div className="table-toolbar"><div className="search-box"><Search size={16}/><input placeholder={isCounsellor ? "Search learner ID..." : "Search records..."}/></div><button className="filter-btn">All status <ChevronDown size={14}/></button></div><div className="table-scroll"><table><thead><tr>{(isCounsellor ? ["LEARNER ID","ASSESSMENT","SUBMITTED","REVIEW STATUS","ACTION"] : isSchool ? ["CLASS","ENROLLED","STARTED","COMPLETED","PARTICIPATION"] : ["SCHOOL / ITEM","CATEGORY","ACTIVITY","STATUS","UPDATED"]).map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{(isCounsellor ? [["LRN-7K4P","Career Interest Assessment","06 Nov 2026","Pending review"],["LRN-2M8Q","Career Interest Assessment","05 Nov 2026","In review"],["LRN-9R3T","Learning Habits","04 Nov 2026","Pending review"],["LRN-5D6W","Career Interest Assessment","03 Nov 2026","Session needed"]] : isSchool ? [["Class 8","48","39","28","81%"],["Class 9","52","41","32","79%"],["Class 10","51","42","35","82%"],["Class 11","49","38","29","78%"],["Class 12","48","26","20","54%"]] : [["Green Valley School","School","64 learners enrolled","Active","Today"],["Career Interest Assessment","Assessment","Version 1.0","Draft","Yesterday"],["Counsellor workspace","User group","3 counsellors","Active","05 Nov"]]).map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j}>{j === r.length-1 && isCounsellor ? <span className={`status-pill ${v === "In review" ? "in-progress" : "upcoming"}`}>{v}</span> : v}</td>)}{isCounsellor && <td><button className="table-action">Open review <ArrowRight size={13}/></button></td>}</tr>)}</tbody></table></div><div className="table-footer">Showing sample records <span>Demo data · Not connected to student records</span></div></div>
    <section className="notice-card"><div className="notice-icon"><ShieldCheck size={20}/></div><div><b>{isSchool ? "Privacy-first school reporting" : "Evidence and review status"}</b><p>{isSchool ? "School dashboards show aggregate participation and common themes only. Individual responses and scores are not displayed to school leadership." : "Assessment outputs are marked as draft until validation and authorised review are complete. Report release requires a recorded counselling session."}</p></div></section>
  </>;
}

export default function Home() {
  const [authReady, setAuthReady] = useState(false);
  const [displayName, setDisplayName] = useState("Learner");
  const [learnerLinked, setLearnerLinked] = useState(false);
  const [liveAssignmentCount, setLiveAssignmentCount] = useState(0);
  const [liveSessionCount, setLiveSessionCount] = useState(0);
  const [liveReportCount, setLiveReportCount] = useState(0);
  const [role, setRole] = useState<Role>("Student");
  const supabase = createClient();
  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.replace("/login"); return; }
      const { data: profile, error } = await supabase.from("profiles").select("display_name, role").eq("id", user.id).maybeSingle();
      if (!active) return;
      if (error) { console.error("Unable to load NiALS profile", error.message); }
      const name = profile?.display_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Learner";
      setDisplayName(name);
      const roleMap: Record<string, Role> = { student: "Student", counsellor: "Counsellor", school_admin: "School Admin", nials_admin: "NiALS Admin", parent: "Student" };
      setRole(roleMap[profile?.role || "student"] || "Student");
      if ((profile?.role || "student") === "student" || profile?.role === "parent") {
        const { data: learner } = await supabase.from("learners").select("id").eq("auth_user_id", user.id).maybeSingle();
        if (learner) {
          setLearnerLinked(true);
          const { count } = await supabase.from("assessment_assignments").select("id", { count: "exact", head: true }).eq("learner_id", learner.id);
          setLiveAssignmentCount(count || 0);
          const { count: sessions } = await supabase.from("counselling_sessions").select("id", { count: "exact", head: true }).eq("learner_id", learner.id);
          setLiveSessionCount(sessions || 0);
          const { data: ids } = await supabase.from("assessment_assignments").select("id").eq("learner_id", learner.id);
          const assignmentIds = (ids || []).map(item => item.id);
          if (assignmentIds.length) { const { count: reports } = await supabase.from("report_releases").select("id", { count: "exact", head: true }).in("assignment_id", assignmentIds); setLiveReportCount(reports || 0); }
        }
      }
      setAuthReady(true);
    };
    loadProfile();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) window.location.replace("/login");
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);
  async function signOut() {
    await supabase.auth.signOut();
    window.location.replace("/login");
  }
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState(false);
  if (!authReady) return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#f7f9fc",color:"#0a66c2",fontFamily:"Arial,sans-serif"}}>Opening your NiALS LMS…</main>;
  return <div className="app-shell">
    <Sidebar role={role} mobileOpen={mobileOpen} close={() => setMobileOpen(false)} onSignOut={signOut}/>
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={21}/></button><div className="breadcrumb">Workspace <span>/</span> <b>{role}</b></div></div><div className="topbar-right"><button className="icon-button notification-button" onClick={()=>setNotifications(!notifications)} aria-label="Notifications"><Bell size={19}/><i/></button>{notifications && <div className="notification-pop"><b>You're all caught up</b><p>No new notifications in this demo workspace.</p></div>}<div className="profile"><div className="profile-avatar">{displayName.trim().charAt(0).toUpperCase()}</div><div className="profile-name"><b>{displayName}</b><small>{role}</small></div><ChevronDown size={15}/></div></div></header>
      <div className="page-content">{role === "Student" ? <StudentDashboard displayName={displayName} liveAssignmentCount={liveAssignmentCount} learnerLinked={learnerLinked}/> : <StaffDashboard role={role}/>}<footer className="page-footer"><Brand/><span>© 2026 NiALS Assessment Services. All rights reserved.</span><span>Privacy-first learning & assessment</span></footer></div>
    </main>
  </div>;
}