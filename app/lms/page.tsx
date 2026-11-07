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
        {items.map((item, i) => <button key={item.label} className={i === 0 ? "nav-item active" : "nav-item"} onClick={() => { const targets: Record<string,string> = {"Overview":"overview","My assessments":"assessments","My progress":"progress","Counselling":"counselling","My reports":"reports","Learners":"workspace-content","Assessment reviews":"workspace-content","Sessions":"workspace-content","Reports":"workspace-content","Students":"workspace-content","Assessment activity":"workspace-content","School insights":"workspace-content","Schools":"catalogue","Users & roles":"catalogue","Assessment catalogue":"catalogue","Evidence & versions":"catalogue","Platform settings":"catalogue"}; document.getElementById(targets[item.label] || "overview")?.scrollIntoView({behavior:"smooth",block:"start"}); close(); }}><item.icon size={18}/><span>{item.label}</span>{item.label === "Assessment reviews" && <span className="nav-count">4</span>}</button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="help-card"><div className="help-icon"><LifeBuoy size={18}/></div><b>Need a hand?</b><p>Our support team is here to help.</p><button>Contact support <ArrowRight size={13}/></button></div>
        <button className="nav-item"><Settings size={18}/><span>Preferences</span></button>
        <button className="nav-item" onClick={onSignOut}><LogOut size={18}/><span>Sign out</span></button>
        <div className="sidebar-version">NiALS Portal <span>v1.0</span></div>
      </div>
    </aside>
  </>;
}

type QuestionItem={id?:string;prompt?:string;question?:string;text?:string;prompt_en?:string;prompt_ml?:string;type?:string;options?:(string|{value?:string;label?:string;label_en?:string;label_ml?:string})[]};
type AssignmentItem={id:string;status:string;assigned_at:string;assessment_versions:{version_label:string;published:boolean;question_set:QuestionItem[];assessments:{title:string;description:string|null}|null}|null;assessment_responses:{id:string;answers:Record<string,string|string[]>;saved_at:string;submitted_at:string|null}[]};
function AssessmentRunner({assignment,onClose,onSaved}:{assignment:AssignmentItem;onClose:()=>void;onSaved:()=>void}){
const supabase=createClient();const qs=assignment.assessment_versions?.question_set||[];const existing=assignment.assessment_responses?.[0];const [answers,setAnswers]=useState<Record<string,string|string[]>>(existing?.answers||{});const [idx,setIdx]=useState(0);const [busy,setBusy]=useState(false);const [msg,setMsg]=useState("");const [lang,setLang]=useState<"en"|"ml">("en");const submitted=!!existing?.submitted_at;const q=qs[idx];const qkey="q_"+(q?.id||idx);
const prompt=lang==="ml"?(q?.prompt_ml||q?.prompt||q?.question||q?.text||""):(q?.prompt_en||q?.prompt||q?.question||q?.text||"");
const opts=(q?.options||[]).map(o=>typeof o==="string"?{value:o,label:o}:{value:o.value||o.label_en||o.label_ml||"",label:lang==="ml"?(o.label_ml||o.label_en||o.value||""):(o.label_en||o.value||o.label_ml||"")});
async function save(submit=false){if(submitted)return;setBusy(true);setMsg("");try{const {error}=await supabase.from("assessment_responses").upsert({assignment_id:assignment.id,answers,saved_at:new Date().toISOString(),submitted_at:submit?new Date().toISOString():null},{onConflict:"assignment_id"});if(error)throw error;setMsg(submit?"Assessment submitted.":"Progress saved.");if(submit)onSaved();}catch(e){setMsg(e instanceof Error?e.message:"Unable to save answers.");}finally{setBusy(false);}}
if(!assignment.assessment_versions?.published||!qs.length)return <div className="assessment-card"><div className="assessment-info"><b>Questionnaire not published yet</b><p>NiALS will enable this assessment after publishing its approved question set.</p><button className="small-outline" onClick={onClose}>Back</button></div></div>;
return <section className="assessment-card" style={{display:"block",padding:24}}><div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><b>{assignment.assessment_versions.assessments?.title||"Assessment"}</b><div style={{display:"flex",gap:6}}><button className="small-outline" onClick={()=>setLang("en")}>English</button><button className="small-outline" onClick={()=>setLang("ml")}>മലയാളം</button><button className="small-outline" onClick={onClose}>Close</button></div></div><p>Question {idx+1} of {qs.length}</p><div className="progress-track"><div className="progress-fill" style={{width:((idx+1)/qs.length*100)+"%"}}/></div><h3 style={{margin:"20px 0"}}>{prompt}</h3>{q.type==="text"||q.type==="textarea"?<textarea rows={4} disabled={submitted} value={String(answers[qkey]||"")} onChange={e=>setAnswers(v=>({...v,[qkey]:e.target.value}))} style={{width:"100%",padding:12,border:"1px solid #d6deea",borderRadius:10}}/>:<div style={{display:"grid",gap:10}}>{opts.map((o,i)=><label key={i} style={{display:"flex",gap:10,padding:12,border:"1px solid #d6deea",borderRadius:10}}><input type={q.type==="multiple"||q.type==="multi_select"?"checkbox":"radio"} name={qkey} disabled={submitted} checked={Array.isArray(answers[qkey])?(answers[qkey] as string[]).includes(o.value):answers[qkey]===o.value} onChange={e=>setAnswers(v=>{if(q.type==="multiple"||q.type==="multi_select"){const old=Array.isArray(v[qkey])?[...(v[qkey] as string[])]:[];return {...v,[qkey]:e.target.checked?[...old,o.value]:old.filter(x=>x!==o.value)}}return {...v,[qkey]:o.value}})}/>{o.label}</label>)}</div>}{msg&&<p role="status">{msg}</p>}<div style={{display:"flex",justifyContent:"space-between",gap:8,marginTop:20,flexWrap:"wrap"}}><button className="small-outline" disabled={idx===0} onClick={()=>setIdx(n=>n-1)}>Previous</button><div style={{display:"flex",gap:8}}>{!submitted&&<button className="small-outline" disabled={busy} onClick={()=>save()}>Save progress</button>}{idx<qs.length-1?<button className="small-primary" onClick={()=>setIdx(n=>n+1)}>Next <ArrowRight size={14}/></button>:submitted?<span className="status-pill completed">Submitted</span>:<button className="small-primary" disabled={busy} onClick={()=>{if(window.confirm("Submit your answers? You cannot edit them afterwards."))void save(true)}}>{busy?"Submitting…":"Submit assessment"}</button>}</div></div></section>}
function StudentDashboard(props: { displayName: string; liveAssignmentCount: number; liveSessionCount: number; liveReportCount: number; learnerLinked: boolean; assignments: AssignmentItem[]; onRefresh:()=>void }) {
  const { displayName, liveAssignmentCount, liveSessionCount, liveReportCount, learnerLinked, assignments, onRefresh } = props;
 const [activeAssignment,setActiveAssignment]=useState<AssignmentItem|null>(null);
  return <>
    <div className="welcome-row" id="overview"><div><div className="eyebrow">{new Intl.DateTimeFormat("en-IN",{weekday:"long",day:"2-digit",month:"long",year:"numeric"}).format(new Date()).toUpperCase()}</div><h1>Good afternoon, {displayName.split(" ")[0]} <span className="wave">✦</span></h1><p className="subheading">Your next step starts with understanding yourself.</p></div><button className="primary-btn" onClick={() => document.getElementById("assessments")?.scrollIntoView({behavior:"smooth"})}><ClipboardCheck size={17}/> Continue assessment</button></div>
    <section className="hero-card"><div className="hero-copy"><div className="hero-kicker"><Sparkles size={14}/> YOUR JOURNEY, YOUR PACE</div><h2>Discover what makes<br/>you <em>uniquely you.</em></h2><p>Take thoughtful steps towards understanding your interests, strengths and future possibilities.</p><button className="hero-btn" onClick={() => document.getElementById("assessments")?.scrollIntoView({behavior:"smooth"})}>Explore my assessments <ArrowRight size={16}/></button></div><div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="art-circle"><GraduationCap size={68}/></div><div className="float-chip chip-one"><Sparkles size={15}/> Your strengths</div><div className="float-chip chip-two"><Activity size={15}/> Your interests</div><div className="art-dot dot-one"/><div className="art-dot dot-two"/></div></section>
    <div className="section-heading" id="progress"><div><h2>Your overview</h2><p>A little progress every day adds up.</p></div><button className="text-link">View activity <ArrowRight size={15}/></button></div>
    <div className="stats-grid">
      <div className="stat-card"><div className="stat-icon stat-blue"><ClipboardCheck size={19}/></div><div className="stat-label">ASSESSMENTS</div><div className="stat-number">{String(liveAssignmentCount).padStart(2, "0")} <span>assigned</span></div><div className="stat-foot">{learnerLinked ? "Live assignments linked to your account" : "Waiting for school/NiALS account linking"}</div></div>
      <div className="stat-card"><div className="stat-icon stat-purple"><Activity size={19}/></div><div className="stat-label">MY PROGRESS</div><div className="stat-number">{liveAssignmentCount ? Math.round(assignments.filter(a => Boolean(a.assessment_responses?.[0]?.submitted_at)).length / liveAssignmentCount * 100) : 0}<span>%</span></div><div className="progress-track"><div className="progress-fill" style={{width:(liveAssignmentCount ? assignments.filter(a => Boolean(a.assessment_responses?.[0]?.submitted_at)).length / liveAssignmentCount * 100 : 0) + "%"}}/></div><div className="stat-foot">Based on your submitted assessments</div></div>
      <div className="stat-card" id="counselling"><div className="stat-icon stat-green"><CalendarDays size={19}/></div><div className="stat-label">COUNSELLING</div><div className="stat-number">{liveSessionCount} <span>sessions</span></div><div className="stat-foot">From your counselling schedule</div></div>
      <div className="stat-card" id="reports"><div className="stat-icon stat-orange"><FileText size={19}/></div><div className="stat-label">MY REPORTS</div><div className="stat-number">{liveReportCount} <span>available</span></div><div className="stat-foot">Counsellor-released summaries</div></div>
    </div>
    <div className="section-heading assessment-heading" id="assessments"><div><h2>My assessments</h2><p>Pick up where you left off.</p></div><button className="outline-btn">View all <ArrowRight size={15}/></button></div>
    <div className="assessment-list">{activeAssignment?<AssessmentRunner assignment={activeAssignment} onClose={()=>setActiveAssignment(null)} onSaved={()=>{setActiveAssignment(null);onRefresh();}}/>:!learnerLinked?<div className="assessment-card"><div className="assessment-info"><b>Learner account linking required</b><p>Your school or NiALS administrator must link your learner record.</p></div></div>:assignments.length===0?<div className="assessment-card"><div className="assessment-info"><b>No assessments assigned yet</b><p>Your assigned assessments will appear here.</p></div></div>:assignments.map(a=>{const response=a.assessment_responses?.[0];const done=Boolean(response?.submitted_at);return <div className="assessment-card" key={a.id}><div className="assessment-icon blue"><ClipboardCheck size={22}/></div><div className="assessment-info"><div className="assessment-title">{a.assessment_versions?.assessments?.title||"Assessment"}</div><p>{a.assessment_versions?.assessments?.description||"Assigned assessment"} · {a.assessment_versions?.version_label||"Version"}</p><div className="assessment-meta"><span>Assigned {new Date(a.assigned_at).toLocaleDateString()}</span>{response?.saved_at&&<span>Saved {new Date(response.saved_at).toLocaleDateString()}</span>}</div></div><div className="assessment-action"><span className={done?"status-pill completed":"status-pill in-progress"}>{done?"Submitted":response?"In progress":a.status.replaceAll("_"," ")}</span><button className="small-primary" onClick={()=>setActiveAssignment(a)}>{done?"View":response?"Resume":"Start"} <ArrowRight size={14}/></button></div></div>})}</div><section className="notice-card"><div className="notice-icon"><ShieldCheck size={20}/></div><div><b>Your information stays private</b><p>Your individual assessment responses are visible only to authorised assessment professionals. Your school receives group-level insights, not your personal scores.</p></div><button aria-label="Learn about privacy"><ArrowRight size={17}/></button></section>
  </>;
}

function AdminAssessmentManager(){
 const supabase=createClient();
 const [items,setItems]=useState<any[]>([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [message,setMessage]=useState("");
 const [code,setCode]=useState("");
 const [title,setTitle]=useState("");
 const [description,setDescription]=useState("");
 const [version,setVersion]=useState("1.0");
 const [gradeMin,setGradeMin]=useState("8");
 const [gradeMax,setGradeMax]=useState("12");
 const [questions,setQuestions]=useState('[{"id":"q1","type":"single","prompt_en":"What activities do you enjoy most?","prompt_ml":"നിങ്ങൾക്ക് ഏറ്റവും ഇഷ്ടമുള്ള പ്രവർത്തനങ്ങൾ ഏവ?","options":[{"value":"A","label_en":"Solving problems","label_ml":"പ്രശ്നങ്ങൾ പരിഹരിക്കൽ"},{"value":"B","label_en":"Helping people","label_ml":"മറ്റുള്ളവരെ സഹായിക്കൽ"}]}]');
 async function load(){setLoading(true);const {data,error}=await supabase.from("assessments").select("id,code,title,description,active,assessment_versions(id,version_label,grade_min,grade_max,evidence_status,published,validation_note,created_at)").order("created_at",{ascending:false});if(error)setError(error.message);else setItems(data||[]);setLoading(false);}
 useEffect(()=>{void load();},[]);
 async function reviewVersion(id:string,note:string){setError("");setMessage("");if(note.trim().length<12){setError("Add a meaningful validation note (at least 12 characters) before publishing.");return;}setSaving(true);try{const {error}=await supabase.from("assessment_versions").update({evidence_status:"validated",validation_note:note.trim(),published:true}).eq("id",id);if(error)throw error;setMessage("Version validated and published.");await load();}catch(e){setError(e instanceof Error?e.message:"Unable to publish version.");}finally{setSaving(false);}}
 async function create(){setError("");setMessage("");if(!code.trim()||!title.trim()){setError("Enter an assessment code and title.");return;}let parsed:any;try{parsed=JSON.parse(questions);if(!Array.isArray(parsed))throw new Error("Questions must be a JSON array.");if(parsed.some((q:any)=>!q.prompt_en&&!q.prompt&&!q.question))throw new Error("Each question needs an English prompt.");}catch(e){setError(e instanceof Error?e.message:"Invalid question JSON.");return;}if(Number(gradeMin)>Number(gradeMax)){setError("Minimum grade cannot exceed maximum grade.");return;}
 setSaving(true);try{const {data:assessment,error:aErr}=await supabase.from("assessments").insert({code:code.trim().toUpperCase(),title:title.trim(),description:description.trim()||null,active:false}).select("id").single();if(aErr)throw aErr;const {error:vErr}=await supabase.from("assessment_versions").insert({assessment_id:assessment.id,version_label:version.trim()||"1.0",grade_min:Number(gradeMin),grade_max:Number(gradeMax),language_codes:["en","ml"],question_set:parsed,evidence_status:"draft",published:false});if(vErr)throw vErr;setMessage("Assessment and draft question version saved. It is not published to learners.");setCode("");setTitle("");setDescription("");await load();}catch(e){setError(e instanceof Error?e.message:"Unable to save assessment.");}finally{setSaving(false);}}
 return <section className="table-card" id="catalogue" style={{padding:22,marginBottom:24}}><div className="section-heading"><div><h2>Assessment catalogue</h2><p>Create assessments and save versioned question sets as drafts.</p></div><span className="status-pill in-progress">NiALS Admin</span></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,margin:"18px 0"}}><label>Assessment code<input value={code} onChange={e=>setCode(e.target.value)} placeholder="CAREER-01"/></label><label>Assessment title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Career Interest Assessment"/></label><label>Version label<input value={version} onChange={e=>setVersion(e.target.value)} placeholder="1.0"/></label><label>Minimum grade<input type="number" min="8" max="12" value={gradeMin} onChange={e=>setGradeMin(e.target.value)}/></label><label>Maximum grade<input type="number" min="8" max="12" value={gradeMax} onChange={e=>setGradeMax(e.target.value)}/></label><label style={{gridColumn:"1/-1"}}>Description<input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Short description shown to learners"/></label></div><label style={{display:"block",fontWeight:600,marginBottom:8}}>Question set (JSON) · English and Malayalam fields supported</label><textarea value={questions} onChange={e=>setQuestions(e.target.value)} rows={12} spellCheck={false} style={{width:"100%",fontFamily:"monospace",fontSize:12,padding:12,border:"1px solid #d6deea",borderRadius:10}}/><div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap",marginTop:12}}><button className="small-primary" disabled={saving} onClick={()=>void create()}>{saving?"Saving…":"Save assessment draft"}</button><button className="small-outline" onClick={()=>void load()}>Refresh catalogue</button><span style={{fontSize:12,color:"#718096"}}>Drafts are not visible to learners until separately reviewed and published.</span></div>{error&&<p role="alert" style={{color:"#b42318"}}>{error}</p>}{message&&<p role="status" style={{color:"#087443"}}>{message}</p>}<div style={{marginTop:24}}><h3>Existing assessments</h3>{loading?<p>Loading catalogue…</p>:items.length===0?<p>No assessments have been created yet.</p>:items.map(item=><div key={item.id} style={{padding:"14px 0",borderBottom:"1px solid #e8edf3"}}><b>{item.title}</b> <span style={{color:"#718096"}}>({item.code})</span>{item.assessment_versions?.length?item.assessment_versions.map((v:any)=><div key={v.id} style={{marginTop:12,padding:12,background:"#f7f9fc",borderRadius:10}}><div><b>Version {v.version_label}</b> · {v.published?"Published":v.evidence_status+" draft"} · Grades {v.grade_min}–{v.grade_max}</div>{v.published?<p style={{fontSize:12,color:"#087443"}}>Published version · {v.validation_note}</p>:<><textarea aria-label={"Validation note for version "+v.version_label} defaultValue={v.validation_note||""} id={"validation-"+v.id} rows={2} placeholder="Record evidence reviewed, source and validation decision (minimum 12 characters)." style={{width:"100%",marginTop:8,padding:10,border:"1px solid #d6deea",borderRadius:8}}/><button className="small-primary" disabled={saving} style={{marginTop:8}} onClick={()=>{const el=document.getElementById("validation-"+v.id) as HTMLTextAreaElement|null;if(el)void reviewVersion(v.id,el.value);}}>Validate & publish</button></>}</div>):<p>No versions</p>}</div>)}</div></section>;
}

function CounsellorWorkspace() {
  const supabase = createClient();
  const [sessions, setSessions] = useState<{id:string;learner_id:string;scheduled_at:string|null;held_at:string|null;created_at:string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("counselling_sessions")
        .select("id,learner_id,scheduled_at,held_at,created_at")
        .order("scheduled_at", { ascending: true, nullsFirst: false });
      if (!active) return;
      if (error) setError(error.message);
      setSessions(data || []);
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, []);
  const upcoming = sessions.filter(s => !!s.scheduled_at && !s.held_at && new Date(s.scheduled_at).getTime() >= Date.now()).length;
  const completed = sessions.filter(s => !!s.held_at).length;
  return <>
    <div className="welcome-row"><div><div className="eyebrow">NIALS ASSESSMENT SERVICES · COUNSELLOR WORKSPACE</div><h1>Counsellor overview</h1><p className="subheading">Your assigned counselling sessions, shown from your secure account.</p></div></div>
    <div className="stats-grid staff-stats">
      <div className="stat-card"><div className="stat-label">ASSIGNED SESSIONS</div><div className="stat-number">{sessions.length}</div><div className="stat-foot">Sessions assigned to your account</div></div>
      <div className="stat-card"><div className="stat-label">UPCOMING</div><div className="stat-number">{upcoming}</div><div className="stat-foot">Scheduled and not yet held</div></div>
      <div className="stat-card"><div className="stat-label">COMPLETED</div><div className="stat-number">{completed}</div><div className="stat-foot">Session held date recorded</div></div>
    </div>
    <div className="section-heading" id="workspace-content"><div><h2>My counselling sessions</h2><p>Only sessions assigned to your counsellor account are shown.</p></div><button className="outline-btn" onClick={() => window.location.reload()}>Refresh <ArrowRight size={15}/></button></div>
    <div className="table-card">
      {loading ? <p style={{padding:20}}>Loading your sessions…</p> : error ? <p role="alert" style={{padding:20,color:"#b42318"}}>Unable to load sessions: {error}</p> : sessions.length === 0 ? <div style={{padding:24}}><b>No sessions assigned yet</b><p style={{color:"#718096"}}>When NiALS assigns a learner session to your account, it will appear here.</p></div> :
      <div className="table-scroll"><table><thead><tr><th>LEARNER RECORD</th><th>SCHEDULED</th><th>SESSION STATUS</th></tr></thead><tbody>{sessions.map(s=><tr key={s.id}><td>Linked learner record</td><td>{s.scheduled_at ? new Date(s.scheduled_at).toLocaleString() : "Not scheduled"}</td><td><span className={`status-pill ${s.held_at ? "completed" : s.scheduled_at ? "upcoming" : "in-progress"}`}>{s.held_at ? "Completed" : s.scheduled_at ? "Scheduled" : "Awaiting schedule"}</span></td></tr>)}</tbody></table></div>}
    </div>
    <section className="notice-card"><div className="notice-icon"><ShieldCheck size={20}/></div><div><b>Confidential learner information</b><p>Session access is restricted to the counsellor assigned to the record. School dashboards do not receive individual responses or private counselling notes.</p></div></section>
  </>;
}

function StaffDashboard({ role }: { role: Role }) {
  if (role === "Counsellor") return <CounsellorWorkspace />;
  const isCounsellor = role === "Counsellor";
  const isSchool = role === "School Admin";
  if (role === "NiALS Admin") return <><div className="welcome-row"><div><div className="eyebrow">NIALS ASSESSMENT SERVICES · ADMIN WORKSPACE</div><h1>Platform administration</h1><p className="subheading">Create and manage the assessment catalogue and draft question versions.</p></div></div><AdminAssessmentManager/><section className="notice-card"><div className="notice-icon"><ShieldCheck size={20}/></div><div><b>Publication remains controlled</b><p>Question sets are saved as drafts. Review and validation must happen before they are made available to learners.</p></div></section></>;
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
  const [assignments,setAssignments]=useState<AssignmentItem[]>([]);
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
          const { data: rows, error: rowsError } = await supabase.from("assessment_assignments").select("id,status,assigned_at,assessment_versions(version_label,published,question_set,assessments(title,description)),assessment_responses(id,answers,saved_at,submitted_at)").eq("learner_id",learner.id).order("assigned_at",{ascending:false});
          if(rowsError) console.error("Assessment load failed",rowsError.message);
          const mapped=(rows||[]) as unknown as AssignmentItem[];setAssignments(mapped);setLiveAssignmentCount(mapped.length);
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
      <div className="page-content">{role === "Student" ? <StudentDashboard displayName={displayName} liveAssignmentCount={liveAssignmentCount} liveSessionCount={liveSessionCount} liveReportCount={liveReportCount} learnerLinked={learnerLinked} assignments={assignments} onRefresh={()=>window.location.reload()}/> : <StaffDashboard role={role}/>}<footer className="page-footer"><Brand/><span>© 2026 NiALS Assessment Services. All rights reserved.</span><span>Privacy-first learning & assessment</span></footer></div>
    </main>
  </div>;
}