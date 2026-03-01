import { useState, useEffect, useMemo, useCallback } from "react";

const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (d) => new Date(d).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const fmtDate = (d) => new Date(d).toLocaleDateString([], { month: "short", day: "numeric" });
const age = (dob) => { const ms = Date.now() - new Date(dob).getTime(); const y = Math.floor(ms / 31557600000); const m = Math.floor((ms % 31557600000) / 2629800000); return y > 0 ? `${y}y ${m}m` : `${m}m`; };
const dayKey = (d) => new Date(d).toISOString().slice(0, 10);
const today = dayKey(new Date());
const now = () => new Date().toISOString();

const TEMPERAMENT_OPTIONS = [
  { label: "Friendly", color: "#22c55e" }, { label: "Reactive", color: "#ef4444", caution: true },
  { label: "High Energy", color: "#f97316" }, { label: "Calm", color: "#3b82f6" },
  { label: "Dog Selective", color: "#ef4444", caution: true }, { label: "Resource Guarding", color: "#ef4444", caution: true },
  { label: "Shy", color: "#a855f7" }, { label: "Playful", color: "#22c55e" },
  { label: "Anxious", color: "#eab308" }, { label: "Senior", color: "#6b7280" },
];
const POTTY_OPTIONS = [
  { label: "Healthy", icon: "✓", color: "#22c55e" }, { label: "Soft Serve", icon: "🍦", color: "#eab308" },
  { label: "Clumps", icon: "●", color: "#f97316" }, { label: "Liquid", icon: "💧", color: "#ef4444" },
];
const MEAL_OPTIONS = [
  { label: "Ate All", icon: "✓", color: "#22c55e" }, { label: "Did Not Finish", icon: "½", color: "#eab308" },
  { label: "Grazed", icon: "~", color: "#f97316" }, { label: "No Appetite", icon: "✗", color: "#ef4444" },
];
const ADDON_OPTIONS = [
  { key: "enrichment", label: "Enrichment", price: 12, desc: "Puzzle toys & brain games" },
  { key: "halfday", label: "Half-Day", price: -15, desc: "Reduced rate for <5 hours" },
  { key: "food", label: "Food (house)", price: 8, desc: "House-provided meal" },
];
const CONTENT_TYPES = [
  { key: "static", label: "Static Image", icon: "🖼" }, { key: "text", label: "Text Post", icon: "📝" },
  { key: "short", label: "Short/Reel", icon: "🎬" }, { key: "longvideo", label: "Long Video", icon: "🎥" },
  { key: "link", label: "Link", icon: "🔗" }, { key: "blog", label: "Blog", icon: "📰" },
];
const PLATFORMS = ["Instagram", "Facebook", "TikTok"];
const PLATFORM_ICONS = { Instagram: "📷", Facebook: "📘", TikTok: "🎵" };
const PLATFORM_COLORS = { Instagram: "#e1306c", Facebook: "#1877f2", TikTok: "#000000" };

const AVATAR_COLORS = ["#6366f1","#ec4899","#f97316","#22c55e","#3b82f6","#a855f7","#14b8a6","#ef4444"];
const getAvatarColor = (name) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const DogAvatar = ({ name, size = 48, faded = false }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: size * 0.4, background: getAvatarColor(name), opacity: faded ? 0.45 : 1, flexShrink: 0, textTransform: "uppercase", letterSpacing: 1 }}>{name.slice(0, 2)}</div>
);
const EmpAvatar = ({ name, size = 36 }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: size * 0.38, background: getAvatarColor(name), flexShrink: 0 }}>{name.split(" ").map(n=>n[0]).join("")}</div>
);

const INITIAL_DOGS = [
  { id:"d1", name:"Biscuit", breed:"Golden Retriever", dob:"2021-03-15", sex:"M", neutered:true, microchip:"985112345678901", vaccinations:[{name:"Rabies",date:"2025-03-01",expires:"2026-03-01"},{name:"DHPP",date:"2025-01-15",expires:"2026-01-15"},{name:"Bordetella",date:"2025-06-01",expires:"2025-12-01"}], temperament:["Friendly","High Energy"], owner:"Maria Santos", phone:"555-0101", emergency:"555-0102", diet:"2 cups kibble AM/PM", meds:"Glucosamine 1x daily", medical:"Hip dysplasia - monitor activity", belongings:["Red leash","Tennis ball"], photo:null },
  { id:"d2", name:"Tank", breed:"Pit Bull Mix", dob:"2019-08-22", sex:"M", neutered:true, microchip:"985112345678902", vaccinations:[{name:"Rabies",date:"2025-05-10",expires:"2026-05-10"},{name:"DHPP",date:"2025-04-01",expires:"2026-04-01"}], temperament:["Reactive","High Energy"], owner:"James Wilson", phone:"555-0201", emergency:"555-0202", diet:"1.5 cups grain-free AM/PM", meds:"", medical:"Allergies - no chicken", belongings:["Blue harness"], photo:null },
  { id:"d3", name:"Mochi", breed:"Shiba Inu", dob:"2022-11-01", sex:"F", neutered:true, microchip:"985112345678903", vaccinations:[{name:"Rabies",date:"2025-08-15",expires:"2026-08-15"},{name:"Bordetella",date:"2025-09-01",expires:"2026-03-01"}], temperament:["Dog Selective","Shy"], owner:"Yuki Tanaka", phone:"555-0301", emergency:"555-0302", diet:"1 cup kibble AM/PM", meds:"Apoquel 16mg AM", medical:"Skin allergies", belongings:["Pink collar","Blanket"], photo:null },
  { id:"d4", name:"Benny", breed:"Beagle", dob:"2020-05-10", sex:"M", neutered:false, microchip:"985112345678904", vaccinations:[{name:"Rabies",date:"2025-02-20",expires:"2026-02-20"},{name:"DHPP",date:"2025-02-20",expires:"2026-02-20"}], temperament:["Friendly","Playful"], owner:"Tom Harris", phone:"555-0401", emergency:"555-0402", diet:"1.5 cups kibble AM/PM", meds:"", medical:"None", belongings:["Orange leash"], photo:null },
  { id:"d5", name:"Luna", breed:"German Shepherd", dob:"2021-01-20", sex:"F", neutered:true, microchip:"985112345678905", vaccinations:[{name:"Rabies",date:"2025-07-01",expires:"2026-07-01"},{name:"DHPP",date:"2025-06-15",expires:"2026-06-15"},{name:"Bordetella",date:"2025-06-15",expires:"2025-12-15"}], temperament:["Calm","Friendly"], owner:"Sarah Chen", phone:"555-0501", emergency:"555-0502", diet:"2.5 cups kibble AM/PM", meds:"Heartworm monthly", medical:"None", belongings:["Black leash","Kong toy"], photo:null },
  { id:"d6", name:"Pepper", breed:"Border Collie", dob:"2022-07-03", sex:"F", neutered:true, microchip:"985112345678906", vaccinations:[{name:"Rabies",date:"2025-09-10",expires:"2026-09-10"}], temperament:["High Energy","Playful","Friendly"], owner:"Mike O'Brien", phone:"555-0601", emergency:"555-0602", diet:"2 cups performance kibble AM/PM", meds:"", medical:"None", belongings:["Frisbee"], photo:null },
  { id:"d7", name:"Rosie", breed:"Cavalier King Charles", dob:"2018-12-25", sex:"F", neutered:true, microchip:"985112345678907", vaccinations:[{name:"Rabies",date:"2025-01-05",expires:"2026-01-05"}], temperament:["Calm","Senior","Friendly"], owner:"Linda Park", phone:"555-0701", emergency:"555-0702", diet:"1 cup senior kibble AM/PM", meds:"Heart medication 2x daily", medical:"Heart murmur Grade III", belongings:["Sweater","Bed"], photo:null },
  { id:"d8", name:"Zeus", breed:"Great Dane", dob:"2023-02-14", sex:"M", neutered:false, microchip:"", vaccinations:[{name:"Rabies",date:"2025-03-20",expires:"2026-03-20"},{name:"DHPP",date:"2025-03-20",expires:"2026-03-20"}], temperament:["Friendly","Anxious"], owner:"Derek Russo", phone:"555-0801", emergency:"555-0802", diet:"4 cups large-breed kibble AM/PM", meds:"", medical:"Growing - limit jumping", belongings:["XL crate pad"], photo:null },
];

const INITIAL_BOOKINGS = [
  { id:"b1", dogId:"d1", type:"daycare", date:today, arrivalTime:"08:00", pickupTime:"17:00", status:"checked-in", checkedInAt:new Date(new Date().setHours(8,5)).toISOString(), addons:["enrichment"] },
  { id:"b2", dogId:"d2", type:"daycare", date:today, arrivalTime:"07:30", pickupTime:"16:00", status:"checked-in", checkedInAt:new Date(new Date().setHours(7,35)).toISOString(), addons:[] },
  { id:"b3", dogId:"d3", type:"boarding", date:today, arrivalTime:"09:00", pickupTime:"17:00", status:"checked-in", checkedInAt:new Date(new Date().setHours(9,10)).toISOString(), boardingEnd:dayKey(new Date(Date.now()+2*86400000)), addons:["food"] },
  { id:"b4", dogId:"d4", type:"daycare", date:today, arrivalTime:"10:00", pickupTime:"18:00", status:"expecting", addons:[] },
  { id:"b5", dogId:"d5", type:"boarding", date:today, arrivalTime:"11:00", pickupTime:"17:00", status:"expecting", boardingEnd:dayKey(new Date(Date.now()+3*86400000)), addons:["enrichment","food"] },
  { id:"b6", dogId:"d6", type:"daycare", date:today, arrivalTime:"08:30", pickupTime:"15:30", status:"checked-in", checkedInAt:new Date(new Date().setHours(8,32)).toISOString(), addons:["halfday"] },
  { id:"b7", dogId:"d7", type:"daycare", date:dayKey(new Date(Date.now()+86400000)), arrivalTime:"09:00", pickupTime:"16:00", status:"expecting", addons:[] },
  { id:"b8", dogId:"d8", type:"boarding", date:dayKey(new Date(Date.now()+2*86400000)), arrivalTime:"10:00", pickupTime:"17:00", status:"expecting", boardingEnd:dayKey(new Date(Date.now()+5*86400000)), addons:[] },
  { id:"b9", dogId:"d1", type:"daycare", date:dayKey(new Date(Date.now()+3*86400000)), arrivalTime:"08:00", pickupTime:"17:00", status:"expecting", addons:[] },
  { id:"b10", dogId:"d4", type:"daycare", date:dayKey(new Date(Date.now()+86400000)), arrivalTime:"08:00", pickupTime:"17:00", status:"expecting", addons:[] },
];

const INITIAL_LOGS = [
  { id:"l1", dogId:"d1", type:"check-in", detail:"Checked in for daycare", time:new Date(new Date().setHours(8,5)).toISOString() },
  { id:"l2", dogId:"d2", type:"check-in", detail:"Checked in for daycare", time:new Date(new Date().setHours(7,35)).toISOString() },
  { id:"l3", dogId:"d3", type:"check-in", detail:"Checked in for boarding", time:new Date(new Date().setHours(9,10)).toISOString() },
  { id:"l4", dogId:"d6", type:"check-in", detail:"Checked in for daycare", time:new Date(new Date().setHours(8,32)).toISOString() },
  { id:"l5", dogId:"d1", type:"potty", detail:"Healthy", time:new Date(new Date().setHours(9,30)).toISOString() },
  { id:"l6", dogId:"d2", type:"meal", detail:"Ate All", time:new Date(new Date().setHours(9,45)).toISOString() },
  { id:"l7", dogId:"d6", type:"play", detail:"Played well with Biscuit", time:new Date(new Date().setHours(10,0)).toISOString() },
  { id:"l8", dogId:"d1", type:"play", detail:"Played well with Pepper", time:new Date(new Date().setHours(10,0)).toISOString() },
  { id:"l9", dogId:"d3", type:"meds", detail:"Apoquel 16mg administered", time:new Date(new Date().setHours(9,15)).toISOString() },
  { id:"l10", dogId:"d1", type:"meal", detail:"Ate All", time:new Date(new Date().setHours(12,0)).toISOString() },
  { id:"l11", type:"team-note", detail:"The hose in the big yard is broken — use buckets for water bowls", time:new Date(new Date().setHours(10,30)).toISOString(), author:"Sam" },
];

const INITIAL_EMPLOYEES = [
  { id:"e1", name:"Sam Donovan", role:"admin", pin:"1234", rate:22, email:"sam@staynplay.com" },
  { id:"e2", name:"Alex Rivera", role:"staff", pin:"5678", rate:16, email:"alex@staynplay.com" },
  { id:"e3", name:"Jordan Lee", role:"staff", pin:"9012", rate:16, email:"jordan@staynplay.com" },
  { id:"e4", name:"Casey Morgan", role:"staff", pin:"3456", rate:17, email:"casey@staynplay.com" },
];

const buildSchedule = () => {
  const s = []; const names = ["e1","e2","e3","e4"];
  for (let i = 0; i < 28; i++) {
    const d = dayKey(new Date(Date.now() + (i - 7) * 86400000));
    const dow = new Date(d).getDay();
    if (dow === 0) continue;
    const onDuty = dow === 6 ? names.slice(0,2) : names.slice(0,3);
    onDuty.forEach(eid => {
      s.push({ id: uid(), empId: eid, date: d, start: eid === "e1" ? "07:00" : "08:00", end: eid === "e1" ? "15:00" : "16:00" });
    });
  }
  return s;
};
const INITIAL_SCHEDULE = buildSchedule();

const INITIAL_TIME_OFF = [
  { id:"to1", empId:"e2", date:dayKey(new Date(Date.now()+5*86400000)), reason:"Doctor appointment", status:"pending" },
];
const INITIAL_SHIFT_SWAPS = [
  { id:"ss1", fromEmpId:"e3", toEmpId:"e2", date:dayKey(new Date(Date.now()+2*86400000)), status:"pending-accept", adminApproval:"pending" },
];
const INITIAL_CONTENT = [
  { id:"cp1", date:today, platform:"Instagram", contentType:"static", text:"Happy pups enjoying the sunshine! ☀️🐾", mediaName:"yard_photo.jpg", notes:"Use the shot from big yard", submittedBy:"e2", approved:true, flagged:false, reminded:false },
  { id:"cp2", date:today, platform:"TikTok", contentType:"short", text:"Watch Biscuit's zoomies compilation!", mediaName:"biscuit_zoomies.mp4", notes:"Add trending audio", submittedBy:"e2", approved:true, flagged:false, reminded:false },
  { id:"cp3", date:dayKey(new Date(Date.now()+86400000)), platform:"Facebook", contentType:"text", text:"Reminder: We have openings this Thursday! Book your pup's play day.", mediaName:"", notes:"", submittedBy:"e3", approved:true, flagged:false, reminded:false },
  { id:"cp4", date:dayKey(new Date(Date.now()+2*86400000)), platform:"Instagram", contentType:"short", text:"Behind the scenes at Stay N Play 🎬", mediaName:"bts_reel.mp4", notes:"Draft - need to reshoot ending", submittedBy:"e2", approved:false, flagged:true, reminded:false },
];

const C = {
  bg:"#f8f9fa", surface:"#ffffff", border:"#e2e5e9", borderLight:"#f0f1f3",
  text:"#1a1d21", textMid:"#5f6368", textLight:"#9aa0a6",
  primary:"#4f46e5", primaryLight:"#eef2ff",
  daycare:"#f97316", daycareLight:"#fff7ed",
  boarding:"#6366f1", boardingLight:"#eef2ff",
  danger:"#ef4444", dangerLight:"#fef2f2",
  success:"#22c55e", successLight:"#f0fdf4",
  warn:"#eab308", warnLight:"#fefce8",
  teamNote:"#fef9c3",
};
const card = { background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:12, marginBottom:8 };
const btn = (bg=C.primary, fg="#fff", small=false) => ({ background:bg, color:fg, border:"none", borderRadius:6, padding:small?"4px 10px":"8px 16px", fontSize:small?11:13, fontWeight:600, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:4, whiteSpace:"nowrap", letterSpacing:0.2 });
const badge = (bg, fg) => ({ display:"inline-flex", alignItems:"center", gap:3, background:bg, color:fg, borderRadius:10, padding:"2px 8px", fontSize:10, fontWeight:700, letterSpacing:0.3, textTransform:"uppercase" });
const input = { width:"100%", padding:"8px 10px", border:`1px solid ${C.border}`, borderRadius:6, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" };
const modal = { position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 };
const modalContent = { background:C.surface, borderRadius:12, width:"90%", maxWidth:560, maxHeight:"85vh", overflow:"auto", padding:0, boxShadow:"0 20px 60px rgba(0,0,0,0.3)" };

const SectionHeader = ({ icon, title, count, color=C.text }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 0 8px", borderBottom:`2px solid ${C.borderLight}`, marginBottom:8 }}>
    <span style={{ fontSize:16 }}>{icon}</span>
    <span style={{ fontWeight:700, fontSize:14, color }}>{title}</span>
    {count != null && <span style={badge(color+"22", color)}>{count}</span>}
  </div>
);


// ─── MAIN APP ───────────────────────────────────────────────────────
export default function StayNPlayDogs() {
  const [dogs, setDogs] = useState(INITIAL_DOGS);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [employees] = useState(INITIAL_EMPLOYEES);
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [timeOffReqs, setTimeOffReqs] = useState(INITIAL_TIME_OFF);
  const [shiftSwaps, setShiftSwaps] = useState(INITIAL_SHIFT_SWAPS);
  const [contentPosts, setContentPosts] = useState(INITIAL_CONTENT);
  const [view, setView] = useState("dashboard");
  const [kiosk, setKiosk] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [dbSearch, setDbSearch] = useState("");
  const [timelineFilter, setTimelineFilter] = useState("all");
  const [empClockIn, setEmpClockIn] = useState({});
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const nowTime = new Date();
      contentPosts.forEach(p => {
        if (p.approved && !p.flagged && !p.reminded && p.date === today) {
          const postTime = new Date(); postTime.setHours(12, 0, 0);
          const diff = postTime - nowTime;
          if (diff > 0 && diff < 3600000) {
            setReminders(prev => [...prev, { id: uid(), postId: p.id, message: `Reminder: "${p.text.slice(0,30)}..." for ${p.platform} posting soon!`, time: now() }]);
            setContentPosts(prev => prev.map(cp => cp.id === p.id ? { ...cp, reminded: true } : cp));
          }
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [contentPosts]);

  const getDog = useCallback((id) => dogs.find(d => d.id === id), [dogs]);
  const getEmp = useCallback((id) => employees.find(e => e.id === id), [employees]);
  const todayBookings = useMemo(() => bookings.filter(b => b.date === today), [bookings]);
  const checkedInDaycare = useMemo(() => todayBookings.filter(b => b.status === "checked-in" && b.type === "daycare"), [todayBookings]);
  const checkedInBoarding = useMemo(() => todayBookings.filter(b => b.status === "checked-in" && b.type === "boarding"), [todayBookings]);
  const expecting = useMemo(() => todayBookings.filter(b => b.status === "expecting"), [todayBookings]);
  const checkedIn = useMemo(() => [...checkedInDaycare, ...checkedInBoarding], [checkedInDaycare, checkedInBoarding]);

  const addLog = useCallback((dogId, type, detail) => { setLogs(prev => [{ id:uid(), dogId, type, detail, time:now() }, ...prev]); }, []);
  const hasCaution = useCallback((dog) => dog?.temperament?.some(t => ["Reactive","Dog Selective","Resource Guarding"].includes(t)), []);
  const pickupSoon = useCallback((b) => { if (!b.pickupTime) return false; const [h,m]=b.pickupTime.split(":").map(Number); const p=new Date(); p.setHours(h,m,0); const d=p-new Date(); return d>0&&d<7200000; }, []);
  const openModal = useCallback((name, data=null) => { setActiveModal(name); setModalData(data); }, []);
  const closeModal = useCallback(() => { setActiveModal(null); setModalData(null); }, []);

  const checkInBooking = useCallback((bookingId) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status:"checked-in", checkedInAt:now() } : b));
    const bk = bookings.find(b => b.id === bookingId);
    if (bk) addLog(bk.dogId, "check-in", "Checked in for " + bk.type);
  }, [bookings, addLog]);

  const checkOut = useCallback((bookingId, amount=null) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status:"checked-out" } : b));
    const bk = bookings.find(b => b.id === bookingId);
    if (bk) addLog(bk.dogId, "check-out", "Checked out" + (amount ? " — $" + amount + " charged" : ""));
    closeModal();
  }, [bookings, addLog, closeModal]);

  const addDog = useCallback((dogData, bookToday=false, bookType="daycare", addons=[]) => {
    const newDog = { ...dogData, id:uid() };
    setDogs(prev => [...prev, newDog]);
    if (bookToday) {
      setBookings(prev => [...prev, { id:uid(), dogId:newDog.id, type:bookType, date:today, arrivalTime:new Date().toTimeString().slice(0,5), pickupTime:"17:00", status:"expecting", addons }]);
    }
    closeModal();
  }, [closeModal]);

  const quickBook = useCallback((dogId, date=today, type="daycare", addons=[]) => {
    setBookings(prev => [...prev, { id:uid(), dogId, type, date, arrivalTime:new Date().toTimeString().slice(0,5), pickupTime:"17:00", status:"expecting", addons }]);
    addLog(dogId, "booked", "Booked for " + type + " on " + fmtDate(date));
  }, [addLog]);

  const updateDog = useCallback((id, updates) => { setDogs(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d)); closeModal(); }, [closeModal]);

  const generateSummary = useCallback((dogId) => {
    const dog = getDog(dogId);
    if (!dog) return "No data available.";
    const tl = logs.filter(l => l.dogId === dogId && l.time && l.time.startsWith(new Date().toISOString().slice(0,10)));
    const parts = [dog.name + " had a great day at Stay N Play!"];
    const meals = tl.filter(l => l.type === "meal");
    const potties = tl.filter(l => l.type === "potty");
    const play = tl.filter(l => l.type === "play");
    const meds = tl.filter(l => l.type === "meds");
    if (meals.length) parts.push("Meal update: " + meals.map(m=>m.detail).join(", ") + ".");
    if (potties.length) parts.push("Potty breaks: " + potties.map(p=>p.detail).join(", ") + ".");
    if (play.length) parts.push("Play time: " + play.map(p=>p.detail).join("; ") + ".");
    if (meds.length) parts.push("Meds: " + meds.map(m=>m.detail).join(", ") + ".");
    if (parts.length === 1) parts.push("We enjoyed spending time together!");
    return parts.join(" ");
  }, [getDog, logs]);

  // ─── HEADER ─────────────────────────────────────────────────────
  const Header = () => (
    <div style={{ background:C.surface, borderBottom:"1px solid "+C.border, padding:"0 16px", display:"flex", alignItems:"center", height:52, gap:16, position:"sticky", top:0, zIndex:100 }}>
      <div style={{ fontWeight:800, fontSize:16, letterSpacing:-0.5, color:C.primary }}>
        <span style={{ marginRight:6 }}>🐾</span>Stay N Play Dogs
      </div>
      <div style={{ flex:1 }} />
      <nav style={{ display:"flex", gap:2 }}>
        {[["dashboard","Dashboard"],["employees","Employees"],["calendar","Calendar"],["database","Database"],["content","Content"]].map(([k,label]) => (
          <button key={k} onClick={()=>setView(k)} style={{ ...btn(view===k?C.primary:"transparent", view===k?"#fff":C.textMid, true), borderRadius:6, fontWeight:view===k?700:500 }}>{label}</button>
        ))}
      </nav>
      <div style={{ flex:1 }} />
      <button onClick={()=>setKiosk(!kiosk)} style={{ ...btn("transparent",C.textMid,true), fontSize:16, padding:6 }}>{kiosk?"⊟":"⊞"}</button>
      {reminders.length > 0 && <span style={{ ...badge(C.danger,"#fff"), cursor:"pointer" }} onClick={()=>{ alert(reminders.map(r=>r.message).join("\n")); setReminders([]); }}>🔔 {reminders.length}</span>}
      <div style={{ display:"flex", alignItems:"center", gap:6, borderLeft:"1px solid "+C.border, paddingLeft:12 }}>
        <div style={{ width:30, height:30, borderRadius:"50%", background:C.primary, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:11 }}>SD</div>
        <span style={{ fontSize:12, fontWeight:600, color:C.textMid }}>Sam</span>
      </div>
    </div>
  );

  // ─── DOG CARD ──────────────────────────────────────────────────
  const DogCard = ({ booking }) => {
    const dog = getDog(booking.dogId); if (!dog) return null;
    return (
      <div style={{ ...card, display:"flex", gap:12, alignItems:"center" }}>
        <DogAvatar name={dog.name} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
            <span style={{ fontWeight:700, fontSize:14, cursor:"pointer", textDecoration:"underline", textDecorationColor:C.border }} onClick={()=>openModal("profile",dog.id)}>{dog.name}</span>
            <span style={{ fontSize:11, color:C.textMid }}>{dog.breed}</span>
            <span style={{ fontSize:10, color:C.textLight }}>{dog.sex === "M" ? "♂" : "♀"} {dog.neutered ? (dog.sex === "M" ? "Neutered" : "Spayed") : "Intact"}</span>
          </div>
          <div style={{ display:"flex", gap:4, marginTop:4, flexWrap:"wrap" }}>
            {hasCaution(dog) && <span style={badge(C.dangerLight,C.danger)}>⚠ Caution</span>}
            {pickupSoon(booking) && <span style={badge(C.warnLight,C.warn)}>⏰ Pickup ~2h</span>}
            {booking.type==="boarding" && <span style={badge(C.boardingLight,C.boarding)}>☾ Boarding</span>}
            {(booking.addons||[]).map(a => <span key={a} style={badge(C.primaryLight,C.primary)}>{a}</span>)}
          </div>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          <button style={btn(C.primaryLight,C.primary,true)} onClick={()=>openModal("activity",booking)}>Log</button>
          <button style={btn(C.dangerLight,C.danger,true)} onClick={()=>openModal("checkout",booking)}>Log Out</button>
        </div>
      </div>
    );
  };

  const ExpectingCard = ({ booking }) => {
    const dog = getDog(booking.dogId); if (!dog) return null;
    return (
      <div style={{ ...card, display:"flex", gap:12, alignItems:"center", opacity:0.7 }}>
        <DogAvatar name={dog.name} faded />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontWeight:700, fontSize:14, cursor:"pointer" }} onClick={()=>openModal("profile",dog.id)}>{dog.name}</span>
            <span style={{ fontSize:11, color:C.textMid }}>{dog.breed}</span>
          </div>
          <div style={{ fontSize:11, color:C.textMid, marginTop:2 }}>Expected {booking.arrivalTime} · {booking.type==="boarding"?"☾ Boarding":"☀ Daycare"}{(booking.addons||[]).length > 0 ? " · +" + booking.addons.join(", ") : ""}</div>
        </div>
        <button style={btn(C.success,"#fff")} onClick={()=>checkInBooking(booking.id)}>Check In</button>
      </div>
    );
  };

  // ─── TIMELINE ──────────────────────────────────────────────────
  const Timeline = () => {
    const [noteText, setNoteText] = useState("");
    const todayLogs = logs.filter(l => !l.time || l.time.startsWith(new Date().toISOString().slice(0,10)));
    const sorted = [...todayLogs].sort((a,b) => new Date(b.time) - new Date(a.time));
    const filtered = timelineFilter === "all" ? sorted : sorted.filter(l => l.type === timelineFilter);
    const typeIcon = (t) => ({"check-in":"→","check-out":"←",potty:"🚽",meal:"🍽",meds:"💊",play:"🎾","team-note":"📌",booked:"📅",system:"🔔"}[t]||"•");
    const addTeamNote = () => { if (!noteText.trim()) return; setLogs(prev => [{ id:uid(), type:"team-note", detail:noteText.trim(), time:now(), author:"Sam" }, ...prev]); setNoteText(""); };
    return (
      <div>
        <SectionHeader icon="📋" title="Timeline" />
        <div style={{ display:"flex", gap:4, marginBottom:8, flexWrap:"wrap" }}>
          {["all","check-in","check-out","potty","meal","meds","play","team-note"].map(f => (
            <button key={f} onClick={()=>setTimelineFilter(f)} style={{ ...btn(timelineFilter===f?C.primary:C.bg, timelineFilter===f?"#fff":C.textMid, true), textTransform:"capitalize" }}>{f==="all"?"All":f.replace("-"," ")}</button>
          ))}
        </div>
        <div style={{ display:"flex", gap:4, marginBottom:10 }}>
          <input value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Team note..." style={{ ...input, flex:1 }} onKeyDown={e=>e.key==="Enter"&&addTeamNote()} />
          <button style={btn(C.warn,"#000",true)} onClick={addTeamNote}>📌 Post</button>
        </div>
        <div style={{ maxHeight:400, overflow:"auto" }}>
          {filtered.map(log => {
            const dog = log.dogId ? getDog(log.dogId) : null;
            const isNote = log.type==="team-note"; const isAlert = log.type==="system";
            return (
              <div key={log.id} style={{ padding:"8px 10px", borderLeft:"3px solid "+(isNote?C.warn:isAlert?C.danger:C.border), background:isNote?C.teamNote:isAlert?C.dangerLight:"transparent", marginBottom:4, borderRadius:"0 4px 4px 0", fontSize:12 }}>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <span>{typeIcon(log.type)}</span>
                  {dog && <span style={{ fontWeight:700 }}>{dog.name}</span>}
                  {isNote && <span style={{ fontWeight:700 }}>Team Note {log.author?"("+log.author+")":""}</span>}
                  <span style={{ color:C.textMid }}>{log.detail}</span>
                  <span style={{ marginLeft:"auto", color:C.textLight, fontSize:10, flexShrink:0 }}>{log.time?fmt(log.time):""}</span>
                </div>
              </div>
            );
          })}
          {filtered.length===0 && <div style={{ padding:16, textAlign:"center", color:C.textLight, fontSize:12 }}>No entries yet</div>}
        </div>
      </div>
    );
  };

  // ─── DASHBOARD VIEW ────────────────────────────────────────────
  const DashboardView = () => (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, padding:20 }}>
      <div>
        <SectionHeader icon="☀" title="Daycare" count={checkedInDaycare.length} color={C.daycare} />
        {checkedInDaycare.map(b => <DogCard key={b.id} booking={b} />)}
        {checkedInDaycare.length===0 && <div style={{ padding:16, color:C.textLight, fontSize:12, textAlign:"center" }}>No daycare check-ins yet</div>}
        <div style={{ marginTop:16 }} />
        <SectionHeader icon="☾" title="Boarding" count={checkedInBoarding.length} color={C.boarding} />
        {checkedInBoarding.map(b => <DogCard key={b.id} booking={b} />)}
        {checkedInBoarding.length===0 && <div style={{ padding:16, color:C.textLight, fontSize:12, textAlign:"center" }}>No boarding check-ins yet</div>}
        <div style={{ marginTop:16 }} />
        <SectionHeader icon="⏳" title="Expecting" count={expecting.length} color={C.textMid} />
        {expecting.map(b => <ExpectingCard key={b.id} booking={b} />)}
        {expecting.length===0 && <div style={{ padding:16, color:C.textLight, fontSize:12, textAlign:"center" }}>All arrivals checked in</div>}
      </div>
      <div><Timeline /></div>
    </div>
  );

  // ─── EMPLOYEE VIEW ─────────────────────────────────────────────
  const EmployeeView = () => {
    const [empMonth, setEmpMonth] = useState(new Date().getMonth());
    const [empYear, setEmpYear] = useState(new Date().getFullYear());
    const [clockPin, setClockPin] = useState("");
    const [clockMsg, setClockMsg] = useState("");
    const [toDate, setToDate] = useState("");
    const [toReason, setToReason] = useState("");
    const [toEmp, setToEmp] = useState("e2");
    const [swapDate, setSwapDate] = useState("");
    const [swapFrom, setSwapFrom] = useState("e3");
    const [swapTo, setSwapTo] = useState("e2");

    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const firstDay = new Date(empYear, empMonth, 1).getDay();
    const daysInMonth = new Date(empYear, empMonth + 1, 0).getDate();
    const days = [];
    for (let i=0; i<firstDay; i++) days.push(null);
    for (let d=1; d<=daysInMonth; d++) days.push(d);

    const prevMonth = () => { if(empMonth===0){setEmpMonth(11);setEmpYear(empYear-1);}else setEmpMonth(empMonth-1); };
    const nextMonth = () => { if(empMonth===11){setEmpMonth(0);setEmpYear(empYear+1);}else setEmpMonth(empMonth+1); };

    const getShiftsForDay = (day) => {
      if (!day) return [];
      const dk = dayKey(new Date(empYear, empMonth, day));
      return schedule.filter(s => s.date === dk);
    };

    const handleClock = () => {
      const emp = employees.find(e => e.pin === clockPin);
      if (!emp) { setClockMsg("Invalid PIN"); return; }
      if (empClockIn[emp.id]) {
        setEmpClockIn(prev => { const n={...prev}; delete n[emp.id]; return n; });
        setClockMsg(emp.name + " clocked OUT at " + fmt(now()));
      } else {
        setEmpClockIn(prev => ({...prev, [emp.id]: now()}));
        setClockMsg(emp.name + " clocked IN at " + fmt(now()));
      }
      setClockPin("");
    };

    const calcEarnings = (empId) => {
      const emp = employees.find(e=>e.id===empId);
      if (!emp) return 0;
      const monthShifts = schedule.filter(s => s.empId === empId && s.date.startsWith(empYear+"-"+String(empMonth+1).padStart(2,"0")));
      return monthShifts.reduce((sum, s) => {
        const [sh,sm] = s.start.split(":").map(Number);
        const [eh,em] = s.end.split(":").map(Number);
        return sum + ((eh + em/60) - (sh + sm/60)) * emp.rate;
      }, 0);
    };

    const handleTimeOff = () => {
      if (!toDate) return;
      setTimeOffReqs(prev => [...prev, { id:uid(), empId:toEmp, date:toDate, reason:toReason||"Personal", status:"pending" }]);
      setToDate(""); setToReason("");
    };

    const handleSwapRequest = () => {
      if (!swapDate || swapFrom === swapTo) return;
      setShiftSwaps(prev => [...prev, { id:uid(), fromEmpId:swapFrom, toEmpId:swapTo, date:swapDate, status:"pending-accept", adminApproval:"pending" }]);
      setSwapDate("");
    };

    const acceptSwap = (swapId) => setShiftSwaps(prev => prev.map(s => s.id===swapId ? {...s, status:"accepted"} : s));
    const approveSwap = (swapId) => {
      const swap = shiftSwaps.find(s=>s.id===swapId);
      if (!swap) return;
      setShiftSwaps(prev => prev.map(s => s.id===swapId ? {...s, adminApproval:"approved"} : s));
      setSchedule(prev => prev.map(s => s.date===swap.date && s.empId===swap.fromEmpId ? {...s, empId:swap.toEmpId} : (s.date===swap.date && s.empId===swap.toEmpId ? {...s, empId:swap.fromEmpId} : s)));
    };
    const denySwap = (swapId) => setShiftSwaps(prev => prev.map(s => s.id===swapId ? {...s, adminApproval:"denied"} : s));
    const approveTimeOff = (toId) => {
      const req = timeOffReqs.find(r=>r.id===toId);
      setTimeOffReqs(prev => prev.map(r => r.id===toId ? {...r, status:"approved"} : r));
      if (req) setSchedule(prev => prev.filter(s => !(s.empId===req.empId && s.date===req.date)));
    };
    const denyTimeOff = (toId) => setTimeOffReqs(prev => prev.map(r => r.id===toId ? {...r, status:"denied"} : r));

    return (
      <div style={{ padding:20 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:20 }}>
          <div>
            {/* Monthly Calendar */}
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
              <button style={btn("transparent",C.textMid,true)} onClick={prevMonth}>◀</button>
              <span style={{ fontWeight:700, fontSize:16 }}>{monthNames[empMonth]} {empYear}</span>
              <button style={btn("transparent",C.textMid,true)} onClick={nextMonth}>▶</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:2 }}>
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                <div key={d} style={{ textAlign:"center", fontSize:10, fontWeight:700, color:C.textLight, padding:4, textTransform:"uppercase" }}>{d}</div>
              ))}
              {days.map((day,i) => {
                if (!day) return <div key={i} />;
                const dk = dayKey(new Date(empYear, empMonth, day));
                const shifts = getShiftsForDay(day);
                const isToday = dk === today;
                return (
                  <div key={i} style={{ border:"1px solid "+C.borderLight, borderRadius:6, padding:4, minHeight:56, background:isToday?C.primaryLight:C.surface, fontSize:10 }}>
                    <div style={{ fontWeight:isToday?800:500, fontSize:11, color:isToday?C.primary:C.text, marginBottom:2 }}>{day}</div>
                    {shifts.slice(0,3).map(s => {
                      const emp = getEmp(s.empId);
                      return emp ? <div key={s.id} style={{ background:getAvatarColor(emp.name)+"22", borderRadius:3, padding:"1px 3px", marginBottom:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontSize:9 }}>
                        {emp.name.split(" ")[0]} {s.start}-{s.end}
                      </div> : null;
                    })}
                    {shifts.length > 3 && <div style={{ fontSize:8, color:C.textLight }}>+{shifts.length-3} more</div>}
                  </div>
                );
              })}
            </div>

            {/* Earnings */}
            <div style={{ marginTop:20 }}>
              <SectionHeader icon="💰" title="Monthly Earnings" />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:8 }}>
                {employees.map(emp => (
                  <div key={emp.id} style={{ ...card, display:"flex", gap:10, alignItems:"center" }}>
                    <EmpAvatar name={emp.name} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:12 }}>{emp.name}</div>
                      <div style={{ fontSize:11, color:C.textMid }}>${emp.rate}/hr · {emp.role}</div>
                    </div>
                    <div style={{ fontWeight:700, fontSize:16, color:C.success }}>${calcEarnings(emp.id).toFixed(0)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ borderLeft:"1px solid "+C.border, paddingLeft:16 }}>
            {/* Clock In/Out */}
            <SectionHeader icon="⏰" title="Clock In / Out" />
            <div style={{ display:"flex", gap:4, marginBottom:8 }}>
              <input style={{ ...input, flex:1 }} type="password" maxLength={4} placeholder="Enter PIN..." value={clockPin} onChange={e=>setClockPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleClock()} />
              <button style={btn(C.primary,"#fff",true)} onClick={handleClock}>Clock</button>
            </div>
            {clockMsg && <div style={{ ...badge(C.successLight,C.success), padding:"6px 10px", marginBottom:8, fontSize:11 }}>{clockMsg}</div>}
            <div style={{ marginBottom:8 }}>
              {employees.map(emp => (
                <div key={emp.id} style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 0", fontSize:12 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:empClockIn[emp.id]?C.success:C.textLight }} />
                  <span style={{ fontWeight:600 }}>{emp.name}</span>
                  <span style={{ color:C.textMid, marginLeft:"auto", fontSize:10 }}>{empClockIn[emp.id]?"In since "+fmt(empClockIn[emp.id]):"Off"}</span>
                </div>
              ))}
            </div>

            {/* Time Off */}
            <SectionHeader icon="🏖" title="Time Off Requests" />
            <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:8 }}>
              <div style={{ display:"flex", gap:4 }}>
                <select style={{ ...input, width:"auto" }} value={toEmp} onChange={e=>setToEmp(e.target.value)}>
                  {employees.filter(e=>e.role!=="admin").map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <input style={input} type="date" value={toDate} onChange={e=>setToDate(e.target.value)} />
              </div>
              <div style={{ display:"flex", gap:4 }}>
                <input style={{ ...input, flex:1 }} placeholder="Reason..." value={toReason} onChange={e=>setToReason(e.target.value)} />
                <button style={btn(C.primary,"#fff",true)} onClick={handleTimeOff}>Request</button>
              </div>
            </div>
            {timeOffReqs.map(r => {
              const emp = getEmp(r.empId);
              return (
                <div key={r.id} style={{ ...card, padding:8, display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:11 }}>{emp?.name} — {fmtDate(r.date)}</div>
                    <div style={{ fontSize:10, color:C.textMid }}>{r.reason}</div>
                  </div>
                  {r.status==="pending" ? (
                    <div style={{ display:"flex", gap:2 }}>
                      <button style={btn(C.success,"#fff",true)} onClick={()=>approveTimeOff(r.id)}>✓</button>
                      <button style={btn(C.danger,"#fff",true)} onClick={()=>denyTimeOff(r.id)}>✗</button>
                    </div>
                  ) : (
                    <span style={badge(r.status==="approved"?C.successLight:C.dangerLight, r.status==="approved"?C.success:C.danger)}>{r.status}</span>
                  )}
                </div>
              );
            })}

            {/* Shift Swaps */}
            <SectionHeader icon="🔄" title="Shift Swaps" />
            <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:8 }}>
              <div style={{ display:"flex", gap:4 }}>
                <select style={{ ...input, width:"auto" }} value={swapFrom} onChange={e=>setSwapFrom(e.target.value)}>
                  {employees.filter(e=>e.role!=="admin").map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <span style={{ fontSize:12, alignSelf:"center" }}>↔</span>
                <select style={{ ...input, width:"auto" }} value={swapTo} onChange={e=>setSwapTo(e.target.value)}>
                  {employees.filter(e=>e.role!=="admin").map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div style={{ display:"flex", gap:4 }}>
                <input style={{ ...input, flex:1 }} type="date" value={swapDate} onChange={e=>setSwapDate(e.target.value)} />
                <button style={btn(C.primary,"#fff",true)} onClick={handleSwapRequest}>Request</button>
              </div>
            </div>
            {shiftSwaps.map(sw => {
              const from = getEmp(sw.fromEmpId); const to = getEmp(sw.toEmpId);
              return (
                <div key={sw.id} style={{ ...card, padding:8 }}>
                  <div style={{ fontSize:11, fontWeight:600 }}>{from?.name} ↔ {to?.name} — {fmtDate(sw.date)}</div>
                  <div style={{ display:"flex", gap:4, marginTop:4, alignItems:"center" }}>
                    {sw.status==="pending-accept" && <span style={badge(C.warnLight,C.warn)}>Awaiting {to?.name?.split(" ")[0]}</span>}
                    {sw.status==="pending-accept" && <button style={btn(C.success,"#fff",true)} onClick={()=>acceptSwap(sw.id)}>Accept</button>}
                    {sw.status==="accepted" && sw.adminApproval==="pending" && (
                      <>
                        <span style={badge(C.primaryLight,C.primary)}>Needs Admin</span>
                        <button style={btn(C.success,"#fff",true)} onClick={()=>approveSwap(sw.id)}>Approve</button>
                        <button style={btn(C.danger,"#fff",true)} onClick={()=>denySwap(sw.id)}>Deny</button>
                      </>
                    )}
                    {sw.adminApproval==="approved" && <span style={badge(C.successLight,C.success)}>Approved & Swapped</span>}
                    {sw.adminApproval==="denied" && <span style={badge(C.dangerLight,C.danger)}>Denied</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ─── CALENDAR VIEW ─────────────────────────────────────────────
  const CalendarView = () => {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
    const days = [];
    for (let i=0; i<firstDay; i++) days.push(null);
    for (let d=1; d<=daysInMonth; d++) days.push(d);
    const getBookingsForDay = (day) => { if(!day)return[]; const dk=dayKey(new Date(calYear,calMonth,day)); return bookings.filter(b=>{if(b.date===dk)return true;if(b.boardingEnd&&b.date<=dk&&b.boardingEnd>=dk)return true;return false;}); };
    const prevMonth = () => { if(calMonth===0){setCalMonth(11);setCalYear(calYear-1);}else setCalMonth(calMonth-1); };
    const nextMonth = () => { if(calMonth===11){setCalMonth(0);setCalYear(calYear+1);}else setCalMonth(calMonth+1); };
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return (
      <div style={{ display:"grid", gridTemplateColumns:selectedDate?"1fr 320px":"1fr", gap:16, padding:20 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
            <button style={btn("transparent",C.textMid,true)} onClick={prevMonth}>◀</button>
            <span style={{ fontWeight:700, fontSize:16 }}>{monthNames[calMonth]} {calYear}</span>
            <button style={btn("transparent",C.textMid,true)} onClick={nextMonth}>▶</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:2 }}>
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
              <div key={d} style={{ textAlign:"center", fontSize:10, fontWeight:700, color:C.textLight, padding:4, textTransform:"uppercase" }}>{d}</div>
            ))}
            {days.map((day,i) => {
              if (!day) return <div key={i} />;
              const dk = dayKey(new Date(calYear, calMonth, day));
              const db = getBookingsForDay(day);
              const dc = db.filter(b=>b.type==="daycare").length;
              const bc = db.filter(b=>b.type==="boarding").length;
              const isToday = dk===today; const isSelected = selectedDate===dk;
              return (
                <div key={i} onClick={()=>setSelectedDate(dk)} style={{ border:"1px solid "+(isSelected?C.primary:C.borderLight), borderRadius:6, padding:6, minHeight:64, cursor:"pointer", background:isToday?C.primaryLight:isSelected?"#f0f0ff":C.surface, transition:"all 0.15s" }}>
                  <div style={{ fontSize:12, fontWeight:isToday?800:500, color:isToday?C.primary:C.text }}>{day}</div>
                  <div style={{ marginTop:4, display:"flex", flexDirection:"column", gap:2 }}>
                    {dc>0 && <div style={{ height:4, borderRadius:2, background:C.daycare, width:Math.min(dc*20,100)+"%" }} />}
                    {bc>0 && <div style={{ height:4, borderRadius:2, background:C.boarding, width:Math.min(bc*25,100)+"%" }} />}
                  </div>
                  {(dc>0||bc>0) && <div style={{ fontSize:9, color:C.textLight, marginTop:2 }}>{dc>0?dc+"D":""}{dc>0&&bc>0?" ":""}{bc>0?bc+"B":""}</div>}
                </div>
              );
            })}
          </div>
          <div style={{ display:"flex", gap:12, marginTop:12, fontSize:11, color:C.textMid }}>
            <span><span style={{ display:"inline-block", width:10, height:4, background:C.daycare, borderRadius:2, marginRight:4 }} />Daycare</span>
            <span><span style={{ display:"inline-block", width:10, height:4, background:C.boarding, borderRadius:2, marginRight:4 }} />Boarding</span>
          </div>
        </div>
        {selectedDate && (
          <div style={{ borderLeft:"1px solid "+C.border, paddingLeft:16 }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:8 }}>{fmtDate(selectedDate)}</div>
            <div style={{ display:"flex", gap:4, marginBottom:12 }}>
              <button style={btn(C.primary,"#fff",true)} onClick={()=>openModal("book",{date:selectedDate})}>Book Existing</button>
              <button style={btn(C.success,"#fff",true)} onClick={()=>openModal("intake",{date:selectedDate})}>Register New</button>
            </div>
            <div style={{ fontSize:11, fontWeight:600, color:C.textMid, marginBottom:6 }}>GUESTS ({bookings.filter(b=>b.date===selectedDate||(b.boardingEnd&&b.date<=selectedDate&&b.boardingEnd>=selectedDate)).length})</div>
            <div style={{ maxHeight:500, overflow:"auto" }}>
              {bookings.filter(b=>b.date===selectedDate||(b.boardingEnd&&b.date<=selectedDate&&b.boardingEnd>=selectedDate)).map(b=>{
                const dog=getDog(b.dogId); if(!dog)return null;
                return (
                  <div key={b.id} style={{ ...card, display:"flex", gap:8, alignItems:"center", cursor:"pointer", padding:8 }} onClick={()=>openModal("profile",dog.id)}>
                    <DogAvatar name={dog.name} size={32} />
                    <div>
                      <div style={{ fontWeight:600, fontSize:12 }}>{dog.name}</div>
                      <div style={{ fontSize:10, color:C.textMid }}>{b.type} · {b.status}{(b.addons||[]).length>0?" · +"+b.addons.join(", "):""}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── DATABASE VIEW ─────────────────────────────────────────────
  const DatabaseView = () => {
    const filtered = dogs.filter(d => d.name.toLowerCase().includes(dbSearch.toLowerCase()) || d.owner.toLowerCase().includes(dbSearch.toLowerCase()));
    const getStatus = (dog) => { const tb=todayBookings.find(b=>b.dogId===dog.id); return tb?tb.status:null; };
    return (
      <div style={{ padding:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <input value={dbSearch} onChange={e=>setDbSearch(e.target.value)} placeholder="Search by pet or owner name..." style={{ ...input, maxWidth:320 }} />
          <span style={{ fontSize:12, color:C.textMid }}>{filtered.length} clients</span>
          <div style={{ flex:1 }} />
          <button style={btn(C.success,"#fff")} onClick={()=>openModal("intake")}>+ Register New</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:10 }}>
          {filtered.map(dog => {
            const status = getStatus(dog);
            return (
              <div key={dog.id} style={{ ...card, cursor:"pointer", display:"flex", gap:10, alignItems:"center" }} onClick={()=>openModal("profile",dog.id)}>
                <DogAvatar name={dog.name} size={40} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <span style={{ fontWeight:700, fontSize:13 }}>{dog.name}</span>
                    <span style={{ fontSize:10, color:C.textLight }}>{dog.sex==="M"?"♂":"♀"}</span>
                  </div>
                  <div style={{ fontSize:11, color:C.textMid }}>{dog.breed} · {age(dog.dob)} · {dog.neutered?(dog.sex==="M"?"Neutered":"Spayed"):"Intact"}</div>
                  <div style={{ fontSize:11, color:C.textLight }}>{dog.owner}</div>
                </div>
                <div>
                  {status==="checked-in" && <span style={badge(C.successLight,C.success)}>Checked In</span>}
                  {status==="expecting" && <span style={badge(C.warnLight,C.warn)}>Expecting</span>}
                  {!status && <button style={btn(C.primaryLight,C.primary,true)} onClick={e=>{e.stopPropagation();quickBook(dog.id);}}>Book</button>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ─── CONTENT CALENDAR VIEW ─────────────────────────────────────
  const ContentCalendarView = () => {
    const [ccView, setCcView] = useState("monthly");
    const [ccMonth, setCcMonth] = useState(new Date().getMonth());
    const [ccYear, setCcYear] = useState(new Date().getFullYear());
    const [ccDay, setCcDay] = useState(today);
    const [editPost, setEditPost] = useState(null);
    const [newPost, setNewPost] = useState({ platform:"Instagram", contentType:"static", text:"", mediaName:"", notes:"" });

    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const firstDay = new Date(ccYear, ccMonth, 1).getDay();
    const daysInMonth = new Date(ccYear, ccMonth+1, 0).getDate();
    const days = []; for(let i=0;i<firstDay;i++)days.push(null); for(let d=1;d<=daysInMonth;d++)days.push(d);
    const prevMonth = () => { if(ccMonth===0){setCcMonth(11);setCcYear(ccYear-1);}else setCcMonth(ccMonth-1); };
    const nextMonth = () => { if(ccMonth===11){setCcMonth(0);setCcYear(ccYear+1);}else setCcMonth(ccMonth+1); };

    const getPostsForDay = (dk) => contentPosts.filter(p => p.date === dk);

    const addPost = () => {
      if (!newPost.text.trim()) return;
      setContentPosts(prev => [...prev, { id:uid(), date:ccDay, ...newPost, submittedBy:"e1", approved:true, flagged:false, reminded:false }]);
      setNewPost({ platform:"Instagram", contentType:"static", text:"", mediaName:"", notes:"" });
    };

    const toggleFlag = (postId) => {
      setContentPosts(prev => prev.map(p => p.id===postId ? { ...p, flagged:!p.flagged, approved:p.flagged?true:false } : p));
    };

    const deletePost = (postId) => setContentPosts(prev => prev.filter(p => p.id !== postId));

    const DailyView = () => {
      const dayPosts = getPostsForDay(ccDay);
      return (
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
            <button style={btn("transparent",C.textMid,true)} onClick={()=>{const d=new Date(ccDay);d.setDate(d.getDate()-1);setCcDay(dayKey(d));}}>◀</button>
            <span style={{ fontWeight:700, fontSize:16 }}>{fmtDate(ccDay)}</span>
            <button style={btn("transparent",C.textMid,true)} onClick={()=>{const d=new Date(ccDay);d.setDate(d.getDate()+1);setCcDay(dayKey(d));}}>▶</button>
            <button style={btn(C.bg,C.textMid,true)} onClick={()=>setCcView("monthly")}>← Month View</button>
          </div>

          {PLATFORMS.map(platform => {
            const platPosts = dayPosts.filter(p => p.platform === platform);
            return (
              <div key={platform} style={{ marginBottom:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 0", borderBottom:"2px solid "+PLATFORM_COLORS[platform]+"44" }}>
                  <span style={{ fontSize:18 }}>{PLATFORM_ICONS[platform]}</span>
                  <span style={{ fontWeight:700, fontSize:14, color:PLATFORM_COLORS[platform] }}>{platform}</span>
                  <span style={badge(PLATFORM_COLORS[platform]+"22",PLATFORM_COLORS[platform])}>{platPosts.length}</span>
                </div>
                {platPosts.map(post => {
                  const ct = CONTENT_TYPES.find(t=>t.key===post.contentType);
                  const submitter = getEmp(post.submittedBy);
                  return (
                    <div key={post.id} style={{ ...card, borderLeft:"3px solid "+(post.flagged?C.danger:C.success), marginTop:6 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                        <span style={{ fontSize:14 }}>{ct?.icon||"📝"}</span>
                        <span style={{ fontWeight:600, fontSize:12 }}>{ct?.label||post.contentType}</span>
                        {post.flagged ? <span style={badge(C.dangerLight,C.danger)}>🚩 Flagged</span> : <span style={badge(C.successLight,C.success)}>✓ Approved</span>}
                        <span style={{ fontSize:10, color:C.textLight, marginLeft:"auto" }}>by {submitter?.name||"Unknown"}</span>
                      </div>
                      <div style={{ fontSize:13, marginBottom:6 }}>{post.text}</div>
                      {post.mediaName && <div style={{ fontSize:11, color:C.primary, marginBottom:4 }}>📎 {post.mediaName}</div>}
                      {post.notes && <div style={{ fontSize:11, color:C.textMid, fontStyle:"italic", background:C.bg, padding:6, borderRadius:4, marginBottom:6 }}>Notes: {post.notes}</div>}
                      <div style={{ display:"flex", gap:4 }}>
                        <button style={btn(post.flagged?C.success:C.danger, "#fff", true)} onClick={()=>toggleFlag(post.id)}>
                          {post.flagged ? "✓ Approve" : "🚩 Flag"}
                        </button>
                        <button style={btn(C.bg,C.textMid,true)} onClick={()=>deletePost(post.id)}>🗑</button>
                      </div>
                    </div>
                  );
                })}
                {platPosts.length===0 && <div style={{ padding:12, color:C.textLight, fontSize:12, textAlign:"center" }}>No posts for {platform}</div>}
              </div>
            );
          })}

          {/* Add new post */}
          <div style={{ ...card, borderLeft:"3px solid "+C.primary, marginTop:16 }}>
            <div style={{ fontWeight:700, fontSize:12, color:C.primary, marginBottom:8, textTransform:"uppercase" }}>New Post</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
              <select style={input} value={newPost.platform} onChange={e=>setNewPost(p=>({...p, platform:e.target.value}))}>
                {PLATFORMS.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
              <select style={input} value={newPost.contentType} onChange={e=>setNewPost(p=>({...p, contentType:e.target.value}))}>
                {CONTENT_TYPES.map(t=><option key={t.key} value={t.key}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <textarea style={{ ...input, minHeight:60, marginBottom:8, resize:"vertical" }} placeholder="Post text / caption..." value={newPost.text} onChange={e=>setNewPost(p=>({...p, text:e.target.value}))} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
              <input style={input} placeholder="Media filename (photo/video)..." value={newPost.mediaName} onChange={e=>setNewPost(p=>({...p, mediaName:e.target.value}))} />
              <input style={input} placeholder="Notes..." value={newPost.notes} onChange={e=>setNewPost(p=>({...p, notes:e.target.value}))} />
            </div>
            <button style={btn(C.primary,"#fff")} onClick={addPost}>+ Add Post</button>
          </div>
        </div>
      );
    };

    if (ccView === "daily") return <div style={{ padding:20 }}><DailyView /></div>;

    return (
      <div style={{ padding:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <button style={btn("transparent",C.textMid,true)} onClick={prevMonth}>◀</button>
          <span style={{ fontWeight:700, fontSize:16 }}>{monthNames[ccMonth]} {ccYear}</span>
          <button style={btn("transparent",C.textMid,true)} onClick={nextMonth}>▶</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:2 }}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
            <div key={d} style={{ textAlign:"center", fontSize:10, fontWeight:700, color:C.textLight, padding:4, textTransform:"uppercase" }}>{d}</div>
          ))}
          {days.map((day,i) => {
            if (!day) return <div key={i} />;
            const dk = dayKey(new Date(ccYear, ccMonth, day));
            const posts = getPostsForDay(dk);
            const isToday = dk===today;
            const hasFlagged = posts.some(p=>p.flagged);
            return (
              <div key={i} onClick={()=>{setCcDay(dk);setCcView("daily");}} style={{ border:"1px solid "+C.borderLight, borderRadius:6, padding:4, minHeight:68, cursor:"pointer", background:isToday?C.primaryLight:C.surface, transition:"all 0.15s" }}>
                <div style={{ fontSize:11, fontWeight:isToday?800:500, color:isToday?C.primary:C.text, marginBottom:3 }}>{day}</div>
                {posts.slice(0,3).map(p => (
                  <div key={p.id} style={{ display:"flex", alignItems:"center", gap:2, fontSize:8, marginBottom:1, background:p.flagged?C.dangerLight:C.successLight, borderRadius:3, padding:"1px 3px" }}>
                    <span>{PLATFORM_ICONS[p.platform]}</span>
                    <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.text.slice(0,15)}</span>
                  </div>
                ))}
                {posts.length>3 && <div style={{ fontSize:8, color:C.textLight }}>+{posts.length-3} more</div>}
                {hasFlagged && <span style={{ fontSize:8, color:C.danger }}>🚩</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };


  // ─── MODAL: INTAKE FORM ───────────────────────────────────────
  const IntakeModal = () => {
    const [form, setForm] = useState({
      name:"", breed:"", dob:"", sex:"M", neutered:false, microchip:"",
      vaccinations:[{name:"Rabies",date:"",expires:""},{name:"DHPP",date:"",expires:""},{name:"Bordetella",date:"",expires:""}],
      temperament:[], owner:"", phone:"", emergency:"", diet:"", meds:"", medical:"",
      belongings:[], bookToday:true, bookType:"daycare", addons:[],
    });
    const [belongingInput, setBelongingInput] = useState("");
    const toggleTemp = (t) => setForm(f=>({...f, temperament:f.temperament.includes(t)?f.temperament.filter(x=>x!==t):[...f.temperament,t]}));
    const toggleAddon = (k) => setForm(f=>({...f, addons:f.addons.includes(k)?f.addons.filter(x=>x!==k):[...f.addons,k]}));
    const addBelonging = () => { if(belongingInput.trim()){setForm(f=>({...f,belongings:[...f.belongings,belongingInput.trim()]}));setBelongingInput("");} };
    const updateVax = (idx,field,val) => setForm(f=>({...f, vaccinations:f.vaccinations.map((v,i)=>i===idx?{...v,[field]:val}:v)}));
    const addVax = () => setForm(f=>({...f, vaccinations:[...f.vaccinations,{name:"",date:"",expires:""}]}));
    const submit = () => {
      if (!form.name||!form.breed||!form.owner) return;
      addDog({
        name:form.name, breed:form.breed, dob:form.dob, sex:form.sex, neutered:form.neutered,
        microchip:form.microchip, vaccinations:form.vaccinations.filter(v=>v.name),
        temperament:form.temperament, owner:form.owner, phone:form.phone, emergency:form.emergency,
        diet:form.diet, meds:form.meds, medical:form.medical, belongings:form.belongings, photo:null,
      }, form.bookToday, form.bookType, form.addons);
    };
    return (
      <div style={modal} onClick={closeModal}>
        <div style={{...modalContent, maxWidth:600}} onClick={e=>e.stopPropagation()}>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid "+C.border, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontWeight:700, fontSize:16 }}>New Client Registration</span>
            <button onClick={closeModal} style={{...btn("transparent",C.textMid,true), fontSize:18}}>×</button>
          </div>
          <div style={{ padding:20, display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ fontWeight:600, fontSize:12, color:C.textMid, textTransform:"uppercase", letterSpacing:0.5 }}>Dog Details</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <input style={input} placeholder="Dog Name *" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
              <input style={input} placeholder="Breed *" value={form.breed} onChange={e=>setForm(f=>({...f,breed:e.target.value}))} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8 }}>
              <input style={input} type="date" value={form.dob} onChange={e=>setForm(f=>({...f,dob:e.target.value}))} />
              <select style={input} value={form.sex} onChange={e=>setForm(f=>({...f,sex:e.target.value}))}>
                <option value="M">Male</option><option value="F">Female</option>
              </select>
              <label style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, cursor:"pointer" }}>
                <input type="checkbox" checked={form.neutered} onChange={e=>setForm(f=>({...f,neutered:e.target.checked}))} />
                {form.sex==="M"?"Neutered":"Spayed"}
              </label>
              <input style={input} placeholder="Microchip #" value={form.microchip} onChange={e=>setForm(f=>({...f,microchip:e.target.value}))} />
            </div>

            <div style={{ fontWeight:600, fontSize:12, color:C.textMid, textTransform:"uppercase", letterSpacing:0.5, marginTop:4 }}>Vaccinations</div>
            {form.vaccinations.map((v,i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:4 }}>
                <input style={input} placeholder="Vaccine name" value={v.name} onChange={e=>updateVax(i,"name",e.target.value)} />
                <input style={input} type="date" placeholder="Date given" value={v.date} onChange={e=>updateVax(i,"date",e.target.value)} />
                <input style={input} type="date" placeholder="Expires" value={v.expires} onChange={e=>updateVax(i,"expires",e.target.value)} />
              </div>
            ))}
            <button style={btn(C.bg,C.textMid,true)} onClick={addVax}>+ Add Vaccine</button>

            <div style={{ fontWeight:600, fontSize:12, color:C.textMid, textTransform:"uppercase", letterSpacing:0.5, marginTop:4 }}>Temperament</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
              {TEMPERAMENT_OPTIONS.map(t => (
                <button key={t.label} onClick={()=>toggleTemp(t.label)} style={{
                  ...badge(form.temperament.includes(t.label)?t.color+"33":C.bg, form.temperament.includes(t.label)?t.color:C.textLight),
                  cursor:"pointer", border:"1px solid "+(form.temperament.includes(t.label)?t.color:C.border), padding:"4px 10px", fontSize:11,
                }}>{t.label}</button>
              ))}
            </div>

            <div style={{ fontWeight:600, fontSize:12, color:C.textMid, textTransform:"uppercase", letterSpacing:0.5, marginTop:4 }}>Owner & Care</div>
            <input style={input} placeholder="Owner Name *" value={form.owner} onChange={e=>setForm(f=>({...f,owner:e.target.value}))} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <input style={input} placeholder="Phone" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
              <input style={input} placeholder="Emergency Contact" value={form.emergency} onChange={e=>setForm(f=>({...f,emergency:e.target.value}))} />
            </div>
            <input style={input} placeholder="Diet Instructions" value={form.diet} onChange={e=>setForm(f=>({...f,diet:e.target.value}))} />
            <input style={input} placeholder="Medications" value={form.meds} onChange={e=>setForm(f=>({...f,meds:e.target.value}))} />
            <textarea style={{...input, minHeight:50, resize:"vertical"}} placeholder="Medical History" value={form.medical} onChange={e=>setForm(f=>({...f,medical:e.target.value}))} />

            <div style={{ display:"flex", gap:4, alignItems:"center" }}>
              <input style={{...input, flex:1}} placeholder="Add belonging..." value={belongingInput} onChange={e=>setBelongingInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addBelonging()} />
              <button style={btn(C.bg,C.textMid,true)} onClick={addBelonging}>+</button>
            </div>
            {form.belongings.length>0 && <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
              {form.belongings.map((b,i) => <span key={i} style={badge(C.bg,C.textMid)}>{b} <span style={{cursor:"pointer"}} onClick={()=>setForm(f=>({...f,belongings:f.belongings.filter((_,j)=>j!==i)}))}>×</span></span>)}
            </div>}

            <div style={{ borderTop:"1px solid "+C.border, paddingTop:12, marginTop:4 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
                <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                  <input type="checkbox" checked={form.bookToday} onChange={e=>setForm(f=>({...f,bookToday:e.target.checked}))} />
                  Schedule for Today?
                </label>
                {form.bookToday && (
                  <select style={{...input,width:"auto"}} value={form.bookType} onChange={e=>setForm(f=>({...f,bookType:e.target.value}))}>
                    <option value="daycare">Daycare</option><option value="boarding">Boarding</option>
                  </select>
                )}
              </div>
              {form.bookToday && (
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:C.textMid, marginBottom:4, textTransform:"uppercase" }}>Add-ons</div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {ADDON_OPTIONS.map(a => (
                      <label key={a.key} style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, cursor:"pointer", ...card, padding:8, marginBottom:0, border:"1px solid "+(form.addons.includes(a.key)?C.primary:C.border) }}>
                        <input type="checkbox" checked={form.addons.includes(a.key)} onChange={()=>toggleAddon(a.key)} />
                        <div>
                          <div style={{ fontWeight:600 }}>{a.label} <span style={{color:a.price>0?C.success:C.primary}}>({a.price>0?"+":""}{a.price>0?"$"+a.price:"-$"+Math.abs(a.price)})</span></div>
                          <div style={{ fontSize:10, color:C.textMid }}>{a.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button style={{...btn(C.primary,"#fff"), width:"100%", justifyContent:"center", marginTop:4}} onClick={submit}>
              Save & {form.bookToday ? "Add to Today" : "Save to Database"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─── MODAL: PET PROFILE ───────────────────────────────────────
  const ProfileModal = () => {
    const dogId = modalData; const dog = getDog(dogId);
    const [tab, setTab] = useState("info");
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [historySearch, setHistorySearch] = useState("");
    const [summary, setSummary] = useState("");
    if (!dog) return null;
    const dogBooking = todayBookings.find(b=>b.dogId===dogId&&(b.status==="checked-in"||b.status==="expecting"));
    const dogLogs = logs.filter(l=>l.dogId===dogId).sort((a,b)=>new Date(b.time)-new Date(a.time));
    const filteredHistory = historySearch?dogLogs.filter(l=>l.detail.toLowerCase().includes(historySearch.toLowerCase())):dogLogs;
    const startEdit = () => { setEditForm({...dog}); setEditing(true); };
    const saveEdit = () => { updateDog(dogId, editForm); setEditing(false); };
    const vaxExpired = (v) => v.expires && new Date(v.expires) < new Date();
    const vaxSoon = (v) => v.expires && !vaxExpired(v) && (new Date(v.expires) - new Date()) < 30*86400000;

    return (
      <div style={modal} onClick={closeModal}>
        <div style={{...modalContent, maxWidth:640}} onClick={e=>e.stopPropagation()}>
          <div style={{ padding:"20px 20px 12px", display:"flex", gap:16, alignItems:"center", borderBottom:"1px solid "+C.border }}>
            <DogAvatar name={dog.name} size={56} />
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontWeight:800, fontSize:18 }}>{dog.name}</span>
                <span style={{ fontSize:13, color:C.textMid }}>{dog.sex==="M"?"♂":"♀"} {dog.neutered?(dog.sex==="M"?"Neutered":"Spayed"):"Intact"}</span>
              </div>
              <div style={{ fontSize:12, color:C.textMid }}>{dog.breed} · {age(dog.dob)}</div>
              {dog.microchip && <div style={{ fontSize:10, color:C.textLight }}>Chip: {dog.microchip}</div>}
              <div style={{ display:"flex", gap:4, marginTop:4, flexWrap:"wrap" }}>
                {dogBooking && <span style={badge(dogBooking.status==="checked-in"?C.successLight:C.warnLight, dogBooking.status==="checked-in"?C.success:C.warn)}>
                  {dogBooking.status==="checked-in"?"Checked In":"Expecting"} · {dogBooking.type}
                </span>}
                {dog.temperament.map(t=>{const o=TEMPERAMENT_OPTIONS.find(x=>x.label===t);return <span key={t} style={badge((o?.color||C.textMid)+"22",o?.color||C.textMid)}>{t}</span>;})}
              </div>
            </div>
            <div style={{ display:"flex", gap:4 }}>
              <button style={btn(C.primaryLight,C.primary,true)} onClick={()=>quickBook(dogId)} title="Schedule">+</button>
              <button style={btn(C.bg,C.textMid,true)} onClick={startEdit} title="Edit">✎</button>
              <button onClick={closeModal} style={{...btn("transparent",C.textMid,true), fontSize:18}}>×</button>
            </div>
          </div>
          <div style={{ display:"flex", borderBottom:"1px solid "+C.border }}>
            {["info","history"].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{ flex:1, padding:"10px 0", border:"none", background:"transparent", borderBottom:tab===t?"2px solid "+C.primary:"2px solid transparent", fontWeight:tab===t?700:500, fontSize:13, color:tab===t?C.primary:C.textMid, cursor:"pointer", textTransform:"capitalize" }}>{t}</button>
            ))}
          </div>
          <div style={{ padding:20, maxHeight:400, overflow:"auto" }}>
            {tab==="info" && !editing && (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {/* Vaccinations */}
                <div style={{ border:"1px solid "+C.primary, borderRadius:8, padding:12 }}>
                  <div style={{ fontWeight:700, fontSize:11, color:C.primary, textTransform:"uppercase", marginBottom:6 }}>💉 Vaccinations</div>
                  {(dog.vaccinations||[]).length===0 && <div style={{ fontSize:12, color:C.textLight }}>No vaccination records</div>}
                  {(dog.vaccinations||[]).map((v,i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"4px 0", borderBottom:i<dog.vaccinations.length-1?"1px solid "+C.borderLight:"none" }}>
                      <span style={{ fontWeight:600, fontSize:12 }}>{v.name}</span>
                      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                        <span style={{ fontSize:11, color:C.textMid }}>Given: {v.date?fmtDate(v.date):"N/A"}</span>
                        {v.expires && (
                          <span style={badge(vaxExpired(v)?C.dangerLight:vaxSoon(v)?C.warnLight:C.successLight, vaxExpired(v)?C.danger:vaxSoon(v)?C.warn:C.success)}>
                            {vaxExpired(v)?"Expired":vaxSoon(v)?"Expiring Soon":"Valid"} {fmtDate(v.expires)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {dog.meds && (
                  <div style={{ border:"1px solid "+C.danger, borderRadius:8, padding:12 }}>
                    <div style={{ fontWeight:700, fontSize:11, color:C.danger, textTransform:"uppercase", marginBottom:4 }}>💊 Medications</div>
                    <div style={{ fontSize:13, color:C.danger }}>{dog.meds}</div>
                  </div>
                )}
                <div style={{ border:"1px solid "+C.boarding, borderRadius:8, padding:12 }}>
                  <div style={{ fontWeight:700, fontSize:11, color:C.boarding, textTransform:"uppercase", marginBottom:4 }}>🍽 Diet</div>
                  <div style={{ fontSize:13 }}>{dog.diet||"No diet info"}</div>
                </div>
                {dog.medical && dog.medical!=="None" && (
                  <div style={{ border:"1px solid "+C.border, borderRadius:8, padding:12 }}>
                    <div style={{ fontWeight:700, fontSize:11, color:C.textMid, textTransform:"uppercase", marginBottom:4 }}>🏥 Medical</div>
                    <div style={{ fontSize:13 }}>{dog.medical}</div>
                  </div>
                )}
                {dog.belongings.length>0 && (
                  <div style={{ border:"1px solid "+C.border, borderRadius:8, padding:12 }}>
                    <div style={{ fontWeight:700, fontSize:11, color:C.textMid, textTransform:"uppercase", marginBottom:4 }}>🎒 Belongings</div>
                    <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>{dog.belongings.map((b,i)=><span key={i} style={badge(C.bg,C.textMid)}>{b}</span>)}</div>
                  </div>
                )}
                <div style={{ border:"1px solid "+C.border, borderRadius:8, padding:12 }}>
                  <div style={{ fontWeight:700, fontSize:11, color:C.textMid, textTransform:"uppercase", marginBottom:4 }}>👤 Owner</div>
                  <div style={{ fontSize:13 }}>{dog.owner}</div>
                  <div style={{ fontSize:12, color:C.textMid }}>📞 {dog.phone||"No phone"} · 🆘 {dog.emergency||"No emergency"}</div>
                </div>
                <button style={{...btn(C.primaryLight,C.primary), width:"100%", justifyContent:"center"}} onClick={()=>setSummary(generateSummary(dogId))}>✨ Generate Daily Summary</button>
                {summary && (
                  <div style={{ background:C.primaryLight, borderRadius:8, padding:12, fontSize:13 }}>
                    <div style={{ fontWeight:700, fontSize:11, color:C.primary, marginBottom:4 }}>AI DAILY SUMMARY</div>
                    {summary}
                    <button style={{...btn(C.primary,"#fff",true), marginTop:8}} onClick={()=>navigator.clipboard?.writeText(summary)}>Copy</button>
                  </div>
                )}
              </div>
            )}
            {tab==="info" && editing && editForm && (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <input style={input} value={editForm.name||""} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} placeholder="Name" />
                  <input style={input} value={editForm.breed||""} onChange={e=>setEditForm(f=>({...f,breed:e.target.value}))} placeholder="Breed" />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8 }}>
                  <input style={input} type="date" value={editForm.dob||""} onChange={e=>setEditForm(f=>({...f,dob:e.target.value}))} />
                  <select style={input} value={editForm.sex||"M"} onChange={e=>setEditForm(f=>({...f,sex:e.target.value}))}>
                    <option value="M">Male</option><option value="F">Female</option>
                  </select>
                  <label style={{ display:"flex", alignItems:"center", gap:4, fontSize:12 }}>
                    <input type="checkbox" checked={editForm.neutered||false} onChange={e=>setEditForm(f=>({...f,neutered:e.target.checked}))} />
                    {editForm.sex==="M"?"Neutered":"Spayed"}
                  </label>
                  <input style={input} value={editForm.microchip||""} onChange={e=>setEditForm(f=>({...f,microchip:e.target.value}))} placeholder="Microchip #" />
                </div>
                <div style={{ fontSize:11, fontWeight:600, color:C.textMid, marginTop:4 }}>Vaccinations</div>
                {(editForm.vaccinations||[]).map((v,i)=>(
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:4 }}>
                    <input style={input} value={v.name} onChange={e=>{const vx=[...(editForm.vaccinations||[])];vx[i]={...vx[i],name:e.target.value};setEditForm(f=>({...f,vaccinations:vx}));}} placeholder="Vaccine" />
                    <input style={input} type="date" value={v.date} onChange={e=>{const vx=[...(editForm.vaccinations||[])];vx[i]={...vx[i],date:e.target.value};setEditForm(f=>({...f,vaccinations:vx}));}} />
                    <input style={input} type="date" value={v.expires} onChange={e=>{const vx=[...(editForm.vaccinations||[])];vx[i]={...vx[i],expires:e.target.value};setEditForm(f=>({...f,vaccinations:vx}));}} />
                    <button style={btn(C.dangerLight,C.danger,true)} onClick={()=>{const vx=(editForm.vaccinations||[]).filter((_,j)=>j!==i);setEditForm(f=>({...f,vaccinations:vx}));}}>×</button>
                  </div>
                ))}
                <button style={btn(C.bg,C.textMid,true)} onClick={()=>setEditForm(f=>({...f,vaccinations:[...(f.vaccinations||[]),{name:"",date:"",expires:""}]}))}>+ Add Vaccine</button>
                <input style={input} value={editForm.owner||""} onChange={e=>setEditForm(f=>({...f,owner:e.target.value}))} placeholder="Owner" />
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <input style={input} value={editForm.phone||""} onChange={e=>setEditForm(f=>({...f,phone:e.target.value}))} placeholder="Phone" />
                  <input style={input} value={editForm.emergency||""} onChange={e=>setEditForm(f=>({...f,emergency:e.target.value}))} placeholder="Emergency" />
                </div>
                <input style={input} value={editForm.diet||""} onChange={e=>setEditForm(f=>({...f,diet:e.target.value}))} placeholder="Diet" />
                <input style={input} value={editForm.meds||""} onChange={e=>setEditForm(f=>({...f,meds:e.target.value}))} placeholder="Meds" />
                <textarea style={{...input, minHeight:50}} value={editForm.medical||""} onChange={e=>setEditForm(f=>({...f,medical:e.target.value}))} placeholder="Medical" />
                <div style={{ display:"flex", gap:8 }}>
                  <button style={{...btn(C.primary,"#fff"), flex:1, justifyContent:"center"}} onClick={saveEdit}>Save</button>
                  <button style={{...btn(C.bg,C.textMid), flex:1, justifyContent:"center"}} onClick={()=>setEditing(false)}>Cancel</button>
                </div>
              </div>
            )}
            {tab==="history" && (
              <div>
                <input style={{...input, marginBottom:10}} placeholder="Search logs..." value={historySearch} onChange={e=>setHistorySearch(e.target.value)} />
                {filteredHistory.map(log=>(
                  <div key={log.id} style={{ padding:"6px 0", borderBottom:"1px solid "+C.borderLight, fontSize:12, display:"flex", justifyContent:"space-between" }}>
                    <span><span style={{ fontWeight:600, textTransform:"capitalize" }}>{log.type}</span> — {log.detail}</span>
                    <span style={{ color:C.textLight, flexShrink:0 }}>{log.time?fmtDate(log.time)+" "+fmt(log.time):""}</span>
                  </div>
                ))}
                {filteredHistory.length===0 && <div style={{ padding:16, textAlign:"center", color:C.textLight }}>No logs found</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ─── MODAL: ACTIVITY LOG ──────────────────────────────────────
  const ActivityModal = () => {
    const booking = modalData; const dog = getDog(booking?.dogId);
    const [screen, setScreen] = useState("main");
    const [playType, setPlayType] = useState(null);
    if (!dog||!booking) return null;
    const otherCheckedIn = checkedIn.filter(b=>b.dogId!==booking.dogId).map(b=>getDog(b.dogId)).filter(Boolean);
    const logAndClose = (type,detail) => { addLog(dog.id,type,detail); closeModal(); };
    const logPlay = (partnerId,good) => {
      const partner = getDog(partnerId); if(!partner) return;
      addLog(dog.id,"play",(good?"Played well with ":"Had issues with ")+partner.name);
      addLog(partnerId,"play",(good?"Played well with ":"Had issues with ")+dog.name);
      closeModal();
    };
    return (
      <div style={modal} onClick={closeModal}>
        <div style={{...modalContent, maxWidth:400}} onClick={e=>e.stopPropagation()}>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid "+C.border, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}><DogAvatar name={dog.name} size={32} /><span style={{ fontWeight:700 }}>Log — {dog.name}</span></div>
            <button onClick={closeModal} style={{...btn("transparent",C.textMid,true), fontSize:18}}>×</button>
          </div>
          <div style={{ padding:20 }}>
            {screen==="main" && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {[["potty","🚽","Potty"],["meal","🍽","Meal"],["meds","💊","Meds"],["play","🎾","Play"]].map(([k,icon,label])=>(
                  <button key={k} style={{...btn(C.bg,C.text), padding:20, flexDirection:"column", justifyContent:"center", borderRadius:10, border:"1px solid "+C.border}}
                    onClick={()=>k==="meds"?logAndClose("meds",(dog.meds||"Medication")+" administered"):setScreen(k)}>
                    <span style={{ fontSize:24 }}>{icon}</span><span style={{ fontWeight:700 }}>{label}</span>
                  </button>
                ))}
              </div>
            )}
            {screen==="potty" && <div>
              <button style={{...btn("transparent",C.textMid,true), marginBottom:8}} onClick={()=>setScreen("main")}>← Back</button>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {POTTY_OPTIONS.map(p=><button key={p.label} style={{...btn(p.color+"18",p.color), padding:16, borderRadius:10, border:"1px solid "+p.color+"44", justifyContent:"center"}} onClick={()=>logAndClose("potty",p.label)}><span style={{fontSize:18}}>{p.icon}</span> {p.label}</button>)}
              </div>
            </div>}
            {screen==="meal" && <div>
              <button style={{...btn("transparent",C.textMid,true), marginBottom:8}} onClick={()=>setScreen("main")}>← Back</button>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {MEAL_OPTIONS.map(m=><button key={m.label} style={{...btn(m.color+"18",m.color), padding:16, borderRadius:10, border:"1px solid "+m.color+"44", justifyContent:"center"}} onClick={()=>logAndClose("meal",m.label)}><span style={{fontSize:18}}>{m.icon}</span> {m.label}</button>)}
              </div>
            </div>}
            {screen==="play" && !playType && <div>
              <button style={{...btn("transparent",C.textMid,true), marginBottom:8}} onClick={()=>setScreen("main")}>← Back</button>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <button style={{...btn(C.successLight,C.success), padding:14, borderRadius:10, border:"1px solid "+C.success+"44", justifyContent:"center"}} onClick={()=>setPlayType("good")}>🎾 Played well with...</button>
                <button style={{...btn(C.dangerLight,C.danger), padding:14, borderRadius:10, border:"1px solid "+C.danger+"44", justifyContent:"center"}} onClick={()=>setPlayType("issue")}>⚠ Had issues with...</button>
                <div style={{ borderTop:"1px solid "+C.border, paddingTop:8, marginTop:4 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:C.textMid, marginBottom:6 }}>SOLO</div>
                  <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                    <button style={btn(C.warnLight,C.warn,true)} onClick={()=>logAndClose("play","Was nervous")}>😟 Nervous</button>
                    <button style={btn(C.boardingLight,C.boarding,true)} onClick={()=>logAndClose("play","Stuck by humans")}>🧑 Stuck by Humans</button>
                  </div>
                </div>
              </div>
            </div>}
            {screen==="play" && playType && <div>
              <button style={{...btn("transparent",C.textMid,true), marginBottom:8}} onClick={()=>setPlayType(null)}>← Back</button>
              <div style={{ fontSize:12, fontWeight:600, marginBottom:8, color:C.textMid }}>{playType==="good"?"Played well with...":"Had issues with..."}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {otherCheckedIn.map(d=>(
                  <button key={d.id} style={{...card, display:"flex", gap:8, alignItems:"center", cursor:"pointer", border:"1px solid "+C.border, margin:0}} onClick={()=>logPlay(d.id,playType==="good")}>
                    <DogAvatar name={d.name} size={28} /><span style={{ fontWeight:600, fontSize:13 }}>{d.name}</span><span style={{ fontSize:11, color:C.textMid }}>{d.breed}</span>
                  </button>
                ))}
                {otherCheckedIn.length===0 && <div style={{ padding:12, textAlign:"center", color:C.textLight, fontSize:12 }}>No other dogs checked in</div>}
              </div>
            </div>}
          </div>
        </div>
      </div>
    );
  };

  // ─── MODAL: CHECKOUT ──────────────────────────────────────────
  const CheckoutModal = () => {
    const booking = modalData; const dog = getDog(booking?.dogId);
    const [summaryText, setSummaryText] = useState("");
    const [charged, setCharged] = useState(false);
    const [lateFee, setLateFee] = useState(0);
    const [lateFeeReason, setLateFeeReason] = useState("");
    if (!dog||!booking) return null;
    const basePrice = booking.type==="boarding"?65:42;
    const addonTotal = (booking.addons||[]).reduce((sum,a) => { const opt=ADDON_OPTIONS.find(o=>o.key===a); return sum+(opt?opt.price:0); }, 0);
    const total = basePrice + addonTotal + Number(lateFee||0);
    return (
      <div style={modal} onClick={closeModal}>
        <div style={{...modalContent, maxWidth:500}} onClick={e=>e.stopPropagation()}>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid "+C.border, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontWeight:700, fontSize:16 }}>Checkout — {dog.name}</span>
            <button onClick={closeModal} style={{...btn("transparent",C.textMid,true), fontSize:18}}>×</button>
          </div>
          <div style={{ padding:20, display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              <DogAvatar name={dog.name} size={48} />
              <div>
                <div style={{ fontWeight:700, fontSize:16 }}>{dog.name}</div>
                <div style={{ fontSize:12, color:C.textMid }}>{booking.type} · {dog.owner}</div>
              </div>
            </div>
            <button style={{...btn(C.primaryLight,C.primary), width:"100%", justifyContent:"center"}} onClick={()=>setSummaryText(generateSummary(dog.id))}>✨ Generate Daily Report</button>
            {summaryText && (
              <div style={{ background:C.primaryLight, borderRadius:8, padding:12, fontSize:13, lineHeight:1.5 }}>
                <div style={{ fontWeight:700, fontSize:11, color:C.primary, marginBottom:4 }}>OWNER SUMMARY</div>
                {summaryText}
                <button style={{...btn(C.primary,"#fff",true), marginTop:8}} onClick={()=>navigator.clipboard?.writeText(summaryText)}>Copy</button>
              </div>
            )}

            <div style={{ border:"1px solid "+C.border, borderRadius:10, padding:16 }}>
              <div style={{ fontWeight:700, fontSize:12, color:C.textMid, textTransform:"uppercase", marginBottom:10 }}>Payment — Square</div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}>
                <span>{booking.type==="boarding"?"Boarding (1 night)":"Daycare (full day)"}</span>
                <span style={{ fontWeight:600 }}>${basePrice}.00</span>
              </div>
              {(booking.addons||[]).map(a => {
                const opt = ADDON_OPTIONS.find(o=>o.key===a);
                return opt ? (
                  <div key={a} style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:C.textMid, marginBottom:2 }}>
                    <span>{opt.label}</span>
                    <span>{opt.price>0?"+$"+opt.price:"-$"+Math.abs(opt.price)}</span>
                  </div>
                ) : null;
              })}

              {/* Late Fee Section */}
              <div style={{ borderTop:"1px solid "+C.borderLight, marginTop:8, paddingTop:8 }}>
                <div style={{ fontSize:11, fontWeight:600, color:C.danger, marginBottom:4 }}>LATE FEE (if applicable)</div>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <span style={{ fontSize:12 }}>$</span>
                  <input style={{...input, width:80}} type="number" min="0" step="5" value={lateFee} onChange={e=>setLateFee(e.target.value)} placeholder="0" />
                  <input style={{...input, flex:1}} placeholder="Reason (e.g. late pickup)..." value={lateFeeReason} onChange={e=>setLateFeeReason(e.target.value)} />
                </div>
              </div>

              <div style={{ display:"flex", justifyContent:"space-between", fontSize:15, fontWeight:700, marginTop:10, paddingTop:8, borderTop:"2px solid "+C.border }}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:C.textMid, marginTop:4, marginBottom:12 }}>
                <span>Card on File</span>
                <span>•••• 4242</span>
              </div>
              {!charged ? (
                <button style={{...btn(C.success,"#fff"), width:"100%", justifyContent:"center", padding:14}} onClick={()=>setCharged(true)}>
                  💳 Charge ${total.toFixed(2)} via Square
                </button>
              ) : (
                <div style={{ textAlign:"center" }}>
                  <div style={{...badge(C.successLight,C.success), padding:"8px 16px", fontSize:13}}>✓ Payment Charged — ${total.toFixed(2)}</div>
                  <button style={{...btn(C.primary,"#fff"), width:"100%", justifyContent:"center", marginTop:12}} onClick={()=>checkOut(booking.id, total.toFixed(2))}>
                    Complete Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── MODAL: QUICK BOOK ────────────────────────────────────────
  const BookModal = () => {
    const data = modalData||{};
    const [search, setSearch] = useState("");
    const [type, setType] = useState("daycare");
    const [addons, setAddons] = useState([]);
    const filtered = dogs.filter(d=>d.name.toLowerCase().includes(search.toLowerCase())||d.owner.toLowerCase().includes(search.toLowerCase()));
    const toggleAddon = (k) => setAddons(prev=>prev.includes(k)?prev.filter(x=>x!==k):[...prev,k]);
    return (
      <div style={modal} onClick={closeModal}>
        <div style={{...modalContent, maxWidth:440}} onClick={e=>e.stopPropagation()}>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid "+C.border, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontWeight:700, fontSize:16 }}>Book for {data.date?fmtDate(data.date):"Today"}</span>
            <button onClick={closeModal} style={{...btn("transparent",C.textMid,true), fontSize:18}}>×</button>
          </div>
          <div style={{ padding:16 }}>
            <div style={{ display:"flex", gap:8, marginBottom:8 }}>
              <input style={{...input, flex:1}} placeholder="Search dogs..." value={search} onChange={e=>setSearch(e.target.value)} />
              <select style={{...input, width:"auto"}} value={type} onChange={e=>setType(e.target.value)}>
                <option value="daycare">Daycare</option><option value="boarding">Boarding</option>
              </select>
            </div>
            <div style={{ fontSize:11, fontWeight:600, color:C.textMid, marginBottom:4, textTransform:"uppercase" }}>Add-ons</div>
            <div style={{ display:"flex", gap:4, marginBottom:10, flexWrap:"wrap" }}>
              {ADDON_OPTIONS.map(a=>(
                <label key={a.key} style={{ display:"flex", alignItems:"center", gap:3, fontSize:11, cursor:"pointer", background:addons.includes(a.key)?C.primaryLight:C.bg, border:"1px solid "+(addons.includes(a.key)?C.primary:C.border), borderRadius:6, padding:"4px 8px" }}>
                  <input type="checkbox" checked={addons.includes(a.key)} onChange={()=>toggleAddon(a.key)} style={{width:12,height:12}} />
                  {a.label} ({a.price>0?"+$"+a.price:"-$"+Math.abs(a.price)})
                </label>
              ))}
            </div>
            <div style={{ maxHeight:300, overflow:"auto" }}>
              {filtered.map(dog=>(
                <div key={dog.id} style={{...card, display:"flex", gap:8, alignItems:"center", cursor:"pointer", margin:"0 0 4px"}}
                  onClick={()=>{quickBook(dog.id, data.date||today, type, addons); closeModal();}}>
                  <DogAvatar name={dog.name} size={32} />
                  <div>
                    <div style={{ fontWeight:600, fontSize:12 }}>{dog.name}</div>
                    <div style={{ fontSize:10, color:C.textMid }}>{dog.breed} · {dog.owner}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── RENDER ───────────────────────────────────────────────────
  return (
    <div style={{ fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize:13, lineHeight:1.4, color:C.text, background:C.bg, minHeight:"100vh" }}>
      <Header />
      {view === "dashboard" && <DashboardView />}
      {view === "employees" && <EmployeeView />}
      {view === "calendar" && <CalendarView />}
      {view === "database" && <DatabaseView />}
      {view === "content" && <ContentCalendarView />}
      {activeModal === "intake" && <IntakeModal />}
      {activeModal === "profile" && <ProfileModal />}
      {activeModal === "activity" && <ActivityModal />}
      {activeModal === "checkout" && <CheckoutModal />}
      {activeModal === "book" && <BookModal />}
    </div>
  );
}
